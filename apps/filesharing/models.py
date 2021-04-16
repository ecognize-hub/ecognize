from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django.dispatch import receiver
from datetime import datetime
from crum import get_current_user
from apps.profiles.models import UserProfile, OrganizationGroup
import hashlib
import os
from django.urls import reverse
from .validators import validate_file_content_and_extension


class AbstractBaseFileSharingObject(models.Model):
    owner = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="owned_%(class)s", blank=True, null=False, editable=False)
    last_edited_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, related_name="last_edited%(class)s", null=True, blank=True)
    users_read = models.ManyToManyField(UserProfile, related_name="readable_%(class)s", blank=True)
    users_write = models.ManyToManyField(UserProfile, related_name="writeable_%(class)s", blank=True)
    orgs_read = models.ManyToManyField(OrganizationGroup, related_name="readable_%(class)s", blank=True)
    orgs_write = models.ManyToManyField(OrganizationGroup, related_name="writeable_%(class)s", blank=True)
    time_created = models.DateTimeField(default=datetime.now, editable=False, null=False)
    time_last_edited = models.DateTimeField(default=datetime.now, editable=False, null=False)
    parent_folder = models.ForeignKey('self', null=True, blank=True, related_name="contained_%(class)s", on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        current_profile = get_current_user().profile
        if is_new:
            self.owner = current_profile
        self.time_last_edited = datetime.now()
        self.last_edited_by = current_profile
        super(AbstractBaseFileSharingObject, self).save(*args, **kwargs)
        if is_new and self.parent_folder is not None:
            self.users_read.add(*self.parent_folder.users_read.all())
            self.users_write.add(*self.parent_folder.users_write.all())
            self.orgs_read.add(*self.parent_folder.orgs_read.all())
            self.orgs_write.add(*self.parent_folder.orgs_write.all())

    class Meta:
        abstract = True


class SharedFolder(AbstractBaseFileSharingObject):
    name = models.CharField(max_length=250)
    parent_folder = models.ForeignKey('self', null=True, blank=True, related_name="contained_folders", on_delete=models.CASCADE)
    notifications = GenericRelation('notifications.Notification', related_query_name='sharedfolder')  # added for automatic deletion through cascade

    def get_detail_url(self):
        return reverse('view-folder-by-id', args=(self.id,))


def hashed_object_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<hash>/<filename>
    m = hashlib.sha3_512()
    m.update(filename.encode())
    m.update(str(instance.time_created).encode())
    m.update(str(instance.owner.user.id).encode())
    m.update(instance.owner.user.username.encode())
    return 'filex/user_{0}/{1}/{2}'.format(instance.owner.user.id, m.hexdigest(), filename)


class SharedFile(AbstractBaseFileSharingObject):
    parent_folder = models.ForeignKey(SharedFolder, null=True, blank=True, related_name="contained_files", on_delete=models.CASCADE)
    file = models.FileField(upload_to=hashed_object_path, max_length=250, validators=(validate_file_content_and_extension,))
    notifications = GenericRelation('notifications.Notification', related_query_name='sharedfile')  # added for automatic deletion through cascade

    def save(self, *args, **kwargs):
        self.filename_cached = self.file.name
        super(SharedFile, self).save(*args, **kwargs)

    def get_detail_url(self):
        return reverse('view-file-by-id', args=(self.id,))


@receiver(models.signals.post_delete, sender=SharedFile)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `MediaFile` object is deleted.
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)


@receiver(models.signals.pre_save, sender=SharedFile)
def auto_delete_file_on_change(sender, instance, **kwargs):
    """
    Deletes old file from filesystem
    when corresponding `SharedFile` object is updated
    with new file.
    """
    if not instance.pk:
        return False

    try:
        old_file = SharedFile.objects.get(pk=instance.pk).file
        if not old_file:
            return False
    except SharedFile.DoesNotExist:
        return False

    new_file = instance.file
    if not old_file == new_file:
        if os.path.isfile(old_file.path):
            os.remove(old_file.path)

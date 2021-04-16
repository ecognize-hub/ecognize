from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from multiselectfield import MultiSelectField
from django_countries.fields import CountryField
from apps.profiles.models import UserType, UserCreatedGroup, UserProfile
from crum import get_current_user
from django.db.models.signals import post_save, m2m_changed
from datetime import datetime, timedelta
from apps.reports.models import Report, OnlineReport
from apps.filesharing.models import SharedFile, SharedFolder
from apps.events.models import Event


class Notification(models.Model):
    creator = models.ForeignKey('profiles.UserProfile', blank=True, null=True, related_name="notifications_created", on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    recipient_occupational_groups = MultiSelectField(choices=UserType.choices, max_length=4*len(UserType.choices))
    recipient_countries = CountryField(multiple=True, blank=True, default='')
    recipient_users = models.ManyToManyField('profiles.UserProfile', blank=True, related_name="notifications_received")
    recipient_orgs = models.ManyToManyField('profiles.OrganizationGroup', blank=True, related_name="notifications_received")
    viewed_by = models.ManyToManyField('profiles.UserProfile', blank=True, related_name="notifications_viewed")
    timestamp = models.DateTimeField(default=datetime.now)

    def save(self, *args, **kwargs):
        current_user = get_current_user()
        if current_user.is_authenticated:
            self.creator = get_current_user().profile
        self.timestamp = datetime.now()
        super(Notification, self).save(*args, **kwargs)

    def register_viewer(self):
        current_user = get_current_user()
        current_user_profile = current_user.profile
        self.viewed_by.add(current_user_profile)

    def unregister_viewer(self):
        current_user = get_current_user()
        current_user_profile = current_user.profile
        self.viewed_by.remove(current_user_profile)

    def user_can_view(self):
        current_user = get_current_user()
        current_user_profile = current_user.profile
        current_user_country = current_user_profile.country
        current_user_org = current_user.primary_org
        current_user_type = current_user_profile.type

        return (current_user_profile in self.recipient_users or not self.recipient_users.exists())\
            and (current_user_country in self.recipient_countries or self.recipient_countries == "")\
            and (current_user_org in self.recipient_orgs or not self.recipient_orgs.exists())\
            and (current_user_type in self.recipient_occupational_groups or self.recipient_occupational_groups == "")

    def __str__(self):
        if self.content_type == ContentType.objects.get_for_model(Report):
            if self.content_object:
                return "New report: {} activity in {}".format(self.content_object.get_category_display(), self.content_object.country.name)
            else:
                return "New report: (report was deleted - no longer accessible)"
        elif self.content_type == ContentType.objects.get_for_model(OnlineReport):
            if self.content_object:
                return "New online activity report: {}".format(self.content_object.get_category_display())
            else:
                return "New online report: (online report was deleted - no longer accessible)"
        elif self.content_type == ContentType.objects.get_for_model(SharedFile):
            if self.content_object:
                return "A file was shared with you: {}".format(self.content_object.file.name.split('/')[-1])
            else:
                return "A file was shared with you: {}".format("(deleted by now - no longer accessible)")
        elif self.content_type == ContentType.objects.get_for_model(SharedFolder):
            if self.content_object:
                return "A folder was shared with you: {}".format(self.content_object.name)
            else:
                return "A folder was shared with you: {}".format("(deleted by now - no longer accessible)")
        elif self.content_type == ContentType.objects.get_for_model(UserCreatedGroup):
            if self.content_object:
                return "A change in status in the group {}".format(self.content_object.display_name)
            else:
                return "A change in status in the group {}".format("(deleted by now - no longer accessible)")
        elif self.content_type == ContentType.objects.get_for_model(Event):
            if self.content_object:
                return "Invitation to event \"{}\" on {}".format(self.content_object.title, self.content_object.datetime_start)
            else:
                return "A change in status in the event {}".format("(deleted by now - no longer accessible)")
        else:
            return "New {}".format(self.content_type.model)


def generate_report_notification(sender, instance, **kwargs):
    if not kwargs['created'] and instance.read_only:  # checking for read_only makes sure we generate notifications only on finalization
        content_type = ContentType.objects.get_for_model(sender)
        object_id = instance.id
        recipient_countries = ''
        recipient_occupational_groups = (UserType.JRN.value, UserType.ACA.value, UserType.NGO.value, UserType.LAW.value, UserType.GOV.value, UserType.IGO.value)
        if sender is Report:
            recipient_countries = instance.country
        new_notification = Notification(content_type=content_type, object_id=object_id, recipient_countries=recipient_countries, recipient_occupational_groups=recipient_occupational_groups)
        new_notification.save()


def generate_file_or_folder_notification(sender, instance, **kwargs):
    content_type = ContentType.objects.get_for_model(sender)
    object_id = instance.id
    recipient_users = instance.users_read.all() | instance.users_write.all()
    recipient_orgs = instance.orgs_read.all() | instance.orgs_write.all()
    current_user_profile = get_current_user().profile
    
    if not recipient_users and not recipient_orgs:  # no recipients at all, do not generate notification
        return

    fifteen_mins_ago = datetime.now() - timedelta(minutes=15)

    potential_duplicate = None
    if sender == SharedFile:
        potential_duplicate = Notification.objects.filter(object_id=object_id, content_type=content_type, timestamp__gte=fifteen_mins_ago, creator=current_user_profile).first()
    if sender == SharedFolder:
        potential_duplicate = Notification.objects.filter(object_id=object_id, content_type=content_type, timestamp__gte=fifteen_mins_ago, creator=current_user_profile).first()

    if not potential_duplicate:
        new_notification = Notification(content_type=content_type, object_id=object_id)
        new_notification.save()
        new_notification.recipient_users.set(recipient_users)
        new_notification.recipient_orgs.set(recipient_orgs)
    else:
        potential_duplicate.timestamp = datetime.now()
        potential_duplicate.recipient_users.set(recipient_users)
        potential_duplicate.recipient_orgs.set(recipient_orgs)
        potential_duplicate.save()


# TODO filter for duplicate content type and object ID within sliding time window
def notify_new_share_targets_of_file_or_folder(sender, instance, **kwargs):
    print("Called: {}".format('notify_new_share_targets_of_file_or_folder'))
    pk_set = kwargs['pk_set']
    current_user_profile = get_current_user().profile
    object_id = instance.id
    content_type_file = ContentType.objects.get_for_model(SharedFile)
    content_type_folder = ContentType.objects.get_for_model(SharedFolder)

    if kwargs['action'] == "post_add":

        fifteen_mins_ago = datetime.now() - timedelta(minutes=15)

        potential_duplicate = None
        if sender == SharedFile.users_read.through or sender == SharedFile.users_write.through or sender == SharedFile.orgs_read.through or sender == SharedFile.orgs_write.through:
            potential_duplicate = Notification.objects.filter(object_id=object_id, content_type=content_type_file, timestamp__gte=fifteen_mins_ago, creator=current_user_profile).first()
        if sender == SharedFolder.users_read.through or sender == SharedFolder.users_write.through or sender == SharedFolder.orgs_read.through or sender == SharedFolder.orgs_write.through:
            potential_duplicate = Notification.objects.filter(object_id=object_id, content_type=content_type_folder, timestamp__gte=fifteen_mins_ago, creator=current_user_profile).first()

        if sender == SharedFile.users_read.through or sender == SharedFile.users_write.through:
            if potential_duplicate:
                potential_duplicate.recipient_users.add(*pk_set)
                potential_duplicate.timestamp = datetime.now()
                potential_duplicate.save()
            else:
                new_notification = Notification(content_type=content_type_file, object_id=object_id)
                new_notification.save()
                new_notification.recipient_users.set(pk_set)
        elif sender == SharedFile.orgs_read.through or sender == SharedFile.orgs_write.through:
            if potential_duplicate:
                potential_duplicate.recipient_orgs.add(*pk_set)
                potential_duplicate.timestamp = datetime.now()
                potential_duplicate.save()
            else:
                new_notification = Notification(content_type=content_type_file, object_id=object_id)
                new_notification.save()
                new_notification.recipient_orgs.set(pk_set)
        elif sender == SharedFolder.users_read.through or sender == SharedFolder.users_write.through:
            if potential_duplicate:
                potential_duplicate.recipient_users.add(*pk_set)
                potential_duplicate.timestamp = datetime.now()
                potential_duplicate.save()
            else:
                new_notification = Notification(content_type=content_type_folder, object_id=object_id)
                new_notification.save()
                new_notification.recipient_users.set(pk_set)
        elif sender == SharedFolder.orgs_read.through or sender == SharedFolder.orgs_write.through:
            if potential_duplicate:
                potential_duplicate.recipient_orgs.add(*pk_set)
                potential_duplicate.timestamp = datetime.now()
                potential_duplicate.save()
            else:
                new_notification = Notification(content_type=content_type_folder, object_id=object_id)
                new_notification.save()
                new_notification.recipient_orgs.set(pk_set)


post_save.connect(generate_report_notification, sender=Report, dispatch_uid="apps.notifications.models")
post_save.connect(generate_report_notification, sender=OnlineReport, dispatch_uid="apps.notifications.models")
post_save.connect(generate_file_or_folder_notification, sender=SharedFile, dispatch_uid="apps.notifications.models")
post_save.connect(generate_file_or_folder_notification, sender=SharedFolder, dispatch_uid="apps.notifications.models")
m2m_changed.connect(notify_new_share_targets_of_file_or_folder, sender=SharedFile.users_read.through, dispatch_uid="apps.notifications.models")
m2m_changed.connect(notify_new_share_targets_of_file_or_folder, sender=SharedFile.users_write.through, dispatch_uid="apps.notifications.models")
m2m_changed.connect(notify_new_share_targets_of_file_or_folder, sender=SharedFile.orgs_read.through, dispatch_uid="apps.notifications.models")
m2m_changed.connect(notify_new_share_targets_of_file_or_folder, sender=SharedFile.orgs_write.through, dispatch_uid="apps.notifications.models")
m2m_changed.connect(notify_new_share_targets_of_file_or_folder, sender=SharedFolder.users_read.through, dispatch_uid="apps.notifications.models")
m2m_changed.connect(notify_new_share_targets_of_file_or_folder, sender=SharedFolder.users_write.through, dispatch_uid="apps.notifications.models")
m2m_changed.connect(notify_new_share_targets_of_file_or_folder, sender=SharedFolder.orgs_read.through, dispatch_uid="apps.notifications.models")
m2m_changed.connect(notify_new_share_targets_of_file_or_folder, sender=SharedFolder.orgs_write.through, dispatch_uid="apps.notifications.models")

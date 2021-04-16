from django.db import models, transaction
from django.contrib.auth.models import User, Group
from django_countries.fields import CountryField
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFit
from hashlib import sha256
from datetime import datetime
from crum import get_current_user
from apps.globalutils.models import ThankableMixin
from apps.social.models import ConnectionRequest
from django.db.models import Q
from django.urls import reverse

from django.apps import apps


class UserType(models.TextChoices):
    VOL = 'VOL', 'Volunteer'
    NGO = 'NGO', 'Non-governmental organization'  # needs email address w/ preregistered NGO domain
    LAW = 'LAW', 'Law enforcement'  # needs .gov email
    ACA = 'ACA', 'Academic institution'  # needs .edu, .ac.<tld> or .edu.<tld> email
    IGO = 'IGO', 'Intergovernmental organization'  # e.g. UN, CITES - needs e-mail address with one of their domains
    GOV = 'GOV', 'Government bodies'
    JRN = 'JRN', 'Reporter/journalist'
    COM = 'COM', 'Commercial entity'
    ANO = 'ANO', 'Anonymous'  # not really anonymous, just a user who can only post reports and nothing else


class LevelTypes(models.TextChoices):
    S = 'I', 'International'
    N = 'N', 'National'


class UserProfile(models.Model):
    def fix_org_after_delete(self):  # TODO use as on_delete function for primary_org
        self.primary_org = None
        self.type = UserType.VOL

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    type = models.CharField(max_length=3, choices=UserType.choices, verbose_name="Occupation", default=UserType.VOL, help_text="Your professional capacity, if any")
    country = CountryField(blank=False, null=False, verbose_name="Country", help_text="Country where the user resides", blank_label='(Select country)')
    visible = models.BooleanField(default=False, verbose_name="Profile visibility", help_text="Determines whether your profile can be found by other users on our website")
    anyone_can_message = models.BooleanField(default=True, help_text="Determines whether anyone can message you, or only contacts")
    reputation = models.IntegerField(default=0)
    num_reports = models.IntegerField(default=0)
    thanks = models.IntegerField(default=0)
    title = models.CharField(max_length=100, blank=True, null=True, default='', verbose_name="Job title", help_text="Provide your job title")
    avatar = models.ImageField(null=True, blank=True, upload_to='uploads/avatars/', default='defaults/default_avatar.png', verbose_name="Profile picture", help_text="Provide a profile photo or picture")
    primary_org = models.ForeignKey('OrganizationGroup', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="Organization", help_text="The organization you are affiliated with")
    thumbnail = ImageSpecField(source='avatar',
                               processors=[ResizeToFit(320, 240)],
                               format='JPEG',
                               options={'quality': 75})
    email_confirmed = models.BooleanField(default=False)
    bio = models.TextField(max_length=2500, null=True, blank=True, default='')

    def get_connections(self):
        initiator_filter = Q(initiator=self)
        recipient_filter = Q(recipient=self)
        accepted_filter = Q(accepted=True)
        initiated_connections = ConnectionRequest.objects.filter(initiator_filter & accepted_filter).values_list('recipient', flat=True)
        initiated_connections_profiles = UserProfile.objects.filter(id__in=initiated_connections)
        received_connections = ConnectionRequest.objects.filter(recipient_filter & accepted_filter).values_list('initiator', flat=True)
        received_connections_profiles = UserProfile.objects.filter(id__in=received_connections)
        all_connections_profiles = initiated_connections_profiles | received_connections_profiles
        return all_connections_profiles

    def get_occupational_groups(self):
        user_group_pks = self.user.groups.all().values_list('pk', flat=True)
        user_occupational_groups = GenericGroup.objects.filter(group__pk=user_group_pks)
        return user_occupational_groups

    def __str__(self):
        if (self.user.first_name is None or self.user.first_name == "") and (self.user.last_name is None or self.user.last_name == ""):
            return "{}".format(self.user.username)
        else:
            real_name = " ".join([self.user.first_name, self.user.last_name])
            return "{} ({})".format(self.user.username, real_name)

    def save(self, *args, **kwargs):
        is_new = not self.pk
        if is_new:
            if self.type != UserType.ANO:
                if self.primary_org is None:
                    self.type = UserType.VOL
                else:
                    self.type = self.primary_org.type
        self.reputation = self.thanks + self.num_reports
        super(UserProfile, self).save(*args, **kwargs)


class UserSettings(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='settings')


class AbstractBaseGroup(models.Model):
    group = models.OneToOneField(Group, on_delete=models.CASCADE, related_name="%(class)s_set")
    display_name = models.CharField(max_length=255, blank=True, null=True)  # WWF Germany, CITES Secretariat...
    countries = CountryField(blank=True, null=False, default='', multiple=True)
    level_type = models.CharField(max_length=1, choices=LevelTypes.choices, blank=False, null=False, default=LevelTypes.N.value)
    visible = models.BooleanField(default=True)
    logo = models.ImageField(null=True, blank=True, upload_to='uploads/grouplogos/', default='defaults/default_avatar.png')
    type = models.CharField(max_length=3, choices=UserType.choices, default='VOL')
    description = models.CharField(max_length=2000, blank=True, default="")
    logo_thumbnail = ImageSpecField(source='logo',
                                    processors=[ResizeToFit(320, 240)],
                                    format='JPEG',
                                    options={'quality': 75})

    def __str__(self):
        return self.display_name

    class Meta:
        abstract = True


# this maps onto "real-world" registered entities, like law enforcement orgs or NGOs
class OrganizationGroup(AbstractBaseGroup):
    admins = models.ManyToManyField(UserProfile, blank=True, related_name='admin_of_orggroup')  # for viewing or removing members  # TODO appoint new admin in dialog
    parent = models.ForeignKey('self', blank=True, null=True, related_name='%(class)s_child_orgs', on_delete=models.SET_NULL)
    full_name = models.CharField(max_length=255, blank=True, null=True)  # Worldwide Fund for Nature Germany, Convention of the International Trade for...
    local_name = models.CharField(max_length=255, blank=True, null=True)  # WWF Deutschland e.V.
    domain = models.CharField(blank=False, null=False, max_length=250)
    is_parent = models.BooleanField(default=False, null=False)  # determines whether this organization has sub-organizations or not
    own_forums = models.ForeignKey('forums.Forum', null=True, on_delete=models.SET_NULL, related_name="forum_orgs")  # TODO allow null and cascade
    parental_forums = models.ForeignKey('forums.Forum', null=True, blank=True, on_delete=models.SET_NULL, related_name="parent_forum_orgs")

    @transaction.atomic
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:  # group does not exist yet
            new_name = self.display_name + '_' + sha256(bytes(datetime.utcnow().strftime("%d/%m/%Y %H:%M:%S"), 'UTF-8')).hexdigest()  # TODO add randomness
            new_base_group = Group(name=new_name)  # TODO remove special chars from new_name
            new_base_group.save()
            self.group = new_base_group

            # create forum for this group:
            # new_forum = Forum()
            new_forum = apps.get_model('forums.Forum')()  # calling model manager to avoid circular import
            new_forum.global_level = self.level_type
            new_forum.forum_type = 'O'  # hardcoded to avoid circular import
            new_forum.name = "Forums for " + self.display_name
            new_forum.save()
            self.own_forums = new_forum

            # if this group is a parent org, create shared forum:
            if self.is_parent:  # if we are the parent, create parental forums
                # new_parent_forum = Forum()
                new_parent_forum = apps.get_model('forums.Forum')()  # calling model manager to avoid circular import
                new_parent_forum.global_level = self.level_type
                new_parent_forum.forum_type = 'S'  # hardcoded to avoid circular import
                new_parent_forum.name = "Forums for " + self.display_name + " and sub-organizations"
                new_parent_forum.save()
                self.parental_forums = new_parent_forum
            else:  # if we are not the parent, add parental forums to own model instance
                if self.parent:
                    self.parental_forums = self.parent.parental_forums
        super(OrganizationGroup, self).save(*args, **kwargs)
        if is_new:
            # create quota
            new_quota = apps.get_model('quotas.Quota')()  # calling model manager to avoid circular import
            new_quota.pk = self.pk
            new_quota.save()

            new_forum.participant_organizations.add(self)
            if self.is_parent or self.parent:
                self.parental_forums.participant_organizations.add(self)

    def delete(self, using=None, keep_parents=False):
        super(OrganizationGroup, self).delete(using, keep_parents)
        self.group.delete()
        self.own_forums.delete()
        if self.is_parent:
            self.parental_forums.delete()


# this maps onto generic collectives, such as "all law enforcement in country X"
class GenericGroup(AbstractBaseGroup):
    visible = models.BooleanField(default=False)
    parent = models.ForeignKey('self', blank=True, null=True, related_name='%(class)s_child_orgs', on_delete=models.SET_NULL)
    own_forums = models.ForeignKey('forums.Forum', null=True, on_delete=models.SET_NULL, related_name="forum_occgroups")


class JoinMode(models.TextChoices):
    OPN = 'O', 'Open - anyone can join without approval'
    MCA = 'M', 'Members can approve new members'
    ACA = 'A', 'Only administrators can approve new users'


# this maps onto user-created groups
class UserCreatedGroup(AbstractBaseGroup):
    type = models.CharField(max_length=3, default='VOL', null=False, blank=True)
    admins = models.ManyToManyField(UserProfile, blank=True, related_name='admin_of_usergroups')  # for viewing or removing members  # TODO need to prevent users with warning when deleting their accounts to appoint another admin before
    level_type = models.CharField(max_length=1, choices=LevelTypes.choices, blank=False, null=False, default=LevelTypes.S.value)
    join_mode = models.CharField(max_length=1, choices=JoinMode.choices, blank=False, null=False, default=JoinMode.OPN.value)
    supplicants = models.ManyToManyField(UserProfile, blank=True, related_name='usergroups_requested_to_join')
    invited = models.ManyToManyField(UserProfile, blank=True, related_name='usergroups_invited_to_join')
    is_parent = models.BooleanField(default=False, null=False)  # determines whether this organization has sub-organizations or not

    def get_detail_url(self):
        return reverse('usergroup-detail', args=(self.id,))

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        current_user = get_current_user()
        if is_new:  # group does not exist yet
            new_name = self.display_name + '_' + sha256(bytes(datetime.utcnow().strftime("%d/%m/%Y %H:%M:%S"), 'UTF-8')).hexdigest()  # TODO add randomness
            new_base_group = Group(name=new_name)  # TODO remove special chars from new_name
            new_base_group.save()
            self.group = new_base_group
            if self.level_type == LevelTypes.N.value:
                current_user_country = current_user.profile.country
                self.countries = current_user_country
        super(UserCreatedGroup, self).save(*args, **kwargs)
        if is_new:  # M2M fields can only be added after save()
            self.admins.add(current_user.profile)
            current_user.groups.add(self.group)

    def delete(self, *args, **kwargs):
        self.group.delete()
        super(UserCreatedGroup, self).delete(*args, **kwargs)


class UserGroupThread(models.Model):
    author = models.ForeignKey(UserProfile, null=True, blank=True, editable=False, on_delete=models.CASCADE, related_name="initiated_group_threads")
    user_group = models.ForeignKey(UserCreatedGroup, blank=False, related_name="group_threads", on_delete=models.CASCADE)
    started_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    subject = models.CharField(max_length=255, null=True, blank=True)
    last_post_datetime = models.DateTimeField(null=False, default=datetime.now, editable=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
        super(UserGroupThread, self).save(*args, **kwargs)


class UserGroupMessage(ThankableMixin):
    thread = models.ForeignKey(UserGroupThread, null=False, blank=False, on_delete=models.CASCADE, related_name="messages")
    sent_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    author = models.ForeignKey(UserProfile, editable=False, null=True, blank=True, on_delete=models.CASCADE, related_name="group_messages")
    content = models.TextField(max_length=5000, blank=False, null=False, default='')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
            thread = self.thread
            thread.last_post_datetime = self.sent_timestamp
            thread.save()
        super(UserGroupMessage, self).save(*args, **kwargs)

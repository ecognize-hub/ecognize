from django.db import models

from apps.globalutils.models import ThankableMixin
from apps.profiles.models import GenericGroup, OrganizationGroup, UserProfile, LevelTypes
from datetime import datetime
from crum import get_current_user
from bleach import clean
from bleach.sanitizer import ALLOWED_TAGS


class ForumType(models.TextChoices):
    ORG = 'O', 'Organizational'  # forums for a specific organization
    GNR = 'G', 'Generic'  # forums for a generic occupational group
    PUB = 'P', 'Public'  # shared forums for multiple occupational groups
    CST = 'C', 'Custom'  # custom forums, created by users. may hold single users and several different organizations
    PRT = 'S', 'Parent organization'  # forums for a parent organization and its sub-organizations


class Forum(models.Model):
    participant_organizations = models.ManyToManyField('profiles.OrganizationGroup', related_name="forum_memberships", blank=True)
    participant_users_profiles = models.ManyToManyField('profiles.UserProfile', related_name="forum_memberships", blank=True)
    participant_generic_groups = models.ManyToManyField('profiles.GenericGroup', related_name="forum_memberships", blank=True)
    moderators = models.ManyToManyField('profiles.UserProfile', related_name="moderated_forums", blank=True)
    administrators = models.ManyToManyField('profiles.UserProfile', related_name="administrated_forums", blank=True)
    creator = models.ForeignKey('profiles.UserProfile', related_name="created_forums", null=True, blank=True, on_delete=models.SET_NULL)
    forum_type = models.CharField(max_length=1, choices=ForumType.choices, blank=False, null=False, default=ForumType.CST.value)
    global_level = models.CharField(max_length=1, choices=LevelTypes.choices, blank=False, null=False, default=LevelTypes.N.value)  # TODO how will this play a role for custom-created forums?
    name = models.CharField(max_length=250, null=False, blank=False)

    def save(self, *args, **kwargs):
        if self.forum_type == ForumType.CST.value:
            current_profile = get_current_user().profile
            if self.pk is None:
                self.creator = current_profile
        super(Forum, self).save(*args, **kwargs)

    def __str__(self):
        return self.name


class ForumThread(ThankableMixin):
    author = models.ForeignKey('profiles.UserProfile', null=True, blank=True, editable=False, on_delete=models.CASCADE, related_name="initiated_forum_threads")
    forum = models.ForeignKey(Forum, null=False, blank=True, on_delete=models.CASCADE, related_name="threads")
    started_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    subject = models.CharField(max_length=255, null=True, blank=True)
    number_of_responses = models.IntegerField(default=-1, null=False, blank=True, editable=False)
    last_post_datetime = models.DateTimeField(null=False, default=datetime.now, editable=False)
    last_post_user = models.ForeignKey('profiles.UserProfile', null=False, blank=True, editable=False, on_delete=models.CASCADE, related_name="last_posted_in")

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
            self.last_post_datetime = self.started_timestamp
            self.last_post_user = self.author
        super(ForumThread, self).save(*args, **kwargs)


class ForumThreadPost(models.Model):
    thread = models.ForeignKey(ForumThread, null=False, blank=False, on_delete=models.CASCADE, related_name="posts")
    sent_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    author = models.ForeignKey('profiles.UserProfile', editable=False, null=True, blank=True, on_delete=models.CASCADE, related_name="forum_posts")
    content = models.TextField(max_length=5000, blank=False, null=False, default='')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        allowed_tags = ALLOWED_TAGS + ['p', 'h2', 'h3', 'h4']
        self.content = clean(self.content, tags=allowed_tags)
        if is_new:
            self.author = get_current_user().profile
            thread = self.thread
            thread.number_of_responses = thread.number_of_responses + 1
            thread.last_post_datetime = self.sent_timestamp
            thread.last_post_user = self.author
            thread.save()
        super(ForumThreadPost, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        thread = self.thread
        thread_posts = thread.posts.all().order_by("-sent_timestamp")
        threads_last_post = thread_posts[0]

        if self == threads_last_post:
            if thread.number_of_responses == 0:
                thread.delete()  # automatically also deletes this post through cascade
            else:
                if thread.number_of_responses > 1:
                    threads_second_last_post = thread_posts[1]
                    thread.last_post_user = threads_second_last_post.author
                    thread.last_post_datetime = threads_second_last_post.sent_timestamp
                else:
                    thread.last_post_user = thread.author
                    thread.last_post_datetime = thread.started_timestamp
                thread.number_of_responses = thread.number_of_responses - 1
                thread.save()
                super(ForumThreadPost, self).delete(*args, **kwargs)
        else:
            thread.number_of_responses = thread.number_of_responses - 1
            thread.save()
            super(ForumThreadPost, self).delete(*args, **kwargs)

from django.db import models
from datetime import datetime
from crum import get_current_user
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q


class ConnectionRequest(models.Model):
    initiator = models.ForeignKey('profiles.UserProfile', null=True, blank=True, editable=False, on_delete=models.CASCADE, related_name='initiated_connection_requests')
    recipient = models.ForeignKey('profiles.UserProfile', null=True, blank=False, on_delete=models.SET_NULL, related_name='received_connection_requests')
    requested_timestamp = models.DateTimeField(default=datetime.now, editable=False, null=False)
    note = models.CharField(max_length=255, blank=True, null=True)
    accepted_timestamp = models.DateTimeField(null=True)
    accepted = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.initiator = get_current_user().profile
        if self.accepted:
            self.accepted_time = datetime.now()
        super(ConnectionRequest, self).save(*args, **kwargs)


class MessagingThread(models.Model):
    initiator = models.ForeignKey('profiles.UserProfile', null=True, blank=True, editable=False, on_delete=models.CASCADE, related_name="initiated_messaging_threads")
    recipient_users = models.ManyToManyField('profiles.UserProfile', blank=True, related_name="messaging_threads")
    recipient_groups = models.ManyToManyField('profiles.OrganizationGroup', blank=True, related_name="messaging_threads")
    started_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    subject = models.CharField(max_length=255, null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to=models.Q(app_label='reports', model='report') | models.Q(app_label='reports', model='onlinereport'), null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    last_message_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.initiator = get_current_user().profile
        super(MessagingThread, self).save(*args, **kwargs)


class MessagingMessage(models.Model):
    thread = models.ForeignKey(MessagingThread, null=False, blank=False, on_delete=models.CASCADE)
    sent_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    sender = models.ForeignKey('profiles.UserProfile', editable=False, null=True, on_delete=models.CASCADE, related_name="sent_messages")
    content = models.TextField(max_length=5000, blank=False, null=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.sender = get_current_user().profile
        super(MessagingMessage, self).save(*args, **kwargs)
        self.thread.last_message_timestamp = self.sent_timestamp
        self.thread.save()

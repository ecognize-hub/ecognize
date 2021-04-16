from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.gis.db import models

from apps.globalutils.models import ThankableMixin
from apps.profiles.models import UserProfile
from django_countries.fields import CountryField
from crum import get_current_user
import reverse_geocode
from datetime import datetime
from django.urls import reverse


class EventType(models.TextChoices):
    MUP = 'MUP', 'Meetup',
    CUP = 'CUP', 'Cleanup',
    DEM = 'DEM', 'Demonstration',
    TRN = 'TRN', 'Training/Workshop',
    PRS = 'PRS', 'Presentation'
    OTR = 'OTR', 'Other'


class Event(models.Model):
    datetime_start = models.DateTimeField(null=False, blank=False)
    datetime_end = models.DateTimeField(null=False, blank=False)
    title = models.CharField(null=False, blank=False, max_length=250)
    description = models.TextField(null=False, blank=False, max_length=5000)
    category = models.CharField(max_length=3, choices=EventType.choices)
    geom = models.PointField(srid=4326, geography=True, blank=True, null=True, verbose_name="Coordinates")
    address = models.CharField(null=True, blank=True, max_length=250)
    country = CountryField(blank=True, null=True)
    admin = models.ForeignKey(UserProfile, null=True, blank=True, on_delete=models.CASCADE, related_name="events_created")
    cohosts = models.ManyToManyField(UserProfile, related_name="events_cohosting", blank=True)
    participants = models.ManyToManyField(UserProfile, related_name="events_participating", blank=True)
    invited = models.ManyToManyField(UserProfile, related_name="events_invited", blank=True)
    public = models.BooleanField(default=True)
    online = models.BooleanField(default=False)
    online_address = models.URLField(null=True, blank=True)
    notifications = GenericRelation('notifications.Notification', related_query_name='event')  # added for automatic deletion through cascade

    def get_detail_url(self):
        return reverse('view-events-detail', args=(self.id,))

    def __str__(self):
        return '{}: {} on {} at {} in {}'.format(self.category, self.title, self.datetime_start, self.geom, self.country)

    def save(self, *args, **kwargs):
        user = get_current_user()
        if user and not user.pk:
            user = None
        user_profile = user.profile
        self.admin = user_profile
        if not self.online:
            switch_coordinates = [(self.geom[1], self.geom[0])]
            rev_res = reverse_geocode.search(switch_coordinates)
            if rev_res:
                self.country = rev_res[0]['country_code']
        super(Event, self).save(*args, **kwargs)
        self.participants.add(user_profile)


class EventThread(models.Model):
    author = models.ForeignKey(UserProfile, null=True, blank=True, editable=False, on_delete=models.CASCADE, related_name="initiated_event_threads")
    event = models.ForeignKey(Event, blank=False, related_name="event_threads", on_delete=models.CASCADE)
    started_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    last_post_datetime = models.DateTimeField(null=False, default=datetime.now, editable=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
        super(EventThread, self).save(*args, **kwargs)


class EventThreadMessage(ThankableMixin):
    thread = models.ForeignKey(EventThread, null=False, blank=False, on_delete=models.CASCADE, related_name="messages")
    sent_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    author = models.ForeignKey(UserProfile, editable=False, null=True, blank=True, on_delete=models.CASCADE, related_name="event_messages")
    content = models.TextField(max_length=5000, blank=False, null=False, default='')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
            thread = self.thread
            thread.last_post_datetime = self.sent_timestamp
            thread.save()
        super(EventThreadMessage, self).save(*args, **kwargs)

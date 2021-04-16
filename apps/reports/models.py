from django.contrib.gis.db import models
from django_countries.fields import CountryField
from django.utils import timezone
from crum import get_current_user
import reverse_geocode
from django.urls import reverse
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from datetime import datetime
from apps.globalutils.models import ThankableMixin
from apps.social.models import MessagingThread
from apps.profiles.models import UserProfile
from django.dispatch import receiver
import os
from django.utils.crypto import get_random_string


CRIMETYPE_CHOICES = [
    ('Animals', (
        ('KIL', 'Killing (general)'),
        ('HNT', 'Hunting with killing'),
        ('CTC', 'Live catching'),
        ('EGG', 'Egg stealing'),
        ('NST', 'Nest stealing'),
        ('FRM', 'Farm operation'),
        ('ENT', 'Entertainment'),
        ('CNF', 'Confinement'),
        ('FSR', 'Fishing without boats'),
        ('FSS', 'Fishing (boat or ship)'),
        ('AOG', "Other/general"),
        ('HLP', "Needs help/in distress")
    )
     ),
    ('Selling & commercial activity', (
        ('ILI', 'Illegal items'),
        ('FOD', 'Food'),
        ('MED', 'Medicine'),
        ('LIV', 'Live animals'),
        ('SMG', 'Smuggling'),
        ('SOG', "Other/general"),
    )
     ),
    ('Pollution', (
        ('PLA', 'Plastic, wrappings, trash'),
        ('ELE', 'Electronics'),
        ('MAC', 'Machinery (cars, appliances, etc.)'),
        ('SPL', 'Spills (oil, chemicals, etc.)'),
        ('POG', "Other/general"),
    )
     ),
    ('Land & forests', (
        ('FIR', 'Fires & arson'),
        ('LOG', 'Illegal logging & land clearing'),
        ('FRG', 'Farming & grazing, unauthorized'),
        ('FOG', "Other/general"),
    )
     ),
    ('Unknown', (
        ('UNK', "Other/general"),
    )
    )
]


class LocationType(models.TextChoices):
    RSV = 'RSV', 'Reserve',
    PRK = 'PRK', 'Park',
    NAT = 'NAT', 'Nature/undeclared area',
    ZOO = 'ZOO', 'Zoo',
    FRM = 'FRM', 'Farm',
    SCT = 'SCT', 'Sanctuary',
    SHP = 'SHP', 'Shop',
    MKT = 'MKT', 'Market, stall, booth, etc.',
    PHA = 'PHA', 'Pharmacy',
    STR = 'STR', 'Street vendor',
    RST = 'RST', 'Restaurant',
    ONL = 'ONL', 'Online',
    FOR = 'FOR', 'Forest',
    LAK = 'LAK', 'Lake',
    RIV = 'RIV', 'River',
    OCN = 'OCN', 'Ocean',
    FLD = 'FLD', 'Field',
    UNK = 'UNK', 'Other'


class OnlineTypes(models.TextChoices):
    SOC = 'SOC', 'Social media post'
    SAL = 'SAL', 'Online sale'
    GRP = 'GRP', 'Group'


class ReportImage(models.Model):
    image = models.ImageField(
        upload_to='uploads/reportimgs/'
    )
    thumbnail = ImageSpecField(source='image',
                               processors=[ResizeToFill(320, 240)],
                               format='JPEG',
                               options={'quality': 75})
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, limit_choices_to=models.Q(app_label='reports', model='report') | models.Q(app_label='reports', model='onlinereport'))
    object_id = models.PositiveIntegerField(null=True)
    content_object = GenericForeignKey('content_type', 'object_id')


class Report(ThankableMixin):
    category = models.CharField(max_length=3, choices=CRIMETYPE_CHOICES)
    location_type = models.CharField(max_length=3, choices=LocationType.choices)
    timestamp = models.DateTimeField(default=timezone.now, blank=False, null=False)
    geom = models.PointField(srid=4326, geography=True, blank=False, null=True, verbose_name="Coordinates")
    description = models.TextField(max_length=5000, blank=True, null=True)
    read_only = models.BooleanField(default=False, null=False, blank=True)
    author = models.ForeignKey(UserProfile, blank=True, null=True, on_delete=models.CASCADE, related_name="reports")
    country = CountryField(blank=True, null=True, verbose_name="Country", help_text="Country where the event happened or object is located")
    location_name = models.CharField(max_length=250, blank=True, null=True)
    creation_date = models.DateTimeField(default=timezone.now, blank=False, null=False)
    images = GenericRelation(ReportImage, related_query_name='report')
    notifications = GenericRelation('notifications.Notification', related_query_name='report')  # added for automatic deletion through cascade
    message_threads = GenericRelation(MessagingThread, related_name='report')  # added for automatic deletion through cascade
    edit_token = models.CharField(max_length=32, blank=True, default="")

    def get_detail_url(self):
        return reverse('report-detail', args=(self.id,))

    def __str__(self):
        return '{} on {} at {} by {}'.format(self.category, self.timestamp, self.geom, self.author)

    def save(self, *args, **kwargs):
        user = get_current_user()
        if user.is_authenticated:
            if self.pk is None:
                self.author = user.profile
            if self.read_only:  # report was just finalized
                self.author.num_reports += 1
                self.author.reputation += 1
                self.edit_token = ""
                self.author.save()
        else:
            if self.pk is None:
                self.author = None
                self.edit_token = get_random_string(length=32)
            else:
                if self.read_only:
                    self.edit_token = ""
        switch_coordinates = [(self.geom[1], self.geom[0])]
        rev_res = reverse_geocode.search(switch_coordinates)
        if rev_res:
            self.country = rev_res[0]['country_code']
        super(Report, self).save(*args, **kwargs)


class OnlineReport(ThankableMixin):
    timestamp = models.DateTimeField(default=timezone.now)
    url = models.TextField(max_length=300, blank=True, null=True)
    category = models.CharField(max_length=3, choices=OnlineTypes.choices)
    description = models.TextField(max_length=5000, blank=True, null=True)
    author = models.ForeignKey(UserProfile, blank=True, null=True, on_delete=models.CASCADE, related_name="online_reports")
    read_only = models.BooleanField(default=False, null=False, blank=True)
    images = GenericRelation(ReportImage, related_query_name='online_report')
    notifications = GenericRelation('notifications.Notification', related_query_name='online_report')  # added for automatic deletion through cascade  # TODO check this works
    message_threads = GenericRelation(MessagingThread, related_name='online_report')  # added for automatic deletion through cascade  # TODO check this works
    edit_token = models.CharField(max_length=32, blank=True, default="")

    def get_detail_url(self):
        return reverse('onlinereport-detail', args=(self.id,))

    def save(self, *args, **kwargs):
        user = get_current_user()
        if user.is_authenticated:
            if self.pk is None:
                self.author = user.profile
            if self.read_only:  # report was just finalized
                self.author.num_reports += 1
                self.author.reputation += 1
                self.edit_token = ""
                self.author.save()
        else:
            if self.pk is None:
                self.author = None  # in case the report was handed in anonymously  # TODO make sure than same user finalizes report as started it!
                self.edit_token = get_random_string(length=32)
            else:
                if self.read_only:
                    self.edit_token = ""
        super(OnlineReport, self).save(*args, **kwargs)


class ReportCommentThread(models.Model):
    author = models.ForeignKey(UserProfile, null=True, blank=True, editable=False, on_delete=models.CASCADE, related_name="initiated_report_threads")
    report = models.ForeignKey(Report, blank=False, related_name="comment_threads", on_delete=models.CASCADE)
    started_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    last_post_datetime = models.DateTimeField(null=False, default=datetime.now, editable=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
        super(ReportCommentThread, self).save(*args, **kwargs)


class ReportComment(ThankableMixin):
    thread = models.ForeignKey(ReportCommentThread, null=False, blank=False, on_delete=models.CASCADE, related_name="comments")
    sent_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    author = models.ForeignKey(UserProfile, editable=False, null=True, blank=True, on_delete=models.CASCADE, related_name="reportcomments")
    content = models.TextField(max_length=5000, blank=False, null=False, default='')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
            thread = self.thread
            thread.last_post_datetime = self.sent_timestamp
            thread.save()
        super(ReportComment, self).save(*args, **kwargs)


class OnlineReportCommentThread(models.Model):
    author = models.ForeignKey(UserProfile, null=True, blank=True, editable=False, on_delete=models.CASCADE, related_name="initiated_onlinereport_threads")
    report = models.ForeignKey(OnlineReport, blank=False, related_name="comment_threads", on_delete=models.CASCADE)
    started_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    last_post_datetime = models.DateTimeField(null=False, default=datetime.now, editable=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
        super(OnlineReportCommentThread, self).save(*args, **kwargs)


class OnlineReportComment(ThankableMixin):
    thread = models.ForeignKey(OnlineReportCommentThread, null=False, blank=False, on_delete=models.CASCADE, related_name="comments")
    sent_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    author = models.ForeignKey(UserProfile, editable=False, null=True, blank=True, on_delete=models.CASCADE, related_name="onlinereportcomments")
    content = models.TextField(max_length=5000, blank=False, null=False, default='')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
            thread = self.thread
            thread.last_post_datetime = self.sent_timestamp
            thread.save()
        super(OnlineReportComment, self).save(*args, **kwargs)


@receiver(models.signals.post_delete, sender=ReportImage)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `MediaFile` object is deleted.
    """
    if instance.image:
        if os.path.isfile(instance.image.path):
            os.remove(instance.image.path)


@receiver(models.signals.post_delete, sender=Report)
@receiver(models.signals.post_delete, sender=OnlineReport)
def auto_adjust_reputation_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `MediaFile` object is deleted.
    """
    instance.author.reputation -= 1
    instance.author.num_reports -= 1
    instance.author.save()

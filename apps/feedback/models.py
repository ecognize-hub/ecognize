from django.db import models

from apps.globalutils.models import ThankableMixin
from apps.profiles.models import UserProfile
from crum import get_current_user
from datetime import datetime


class IssueStatus(models.TextChoices):
    OPN = 'O', 'Open'
    WIP = 'W', 'Work in progress'
    FIN = 'C', 'Closed'


class ClosureReasons(models.TextChoices):
    DONE = 'D', 'Done'
    NOPE = 'N', "Won't implement"


class IssueTypes(models.TextChoices):
    BR = 'B', 'Bug report'
    FR = 'F', 'Feature request'
    CR = 'C', 'Change request'


class Issue(ThankableMixin):
    issue_type = models.CharField(max_length=1, choices=IssueTypes.choices)
    title = models.CharField(max_length=250)
    description = models.TextField(max_length=5000)
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="issues_created", blank=True, editable=False)
    upvoted_by = models.ManyToManyField(UserProfile, related_name="issues_upvoted", blank=True)
    issue_status = models.TextField(max_length=1, choices=IssueStatus.choices, null=False, blank=False, default=IssueStatus.OPN.value)
    closure_reason = models.TextField(max_length=1, choices=ClosureReasons.choices, null=True, blank=True)
    created_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
        super(Issue, self).save(*args, **kwargs)


class IssueComment(ThankableMixin):
    issue = models.ForeignKey(Issue, null=False, blank=False, on_delete=models.CASCADE, related_name="comments")
    sent_timestamp = models.DateTimeField(null=False, default=datetime.now, editable=False)
    author = models.ForeignKey(UserProfile, editable=False, null=True, blank=True, on_delete=models.CASCADE, related_name="issue_comments")
    content = models.TextField(max_length=5000, blank=False, null=False, default='')

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new:
            self.author = get_current_user().profile
        super(IssueComment, self).save(*args, **kwargs)

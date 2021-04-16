from django.contrib import admin
from .models import Issue, IssueComment

admin.site.register(Issue)
admin.site.register(IssueComment)

from django.contrib import admin
from .models import Forum, ForumThread, ForumThreadPost

admin.site.register(Forum)
admin.site.register(ForumThread)
admin.site.register(ForumThreadPost)

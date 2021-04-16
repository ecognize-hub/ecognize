from django.contrib import admin
from .models import SharedFile, SharedFolder

admin.site.register(SharedFile)
admin.site.register(SharedFolder)

from django.contrib import admin
from .models import UserProfile, UserSettings, OrganizationGroup, GenericGroup, UserCreatedGroup, UserGroupThread, UserGroupMessage

admin.site.register(UserProfile)
admin.site.register(UserSettings)
admin.site.register(OrganizationGroup)
admin.site.register(GenericGroup)
admin.site.register(UserCreatedGroup)
admin.site.register(UserGroupThread)
admin.site.register(UserGroupMessage)

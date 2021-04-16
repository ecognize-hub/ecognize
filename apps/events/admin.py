from django.contrib.gis import admin
from .models import Event, EventThread, EventThreadMessage

admin.site.register(Event, admin.GeoModelAdmin)
admin.site.register(EventThread)
admin.site.register(EventThreadMessage)

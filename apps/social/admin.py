from django.contrib import admin
from .models import MessagingThread, MessagingMessage, ConnectionRequest

admin.site.register(MessagingThread)
admin.site.register(MessagingMessage)
admin.site.register(ConnectionRequest)

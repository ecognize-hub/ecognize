from .models import Notification
from rest_framework import fields, serializers
from apps.profiles.models import UserType


class NotificationSerializer(serializers.ModelSerializer):
    recipients = fields.MultipleChoiceField(choices=UserType.choices)

    class Meta:
        model = Notification
        exclude = ['created_by', 'viewed_by']

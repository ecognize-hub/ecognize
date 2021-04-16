from crum import get_current_user
from rest_framework import serializers
from .models import Event, EventThreadMessage, EventThread
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from django_countries.serializers import CountryFieldMixin
from apps.profiles.serializers import ProfilePreviewSerializer


class EventSerializer(CountryFieldMixin, GeoFeatureModelSerializer):
    admin = ProfilePreviewSerializer(read_only=True)
    cohosts = ProfilePreviewSerializer(read_only=True, many=True)

    class Meta:
        model = Event
        geo_field = "geom"
        fields = ['datetime_start', 'datetime_end', 'title', 'description', 'category', 'geom', 'address', 'country', 'admin',
                  'cohosts', 'participants', 'invited', 'public', 'online', 'online_address', 'id']


class CreateMessageInEventThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventThreadMessage
        fields = ['thread', 'sent_timestamp', 'content']


class EventMessageSerializer(serializers.ModelSerializer):
    author = ProfilePreviewSerializer(read_only=True)
    thanked = serializers.SerializerMethodField()
    id = serializers.IntegerField(read_only=True)
    thanks = serializers.IntegerField(read_only=True)

    def get_thanked(self, obj):
        current_user_profile = get_current_user().profile
        return current_user_profile in obj.thanked_by.all()

    class Meta:
        model = EventThreadMessage
        fields = ["content", "author", "sent_timestamp", "thread", "id", "thanks", "thanked"]


class EventThreadSerializer(serializers.ModelSerializer):
    author = ProfilePreviewSerializer(read_only=True)
    messages = EventMessageSerializer(read_only=True, many=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = EventThread
        fields = ['author', 'started_timestamp', 'last_post_datetime', 'id', 'messages']

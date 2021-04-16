from .models import MessagingThread
from rest_framework import serializers
from .models import MessagingMessage, ConnectionRequest
from apps.reports.models import Report, OnlineReport
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from django.conf import settings
from apps.profiles.serializers import ProfilePreviewSerializer
from apps.profiles.models import UserType


class CreateMessageInThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessagingMessage
        exclude = ['sender']


class MessagingMessageSerializer(serializers.ModelSerializer):
    sender = ProfilePreviewSerializer(read_only=True)

    def get_sender(self, obj):
        if not obj.sender.visible:
            return {-1: {"name": "anonymous", "org_name": None, "thumbnail": ''}}
        else:
            if obj.sender.type == UserType.VOL.value or obj.sender.type == UserType.ANO.value:
                return {obj.sender.id: {"name": obj.sender.user.username, "org_name": None,
                                        "thumbnail": obj.sender.thumbnail.url}}
            else:
                return {
                    obj.sender.id: {"name": obj.sender.user.username, "org_name": obj.sender.primary_org.display_name,
                                    "thumbnail": obj.sender.thumbnail.url}}

    class Meta:
        model = MessagingMessage
        fields = '__all__'


class ConnectionSerializer(serializers.ModelSerializer):
    connection = serializers.SerializerMethodField('get_connection')

    def get_connection(self, obj):
        current_user_profile_id = self.context['user_id']
        initiator_user_id = obj.initiator.id
        if current_user_profile_id == initiator_user_id:
            return ProfilePreviewSerializer(obj.recipient).data
        else:
            return ProfilePreviewSerializer(obj.initiator).data

    class Meta:
        model = ConnectionRequest
        fields = ['id', 'accepted_timestamp', 'connection']


class AcceptConnectionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectionRequest
        fields = ['accepted']


class CreateOrDeleteConnectionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConnectionRequest
        fields = ['recipient', 'note']


class SentConnectionRequestSerializer(serializers.ModelSerializer):
    connection = ProfilePreviewSerializer(read_only=True, source='recipient')
    note = serializers.CharField(read_only=True)

    class Meta:
        model = ConnectionRequest
        fields = ['connection', 'note', 'id']


class ReceivedConnectionRequestSerializer(serializers.ModelSerializer):
    connection = ProfilePreviewSerializer(read_only=True, source='initiator')
    note = serializers.CharField(read_only=True)

    class Meta:
        model = ConnectionRequest
        fields = ['connection', 'note', 'id']


class StartMessagingThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessagingThread
        fields = ['recipient_users', 'recipient_groups', 'subject', 'content_type', 'object_id']


class MessagingThreadSerializer(serializers.ModelSerializer):
    recipient_users = ProfilePreviewSerializer(many=True)  # serializers.SerializerMethodField('get_all_participants_as_arr', read_only=True)
    recipient_groups = serializers.SerializerMethodField('get_recipient_group_names', read_only=True)
    related_object = serializers.SerializerMethodField('get_related_object_details', read_only=True)
    initiator = ProfilePreviewSerializer()  # serializers.SerializerMethodField('get_initiator_name', read_only=True)

    def get_initiator_name(self, obj):
        if not obj.initiator.visible:
            return {-1: {"name": "anonymous", "org_name": None, "thumbnail": ''}}
        else:
            if obj.initiator.type != 'VOL':
                return {obj.initiator.id: {"name": obj.initiator.user.username,
                                           "org_name": obj.initiator.primary_org.display_name,
                                           "thumbnail": obj.initiator.thumbnail.url}}
            else:
                return {obj.initiator.id: {"name": obj.initiator.user.username,
                                           "org_name": None,
                                           "thumbnail": obj.initiator.thumbnail.url}}

    def get_all_participants_as_arr(self, obj):
        result = []
        for recipient in obj.recipient_users.all():
            if recipient.visible:
                if recipient.type != 'VOL':
                    result.append({recipient.id: {"name": recipient.user.username,
                                                  "org_name": recipient.primary_org.display_name,
                                                  "thumbnail": recipient.thumbnail.url}})
                else:
                    result.append({recipient.id: {"name": recipient.user.username, "org_name": None,
                                                  "thumbnail": recipient.thumbnail.url}})
            else:
                result.append({-1: {"name": "anonymous", "org_name": None, "thumbnail": ''}})
        if obj.initiator.visible:
            if obj.initiator.type != 'VOL':
                result.append({obj.initiator.id: {"name": obj.initiator.user.username,
                                                  "org_name": obj.initiator.primary_org.display_name,
                                                  "thumbnail": obj.initiator.thumbnail.url}})
            else:
                result.append({obj.initiator.id: {"name": obj.initiator.user.username, "org_name": None,
                                                  "thumbnail": obj.initiator.thumbnail.url}})
        else:
            result.append({-1: {"name": "anonymous", "org_name": None, "thumbnail": ''}})
        return result

    def get_recipient_group_names(self, obj):
        result = []
        for group in obj.recipient_groups.all():
            result.append({group.id: group.display_name})
        return result

    def get_related_object_details(self, obj):
        result = None
        if obj.content_type and obj.object_id:
            if obj.content_type.id == ContentType.objects.get_for_model(Report).id:
                result = 'Re: <a href="{}">Report {}</a>'.format(
                    settings.BASE_URL + reverse('report-detail', kwargs={'pk': obj.object_id}), obj.object_id)
            if obj.content_type.id == ContentType.objects.get_for_model(OnlineReport).id:
                result = 'Re: <a href="{}">Online report {}</a>'.format(
                    settings.BASE_URL + reverse('onlinereport-detail', kwargs={'pk': obj.object_id}), obj.object_id)
        return result

    class Meta:
        model = MessagingThread
        fields = '__all__'

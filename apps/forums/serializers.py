from rest_framework import serializers
from .models import Forum, ForumThreadPost, ForumThread
from apps.profiles.serializers import ProfilePreviewSerializer, OrganizationGroupSerializer, GenericGroupSerializer
from apps.profiles.models import OrganizationGroup, UserProfile, GenericGroup


class OrgForumSerializer(serializers.ModelSerializer):
    participant_organizations = OrganizationGroupSerializer(read_only=True, many=True)

    class Meta:
        model = Forum
        fields = ['participant_organizations', 'id']


class ForumSerializer(serializers.ModelSerializer):
    participant_organizations = OrganizationGroupSerializer(read_only=True, many=True)
    participant_generic_groups = GenericGroupSerializer(read_only=True, many=True)
    participant_users_profiles = ProfilePreviewSerializer(read_only=True, many=True)
    administrators = ProfilePreviewSerializer(read_only=True, many=True)
    moderators = ProfilePreviewSerializer(read_only=True, many=True)
    global_level = serializers.CharField(read_only=True)
    name = serializers.CharField(read_only=True)

    class Meta:
        model = Forum
        fields = ['name', 'participant_organizations', 'participant_generic_groups', 'participant_users_profiles', 'id', 'forum_type', 'administrators', 'moderators', 'global_level']


class CustomForumCreationSerializer(serializers.ModelSerializer):  # important: use this ONLY for creation, as it allows write access to moderator/administrator fields!
    participant_organizations = serializers.PrimaryKeyRelatedField(many=True, queryset=OrganizationGroup.objects.all())
    participant_users_profiles = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all())  # TODO filter for connections
    moderators = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all())
    administrators = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all())

    class Meta:
        model = Forum
        fields = ['name', 'participant_organizations', 'participant_users_profiles', 'moderators', 'administrators']


class ForumThreadOverviewSerializer(serializers.ModelSerializer):
    author = ProfilePreviewSerializer(read_only=True)
    last_post_user = ProfilePreviewSerializer(read_only=True)

    class Meta:
        model = ForumThread
        fields = ['author', 'started_timestamp', 'subject', 'number_of_responses', 'last_post_user', 'last_post_datetime', 'id', 'forum']


class ForumPostSerializer(serializers.ModelSerializer):
    sent_timestamp = serializers.DateTimeField(read_only=True)
    author = ProfilePreviewSerializer(read_only=True)

    class Meta:
        model = ForumThreadPost
        fields = ['sent_timestamp', 'author', 'content', 'thread', 'id']

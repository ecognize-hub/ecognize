from crum import get_current_user
from rest_framework import serializers
from .models import Issue, IssueComment
from apps.profiles.serializers import ProfilePreviewSerializer


class IssueSerializer(serializers.ModelSerializer):
    author = ProfilePreviewSerializer(read_only=True)
    issue_status = serializers.CharField(read_only=True)
    closure_reason = serializers.CharField(read_only=True)
    id = serializers.IntegerField(read_only=True)
    thanks = serializers.IntegerField(read_only=True)
    thanked = serializers.SerializerMethodField()

    def get_thanked(self, obj):
        current_user_profile = get_current_user().profile
        return current_user_profile in obj.thanked_by.all()

    class Meta:
        model = Issue
        fields = ('id', 'issue_type', 'title', 'description', 'author', 'issue_status', 'closure_reason', 'thanks', 'thanked')


class IssueCommentSerializer(serializers.ModelSerializer):
    author = ProfilePreviewSerializer(read_only=True)
    issue = serializers.PrimaryKeyRelatedField(queryset=Issue.objects.all())
    id = serializers.IntegerField(read_only=True)
    thanks = serializers.IntegerField(read_only=True)
    thanked = serializers.SerializerMethodField()

    def get_thanked(self, obj):
        current_user_profile = get_current_user().profile
        return current_user_profile in obj.thanked_by.all()

    class Meta:
        model = IssueComment
        fields = ('id', 'issue', 'sent_timestamp', 'author', 'content', 'thanks', 'thanked')

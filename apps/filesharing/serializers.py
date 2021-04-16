from rest_framework import serializers
from .models import SharedFolder, SharedFile
from apps.profiles.serializers import ProfilePreviewSerializer, OrganizationGroupSerializer
from apps.profiles.models import UserProfile, OrganizationGroup


class FolderReadOnlySerializer(serializers.ModelSerializer):
    owner = ProfilePreviewSerializer(read_only=True)
    last_edited_by = ProfilePreviewSerializer(read_only=True)
    users_read = ProfilePreviewSerializer(many=True, read_only=True)
    users_write = ProfilePreviewSerializer(many=True, read_only=True)
    orgs_read = OrganizationGroupSerializer(many=True, read_only=True)
    orgs_write = OrganizationGroupSerializer(many=True, read_only=True)
    parent_folder = serializers.PrimaryKeyRelatedField(read_only=True)
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)

    class Meta:
        model = SharedFolder
        fields = ('id', 'name', 'owner', 'last_edited_by', 'users_read', 'users_write', 'orgs_read', 'orgs_write', 'time_created', 'time_last_edited', 'parent_folder')


class FolderUpdateSerializer(serializers.ModelSerializer):
    owner = ProfilePreviewSerializer(read_only=True)
    last_edited_by = ProfilePreviewSerializer(read_only=True)
    users_read = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all(), required=False)
    users_write = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all(), required=False)
    orgs_read = serializers.PrimaryKeyRelatedField(many=True, queryset=OrganizationGroup.objects.all(), required=False)
    orgs_write = serializers.PrimaryKeyRelatedField(many=True, queryset=OrganizationGroup.objects.all(), required=False)
    parent_folder = serializers.PrimaryKeyRelatedField(read_only=True)  # set this through URL so users cannot rewrite this
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(required=False)

    class Meta:
        model = SharedFolder
        fields = ('id', 'name', 'owner', 'last_edited_by', 'users_read', 'users_write', 'orgs_read', 'orgs_write', 'time_created', 'time_last_edited', 'parent_folder')


class FolderCreateSerializer(serializers.ModelSerializer):
    owner = ProfilePreviewSerializer(read_only=True)
    last_edited_by = ProfilePreviewSerializer(read_only=True)
    users_read = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all(), required=False)
    users_write = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all(), required=False)
    orgs_read = serializers.PrimaryKeyRelatedField(many=True, queryset=OrganizationGroup.objects.all(), required=False)
    orgs_write = serializers.PrimaryKeyRelatedField(many=True, queryset=OrganizationGroup.objects.all(), required=False)
    parent_folder = serializers.PrimaryKeyRelatedField(required=False, queryset=SharedFolder.objects.all())  # set this through URL so users cannot rewrite this
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField()

    class Meta:
        model = SharedFolder
        fields = ('id', 'name', 'owner', 'last_edited_by', 'users_read', 'users_write', 'orgs_read', 'orgs_write', 'time_created', 'time_last_edited', 'parent_folder')


class FileReadOnlySerializer(serializers.ModelSerializer):
    owner = ProfilePreviewSerializer(read_only=True)
    last_edited_by = ProfilePreviewSerializer(read_only=True)
    users_read = ProfilePreviewSerializer(many=True, read_only=True)
    users_write = ProfilePreviewSerializer(many=True, read_only=True)
    orgs_read = OrganizationGroupSerializer(many=True, read_only=True)
    orgs_write = OrganizationGroupSerializer(many=True, read_only=True)
    parent_folder = serializers.PrimaryKeyRelatedField(read_only=True)
    file = serializers.CharField(read_only=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = SharedFile
        fields = ('id', 'owner', 'last_edited_by', 'users_read', 'users_write', 'orgs_read', 'orgs_write', 'time_created', 'time_last_edited', 'parent_folder', 'file')


class FileUpdateSerializer(serializers.ModelSerializer):
    owner = ProfilePreviewSerializer(read_only=True)
    last_edited_by = ProfilePreviewSerializer(read_only=True)
    users_read = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all(), required=False)
    users_write = serializers.PrimaryKeyRelatedField(many=True, queryset=UserProfile.objects.all(), required=False)
    orgs_read = serializers.PrimaryKeyRelatedField(many=True, queryset=OrganizationGroup.objects.all(), required=False)
    orgs_write = serializers.PrimaryKeyRelatedField(many=True, queryset=OrganizationGroup.objects.all(), required=False)
    parent_folder = serializers.PrimaryKeyRelatedField(read_only=True)  # set this through URL so users cannot rewrite this
    file = serializers.CharField(required=False)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = SharedFile
        fields = ('id', 'owner', 'last_edited_by', 'users_read', 'users_write', 'orgs_read', 'orgs_write', 'time_created', 'time_last_edited', 'parent_folder', 'file')

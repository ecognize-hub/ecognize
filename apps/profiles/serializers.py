from crum import get_current_user
from rest_framework import serializers
from .models import OrganizationGroup, UserProfile, UserCreatedGroup, GenericGroup, UserGroupThread, UserGroupMessage
from django_countries.serializers import CountryFieldMixin


class OrganizationGroupSerializer(CountryFieldMixin, serializers.ModelSerializer):
    logo_thumbnail = serializers.ImageField(read_only=True)

    class Meta:
        model = OrganizationGroup
        exclude = ['group', 'admins', 'visible']


class GenericGroupSerializer(CountryFieldMixin, serializers.ModelSerializer):
    class Meta:
        model = GenericGroup
        exclude = ['group', 'visible']


class UserCreatedGroupSerializer(CountryFieldMixin, serializers.ModelSerializer):
    logo_thumbnail = serializers.ImageField(read_only=True)
    is_admin = serializers.SerializerMethodField('get_if_admin')

    def get_if_admin(self, obj):
        obj_admins = obj.admins.all()
        current_user = self.context['request'].user.profile
        if current_user in obj_admins:
            return True
        else:
            return False

    class Meta:
        model = UserCreatedGroup
        exclude = ['group', 'admins', 'visible']


class CreateUpdateDeleteGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCreatedGroup
        fields = ['display_name', 'visible', 'join_mode', 'level_type', 'logo']


class ProfilePreviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    thumbnail = serializers.ImageField(read_only=True)
    real_name = serializers.SerializerMethodField(read_only=True, source="get_real_name")
    primary_org = serializers.PrimaryKeyRelatedField(read_only=True)

    def get_real_name(self, obj):
        user_obj = obj.user
        if user_obj.first_name and user_obj.last_name:
            return " ".join([user_obj.first_name, user_obj.last_name])
        elif user_obj.first_name:
            return user_obj.first_name
        elif user_obj.last_name:
            return user_obj.last_name
        else:
            return ""

    class Meta:
        model = UserProfile
        fields = ['id', 'real_name', 'thumbnail', 'user_name', 'primary_org']


class Base64ImageField(serializers.ImageField):

    def to_internal_value(self, data):
        from django.core.files.base import ContentFile
        import base64
        import six
        import uuid

        if isinstance(data, six.string_types):
            if 'data:' in data and ';base64,' in data:
                header, data = data.split(';base64,')

            try:
                decoded_file = base64.b64decode(data)
            except TypeError:
                self.fail('invalid_image')

            file_name = str(uuid.uuid4())[:12]  # 12 characters are more than enough.
            file_extension = self.get_file_extension(file_name, decoded_file)
            complete_file_name = "%s.%s" % (file_name, file_extension, )
            data = ContentFile(decoded_file, name=complete_file_name)

        return super(Base64ImageField, self).to_internal_value(data)

    def get_file_extension(self, file_name, decoded_file):
        import imghdr

        extension = imghdr.what(file_name, decoded_file)
        extension = "jpg" if extension == "jpeg" else extension

        return extension


class ProfileUpdateSerializer(serializers.ModelSerializer):
    avatar = Base64ImageField(max_length=None, use_url=True, required=False)

    class Meta:
        model = UserProfile
        fields = ['avatar', 'title', 'bio']


class OrgMemberListSerializer(serializers.ModelSerializer):
    members = ProfilePreviewSerializer(many=True)

    class Meta:
        model = UserProfile
        fields = ['members']


class CreateMessageInGroupThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserGroupMessage
        exclude = ['author']


class UserGroupMessageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    thanks = serializers.IntegerField(read_only=True)
    thanked = serializers.SerializerMethodField()
    author = ProfilePreviewSerializer(read_only=True)

    def get_thanked(self, obj):
        current_user_profile = get_current_user().profile
        return current_user_profile in obj.thanked_by.all()

    class Meta:
        model = UserGroupMessage
        fields = ["content", "author", "sent_timestamp", "thread", "id", "thanks", "thanked"]


class UserGroupThreadSerializer(serializers.ModelSerializer):
    author = ProfilePreviewSerializer(read_only=True)
    messages = UserGroupMessageSerializer(read_only=True, many=True)

    class Meta:
        model = UserGroupThread
        fields = '__all__'

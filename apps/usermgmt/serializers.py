from rest_captcha.serializers import RestCaptchaSerializer
from rest_framework import serializers
from .models import OrgAdditionRequest
from apps.profiles.models import UserProfile


class OrgAdditionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrgAdditionRequest
        fields = ('org_name', 'org_website', 'parent_org_name', 'supplicant_email_address', 'supplicant_name')


class AnonymousUserCreationSerializer(RestCaptchaSerializer, serializers.ModelSerializer):
    password = serializers.CharField(max_length=24, min_length=24, allow_blank=False, allow_null=False, write_only=True)

    class Meta:
        model = UserProfile
        fields = ('country', 'captcha_value', 'captcha_key', 'password')

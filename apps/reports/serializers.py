from crum import get_current_user
from rest_captcha.serializers import RestCaptchaSerializer
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from django_countries.serializers import CountryFieldMixin
from .models import Report, ReportImage, OnlineReport, ReportComment, OnlineReportComment, ReportCommentThread, \
    OnlineReportCommentThread
from apps.profiles.serializers import ProfilePreviewSerializer


class ReportImagesSerializer(serializers.ModelSerializer):
    thumbnail = serializers.ReadOnlyField(source="thumbnail.url")

    class Meta:
        model = ReportImage
        fields = '__all__'


class ReportCreateUpdateSerializer(RestCaptchaSerializer, serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True, required=False)
    captcha_key = serializers.CharField(write_only=True)
    captcha_value = serializers.CharField(write_only=True)
    edit_token = serializers.CharField(read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'timestamp', 'geom', 'category', 'location_type', 'location_name', 'description', 'country', 'captcha_key', 'captcha_value', 'edit_token']


class OnlineReportCreateUpdateSerializer(RestCaptchaSerializer, serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True, required=False)
    captcha_key = serializers.CharField(write_only=True)
    captcha_value = serializers.CharField(write_only=True)
    edit_token = serializers.CharField(read_only=True)

    class Meta:
        model = OnlineReport
        fields = ['id', 'timestamp', 'url', 'category', 'description', 'captcha_key', 'captcha_value', 'edit_token']


class ReportSerializer(serializers.ModelSerializer):
    images = ReportImagesSerializer(many=True, read_only=True)
    id = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Report
        fields = ['id', 'timestamp', 'geom', 'category', 'location_type', 'location_name', 'description', 'country', 'images']


class OnlineReportSerializer(serializers.ModelSerializer):
    images = ReportImagesSerializer(many=True, read_only=True)
    id = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = OnlineReport
        fields = ['id', 'timestamp', 'url', 'category', 'description', 'images']


class ReportFinalizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['read_only']


class OnlineReportFinalizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineReport
        fields = ['read_only']


class ReportGeoSerializer(CountryFieldMixin, GeoFeatureModelSerializer):
    images = ReportImagesSerializer(many=True, read_only=True)
    id = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Report
        geo_field = "geom"
        fields = ['id', 'timestamp', 'geom', 'category', 'location_type', 'location_name', 'description', 'country', 'images']


class ReportCommentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    thanks = serializers.IntegerField(read_only=True)
    thanked = serializers.SerializerMethodField()
    author = ProfilePreviewSerializer(read_only=True)

    def get_thanked(self, obj):
        current_user_profile = get_current_user().profile
        return current_user_profile in obj.thanked_by.all()

    class Meta:
        model = ReportComment
        fields = ['id', 'author', 'content', 'thanks', 'thanked', 'sent_timestamp', 'thread']


class ReportCommentThreadSerializer(serializers.ModelSerializer):
    author = ProfilePreviewSerializer(read_only=True)
    comments = ReportCommentSerializer(read_only=True, many=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ReportCommentThread
        fields = ['author', 'started_timestamp', 'last_post_datetime', 'id', 'comments', 'report']


class CreateReportCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportComment
        fields = ['thread', 'content']


class OnlineReportCommentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    thanks = serializers.IntegerField(read_only=True)
    thanked = serializers.SerializerMethodField()
    author = ProfilePreviewSerializer(read_only=True)

    def get_thanked(self, obj):
        current_user_profile = get_current_user().profilecreation_date
        return current_user_profile in obj.thanked_by.all()

    class Meta:
        model = OnlineReportComment
        fields = ['id', 'author', 'content', 'thanks', 'thanked', 'sent_timestamp', 'thread']


class OnlineReportCommentThreadSerializer(serializers.ModelSerializer):
    author = ProfilePreviewSerializer(read_only=True)
    comments = OnlineReportCommentSerializer(read_only=True, many=True)
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = OnlineReportCommentThread
        fields = ['author', 'started_timestamp', 'last_post_datetime', 'id', 'comments', 'report']


class CreateOnlineReportCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnlineReportComment
        fields = ['thread', 'content']

import re
from django_countries.serializers import CountryFieldMixin
from rest_framework import serializers
from apps.profiles.models import OrganizationGroup
from apps.profiles.serializers import Base64ImageField


class CreateUpdateOrgGroupSerializer(CountryFieldMixin, serializers.ModelSerializer):
    logo = Base64ImageField(max_length=None, use_url=True, required=False)

    def validate(self, data):
        """
        Check that the start is before the stop.
        """
        validated_data = super(CreateUpdateOrgGroupSerializer, self).validate(data)
        forbidden_chars = '[<>"=]'
        if not (validated_data['level_type'] != 'I' or validated_data['level_type'] != 'N'):
            raise serializers.ValidationError(
                "Wrong level type: {})".format(validated_data['level_type']))
        if validated_data['level_type'] == 'I' and len(validated_data['countries']) > 0:
            raise serializers.ValidationError("International organizations cannot be bound to countries")
        if validated_data['level_type'] == 'N' and len(validated_data['countries']) < 1:
            raise serializers.ValidationError("National organizations need to be bound to (at least) one country")
        if re.match(forbidden_chars, validated_data['display_name']):
            raise serializers.ValidationError("Display name contains forbidden characters (forbidden: {})".format(forbidden_chars))
        if re.match(forbidden_chars, validated_data['local_name']):
            raise serializers.ValidationError("Local name contains forbidden characters (forbidden: {})".format(forbidden_chars))
        if re.match(forbidden_chars, validated_data['full_name']):
            raise serializers.ValidationError("Full name contains forbidden characters (forbidden: {})".format(forbidden_chars))
        return validated_data

    class Meta:
        model = OrganizationGroup
        fields = ['display_name', 'countries', 'level_type', 'logo', 'type', 'local_name', 'parent', 'full_name', 'domain', 'is_parent']

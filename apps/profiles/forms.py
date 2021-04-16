from django import forms
from crispy_forms.helper import FormHelper
from .models import UserCreatedGroup, UserProfile
from django.urls import reverse


class CreateNewGroupForm(forms.ModelForm):
    class Meta:
        model = UserCreatedGroup
        fields = ['display_name', 'visible', 'logo', 'join_mode']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'id_createNewGroupForm'
        self.helper.form_method = 'post'
        self.helper.form_action = reverse('api-usergroups-create')


class UserSettingsForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['visible', 'anyone_can_message']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'id-settingsChangeForm'
        self.helper.form_method = 'post'
        self.helper.form_action = reverse('profile-settings')

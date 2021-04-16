import re

from django import forms
from crispy_forms.helper import FormHelper
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from captcha.fields import CaptchaField
from apps.profiles.models import UserProfile
from .models import OrgAdditionRequest
from django.forms import ValidationError


class OrgAdditionRequestForm(forms.ModelForm):
    required_css_class = 'required'
    verification_code = CaptchaField()

    class Meta:
        model = OrgAdditionRequest
        fields = ('org_name', 'org_website', 'parent_org_name', 'supplicant_email_address', 'supplicant_name')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_id = 'id-orgAdditionRequestForm'
        self.helper.form_method = 'post'
        self.helper.form_action = ''


class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    last_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    email = forms.EmailField(max_length=254, help_text='Required. Your e-mail address is required for validating your account.')
    required_css_class = 'required'
    verification_code = CaptchaField()

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        username = cleaned_data.get('username')
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError({'email': ["A user with that email already exists.", ]})
        if User.objects.filter(username__iexact=username):
            raise ValidationError({'username': ["A user with that username already exists.", ]})
        return self.cleaned_data

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2', )


class ProfileForm(forms.ModelForm):
    required_css_class = 'required'

    class Meta:
        model = UserProfile
        fields = ('country', 'visible', 'title', 'avatar', 'primary_org')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['country'].empty_label = '(Please choose)'
        self.fields['primary_org'].empty_label = '(None - I am a volunteer)'
        self.helper = FormHelper()
        self.helper.form_id = 'id-userProfileCreationForm'
        self.helper.form_method = 'post'
        self.helper.form_action = ''

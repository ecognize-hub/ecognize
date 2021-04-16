from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from .models import Report, OnlineReport
from leaflet.forms.widgets import LeafletWidget
from django.utils.translation import gettext_lazy as _
from .widgets import MapBoxWidget
from captcha.fields import CaptchaField


class NewReportForm(forms.ModelForm):
    verification_code = CaptchaField()

    def __init__(self, *args, **kwargs):
        super(NewReportForm, self).__init__(*args, **kwargs)

        self.helper = FormHelper(self)

        self.helper.layout.append(Submit('save', 'save'))

    class Meta:
        model = Report
        exclude = ['country', 'owner', 'read_only', 'creation_date']
        widgets = {'geom': MapBoxWidget()}
        labels = {
            'geom': _('Where did it happen?'),
            'timestamp': _('When did it happen?'),
            'category': _('What happened?'),
            'location_type': _('In what kind of place did it happen?'),
            'location_name': _('Name or address of the location'),
            'description': _('Additional info - describe what happened, name of the place, people involved...:')
        }


class NewOnlineReportForm(forms.ModelForm):
    verification_code = CaptchaField()

    def __init__(self, *args, **kwargs):
        super(NewOnlineReportForm, self).__init__(*args, **kwargs)

        self.helper = FormHelper(self)

        self.helper.layout.append(Submit('save', 'save'))

    class Meta:
        model = OnlineReport
        exclude = ['country', 'owner', 'read_only', 'creation_date']
        widgets = {'geom': LeafletWidget(), 'url': forms.URLInput()}
        labels = {
            'timestamp': _('When did it happen?'),
            'category': _('What did you find?'),
            'url': _('Please copy the full address of the offending website here:'),
            'description': _('Additional info - describe what you found or any other information...:')
        }

from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from .models import Event
from apps.reports.widgets import MapBoxWidget
from django.db.models import Q
from apps.profiles.models import UserProfile
from apps.social.models import ConnectionRequest
from crum import get_current_user


class NewEventForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(NewEventForm, self).__init__(*args, **kwargs)

        # queryset for choices should only consist of connections
        current_profile = get_current_user().profile
        accepted_filter = Q(accepted=True)
        initiated_filter = Q(initiator=current_profile)
        recipient_filter = Q(recipient=current_profile)
        initiated_connections = ConnectionRequest.objects.filter(accepted_filter & initiated_filter).values('recipient__id')
        received_connections = ConnectionRequest.objects.filter(accepted_filter & recipient_filter).values('initiator__id')
        initiated_connections_filter = Q(id__in=initiated_connections)
        received_connections_filter = Q(id__in=received_connections)
        self.fields['cohosts'].queryset = UserProfile.objects.filter(initiated_connections_filter | received_connections_filter)
        self.fields['invited'].queryset = UserProfile.objects.filter(initiated_connections_filter | received_connections_filter)

        self.helper = FormHelper(self)

        self.helper.layout.append(Submit('save', 'save'))

    class Meta:
        model = Event
        exclude = ['admin']
        widgets = {'geom': MapBoxWidget(),
                   'description': forms.Textarea(attrs={'placeholder': 'Description', 'rows': '5'}),
                   'address': forms.TextInput(attrs={'placeholder': 'Name of the place, address...'}),
                   'title': forms.TextInput(attrs={'placeholder': 'Title'}),
                   }

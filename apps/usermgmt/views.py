from django.shortcuts import render, redirect
from django.db import transaction
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .forms import ProfileForm, SignUpForm, OrgAdditionRequestForm
from django.views.generic import TemplateView, DetailView
from rest_framework.generics import CreateAPIView
from apps.profiles.models import UserType, OrganizationGroup, GenericGroup, LevelTypes, UserProfile
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .tokens import account_activation_token, org_activation_token
from django.utils.encoding import force_bytes, force_text
from django.contrib.auth.models import User
from .serializers import OrgAdditionRequestSerializer, AnonymousUserCreationSerializer
from django.core.mail import send_mail
from .models import OrgAdditionRequest


@transaction.atomic
def create_org_addition_request(request):
    if request.method == 'POST':
        org_request_form = OrgAdditionRequestForm(request.POST)
        if org_request_form.is_valid():
            org_request = org_request_form.save()
            current_site = get_current_site(request)
            subject = 'Confirm Ecognize access for organization'
            message = render_to_string('org_activation_email.html', {
                'name': org_request.supplicant_name,
                'domain': current_site.domain,
                'uid': urlsafe_base64_encode(force_bytes(org_request.pk)),
                'token': org_activation_token.make_token(org_request),
            })
            send_mail(subject, message, recipient_list=(org_request.supplicant_email_address,), from_email=None)

            return redirect('org-reg-mail-sent')
    else:
        org_request_form = OrgAdditionRequestForm()
    return render(request, 'request_org_addition.html', {
        'form': org_request_form
    })


class RequestOrgAdditionAPIView(CreateAPIView):
    serializer_class = OrgAdditionRequestSerializer


class SignupMailSentView(TemplateView):
    template_name = 'reg_email_sent.html'


class OrgMailSentView(TemplateView):
    template_name = 'org_reg_email_sent.html'


class RequestOrgAdditionSuccess(TemplateView):
    template_name = 'org_add_request_success.html'


class SignupDomainError(DetailView):
    template_name = "signup_domain_error.html"
    context_object_name = 'org'

    def get_object(self, queryset=None):
        return self.get_queryset().get(id=self.kwargs['pk'])

    def get_queryset(self):
        return OrganizationGroup.objects.all()


def activate_org(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        org_request = OrgAdditionRequest.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, OrgAdditionRequest.DoesNotExist):
        org_request = None

    if org_request is not None and org_activation_token.check_token(org_request, token):
        org_request.email_confirmed = True
        org_request.save()

        return redirect('req-org-addition-success')
    else:
        return render(request, 'org_activation_invalid.html')


def activate_user(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.profile.email_confirmed = True
        user.save()
        user.profile.save()

        # now add user to correct groups:
        user_type = user.profile.type
        user_country = user.profile.country
        GenericGroup.objects.get(type=user_type, level_type=LevelTypes.S).group.user_set.add(user)
        GenericGroup.objects.get(type=user_type, level_type=LevelTypes.N, countries__icontains=user_country).group.user_set.add(user)
        if user_type != UserType.VOL:
            user_org = user.profile.primary_org
            user_org.group.user_set.add(user)
        return redirect('login')
    else:
        return render(request, 'account_activation_invalid.html')


class RegisterAnonymousContributor(CreateAPIView):
    serializer_class = AnonymousUserCreationSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)

    def perform_create(self, serializer):
        new_user = User()
        new_user.is_active = True
        new_user.password = serializer.data['password']
        num_of_anon_contributors = UserProfile.objects.filter(type=UserType.ANO.value).count()
        new_user.user_name = "anon" + str(num_of_anon_contributors + 1)
        new_user.first_name = "anonymous"
        new_user.email = ""
        new_user.last_name = str(num_of_anon_contributors + 1)
        new_user.save()
        new_user.refresh_from_db()
        profile = new_user.profile
        profile.type = UserType.ANO.value
        profile.country = serializer.data['country']
        profile.primary_org = None
        profile.visible = False
        profile.title = None
        profile.avatar = None
        user_type = profile.type
        user_country = profile.country
        GenericGroup.objects.get(type=user_type, level_type=LevelTypes.S).group.user_set.add(new_user)
        GenericGroup.objects.get(type=user_type, level_type=LevelTypes.N,
                                 countries__icontains=user_country).group.user_set.add(new_user)
        profile.save()
        return Response({'user_name': new_user.user_name}, status=201)


@transaction.atomic
def create_user_view(request):
    if request.method == 'POST':
        user_form = SignUpForm(request.POST)
        profile_form = ProfileForm(request.POST)
        print(profile_form)
        if user_form.is_valid() and profile_form.is_valid():
            user = user_form.save(commit=False)
            user.is_active = False  # needs confirmation e-mail to activate account

            profile_form = ProfileForm(request.POST)  # Reload the profile form with the profile instance
            profile_form.full_clean()  # Manually clean the form this time. It is implicitly called by "is_valid()" method
            profile = profile_form.save(commit=False)  # Gracefully save the form

            print(profile_form.cleaned_data)

            # dirty hack: post validation to make sure e-mail domain matches org  # TODO domain validation
            if profile.primary_org is None:  # we got a volunteer
                user.save()
                user.refresh_from_db()  # This will load the Profile created by the Signal
                profile_form = ProfileForm(request.POST, instance=user.profile)  # Reload the profile form with the profile instance
                profile_form.full_clean()  # Manually clean the form this time. It is implicitly called by "is_valid()" method
                profile_form.save()  # Gracefully save the form

                current_site = get_current_site(request)
                subject = 'Activate Your Ecognize Account'
                message = render_to_string('account_activation_email.html', {
                    'user': user,
                    'domain': current_site.domain,
                    'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                    'token': account_activation_token.make_token(user),
                })
                user.email_user(subject, message)

                return redirect('regmailsent')
            else:
                domains = profile.primary_org.domain.split(',')
                org_type = profile.primary_org.type
                email_address = user.email

                if org_type in (UserType.NGO, UserType.COM, UserType.IGO, UserType.GOV, UserType.JRN, UserType.LAW, UserType.ACA):
                    email_valid = False
                    for domain in domains:
                        if email_address.endswith('@' + domain):
                            email_valid = True
                    if email_valid:
                        user.save()
                        user.refresh_from_db()  # This will load the Profile created by the Signal
                        profile_form = ProfileForm(request.POST,
                                                   instance=user.profile)  # Reload the profile form with the profile instance
                        profile_form.full_clean()  # Manually clean the form this time. It is implicitly called by "is_valid()" method
                        profile_form.save()  # Gracefully save the form

                        current_site = get_current_site(request)
                        subject = 'Activate Your Ecognize Account'
                        message = render_to_string('account_activation_email.html', {
                            'user': user,
                            'domain': current_site.domain,
                            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                            'token': account_activation_token.make_token(user),
                        })
                        user.email_user(subject, message)

                        return redirect('regmailsent')
                    else:
                        return redirect('signup-domain-error', profile.primary_org.id)
    else:
        user_form = SignUpForm()
        profile_form = ProfileForm()
    return render(request, 'registration/register.html', {
        'user_form': user_form,
        'profile_form': profile_form
    })

from django.db import models
from django.contrib.auth.signals import user_logged_in
from django.db.models import Q
from apps.notifications.models import Notification
from apps.profiles.models import UserType, OrganizationGroup
from apps.social.models import MessagingThread


class OrgAdditionRequest(models.Model):
    org_name = models.CharField(max_length=255, blank=False, null=False, help_text="Name of the organization you want to register", verbose_name="Organization's name")
    org_website = models.URLField(max_length=255, blank=True, null=True, help_text="Website of the organization to be registered", verbose_name="Organization's website")
    parent_org_name = models.CharField(max_length=255, blank=True, null=True,
                                       help_text="Name of the parent organization (if exists)",
                                       verbose_name="Parent organization's name")
    supplicant_email_address = models.EmailField(blank=False, null=False, max_length=250, verbose_name="Your e-mail address", help_text="Your professional e-mail address at the organization you want to register. Required for confirmation e-mail.")
    supplicant_name = models.CharField(blank=False, null=False, max_length=250, verbose_name="Your name")
    email_confirmed = models.BooleanField(default=False)


def gen_unseen_numbers(sender, user, request, **kwargs):
    if user is not None:
        # get number of unread notifications:
        user_profile = user.profile
        user_type = user_profile.type
        if user_type != UserType.VOL.value and user_type != UserType.ANO.value:
            user_countries = user_profile.primary_org.countries
        else:
            user_countries = user_profile.country.code
        user_org = user_profile.primary_org
        occupational_group_filter = Q(recipient_occupational_groups__icontains=user_type)
        empty_occupational_group_filter = Q(recipient_occupational_groups='')
        country_empty_filter = Q(recipient_countries='')
        country_filter = Q(recipient_countries__in=user_countries)
        recipient_users_filter = Q(recipient_users=user_profile)
        recipient_users_empty_filter = Q(recipient_users=None)
        recipient_org_filter = Q(recipient_orgs=user_org)
        recipient_org_empty_filter = Q(recipient_orgs=None)
        exclude_owner_filter = ~Q(creator=user_profile)
        read_filter = ~Q(viewed_by=user_profile)
        queryset = Notification.objects.filter(
            (occupational_group_filter | empty_occupational_group_filter) & (country_empty_filter | country_filter) & (
                        recipient_users_filter | recipient_users_empty_filter) & (
                        recipient_org_filter | recipient_org_empty_filter) & exclude_owner_filter & read_filter).distinct()
        num_unread_notifications = queryset.count()
        request.session['unread_notifs'] = num_unread_notifications

        # get messages since last login:
        last_login = user.last_login
        initiator_filter = Q(initiator=user_profile)
        recipient_filter = Q(recipient_users=user_profile)
        ids_of_all_org_groups = OrganizationGroup.objects.all().values_list('group_id', flat=True)
        current_user_groups = user.groups.all()
        any_membership_q = Q()
        new_messages_filter = Q() if last_login is None else Q(last_message_timestamp__gt=last_login)
        for grp in current_user_groups:
            if grp.id in ids_of_all_org_groups:
                any_membership_q |= Q(recipient_groups=grp.organizationgroup_set)
        new_messages = MessagingThread.objects.filter((initiator_filter | recipient_filter | any_membership_q) & new_messages_filter).distinct()
        request.session['unread_msgs'] = new_messages.count()


user_logged_in.connect(gen_unseen_numbers)

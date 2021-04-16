from django.contrib.auth.mixins import UserPassesTestMixin
from django.db.models import Q
from django.shortcuts import redirect
from django.views.generic import ListView, DetailView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.profiles.models import UserType
from .models import Notification


class ListMyReceivedNotificationsView(ListView):
    template_name = 'notifications.html'
    context_object_name = 'notifications'

    def get_context_data(self, **kwargs):
        context = super(ListMyReceivedNotificationsView, self).get_context_data()
        context['profile_id'] = self.request.user.profile.id
        context['profile'] = self.request.user.profile
        return context

    def get_queryset(self):
        user = self.request.user
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
        queryset = Notification.objects.filter((occupational_group_filter | empty_occupational_group_filter) & (country_empty_filter | country_filter) & (recipient_users_filter | recipient_users_empty_filter) & (recipient_org_filter | recipient_org_empty_filter) & exclude_owner_filter).distinct().order_by("-timestamp")
        return queryset


class ToggleReadStatus(UserPassesTestMixin, APIView):
    def test_func(self):
        return True  # every user can toggle notification read status

    def post(self, request, *args, **kwargs):
        current_user = self.request.user

        action = request.data['action']
        obj = Notification.objects.get(pk=kwargs['pk'])

        if action == "read":
            obj.register_viewer()
            request.session['unread_notifs'] = request.session['unread_notifs'] - 1
            return Response({"code": "success"})
        elif action == "unread":
            obj.unregister_viewer()
            request.session['unread_notifs'] = request.session['unread_notifs'] + 1
            return Response({"code": "success"})
        else:
            return Response({"code": "failure"})


class GetObjectBehindNotification(DetailView):
    model = Notification

    def get(self, request, *args, **kwargs):
        obj = self.model.objects.get(pk=kwargs['pk'])
        current_profile = self.request.user.profile
        if current_profile not in obj.viewed_by.all():
            obj.register_viewer()
            request.session['unread_notifs'] = request.session['unread_notifs'] - 1
        return redirect(obj.content_object.get_detail_url())

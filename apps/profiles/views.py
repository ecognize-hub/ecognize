from django.views.generic import ListView, DetailView, TemplateView, UpdateView, FormView
from .models import UserProfile, OrganizationGroup, UserGroupThread, UserGroupMessage, GenericGroup
from .forms import CreateNewGroupForm, UserSettingsForm
from .serializers import OrganizationGroupSerializer, ProfilePreviewSerializer, CreateUpdateDeleteGroupSerializer, \
    UserCreatedGroupSerializer, UserGroupMessageSerializer, UserGroupThreadSerializer, CreateMessageInGroupThreadSerializer, \
    GenericGroupSerializer, ProfileUpdateSerializer
from django.db.models import Q
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView, UpdateAPIView
from rest_framework.views import APIView
from rest_framework.filters import SearchFilter
from .models import UserCreatedGroup, JoinMode
from .decorator_tests import *
from django.contrib.auth.mixins import UserPassesTestMixin
from rest_framework.response import Response
from apps.social.models import ConnectionRequest
from apps.notifications.models import Notification
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse


class GlobalUserRankingListView(UserPassesTestMixin, ListView):
    template_name = 'rankings.html'
    model = UserProfile
    context_object_name = 'userprofiles'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        queryset = UserProfile.objects.all().order_by('-num_reports').values('user__username', 'visible', 'num_reports', 'reputation', 'id', 'country')
        for element in queryset:
            if not element['visible']:
                element['user__username'] = '(anonymous)'
                element['id'] = 0
        return queryset


class NationalUserRankingListView(UserPassesTestMixin, ListView):
    template_name = 'rankings.html'
    model = UserProfile
    context_object_name = 'userprofiles'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_county = UserProfile.objects.get(user=self.request.user).country
        queryset = UserProfile.objects.filter(country=current_user_county).order_by('-num_reports').values('user__username', 'visible', 'num_reports', 'reputation', 'id', 'country')
        for element in queryset:
            if not element['visible']:
                element['user__username'] = '(anonymous)'
                element['id'] = 0
        return queryset


class UserProfileDetailView(UserPassesTestMixin, DetailView):
    template_name = 'profile.html'
    model = UserProfile
    context_object_name = 'profile'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        current_user_profile = current_user.profile

        all_connections_profiles = current_user_profile.get_connections()

        visible_filter = Q(visible=True)
        all_visible_profiles = self.model.objects.filter(visible_filter)

        return (all_connections_profiles | all_visible_profiles).distinct()

    def get_object(self, *args, **kwargs):
        id_filter = Q(id=self.kwargs['pk'])
        return self.get_queryset().get(id_filter)

    def get_context_data(self, **kwargs):
        context = super(UserProfileDetailView, self).get_context_data(**kwargs)

        user_id = int(self.kwargs['pk'])
        user_profile = UserProfile.objects.get(pk=user_id)

        friends = self.request.user.profile.get_connections()
        friends_ids = [item for item in friends.values_list('id', flat=True)]

        context['is_friend'] = int(self.kwargs['pk']) in friends_ids
        context['sent_them_req'] = ConnectionRequest.objects.filter(initiator=self.request.user.profile, accepted=False, recipient=user_id).exists()
        context['received_req_from_them'] = ConnectionRequest.objects.filter(recipient=self.request.user.profile, accepted=False, initiator=user_id).exists()
        context['num_friends'] = len(friends_ids)
        context['is_me'] = int(self.kwargs['pk']) == self.request.user.profile.id
        context['allows_msg'] = user_profile.anyone_can_message
        return context


class MyUserProfileDetailView(UserPassesTestMixin, DetailView):
    template_name = 'profile.html'
    model = UserProfile
    context_object_name = 'profile'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_object(self, *args, **kwargs):
        return self.model.objects.get(user=self.request.user)

    def get_context_data(self, **kwargs):
        friends = self.request.user.profile.get_connections()
        friends_ids = [item for item in friends.values_list('id', flat=True)]

        context = super(MyUserProfileDetailView, self).get_context_data(**kwargs)
        context['is_friend'] = False
        context['sent_them_req'] = False
        context['received_req_from_them'] = False
        context['num_friends'] = len(friends_ids)
        context['is_me'] = True
        return context


class MyUserProfilePreviewAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = ProfilePreviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_object(self):
        return UserProfile.objects.get(id=self.request.user.profile.id)


class OrgDetailView(UserPassesTestMixin, DetailView):
    template_name = 'org.html'
    model = OrganizationGroup
    context_object_name = 'org'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(OrgDetailView, self).get_context_data(**kwargs)
        this_group = OrganizationGroup.objects.get(id=self.kwargs['pk']).group
        num_of_org_members = this_group.user_set.all().count()
        context['num_org_members'] = num_of_org_members
        return context


class UserGroupDetailView(UserPassesTestMixin, DetailView):
    template_name = 'usergroup.html'
    model = UserCreatedGroup
    context_object_name = 'usergroup'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(UserGroupDetailView, self).get_context_data(**kwargs)
        this_usergroup = UserCreatedGroup.objects.get(id=self.kwargs['pk'])
        this_group = this_usergroup.group
        current_user = self.request.user
        current_user_profile = current_user.profile
        num_of_group_members = this_group.user_set.all().count()
        context['is_member'] = this_group in current_user.groups.all()
        context['requested_to_join'] = current_user_profile in this_usergroup.supplicants.all()
        context['invited_to_join'] = current_user_profile in this_usergroup.invited.all()
        context['is_admin'] = current_user_profile in this_usergroup.admins.all()
        context['group_id'] = self.kwargs['pk']
        context['num_group_members'] = num_of_group_members
        context['ctid_usergroup_comment'] = ContentType.objects.get_for_model(UserGroupMessage).id
        return context

    def get_object(self, queryset=None):
        pk = self.kwargs['pk']
        current_user = self.request.user
        res = self.model.objects.get(id=pk)
        if res.visible or current_user in res.user_set.all():
            return res
        else:
            return UserCreatedGroup.objects.none()


class SearchOccupationalGroupsGloballyAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = GenericGroupSerializer
    filter_backends = [SearchFilter]
    search_fields = ['display_name']

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        if 'search' in self.request.query_params and self.request.query_params['search'] != '':
            if len(self.request.query_params['search']) < 3:
                return GenericGroup.objects.none()
        if 'types' in self.request.query_params and self.request.query_params['types'] != '':
            if len(self.request.query_params['types']) < 3:
                return GenericGroup.objects.none()
        type_filter = Q()
        country_filter = Q()
        if 'countries' in self.request.query_params and self.request.query_params['countries'] != '':
            for country in self.request.query_params['countries'].split(','):
                country_filter |= Q(countries=country)
        if 'types' in self.request.query_params and self.request.query_params['types'] != '':
            for org_type in self.request.query_params['types'].split(','):
                type_filter |= Q(type=org_type)
        return GenericGroup.objects.filter(type_filter & country_filter)


class SearchOrgsGloballyAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = OrganizationGroupSerializer
    filter_backends = [SearchFilter]
    search_fields = ['display_name', 'full_name', 'local_name']

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        if 'search' in self.request.query_params and self.request.query_params['search'] != '':
            if len(self.request.query_params['search']) < 3:
                return OrganizationGroup.objects.none()
        if 'types' in self.request.query_params and self.request.query_params['types'] != '':
            if len(self.request.query_params['types']) < 3:
                return OrganizationGroup.objects.none()
        visibility_filter = Q(visible=True)
        type_filter = Q()
        country_filter = Q()
        if 'countries' in self.request.query_params and self.request.query_params['countries'] != '':
            for country in self.request.query_params['countries'].split(','):
                country_filter |= Q(countries=country)
        if 'types' in self.request.query_params and self.request.query_params['types'] != '':
            for org_type in self.request.query_params['types'].split(','):
                type_filter |= Q(type=org_type)
        return OrganizationGroup.objects.filter(visibility_filter & type_filter & country_filter)


class UpdateProfileAPIView(UserPassesTestMixin, UpdateAPIView):
    serializer_class = ProfileUpdateSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_profile_id = self.request.user.profile.id
        return UserProfile.objects.filter(pk=current_profile_id)

    def get_object(self):
        current_profile_id = self.request.user.profile.id
        return UserProfile.objects.get(pk=current_profile_id)


class SearchUserCreatedGroupsGloballyAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = UserCreatedGroupSerializer
    filter_backends = [SearchFilter]
    search_fields = ['display_name']

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        if 'search' in self.request.query_params and self.request.query_params['search'] != '':
            if len(self.request.query_params['search']) < 3:
                return UserCreatedGroup.objects.none()
        visibility_filter = Q(visible=True)
        country_filter = Q()
        if 'countries' in self.request.query_params and self.request.query_params['countries'] != '':
            for country in self.request.query_params['countries'].split(','):
                country_filter |= Q(countries=country)
        return UserCreatedGroup.objects.filter(visibility_filter & country_filter)


class SearchOrgsNationallyAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = OrganizationGroupSerializer
    filter_backends = [SearchFilter]
    search_fields = ['display_name', 'full_name', 'local_name']

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        if 'search' in self.request.query_params and len(self.request.query_params['search']) < 3:
            return OrganizationGroup.objects.none()
        if 'type' in self.request.query_params and len(self.request.query_params['type']) < 3:
            return OrganizationGroup.objects.none()
        visibility_filter = Q(visible=True)
        country_filter = Q(countries__icontains=self.request.user.profile.country)
        type_filter = Q()
        if 'type' in self.request.query_params and self.request.query_params['type'] != '':
            type_filter = Q(type__icontains=self.request.query_params['type'])
        return OrganizationGroup.objects.filter(visibility_filter & country_filter & type_filter)


class CreateUserGroupAPIView(UserPassesTestMixin, CreateAPIView):  # TODO: security constraints
    serializer_class = CreateUpdateDeleteGroupSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)


class UpdateDestroyUserGroupAPIView(UserPassesTestMixin, RetrieveUpdateDestroyAPIView):  # TODO use for group deletion
    serializer_class = CreateUpdateDeleteGroupSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        obj_for_deletion = UserCreatedGroup.objects.get(id=self.kwargs['pk'])
        if current_user_profile in obj_for_deletion.admins.all():
            return UserCreatedGroup.objects.filter(id=self.kwargs['pk'])
        else:
            return UserCreatedGroup.objects.none()


class ListMyGroupsListAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = UserCreatedGroupSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_users_groups = self.request.user.groups.all()
        group_id_filter = Q()
        for group in current_users_groups:
            group_id_filter |= Q(group_id=group.id)
        return UserCreatedGroup.objects.filter(group_id_filter)


class SearchUsersAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ProfilePreviewSerializer
    filter_backends = [SearchFilter]
    search_fields = ['user__first_name', 'user__username', 'user__last_name']

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        if 'search' not in self.request.query_params:
            return UserProfile.objects.none()
        if 'search' in self.request.query_params and len(self.request.query_params['search']) < 4:
            return UserProfile.objects.none()
        visibility_filter = Q(visible=True)
        country_filter = Q()
        type_filter = Q()
        not_anon_filter = ~Q(type=UserType.ANO.value)
        if 'countries' in self.request.query_params and self.request.query_params['countries'] != '':
            for country in self.request.query_params['countries'].split(','):
                country_filter |= Q(country=country)
        if 'types' in self.request.query_params and self.request.query_params['types'] != '':
            for user_type in self.request.query_params['types'].split(','):
                type_filter |= Q(type=user_type)
        return UserProfile.objects.filter(visibility_filter & country_filter & type_filter & not_anon_filter)


class OrgSearchView(UserPassesTestMixin, TemplateView):
    template_name = 'orgsearch.html'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(OrgSearchView, self).get_context_data(**kwargs)
        context['types'] = [(UserType.ACA.value, UserType.ACA.label), (UserType.IGO.value, UserType.IGO.label),
                            (UserType.NGO.value, UserType.NGO.label), (UserType.LAW.value, UserType.LAW.label),
                            (UserType.GOV.value, UserType.GOV.label), (UserType.COM.value, UserType.COM.label),
                            (UserType.JRN.value, UserType.JRN.label)]
        return context


class GroupSearchView(UserPassesTestMixin, FormView):
    template_name = 'groupsearch.html'
    form_class = CreateNewGroupForm

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(GroupSearchView, self).get_context_data(**kwargs)
        context['types'] = UserType.choices
        return context


class SettingsView(UserPassesTestMixin, UpdateView):
    template_name = 'settings.html'
    form_class = UserSettingsForm
    model = UserProfile

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(SettingsView, self).get_context_data(**kwargs)
        return context

    def get_queryset(self):
        return UserProfile.objects.filter(pk=self.request.user.profile.id)

    def get_object(self, queryset=None):
        return self.request.user.profile

    def get_success_url(self):
        return reverse('profile-settings')


class GetMyDetailsAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = ProfilePreviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_object(self):
        return self.request.user.profile


class GetOrgMembersListAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ProfilePreviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        visible_filter = Q(visible=True)
        org_id = self.kwargs['pk']
        membership_filter = Q(primary_org=org_id)
        return UserProfile.objects.filter(visible_filter & membership_filter)


class GetUserGroupMembersListAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ProfilePreviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        group_id = self.kwargs['pk']
        group_members = UserCreatedGroup.objects.get(id=group_id).group.user_set.all()
        visibility_filter = Q(visible=True)
        membership_filter = Q(user__in=group_members)
        if current_user in group_members:
            return UserProfile.objects.filter(visibility_filter & membership_filter)
        else:
            return UserProfile.objects.none()


class GetUserGroupSupplicantsListAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ProfilePreviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        group_id = self.kwargs['pk']
        this_group = UserCreatedGroup.objects.get(id=group_id)
        group_members = this_group.group.user_set.all()
        visibility_filter = Q(visible=True)
        if current_user in group_members:
            return this_group.supplicants.filter(visibility_filter)
        else:
            return UserProfile.objects.none()


class MyOrgDetailView(UserPassesTestMixin, DetailView):
    template_name = 'org.html'
    model = OrganizationGroup
    context_object_name = 'org'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(MyOrgDetailView, self).get_context_data(**kwargs)
        this_group = self.get_object().group
        num_of_org_members = this_group.user_set.all().count()
        context['num_org_members'] = num_of_org_members
        return context

    def get_object(self, queryset=None):
        current_user = self.request.user
        current_user_profile = UserProfile.objects.get(user=current_user)
        return current_user_profile.primary_org


class ListGroupThreadsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = UserGroupThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_groups = self.request.user.groups.all()
        user_group_id = self.kwargs['pk']
        user_group_obj = UserCreatedGroup.objects.get(id=user_group_id)
        user_group_base_group = user_group_obj.group
        if user_group_base_group in current_user_groups:
            return UserGroupThread.objects.filter(user_group=user_group_id).order_by("-last_post_datetime")
        else:
            return UserGroupThread.objects.none()


class ListMessagesInGroupThreadAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = UserGroupMessageSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        thread_id = self.kwargs['pk']
        group_id = UserGroupThread.objects.get(id=thread_id).user_group.id

        current_user_groups = self.request.user.groups.all()
        user_group_obj = UserCreatedGroup.objects.get(id=group_id)
        user_group_base_group = user_group_obj.group
        if user_group_base_group in current_user_groups:
            return UserGroupMessage.objects.filter(thread=thread_id)
        else:
            return UserGroupMessage.objects.none()


class SendMessageToGroupThreadAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = CreateMessageInGroupThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def perform_create(self, serializer):  # TODO right method to overwrite?
        current_user = self.request.user
        current_thread = UserGroupThread.objects.get(id=self.kwargs['pk'])

        if current_user in current_thread.user_group.group.user_set.all():
            serializer.save()


class StartNewGroupThreadAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = UserGroupThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def perform_create(self, serializer):  # TODO right method to overwrite?
        current_user = self.request.user
        current_group = UserCreatedGroup.objects.get(id=self.kwargs['pk'])

        if current_user in current_group.group.user_set.all():
            serializer.save()


class RequestToJoinUserGroup(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get(self, request, *args, **kwargs):
        current_user = self.request.user
        current_group = UserCreatedGroup.objects.get(id=self.kwargs['pk'])

        if current_user not in current_group.group.user_set.all() and current_group.visible:
            if current_group.join_mode == JoinMode.OPN.value:
                current_group.group.user_set.add(current_user)
            else:
                current_group.supplicants.add(current_user.profile)
            if current_user.profile in current_group.invited.all():
                current_group.invited.remove(current_user.profile)
            return Response({"code": "success"})
        else:
            return Response({"code": "failure"})


class LeaveUserGroup(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get(self, request, *args, **kwargs):
        current_user = self.request.user
        current_group = UserCreatedGroup.objects.get(id=self.kwargs['pk'])

        if current_user in current_group.group.user_set.all():
            if current_user.profile in current_group.admins.all():
                current_group.admins.remove(current_user.profile)  # todo what to do when there are no more admins?
            current_group.group.user_set.remove(current_user)
            return Response({"code": "success"})
        else:
            return Response({"code": "failure"})


class CancelJoinRequest(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get(self, request, *args, **kwargs):
        current_user = self.request.user
        current_group = UserCreatedGroup.objects.get(id=self.kwargs['pk'])

        if current_user.profile in current_group.supplicants.all() or current_user.profile in current_group.invited.all():
            current_group.supplicants.remove(current_user.profile)
            current_group.invited.remove(current_user.profile)
            return Response({"code": "success"})
        else:
            return Response({"code": "failure"})


class AcceptUserRequestToJoinUserGroup(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def post(self, request, *args, **kwargs):
        current_user = self.request.user
        current_group = UserCreatedGroup.objects.get(id=self.kwargs['pk'])
        user_to_add_id = int(request.data['user'])  # will be profile id, not user id
        user_to_add = UserProfile.objects.get(id=user_to_add_id)

        if user_to_add in current_group.supplicants.all():
            if current_group.join_mode == JoinMode.MCA.value and current_user in current_group.group.user_set.all():
                current_group.group.user_set.add(user_to_add.user)
                current_group.supplicants.remove(user_to_add)

                new_notification = Notification(content_type=ContentType.objects.get_for_model(UserCreatedGroup), object_id=current_group.id)
                new_notification.recipient_users.set((user_to_add,))
                new_notification.save()

                return Response({"code": "success"})
            else:
                if current_user.profile in current_group.admins.all():
                    current_group.group.user_set.add(user_to_add.user)
                    current_group.supplicants.remove(current_user)

                    new_notification = Notification(content_type=ContentType.objects.get_for_model(UserCreatedGroup), object_id=current_group.id)
                    new_notification.recipient_users.set((user_to_add,))
                    new_notification.save()

                    return Response({"code": "success"})
                else:
                    return Response({"code": "failure"})
        else:
            return Response({"code": "failure"})


class DeleteUserFromGroup(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def post(self, request, *args, **kwargs):
        current_user = self.request.user
        current_group = UserCreatedGroup.objects.get(id=self.kwargs['pk'])
        user_to_del_id = int(request.data['user'])  # will be profile id, not user id
        user_to_del = UserProfile.objects.get(id=user_to_del_id)

        if user_to_del.user in current_group.group.user_set.all():
            if current_user.profile in current_group.admins.all():
                current_group.group.user_set.remove(user_to_del.user)
                if user_to_del in current_group.admins.all():
                    current_group.admins.remove(user_to_del)  # todo what if this is the last admin?
                return Response({"code": "success"})
            else:
                return Response({"code": "failure"})
        else:
            return Response({"code": "failure"})


class InviteUserToJoinUserGroup(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def post(self, request, *args, **kwargs):
        current_user = self.request.user
        current_user_profile = current_user.profile
        current_group = UserCreatedGroup.objects.get(id=self.kwargs['pk'])
        users_to_add_ids = request.data['users']  # will be profile id, not user id

        if current_user in current_group.group.user_set.all():
            initiator_filter = Q(initiator=current_user_profile)
            recipient_filter = Q(recipient=current_user_profile)
            accepted_filter = Q(accepted=True)
            current_user_connections = [item for item in ConnectionRequest.objects.filter(initiator_filter & accepted_filter).values_list('recipient__id', flat=True)]
            current_user_connections = current_user_connections + [item for item in ConnectionRequest.objects.filter(recipient_filter & accepted_filter).values_list('initiator_id', flat=True)]

            user_ids_successfully_added = []
            for user_id in users_to_add_ids:
                user_id_int = int(user_id)
                if user_id_int in current_user_connections:
                    user_to_add_profile = UserProfile.objects.get(id=user_id_int)
                    current_group.invited.add(user_to_add_profile)
                    user_ids_successfully_added.append(user_id_int)
            if len(user_ids_successfully_added) > 0:
                new_notification = Notification(content_type=ContentType.objects.get_for_model(UserCreatedGroup), object_id=current_group.id)
                new_notification.save()
                new_notification.recipient_users.set(user_ids_successfully_added)
            return Response({"code": "success"})
        else:
            return Response({"code": "failure"})


class DeleteUserRequestToJoinGroup(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def post(self, request, *args, **kwargs):
        print(request.data)
        current_user = self.request.user
        current_group = UserCreatedGroup.objects.get(id=self.kwargs['pk'])
        user_to_add_id = int(request.data['user'])  # will be profile id, not user id
        user_to_add = UserProfile.objects.get(id=user_to_add_id)

        if current_user.profile in current_group.admins.all():
            current_group.supplicants.remove(user_to_add)
            current_group.invited.remove(user_to_add)
            return Response({"code": "success"})
        else:
            return Response({"code": "failure"})

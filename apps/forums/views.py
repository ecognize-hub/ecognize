from crum import get_current_user
from csp.decorators import csp_update
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, DetailView
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, DestroyAPIView, UpdateAPIView
from rest_framework.response import Response
from .serializers import OrgForumSerializer, ForumThreadOverviewSerializer, ForumPostSerializer, ForumSerializer, \
    CustomForumCreationSerializer
from .models import Forum, ForumThread, ForumThreadPost, ForumType
from apps.profiles.models import GenericGroup, OrganizationGroup
from django.db.models import Q
from apps.profiles.decorator_tests import *
from django.contrib.auth.mixins import UserPassesTestMixin
from apps.quotas.models import Quota


class MyOrgPrivateForumView(UserPassesTestMixin, TemplateView):
    template_name = "forum.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(MyOrgPrivateForumView, self).get_context_data(**kwargs)
        forum = Forum.objects.get(participant_organizations=self.request.user.profile.primary_org.id, forum_type=ForumType.ORG.value)
        context['forum_id'] = forum.id
        context['forum_name'] = forum.name
        context['forum_type'] = 'org'
        return context


class ForumDetailView(UserPassesTestMixin, TemplateView):
    template_name = "forum.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(ForumDetailView, self).get_context_data(**kwargs)
        forum = Forum.objects.get(id=self.kwargs['pk'])
        context['forum_id'] = self.kwargs['pk']
        context['forum_type'] = 'public'
        context['forum_name'] = forum.name
        context['is_forum_creator'] = forum.creator == self.request.user.profile
        context['is_admin'] = self.request.user.profile in forum.administrators.all()
        return context


class ForumRetrieveAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = ForumSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_object(self):
        res = self.get_queryset().get(id=self.kwargs['pk'])
        return res

    def get_queryset(self):
        current_user = self.request.user
        current_user_profile = current_user.profile
        all_user_groups = current_user.groups.all()
        generic_groups = GenericGroup.objects.filter(group__in=all_user_groups)
        generic_group_filter = Q(participant_generic_groups__in=generic_groups)
        org_groups = OrganizationGroup.objects.filter(group__in=all_user_groups)
        org_group_filter = Q(participant_organizations__in=org_groups)
        direct_membership_filter = Q(participant_users_profiles=current_user_profile)
        creator_filter = Q(creator=current_user_profile)
        return Forum.objects.filter(org_group_filter | generic_group_filter | direct_membership_filter | creator_filter).distinct()


class MyOrgPrivateForumRetrieveAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = OrgForumSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_object(self):
        current_user = self.request.user
        current_users_affiliation_type = current_user.profile.type
        current_users_main_org = current_user.profile.primary_org
        if current_users_affiliation_type == UserType.VOL or current_users_affiliation_type == '':
            return Forum.objects.none()
        else:
            no_other_users_filter = Q(participant_users_profiles=None)
            no_other_generic_groups_filter = Q(participant_generic_groups=None)
            forum_type_filter = Q(forum_type=ForumType.ORG.value)
            matching_org_filter = Q(participant_organizations=current_users_main_org)
            return Forum.objects.get(no_other_users_filter & no_other_generic_groups_filter & forum_type_filter & matching_org_filter)


class ListForumThreadsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ForumThreadOverviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        forum = Forum.objects.get(id=self.kwargs['pk'])
        current_user_profile = current_user.profile
        if current_user.groups.filter(id__in=forum.participant_generic_groups.all().values('group__id')).exists() or current_user.groups.filter(id__in=forum.participant_organizations.all().values('group__id')).exists() or current_user_profile in forum.participant_users_profiles.all() or current_user_profile == forum.creator:
            return forum.threads.all().order_by("-last_post_datetime")
        else:
            return forum.threads.none()


class StartNewThreadCreateAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = ForumThreadOverviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def create(self, request, *args, **kwargs):
        # only allow thread creation if user is member of forum
        forum = Forum.objects.get(id=self.kwargs['pk'])
        request.data['forum'] = forum.id  # making sure no one tampers with the forum parameter by overwriting it
        current_user = self.request.user
        current_user_profile = current_user.profile
        if current_user.groups.filter(id__in=forum.participant_generic_groups.all().values('group__id')).exists() or current_user.groups.filter(id__in=forum.participant_organizations.all().values('group__id')).exists() or current_user_profile in forum.participant_users_profiles.all() or current_user_profile == forum.creator:
            return super(StartNewThreadCreateAPIView, self).create(request, *args, **kwargs)
        else:
            return Response(status=403)


class PostMessageInThreadCreateAPIVIew(UserPassesTestMixin, CreateAPIView):
    serializer_class = ForumPostSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def create(self, request, *args, **kwargs):
        # only allow thread creation if user is member of forum
        forum = ForumThread.objects.get(id=self.kwargs['pk']).forum
        if int(forum.id) != int(self.kwargs['forum']):  # somebody tampered with parameters
            return Response(status=500)
        current_user = self.request.user
        current_user_profile = current_user.profile
        if current_user.groups.filter(id__in=forum.participant_generic_groups.all().values('group__id')).exists() or current_user.groups.filter(id__in=forum.participant_organizations.all().values('group__id')).exists() or current_user_profile in forum.participant_users_profiles.all() or current_user_profile == forum.creator:
            return super(PostMessageInThreadCreateAPIVIew, self).create(request, *args, **kwargs)
        else:
            return Response(status=403)


class DeletePostInThreadDestroyAPIView(UserPassesTestMixin, DestroyAPIView):
    serializer_class = ForumPostSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_profile = self.request.user.profile
        post = ForumThreadPost.objects.get(pk=self.kwargs['pk'])
        forum_of_post = post.thread.forum
        if current_profile in forum_of_post.administrators.all() or current_profile in forum_of_post.moderators.all() or current_profile == forum_of_post.creator or current_profile == post.author:
            return ForumThreadPost.objects.filter(pk=self.kwargs['pk'])
        else:
            return ForumThread.objects.none()


class DeleteThreadDestroyAPIView(UserPassesTestMixin, DestroyAPIView):
    serializer_class = ForumPostSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_profile = self.request.user.profile
        thread = ForumThread.objects.get(pk=self.kwargs['pk'])
        forum_of_post = thread.forum
        if current_profile in forum_of_post.administrators.all() or current_profile in forum_of_post.moderators.all() or current_profile == forum_of_post.creator:
            return ForumThread.objects.filter(forum=forum_of_post)
        else:
            return ForumThread.objects.filter(author=self.request.user.profile)


class DeleteForumDestroyAPIView(UserPassesTestMixin, DestroyAPIView):
    serializer_class = ForumSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        return Forum.objects.filter(creator=self.request.user.profile, forum_type=ForumType.CST.value, pk=self.kwargs['pk'])


@method_decorator(csp_update(STYLE_SRC=("'unsafe-inline'",)), name='dispatch')
class ThreadDetailView(UserPassesTestMixin, DetailView):
    model = ForumThread
    template_name = "thread.html"
    context_object_name = "thread"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(ThreadDetailView, self).get_context_data(**kwargs)
        current_user_profile = self.request.user.profile
        context['current_user_profile'] = current_user_profile
        return context

    def get_queryset(self):
        return ForumThread.objects.filter(forum__id=self.kwargs['forum'])

    def get_object(self, queryset=None):
        queryset = self.get_queryset()
        current_user = self.request.user
        current_user_profile = current_user.profile
        forum = Forum.objects.get(id=self.kwargs['forum'])
        if current_user.groups.filter(id__in=forum.participant_generic_groups.all().values('group__id')).exists() or current_user.groups.filter(id__in=forum.participant_organizations.all().values('group__id')).exists() or current_user_profile in forum.participant_users_profiles.all() or current_user_profile == forum.creator:
            return queryset.get(id=self.kwargs['pk'])
        else:
            return ForumThread.objects.none()


class ListCustomForumsOfUserAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ForumSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        current_user_profile = current_user.profile
        all_user_groups = current_user.groups.all()
        generic_groups = GenericGroup.objects.filter(group__in=all_user_groups)
        generic_group_filter = Q(participant_generic_groups__in=generic_groups)
        org_groups = OrganizationGroup.objects.filter(group__in=all_user_groups)
        org_group_filter = Q(participant_organizations__in=org_groups)
        direct_membership_filter = Q(participant_users_profiles=current_user_profile)
        creator_filter = Q(creator=current_user_profile)
        forum_type_filter = Q(forum_type=ForumType.CST.value)
        return Forum.objects.filter((org_group_filter | generic_group_filter | direct_membership_filter | creator_filter) & forum_type_filter).distinct()


class ListGenericGroupForumsOfUserAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ForumSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        all_user_groups = current_user.groups.all()
        generic_groups = GenericGroup.objects.filter(group__in=all_user_groups)
        generic_group_filter = Q(participant_generic_groups__in=generic_groups)
        forum_type_filter = Q(forum_type=ForumType.GNR.value)
        return Forum.objects.filter(generic_group_filter & forum_type_filter)


class ListOrgPrimaryForumOfUserAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = ForumSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_object(self):
        current_user = self.request.user
        current_users_affiliation_type = current_user.profile.type
        current_users_main_org = current_user.profile.primary_org
        if current_users_affiliation_type == UserType.VOL or current_users_affiliation_type == UserType.ANO or current_users_affiliation_type == '':
            return Forum.objects.none()
        else:
            return current_users_main_org.own_forums


class ListParentOrgSharedForumOfUserAPIView(UserPassesTestMixin, ListAPIView):  # TODO convert this to DetailView? what if there is a chain of parents?
    serializer_class = ForumSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        current_users_affiliation_type = current_user.profile.type
        current_users_main_org = current_user.profile.primary_org
        if current_users_affiliation_type == UserType.VOL or current_users_affiliation_type == '':
            return Forum.objects.none()
        else:
            no_other_users_filter = Q(participant_users_profiles=None)
            no_other_generic_groups_filter = Q(participant_generic_groups=None)
            forum_type_filter = Q(forum_type=ForumType.PRT.value)
            matching_org_filter = Q(participant_organizations=current_users_main_org)
            return Forum.objects.filter(no_other_users_filter & no_other_generic_groups_filter & forum_type_filter & matching_org_filter)


class ListPublicGroupForumsOfUserAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ForumSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        all_user_groups = current_user.groups.all()
        generic_groups = GenericGroup.objects.filter(group__in=all_user_groups)
        generic_group_filter = Q(participant_generic_groups__in=generic_groups)
        forum_type_filter = Q(forum_type=ForumType.PUB.value)
        # global_level_filter = Q(global_level=LevelTypes.S.value)
        # national_level_filter = Q(global_level=LevelTypes.N.value) & Q()
        return Forum.objects.filter(generic_group_filter & forum_type_filter)


class ThreadSearchTemplateView(UserPassesTestMixin, TemplateView):
    template_name = "search.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(ThreadSearchTemplateView, self).get_context_data(**kwargs)
        forum = Forum.objects.get(id=self.kwargs['pk'])
        context['forum'] = forum
        return context


class SearchThreadAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ForumThreadOverviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        forum_id = self.kwargs['pk']  # self.request.query_params['forum_id'] if 'forum_id' in self.request.query_params.keys() and self.request.query_params['forum_id'] != '' else None
        search_terms = self.request.data['search_terms'] if 'search_terms' in self.request.data.keys() and self.request.data['search_terms'] != '' else None
        search_mode = self.request.data['search_mode'] if 'search_mode' in self.request.data.keys() and self.request.data['search_mode'] != '' else None
        search_field_title = self.request.data['search_field_title'] if 'search_field_title' in self.request.data.keys() and self.request.data['search_field_title'] != '' else None
        search_field_body = self.request.data['search_field_body'] if 'search_field_body' in self.request.data.keys() and self.request.data['search_field_body'] != '' else None

        if forum_id is None or forum_id == '' or search_terms is None or search_terms == '':
            return ForumThread.objects.none()

        search_terms_unpacked = search_terms.split(" ")

        current_forum = Forum.objects.get(id=forum_id)
        current_user = self.request.user
        current_user_profile = current_user.profile

        if not (current_user.groups.filter(id__in=current_forum.participant_generic_groups.all().values('group__id')).exists() or current_user.groups.filter(id__in=current_forum.participant_organizations.all().values('group__id')).exists() or current_user_profile in current_forum.participant_users_profiles.all() or current_user_profile == current_forum.creator):
            return ForumThread.objects.none()

        for term in search_terms_unpacked:
            if len(term) < 4:
                search_terms_unpacked.remove(term)

        if len(search_terms_unpacked) < 1:
            return ForumThread.objects.none()

        title_res = ForumThread.objects.none()
        body_res = ForumThread.objects.none()

        if search_field_title:
            thread_query_q = Q(forum=forum_id)
            title_term_q = Q()
            for term in search_terms_unpacked:
                if search_mode == "AND":
                    title_term_q = title_term_q & Q(subject__icontains=term)
                elif search_mode == "OR":
                    title_term_q = title_term_q | Q(subject__icontains=term)
            thread_query_q = thread_query_q & title_term_q
            title_res = ForumThread.objects.filter(thread_query_q).distinct()
            if not search_field_body:
                return title_res
        if search_field_body:
            post_query_q = Q()
            body_term_q = Q()
            for term in search_terms_unpacked:
                if search_mode == "AND":
                    body_term_q = body_term_q & Q(content__icontains=term)
                elif search_mode == "OR":
                    body_term_q = body_term_q | Q(content__icontains=term)
            post_query_q = post_query_q & body_term_q
            found_posts_thread_ids = ForumThreadPost.objects.filter(post_query_q).values_list('thread', flat=True)
            body_res = ForumThread.objects.filter(id__in=found_posts_thread_ids, forum=forum_id).distinct()
            if not search_field_title:
                return body_res

        if search_field_title and search_field_body:
            return title_res | body_res

    def post(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class CreateCustomForumAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = CustomForumCreationSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)


class EditCustomForumAPIView(UserPassesTestMixin, UpdateAPIView):
    serializer_class = CustomForumCreationSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        user_profile = self.request.user.profile
        pk_filter = Q(pk=self.kwargs['pk'])
        creator_filter = Q(creator=user_profile)
        admin_filter = Q(administrators=user_profile)
        forum_type_filter = Q(forum_type=ForumType.CST.value)
        return Forum.objects.filter(pk_filter & forum_type_filter & (creator_filter | admin_filter))


class ListPostsInForumThreadApiView(UserPassesTestMixin, ListAPIView):
    serializer_class = ForumPostSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        current_user_profile = current_user.profile
        forum = Forum.objects.get(id=self.kwargs['forum'])
        if current_user.groups.filter(id__in=forum.participant_generic_groups.all().values('group__id')).exists() or current_user.groups.filter(id__in=forum.participant_organizations.all().values('group__id')).exists() or current_user_profile in forum.participant_users_profiles.all() or current_user_profile == forum.creator:
            thread = ForumThread.objects.get(id=self.kwargs['pk'])
            return thread.posts.all().order_by('sent_timestamp')
        else:
            return ForumThread.objects.none()


class AllForumsView(UserPassesTestMixin, TemplateView):
    template_name = "all_forums.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        current_org = get_current_user().profile.primary_org
        current_org_id = current_org.id
        context = super(AllForumsView, self).get_context_data(**kwargs)
        context['occupation_types'] = UserType.choices
        context['current_user_profile_id'] = self.request.user.profile.id
        context['current_user_occupation_type'] = self.request.user.profile.type
        context['org_name'] = current_org.display_name
        context['usage'] = Quota.objects.get(pk=current_org_id).get_usage_and_limit("forums")
        return context

from django.conf.urls import url
from django.urls import path
from django.contrib.auth.decorators import login_required
from .views import GlobalUserRankingListView, UserProfileDetailView, MyUserProfileDetailView, \
    NationalUserRankingListView, OrgDetailView, MyOrgDetailView, SearchOrgsGloballyAPIView, SearchOrgsNationallyAPIView, \
    MyUserProfilePreviewAPIView, SearchUsersAPIView, OrgSearchView, GroupSearchView, SearchUserCreatedGroupsGloballyAPIView, \
    UserGroupDetailView, CreateUserGroupAPIView, UpdateDestroyUserGroupAPIView, ListMyGroupsListAPIView, GetOrgMembersListAPIView, \
    GetMyDetailsAPIView, GetUserGroupMembersListAPIView, ListGroupThreadsAPIView, ListMessagesInGroupThreadAPIView, SendMessageToGroupThreadAPIView, \
    StartNewGroupThreadAPIView, SearchOccupationalGroupsGloballyAPIView, LeaveUserGroup, AcceptUserRequestToJoinUserGroup, \
    InviteUserToJoinUserGroup, RequestToJoinUserGroup, CancelJoinRequest, GetUserGroupSupplicantsListAPIView, \
    DeleteUserRequestToJoinGroup, DeleteUserFromGroup, UpdateProfileAPIView, SettingsView


urlpatterns = [
    path('rankings/global', login_required(GlobalUserRankingListView.as_view()), name='global-userrankinglist'),
    path('rankings/national', login_required(NationalUserRankingListView.as_view()), name='national-userrankinglist'),
    url(r'user/id/(?P<pk>[0-9]+)$', login_required(UserProfileDetailView.as_view()), name="userprofile-detail"),  # GET
    url(r'api/occupational_group/search/global$', login_required(SearchOccupationalGroupsGloballyAPIView.as_view()), name="api-occupationalgroups-search-global"),  # GET
    url(r'api/org/search/global$', login_required(SearchOrgsGloballyAPIView.as_view()), name="api-orggroups-search-global"),  # GET
    url(r'api/user_group/search/global$', login_required(SearchUserCreatedGroupsGloballyAPIView.as_view()), name="api-usergroups-search-global"),  # GET
    url(r'api/user_group/create$', login_required(CreateUserGroupAPIView.as_view()), name="api-usergroups-create"),  # POST
    url(r'api/user_group/(?P<pk>[0-9]+)/users/join$', login_required(RequestToJoinUserGroup.as_view()), name='api-usergroup-join'),  # GET
    url(r'api/user_group/(?P<pk>[0-9]+)/users/invite$', login_required(InviteUserToJoinUserGroup.as_view()), name='api-usergroup-invite'),  # POST
    url(r'api/user_group/(?P<pk>[0-9]+)/users/leave$', login_required(LeaveUserGroup.as_view()), name='api-usergroup-leave'),  # POST
    url(r'api/user_group/(?P<pk>[0-9]+)/users/admit$', login_required(AcceptUserRequestToJoinUserGroup.as_view()), name='api-usergroup-admit'),  # POST
    url(r'api/user_group/(?P<pk>[0-9]+)/users/deny$', login_required(DeleteUserRequestToJoinGroup.as_view()), name='api-usergroup-deny'),  # POST
    url(r'api/user_group/(?P<pk>[0-9]+)/users/cancel$', login_required(CancelJoinRequest.as_view()), name='api-usergroup-cancel'),  # GET
    url(r'api/user_group/(?P<pk>[0-9]+)/users/remove$', login_required(DeleteUserFromGroup.as_view()), name='api-usergroup-remove'),  # GET
    url(r'api/user_group/(?P<pk>[0-9]+)/threads$', login_required(ListGroupThreadsAPIView.as_view()), name='api-groupthreads-list'),  # GET
    url(r'api/user_group/(?P<pk>[0-9]+)/threads/new$', login_required(StartNewGroupThreadAPIView.as_view()), name='api-groupthreads-new'),  # POST
    url(r'api/user_group/(?P<group>[0-9]+)/threads/(?P<pk>[0-9]+)$', login_required(ListMessagesInGroupThreadAPIView.as_view()), name='api-groupmessages-list'),  # GET
    url(r'api/user_group/(?P<group>[0-9]+)/threads/(?P<pk>[0-9]+)/send$', login_required(SendMessageToGroupThreadAPIView.as_view()), name='api-groupmessages-send'),  # POST
    url(r'api/user_group/(?P<pk>[0-9]+)$', login_required(UpdateDestroyUserGroupAPIView.as_view()), name="api-usergroups-update-delete"),  # PATCH/PUT/DELETE
    url(r'api/org/search/national$', login_required(SearchOrgsNationallyAPIView.as_view()), name="api-orggroups-search-national"),  # GET
    url(r'api/org/(?P<pk>[0-9]+)/members$', login_required(GetOrgMembersListAPIView.as_view()), name="api-orggroups-members"),  # GET
    url(r'api/user_group/(?P<pk>[0-9]+)/members$', login_required(GetUserGroupMembersListAPIView.as_view()), name="api-usergroups-members"),  # GET
    url(r'api/user_group/(?P<pk>[0-9]+)/supplicants$', login_required(GetUserGroupSupplicantsListAPIView.as_view()), name="api-usergroups-supplicants"),  # GET
    url(r'api/profile/me/preview$', login_required(MyUserProfilePreviewAPIView.as_view()), name="api-my-profile-preview"),  # GET
    url(r'api/profile/me/update$', login_required(UpdateProfileAPIView.as_view()), name="api-my-profile-update"),  # PUT/PATCH
    url(r'api/profile/search$', login_required(SearchUsersAPIView.as_view()), name="api-profile-search"),  # GET
    url(r'api/user_group/mine$', login_required(ListMyGroupsListAPIView.as_view()), name="api-my-groups"),  # GET
    url(r'api/me$', login_required(GetMyDetailsAPIView.as_view()), name="api-me"),  # GET
    url(r'org/id/(?P<pk>[0-9]+)$', login_required(OrgDetailView.as_view()), name="org-detail"),  # GET
    url(r'user_group/id/(?P<pk>[0-9]+)$', login_required(UserGroupDetailView.as_view()), name="usergroup-detail"),  # GET
    url(r'org/mine$', login_required(MyOrgDetailView.as_view()), name="my-org-detail"),  # GET
    url(r'org/search$', login_required(OrgSearchView.as_view()), name="org-search"),  # GET
    url(r'settings$', login_required(SettingsView.as_view()), name="profile-settings"),  # GET / POST
    url(r'user_group/search$', login_required(GroupSearchView.as_view()), name="group-search"),  # GET
    url(r'user/me$', login_required(MyUserProfileDetailView.as_view()), name="my-userprofile-detail"),  # GET
]

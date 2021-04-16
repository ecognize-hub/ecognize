from django.conf.urls import url
from django.urls import path
from django.contrib.auth.decorators import login_required
from .views import MyOrgPrivateForumRetrieveAPIView, ListForumThreadsAPIView, \
    ThreadDetailView, ListPostsInForumThreadApiView, StartNewThreadCreateAPIView, PostMessageInThreadCreateAPIVIew, \
    ListCustomForumsOfUserAPIView, ForumRetrieveAPIView, ForumDetailView, DeletePostInThreadDestroyAPIView, \
    DeleteThreadDestroyAPIView, ListGenericGroupForumsOfUserAPIView, ListPublicGroupForumsOfUserAPIView, \
    AllForumsView, ListOrgPrimaryForumOfUserAPIView, CreateCustomForumAPIView, DeleteForumDestroyAPIView, \
    ListParentOrgSharedForumOfUserAPIView, SearchThreadAPIView, ThreadSearchTemplateView, EditCustomForumAPIView

urlpatterns = [
    url(r'^api/forum/org$', login_required(MyOrgPrivateForumRetrieveAPIView.as_view()), name="api-forum-my-org"),  # GET
    url(r'^api/forums/org$', login_required(ListOrgPrimaryForumOfUserAPIView.as_view()), name="api-forums-list-my-org"),  # GET
    url(r'^api/forums/custom$', login_required(ListCustomForumsOfUserAPIView.as_view()), name="api-forums-list-custom"),  # GET
    url(r'^api/forums/custom/new$', login_required(CreateCustomForumAPIView.as_view()), name="api-forums-create-custom"),  # GET
    url(r'^api/forums/occ_group$', login_required(ListGenericGroupForumsOfUserAPIView.as_view()), name="api-forums-list-occupational-group"),  # GET
    url(r'^api/forums/public$', login_required(ListPublicGroupForumsOfUserAPIView.as_view()), name="api-forums-list-public"),  # GET
    url(r'^api/forums/parent$', login_required(ListParentOrgSharedForumOfUserAPIView.as_view()), name="api-forums-list-parent"),  # GET
    url(r'^api/id/(?P<pk>[0-9]+)$', login_required(ForumRetrieveAPIView.as_view()), name="api-forum-details"),  # GET
    url(r'^api/id/(?P<pk>[0-9]+)/delete$', login_required(DeleteForumDestroyAPIView.as_view()), name="api-forum-delete"),  # GET
    url(r'^api/id/(?P<pk>[0-9]+)/edit$', login_required(EditCustomForumAPIView.as_view()), name="api-forum-edit"),  # GET
    url(r'^api/id/(?P<pk>[0-9]+)/thread$', login_required(ListForumThreadsAPIView.as_view()), name="api-forum-threads-list"),  # GET
    url(r'^api/id/(?P<pk>[0-9]+)/thread/new$', login_required(StartNewThreadCreateAPIView.as_view()), name="api-forum-threads-new"),  # PUT
    url(r'^api/id/(?P<pk>[0-9]+)/thread/search$', login_required(SearchThreadAPIView.as_view()), name="api-forum-threads-search"),  # GET
    url(r'^api/id/(?P<forum>[0-9]+)/thread/(?P<pk>[0-9]+)$', login_required(ListPostsInForumThreadApiView.as_view()), name="api-thread-posts-list"),  # GET
    url(r'^api/id/(?P<forum>[0-9]+)/thread/(?P<pk>[0-9]+)/new$', login_required(PostMessageInThreadCreateAPIVIew.as_view()), name="api-thread-posts-new"),  # GET
    url(r'^api/id/(?P<forum>[0-9]+)/thread/(?P<pk>[0-9]+)/delete$', login_required(DeleteThreadDestroyAPIView.as_view()), name="api-forum-thread-delete"),  # DELETE
    url(r'^api/id/(?P<forum>[0-9]+)/thread/(?P<thread>[0-9]+)/post/(?P<pk>[0-9]+)/delete$', login_required(DeletePostInThreadDestroyAPIView.as_view()), name="api-forum-post-delete"),  # DELETE
    url(r'^forum/(?P<forum>[0-9]+)/thread/(?P<pk>[0-9]+)/$', login_required(ThreadDetailView.as_view()), name="thread-detail"),  # GET
    url(r'^forum/(?P<pk>[0-9]+)/$', login_required(ForumDetailView.as_view()), name="forum-details"),  # GET
    url(r'^forum/(?P<pk>[0-9]+)/search$', login_required(ThreadSearchTemplateView.as_view()), name="forum-threads-search"),  # GET
    path('', login_required(AllForumsView.as_view()), name='forums-all'),  # GET
]

from .views import FeatureRequestsOverview, ListAllIssuesAPIView, ListMyIssues, ListMyUpvotes, ListCommentsForIssue, \
    PostCommentForIssue, CreateNewIssue
from django.conf.urls import url
from django.contrib.auth.decorators import login_required


urlpatterns = [
    url(r'^issues$', login_required(FeatureRequestsOverview.as_view()), name='view-issues-overview'),  # GET
    url(r'^api/issues/all$', login_required(ListAllIssuesAPIView.as_view()), name='api-issues-all-list'),  # GET
    url(r'^api/issues/new$', login_required(CreateNewIssue.as_view()), name='api-issues-create'),  # GET
    url(r'^api/issues/(?P<pk>[0-9]+)/comments$', login_required(ListCommentsForIssue.as_view()), name='api-issues-comment-list'),  # GET
    url(r'^api/issues/(?P<pk>[0-9]+)/comments/new$', login_required(PostCommentForIssue.as_view()), name='api-issues-comment-add'),  # POST
    url(r'^api/issues/mine$', login_required(ListMyIssues.as_view()), name='api-issues-mine-list'),  # GET
    url(r'^api/upvotes/mine$', login_required(ListMyUpvotes.as_view()), name='api-issues-upvotes-mine-list'),  # GET
]

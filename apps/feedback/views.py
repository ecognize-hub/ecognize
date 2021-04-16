from django.contrib.contenttypes.models import ContentType
from django.views.generic import TemplateView
from rest_framework.generics import ListAPIView, CreateAPIView
from .serializers import IssueSerializer, IssueCommentSerializer
from .models import Issue, IssueTypes, IssueComment


class FeatureRequestsOverview(TemplateView):
    template_name = "issues.html"

    def get_context_data(self, **kwargs):
        context = super(FeatureRequestsOverview, self).get_context_data(**kwargs)
        context['request_types'] = IssueTypes.choices
        context['ctids'] = {
            'Issue': ContentType.objects.get_for_model(Issue).id,
            'IssueComment': ContentType.objects.get_for_model(IssueComment).id
        }
        return context


class ListAllIssuesAPIView(ListAPIView):
    serializer_class = IssueSerializer
    queryset = Issue.objects.all().order_by("-thanks")


class ListMyUpvotes(ListAPIView):
    serializer_class = IssueSerializer

    def get_queryset(self):
        my_profile = self.request.user.profile
        return my_profile.issues_upvoted.all()


class ListMyIssues(ListAPIView):
    serializer_class = IssueSerializer

    def get_queryset(self):
        my_profile = self.request.user.profile
        return my_profile.issues_created.all()


class ListCommentsForIssue(ListAPIView):
    serializer_class = IssueCommentSerializer

    def get_queryset(self):
        return Issue.objects.get(id=self.kwargs['pk']).comments.all().order_by("sent_timestamp")


class PostCommentForIssue(CreateAPIView):
    serializer_class = IssueCommentSerializer


class CreateNewIssue(CreateAPIView):
    serializer_class = IssueSerializer

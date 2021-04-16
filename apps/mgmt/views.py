from django.contrib.auth.mixins import UserPassesTestMixin
from django.views.generic import ListView
from rest_framework.generics import CreateAPIView, DestroyAPIView
from apps.usermgmt.models import OrgAdditionRequest
from .serializers import CreateUpdateOrgGroupSerializer
from apps.profiles.models import OrganizationGroup, UserType


class ListOrgAdditionRequests(UserPassesTestMixin, ListView):
    template_name = 'org_add_requests_admin.html'
    model = OrgAdditionRequest
    context_object_name = "add_requests"

    def get_context_data(self, **kwargs):
        context = super(ListOrgAdditionRequests, self).get_context_data(**kwargs)
        context['all_orgs'] = OrganizationGroup.objects.all()
        context['org_types'] = [UserType.ACA, UserType.NGO, UserType.LAW, UserType.JRN, UserType.COM, UserType.GOV, UserType.IGO]
        return context

    def test_func(self):
        u = self.request.user
        return u.is_superuser

    def get_queryset(self):
        return OrgAdditionRequest.objects.filter(email_confirmed=True)


class ListOrgAdmins(UserPassesTestMixin, ListView):
    template_name = 'org_admins.html'
    model = OrganizationGroup
    context_object_name = "org_groups"

    def test_func(self):
        u = self.request.user
        return u.is_superuser

    def get_queryset(self):
        return OrganizationGroup.objects.all()


class CreateOrgGroupFromRequestAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = CreateUpdateOrgGroupSerializer

    def test_func(self):
        u = self.request.user
        return u.is_superuser

    def perform_create(self, serializer):
        serializer.save()
        req_id = self.kwargs.get('pk')
        OrgAdditionRequest.objects.get(pk=req_id).delete()


class CreateOrgGroupAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = CreateUpdateOrgGroupSerializer

    def test_func(self):
        u = self.request.user
        return u.is_superuser

    def perform_create(self, serializer):
        serializer.save()


class DeleteOrgRequestAPIView(UserPassesTestMixin, DestroyAPIView):

    def test_func(self):
        u = self.request.user
        return u.is_superuser

    def get_object(self, **kwargs):
        return OrgAdditionRequest.objects.get(pk=kwargs['pk'])

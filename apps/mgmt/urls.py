from .views import ListOrgAdditionRequests, CreateOrgGroupFromRequestAPIView, DeleteOrgRequestAPIView, CreateOrgGroupAPIView, \
    ListOrgAdmins
from django.conf.urls import url


urlpatterns = [
    url(r'^req_org_addition/admin$', ListOrgAdditionRequests.as_view(), name='req-org-addition-admin'),
    url(r'^req_org_addition/api/add/(?P<pk>[0-9]+)$', CreateOrgGroupFromRequestAPIView.as_view(), name='api-req-org-addition-add'),
    url(r'^req_org_addition/api/add/$', CreateOrgGroupAPIView.as_view(), name='api-org-addition-add'),
    url(r'^req_org_addition/api/del/(?P<pk>[0-9]+)$', DeleteOrgRequestAPIView.as_view(), name='api-req-org-addition-delete'),
    url(r'^org_admins/admin$', ListOrgAdmins.as_view(), name='org-admins'),
]

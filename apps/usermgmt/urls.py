from django.conf.urls import url
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView, TokenVerifyView
)

from .views import create_user_view, SignupMailSentView, SignupDomainError, create_org_addition_request, RequestOrgAdditionSuccess, \
    activate_user, RequestOrgAdditionAPIView, OrgMailSentView, activate_org, RegisterAnonymousContributor


urlpatterns = [
    path('', include('django.contrib.auth.urls')),
    url(r'^signup$', create_user_view, name='signup'),
    url(r'^api/signup/anon$', RegisterAnonymousContributor.as_view(), name='api-signup-anon'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),  # TODO remove
    url(r'^regmailsent$', SignupMailSentView.as_view(), name='regmailsent'),
    url(r'^orgregmailsent$', OrgMailSentView.as_view(), name='org-reg-mail-sent'),
    url(r'^request_org_addition$', create_org_addition_request, name='req-org-addition'),
    url(r'^request_org_addition/create$', RequestOrgAdditionAPIView.as_view(), name='api-req-org-addition-create'),
    url(r'^request_org_addition/success$', RequestOrgAdditionSuccess.as_view(), name='req-org-addition-success'),
    url(r'^error/domainmismatch/(?P<pk>[0-9]+)$', SignupDomainError.as_view(), name='signup-domain-error'),
    url(r'^activate_user/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]*-[0-9A-Za-z]*)/$', activate_user, name='activate_user'),
    url(r'^activate_org/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]*-[0-9A-Za-z]*)/$', activate_org, name='activate_org'),
]

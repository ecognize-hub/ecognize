from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from .views import ListMyReceivedNotificationsView, GetObjectBehindNotification, ToggleReadStatus

urlpatterns = [
    url(r'mine/received$', login_required(ListMyReceivedNotificationsView.as_view()), name='my-notifications-list'),  # GET
    url(r'id/(?P<pk>[0-9]+)/go$', login_required(GetObjectBehindNotification.as_view()), name="goto-notification-target"),  # GET
    url(r'id/(?P<pk>[0-9]+)/toggle$', login_required(ToggleReadStatus.as_view()), name="api-notification-toggle-readstatus"),  # GET
]

from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from .views import ChatOverview, ListMyChatThreadsAPIView, ListMessagesInThreadAPIView, SendChatMessageToThread, ConnectionsOverview, \
    GetMyConnectionsListAPIView, RequestConnectionView, ListMySentConnectionRequests, ListMyReceivedConnectionRequests, \
    StartChatThreadCreateAPIView, DeleteConnectionRequestByProfileId, AcceptConnectionRequestByUserId, \
    GetUsersConnectionsListAPIView, HandleThanks

urlpatterns = [
    url(r'api/messages/threads$', login_required(ListMyChatThreadsAPIView.as_view()), name='api-chatthreads-list'),  # GET
    url(r'api/messages/threads/new$', login_required(StartChatThreadCreateAPIView.as_view()), name='api-chatthread-start'),  # GET
    url(r'api/messages/thread/id/(?P<pk>[0-9]+)/messages$', login_required(ListMessagesInThreadAPIView.as_view()), name='api-messages-in-chat-list'),  # GET
    url(r'api/messages/thread/id/(?P<pk>[0-9]+)/messages/send$', login_required(SendChatMessageToThread.as_view()), name='api-messages-in-chat-send'),  # GET
    url(r'api/connections/me$', login_required(GetMyConnectionsListAPIView.as_view()), name='api-connections-list'),  # GET
    url(r'api/connections/id/(?P<pk>[0-9]+)$', login_required(GetUsersConnectionsListAPIView.as_view()), name='api-connections-list-others'),  # GET
    url(r'api/connections/requests/new$', login_required(RequestConnectionView.as_view()), name='api-connections-request-create'),  # GET
    url(r'api/connections/requests/sent$', login_required(ListMySentConnectionRequests.as_view()), name='api-connections-request-sent'),  # GET
    url(r'api/connections/requests/user/(?P<pk>[0-9]+)/delete$', login_required(DeleteConnectionRequestByProfileId.as_view()), name='api-connections-request-delete'),  # DELETE
    url(r'api/connections/requests/user/(?P<pk>[0-9]+)/accept$', login_required(AcceptConnectionRequestByUserId.as_view()), name='api-connections-request-accept'),  # POST
    url(r'api/connections/requests/received$', login_required(ListMyReceivedConnectionRequests.as_view()), name='api-connections-request-received'),  # GET
    url(r'api/thanks/(?P<type>[0-9]+)/(?P<obj>[0-9]+)$', login_required(HandleThanks.as_view()), name='api-thanks'),  # GET and POST
    url(r'messages$', login_required(ChatOverview.as_view()), name='messages-overview'),  # GET
    url(r'connections$', login_required(ConnectionsOverview.as_view()), name='connections-overview'),  # GET
]

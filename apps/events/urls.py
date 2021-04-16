from django.conf.urls import url
from django.urls import path
from django.contrib.auth.decorators import login_required
from .views import NationalEventSearchTemplateView, SearchEventsAPIListView, MyEventsAPIListView, MyEventsTemplateView, CreateNewEventFormView, \
    CreateNewEventCreateAPIView, EventDetailView, ListEventThreadsAPIView, SendMessageToEventThreadAPIView, \
    ListParticipantsAPIView, ListInvitedAPIView, DeleteEventAPIView, UpdateEventFormView, UpdateEventAPIView, \
    StartNewEventThreadCreateAPIView, InviteUserAPIView, ParticipateInEventAPIView, CancelParticipationInEventAPIView

urlpatterns = [
    url(r'api/search/national$', login_required(SearchEventsAPIListView.as_view()), name="api-events-national-search"),  # GET
    url(r'api/mine$', login_required(MyEventsAPIListView.as_view()), name="api-events-mine-list"),  # GET
    url(r'api/new$', login_required(CreateNewEventCreateAPIView.as_view()), name="api-events-create"),  # POST
    url(r'api/event/(?P<pk>[0-9]+)/threads$', login_required(ListEventThreadsAPIView.as_view()), name='api-events-threads-list'),  # GET
    url(r'api/event/(?P<pk>[0-9]+)/threads/new$', login_required(StartNewEventThreadCreateAPIView.as_view()), name='api-events-threads-new'),  # GET
    url(r'api/event/(?P<pk>[0-9]+)/delete$', login_required(DeleteEventAPIView.as_view()), name='api-events-delete'),  # DELETE
    url(r'api/event/(?P<pk>[0-9]+)/edit$', login_required(UpdateEventAPIView.as_view()), name='api-events-edit'),  # POST
    url(r'api/event/(?P<event>[0-9]+)/threads/(?P<pk>[0-9]+)/send$', login_required(SendMessageToEventThreadAPIView.as_view()), name='api-event-thread-message-send'),  # POST
    url(r'api/event/(?P<pk>[0-9]+)/participants$', login_required(ListParticipantsAPIView.as_view()), name='api-events-participants-list'),  # GET
    url(r'api/event/(?P<pk>[0-9]+)/invited$', login_required(ListInvitedAPIView.as_view()), name='api-events-invited-list'),  # GET
    url(r'api/event/(?P<pk>[0-9]+)/invite$', login_required(InviteUserAPIView.as_view()), name='api-events-invite-contact'),  # POST
    url(r'api/event/(?P<pk>[0-9]+)/participate$', login_required(ParticipateInEventAPIView.as_view()), name='api-events-participate'),  # GET
    url(r'api/event/(?P<pk>[0-9]+)/cancel$', login_required(CancelParticipationInEventAPIView.as_view()), name='api-events-cancel'),  # GET
    url(r'id/(?P<pk>[0-9]+)$', login_required(EventDetailView.as_view()), name="view-events-detail"),  # GET
    url(r'id/(?P<pk>[0-9]+)/edit$', login_required(UpdateEventFormView.as_view()), name="view-events-edit"),  # GET
    path('map/national', login_required(NationalEventSearchTemplateView.as_view()), name='view-events-national-search'),
    path('new', login_required(CreateNewEventFormView.as_view()), name='view-events-create'),
    path('mine', login_required(MyEventsTemplateView.as_view()), name='view-events-mine-list'),
]

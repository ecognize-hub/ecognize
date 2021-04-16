from csp.decorators import csp_update
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, FormView, DetailView, UpdateView
from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.views import APIView
from apps.profiles.models import UserProfile
from apps.profiles.serializers import ProfilePreviewSerializer
from .models import EventType, Event, EventThread, EventThreadMessage
from .serializers import EventSerializer, CreateMessageInEventThreadSerializer, EventMessageSerializer, EventThreadSerializer
from .forms import NewEventForm
from django.db.models import Q
from apps.profiles.decorator_tests import *
from django.contrib.auth.mixins import UserPassesTestMixin
from apps.social.models import ConnectionRequest
from apps.notifications.models import Notification
from django.contrib.contenttypes.models import ContentType
from rest_framework.response import Response


class NationalEventSearchTemplateView(UserPassesTestMixin, TemplateView):
    template_name = 'events_search.html'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        current_user = self.request.user
        current_user_country = UserProfile.objects.get(user=current_user).country
        context = super(NationalEventSearchTemplateView, self).get_context_data(**kwargs)
        context['offline_categories'] = EventType.choices
        context['online_categories'] = [EventType.TRN, EventType.PRS, EventType.MUP, EventType.OTR]
        context['usercountry'] = current_user_country
        return context


@method_decorator(csp_update(STYLE_SRC=("'unsafe-inline'",)), name='dispatch')
class CreateNewEventFormView(UserPassesTestMixin, FormView):
    form_class = NewEventForm
    template_name = "create_event.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(CreateNewEventFormView, self).get_context_data(**kwargs)
        context['mode_button'] = "Create event"
        context['mode'] = "Create"
        return context


class CreateNewEventCreateAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = EventSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)


@method_decorator(csp_update(STYLE_SRC=("'unsafe-inline'",)), name='dispatch')
class UpdateEventFormView(UserPassesTestMixin, UpdateView):
    form_class = NewEventForm
    template_name = "create_event.html"
    context_object_name = "event"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        admin_filter = Q(admin=current_user_profile)
        cohosts_filter = Q(cohosts=current_user_profile)
        return Event.objects.filter(admin_filter | cohosts_filter)

    def get_context_data(self, **kwargs):
        context = super(UpdateEventFormView, self).get_context_data(**kwargs)
        context['mode_button'] = "Update event"
        context['mode'] = "Update"
        return context


class UpdateEventAPIView(UserPassesTestMixin, UpdateAPIView):
    serializer_class = EventSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        admin_filter = Q(admin=current_user_profile)
        cohosts_filter = Q(cohosts=current_user_profile)
        return Event.objects.filter(admin_filter | cohosts_filter)


class MyEventsTemplateView(UserPassesTestMixin, TemplateView):
    template_name = 'my_events.html'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(MyEventsTemplateView, self).get_context_data(**kwargs)
        context['categories'] = EventType.choices
        return context


class DeleteEventAPIView(UserPassesTestMixin, DestroyAPIView):
    serializer_class = EventSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        admin_filter = Q(admin=current_user_profile)
        return Event.objects.filter(admin_filter)


class MyEventsAPIListView(UserPassesTestMixin, ListAPIView):
    serializer_class = EventSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        admin_filter = Q(admin=current_user_profile)
        cohost_filter = Q(cohosts=current_user_profile)
        invited_filter = Q(invited=current_user_profile)
        participating_filter = Q(participants=current_user_profile)

        return Event.objects.filter(admin_filter | cohost_filter | invited_filter | participating_filter).order_by("datetime_start").distinct()


class EventDetailView(UserPassesTestMixin, DetailView):
    template_name = "event_detail.html"
    context_object_name = "event"
    queryset = Event.objects.all()

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(EventDetailView, self).get_context_data(**kwargs)
        context['categories'] = EventType.choices
        current_profile = self.request.user.profile
        selected_obj = self.get_object(self.queryset)
        context['admin'] = current_profile == selected_obj.admin
        context['cohosts'] = current_profile in selected_obj.cohosts.all()
        context['participating'] = current_profile in selected_obj.participants.all()
        context['ctids'] = {'EventThreadMessage': ContentType.objects.get(app_label='events', model='eventthreadmessage').id}
        return context

    def get_object(self, queryset=None):
        current_profile = self.request.user.profile
        obj = Event.objects.get(id=self.kwargs['pk'])

        if obj.public or current_profile == obj.admin or current_profile in obj.cohosts.all() or current_profile in obj.participants.all() or current_profile in obj.invited.all():
            return obj
        else:
            return Event.objects.none()


class SearchEventsAPIListView(UserPassesTestMixin, ListAPIView):
    serializer_class = EventSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        start_date = self.request.query_params['sdate'] if 'sdate' in self.request.query_params.keys() and self.request.query_params['sdate'] != '' else None
        end_date = self.request.query_params['edate'] if 'edate' in self.request.query_params.keys() and self.request.query_params['edate'] != '' else None
        types = self.request.query_params['types'].split(',') if 'types' in self.request.query_params.keys() and self.request.query_params['types'] != '' else None
        online = self.request.query_params['online'] if 'online' in self.request.query_params.keys() and self.request.query_params['online'] != '' else None

        query_q = Q()

        print("Value of online:")
        print(online)

        if types is not None and types != '':
            query_q = query_q & Q(category__in=types)
        if start_date is not None and end_date is not None and start_date != '' and end_date != '':
            query_q = query_q & Q(datetime_start__range=[start_date, end_date])
        elif start_date is not None and start_date != '':
            query_q = query_q & Q(datetime_start__range=[start_date, '9999-12-12'])
        elif end_date is not None and end_date != '':
            query_q = query_q & Q(datetime_start__range=['0-1-1', end_date])
        if online is not None and online != '':
            if online == 'true':
                query_q = query_q & Q(online=True)
            if online == 'false':
                query_q = query_q & Q(online=False)
                current_user_country = self.request.user.profile.country
                current_user_org_countries = self.request.user.profile.primary_org.countries
                query_q = query_q & (Q(country__in=current_user_org_countries) | Q(country=current_user_country))

        public_filter = Q(public=True)

        queryset = Event.objects.filter(query_q & public_filter).distinct().order_by("datetime_start")
        return queryset


class ListEventThreadsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = EventThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        event_id = self.kwargs['pk']
        event_obj = Event.objects.get(id=event_id)
        if current_user_profile in event_obj.cohosts.all() or current_user_profile in event_obj.participants.all() or current_user_profile == event_obj.admin:
            return EventThread.objects.filter(event=event_obj).order_by("-last_post_datetime")
        else:
            return EventThread.objects.none()


class ListParticipantsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ProfilePreviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        event_id = self.kwargs['pk']
        event_obj = Event.objects.get(id=event_id)
        if current_user_profile in event_obj.cohosts.all() or current_user_profile in event_obj.participants.all() or current_user_profile == event_obj.admin:
            return event_obj.participants.all()
        else:
            return UserProfile.objects.none()


class ListInvitedAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ProfilePreviewSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        event_id = self.kwargs['pk']
        event_obj = Event.objects.get(id=event_id)
        if current_user_profile in event_obj.cohosts.all() or current_user_profile in event_obj.participants.all() or current_user_profile == event_obj.admin:
            return event_obj.invited.all()
        else:
            return UserProfile.objects.none()


class InviteUserAPIView(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def post(self, request, *args, **kwargs):
        current_user = self.request.user
        current_user_profile = current_user.profile
        current_event = Event.objects.get(id=self.kwargs['pk'])
        users_to_add_ids = request.data['users']  # will be profile id, not user id

        if current_user_profile in current_event.participants.all() or current_user_profile in current_event.cohosts.all() or current_user_profile == current_event.admin:
            initiator_filter = Q(initiator=current_user_profile)
            recipient_filter = Q(recipient=current_user_profile)
            accepted_filter = Q(accepted=True)
            current_user_connections = [item for item in ConnectionRequest.objects.filter(
                initiator_filter & accepted_filter).values_list('recipient__id', flat=True)]
            current_user_connections = current_user_connections + [item for item in ConnectionRequest.objects.filter(
                recipient_filter & accepted_filter).values_list('initiator_id', flat=True)]

            user_ids_successfully_added = []
            for user_id in users_to_add_ids:
                user_id_int = int(user_id)
                if user_id_int in current_user_connections:
                    user_to_add_profile = UserProfile.objects.get(id=user_id_int)
                    current_event.invited.add(user_to_add_profile)
                    user_ids_successfully_added.append(user_id_int)
            if len(user_ids_successfully_added) > 0:
                new_notification = Notification(content_type=ContentType.objects.get_for_model(Event),
                                                object_id=current_event.id)
                new_notification.save()
                new_notification.recipient_users.set(user_ids_successfully_added)
            return Response({"code": "success"})
        else:
            return Response({"code": "failure"})


class ParticipateInEventAPIView(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get(self, request, *args, **kwargs):  # TODO this should become a post request to make it secure against CSRF
        current_user = self.request.user
        current_user_profile = current_user.profile
        current_event = Event.objects.get(id=self.kwargs['pk'])

        if not (current_user_profile in current_event.participants.all() or current_user_profile in current_event.cohosts.all() or current_user_profile == current_event.admin):
            if current_user_profile in current_event.invited.all() or current_event.public:
                current_event.participants.add(current_user_profile)
                return Response({"code": "success"})
            else:
                return Response({"code": "failure"})
        else:
            return Response({"code": "failure"})


class CancelParticipationInEventAPIView(UserPassesTestMixin, APIView):

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get(self, request, *args, **kwargs):  # TODO this should become a post request to make it secure against CSRF
        current_user = self.request.user
        current_user_profile = current_user.profile
        current_event = Event.objects.get(id=self.kwargs['pk'])

        if current_user_profile in current_event.participants.all() and not current_user_profile == current_event.admin:
            current_event.participants.remove(current_user_profile)
            return Response({"code": "success"})
        else:
            return Response({"code": "failure"})


class SendMessageToEventThreadAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = CreateMessageInEventThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def perform_create(self, serializer):
        current_user_profile = self.request.user.profile
        event_thread_obj = EventThread.objects.get(id=self.kwargs['pk'])

        if current_user_profile in event_thread_obj.event.cohosts.all() or current_user_profile in event_thread_obj.event.participants.all() or current_user_profile == event_thread_obj.event.admin:
            serializer.save()


class StartNewEventThreadCreateAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = EventThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def perform_create(self, serializer):
        current_user_profile = self.request.user.profile
        event_event_obj = Event.objects.get(id=self.kwargs['pk'])

        if current_user_profile in event_event_obj.cohosts.all() or current_user_profile in event_event_obj.participants.all() or current_user_profile == event_event_obj.admin:
            serializer.save()


class ListMessagesInEventThreadAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = EventMessageSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        event_id = self.kwargs['pk']
        event_obj = Event.objects.get(id=event_id)
        if current_user_profile in event_obj.cohosts.all() or current_user_profile in event_obj.participants.all() or current_user_profile == event_obj.admin:
            return EventThreadMessage.objects.filter(event=event_obj).order_by("sent_timestamp")
        else:
            return EventThreadMessage.objects.none()

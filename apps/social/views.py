from django.contrib.auth.mixins import UserPassesTestMixin
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q, Value, IntegerField
from django.views.generic import TemplateView
from rest_framework.exceptions import ValidationError
from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.profiles.decorator_tests import *
from apps.profiles.models import OrganizationGroup, UserProfile
from .models import MessagingThread, MessagingMessage, ConnectionRequest
from .serializers import MessagingThreadSerializer, MessagingMessageSerializer, CreateMessageInThreadSerializer, \
    ConnectionSerializer, CreateOrDeleteConnectionRequestSerializer, SentConnectionRequestSerializer, \
    ReceivedConnectionRequestSerializer, \
    AcceptConnectionRequestSerializer, StartMessagingThreadSerializer
from apps.globalutils.models import ThankableMixin


class ListMyChatThreadsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = MessagingThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_queryset(self):
        initiator_filter = Q(initiator=self.request.user.profile)
        recipient_filter = Q(recipient_users=self.request.user.profile)
        ids_of_all_org_groups = OrganizationGroup.objects.all().values_list('group_id', flat=True)
        current_user_groups = self.request.user.groups.all()
        any_membership_q = Q()
        for grp in current_user_groups:
            if grp.id in ids_of_all_org_groups:
                any_membership_q |= Q(recipient_groups=grp.organizationgroup_set)
        return MessagingThread.objects.filter(initiator_filter | recipient_filter | any_membership_q).order_by("-last_message_timestamp")


# all entities except anonymous contributors can start chats, anonymous contributors can respond though
class StartChatThreadCreateAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = StartMessagingThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)


class ListMessagesInThreadAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = MessagingMessageSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        current_user_profile = current_user.profile
        current_thread = MessagingThread.objects.get(id=self.kwargs['pk'])
        initiator = current_thread.initiator
        recipient_users = current_thread.recipient_users.all()
        recipient_organizations = current_thread.recipient_groups.all()

        user_in_any_recipient_group = False
        base_groups = [org.group for org in recipient_organizations]
        for grp in base_groups:
            if grp in current_user.groups.all():
                user_in_any_recipient_group = True

        if current_user_profile == initiator or current_user_profile in recipient_users or user_in_any_recipient_group:
            return MessagingMessage.objects.filter(thread=current_thread).order_by('sent_timestamp')
        else:
            return MessagingMessage.objects.none()


class SendChatMessageToThread(UserPassesTestMixin, CreateAPIView):
    serializer_class = CreateMessageInThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def perform_create(self, serializer):
        current_user = self.request.user
        current_user_profile = current_user.profile
        current_thread = MessagingThread.objects.get(id=self.kwargs['pk'])
        initiator = current_thread.initiator
        recipient_users = current_thread.recipient_users.all()
        recipient_organizations = current_thread.recipient_groups.all()

        user_in_any_recipient_group = False
        base_groups = [org.group for org in recipient_organizations]
        for grp in base_groups:
            if grp in current_user.groups.all():
                user_in_any_recipient_group = True

        if current_user_profile == initiator or current_user_profile in recipient_users or user_in_any_recipient_group:
            serializer.save()


class RequestConnectionView(UserPassesTestMixin, CreateAPIView):
    serializer_class = CreateOrDeleteConnectionRequestSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def perform_create(self, serializer):
        current_user = self.request.user
        current_user_id = current_user.id
        current_user_profile = current_user.profile
        recipient_user_id = self.request.data['recipient']  # has already been translated by serializer
        recipient_profile = UserProfile.objects.get(id=recipient_user_id)

        if current_user_id != recipient_user_id:  # you cannot add yourself
            if recipient_profile.visible:
                # now checking if a request initiated by us already exists:
                recipient_filter = Q(recipient=recipient_profile)
                initiator_filter = Q(initiator=current_user_profile)
                if not ConnectionRequest.objects.filter(recipient_filter & initiator_filter):
                    # now lets see if one the other way around exists:
                    recipient_filter = Q(recipient=current_user_profile)
                    initiator_filter = Q(initiator=recipient_profile)
                    if not ConnectionRequest.objects.filter(recipient_filter & initiator_filter):
                        serializer.save()


class AcceptConnectionRequestByUserId(UserPassesTestMixin, UpdateAPIView):
    serializer_class = AcceptConnectionRequestSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user = self.request.user
        current_profile_id = current_user.profile.id
        recipient_filter = Q(recipient=current_profile_id)
        not_accepted_filter = Q(accepted=False)
        return ConnectionRequest.objects.filter(recipient_filter & not_accepted_filter)

    def get_object(self):
        queryset = self.get_queryset()
        not_accepted_filter = Q(accepted=False)
        initiator_filter = Q(initiator=self.request.user.profile.id)
        other_recipient_filter = Q(recipient=self.kwargs['pk'])
        recipient_filter = Q(recipient=self.request.user.profile.id)
        other_initiator_filter = Q(initiator=self.kwargs['pk'])
        return queryset.get((initiator_filter & other_recipient_filter & not_accepted_filter) | (recipient_filter & other_initiator_filter & not_accepted_filter))


class ListMySentConnectionRequests(UserPassesTestMixin, ListAPIView):
    serializer_class = SentConnectionRequestSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        initiator_filter = Q(initiator=current_user_profile)
        not_accepted_filter = Q(accepted=False)
        return ConnectionRequest.objects.filter(initiator_filter & not_accepted_filter)


class ListMyReceivedConnectionRequests(UserPassesTestMixin, ListAPIView):
    serializer_class = ReceivedConnectionRequestSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        recipient_filter = Q(recipient=current_user_profile)
        not_accepted_filter = Q(accepted=False)
        return ConnectionRequest.objects.filter(recipient_filter & not_accepted_filter)


class DeleteConnectionRequestByProfileId(UserPassesTestMixin, DestroyAPIView):
    serializer_class = CreateOrDeleteConnectionRequestSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        initiator_filter = Q(initiator=self.request.user.profile.id)
        recipient_filter = Q(recipient=self.request.user.profile.id)
        return ConnectionRequest.objects.filter(initiator_filter | recipient_filter)

    def get_object(self):
        queryset = self.get_queryset()
        initiator_filter = Q(initiator=self.request.user.profile.id)
        other_recipient_filter = Q(recipient=self.kwargs['pk'])
        recipient_filter = Q(recipient=self.request.user.profile.id)
        other_initiator_filter = Q(initiator=self.kwargs['pk'])
        return queryset.get((initiator_filter & other_recipient_filter) | (recipient_filter & other_initiator_filter))


class ChatOverview(UserPassesTestMixin, TemplateView):
    template_name = "messages.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_context_data(self, **kwargs):
        context = super(ChatOverview, self).get_context_data(**kwargs)
        return context

    def get(self, request, *args, **kwargs):
        request.session['unread_msgs'] = 0
        return super(ChatOverview, self).get(request, *args, **kwargs)


class GetMyConnectionsListAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ConnectionSerializer

    def get_serializer_context(self):
        context = super(GetMyConnectionsListAPIView, self).get_serializer_context()
        context['user_id'] = self.request.user.profile.id
        return context

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = self.request.user.profile
        initiator_filter = Q(initiator=current_user_profile)
        recipient_filter = Q(recipient=current_user_profile)
        accepted_filter = Q(accepted=True)
        return ConnectionRequest.objects.filter(accepted_filter & (initiator_filter | recipient_filter)).annotate(current_user_profile=Value(current_user_profile.id, output_field=IntegerField()))


class GetUsersConnectionsListAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ConnectionSerializer

    def get_serializer_context(self):
        context = super(GetUsersConnectionsListAPIView, self).get_serializer_context()
        context['user_id'] = self.kwargs['pk']
        return context

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = UserProfile.objects.get(pk=self.kwargs['pk'])
        initiator_filter = Q(initiator=current_user_profile, recipient__visible=True)
        recipient_filter = Q(recipient=current_user_profile, initiator__visible=True)
        accepted_filter = Q(accepted=True)
        return ConnectionRequest.objects.prefetch_related("initiator", "recipient").filter(accepted_filter & (initiator_filter | recipient_filter)).annotate(current_user_profile=Value(current_user_profile.id, output_field=IntegerField()))


class ConnectionsOverview(UserPassesTestMixin, TemplateView):
    template_name = "connections.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        context = super(ConnectionsOverview, self).get_context_data(**kwargs)
        context['types'] = UserType.choices
        return context


class HandleThanks(UserPassesTestMixin, APIView):
    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

    def get(self, request, *args, **kwargs):
        type_id = self.kwargs['type']
        obj_id = self.kwargs['obj']
        content_type = ContentType.objects.get_for_id(id=type_id)
        obj = content_type.get_object_for_this_type(pk=obj_id)

        if not issubclass(obj.__class__, ThankableMixin):
            return Response({'non_field_errors': "Object type cannot be thanked for."}, status=400)
        else:
            # obj.thanks = obj.thanks + 1
            # obj.thanked_by.add(self.request.user.profile)
            # obj.author.thanks = obj.author.thanks + 1
            return Response({'thanks': obj.thanks}, status=200)

    def post(self, request, *args, **kwargs):
        type_id = self.kwargs['type']
        obj_id = self.kwargs['obj']
        action = request.data['action']
        content_type = ContentType.objects.get_for_id(id=type_id)
        obj = content_type.get_object_for_this_type(pk=obj_id)
        current_user_profile = self.request.user.profile

        if not issubclass(obj.__class__, ThankableMixin):
            raise ValidationError(detail={"non_field_errors": "Object type cannot be thanked for."})
        else:
            if action == 'add':
                if current_user_profile in obj.thanked_by.all():
                    raise ValidationError(detail={"non_field_errors": "Can only thank each item once."})  # TODO change for upvotes in issues
                else:
                    obj.thanks = obj.thanks + 1
                    obj.thanked_by.add(current_user_profile)
                    author = obj.author
                    author.thanks = obj.author.thanks + 1
                    obj.save()
                    author.save()
                    return Response(status=201)
            elif action == 'delete':
                if current_user_profile in obj.thanked_by.all():
                    obj.thanks = obj.thanks - 1
                    obj.thanked_by.remove(current_user_profile)
                    author = obj.author
                    author.thanks = obj.author.thanks - 1
                    obj.save()
                    author.save()
                    return Response(status=204)
                else:
                    raise ValidationError(detail={"non_field_errors": "Cannot remove thanks when none present."})
            else:
                raise ValidationError(detail={"action": "Invalid action."})

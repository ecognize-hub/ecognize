from csp.decorators import csp_update
from django.utils.decorators import method_decorator
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.generic import TemplateView, DetailView, FormView
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView, DestroyAPIView
from .serializers import ReportSerializer, ReportGeoSerializer, ReportImagesSerializer, ReportFinalizeSerializer, \
    OnlineReportFinalizeSerializer, OnlineReportSerializer, ReportCreateUpdateSerializer, \
    OnlineReportCreateUpdateSerializer, ReportCommentThreadSerializer, OnlineReportCommentThreadSerializer,\
    CreateReportCommentSerializer, CreateOnlineReportCommentSerializer
from .models import Report, ReportImage, OnlineReport, ReportCommentThread, OnlineReportCommentThread, ReportComment, \
    OnlineReportComment
from .models import LocationType, CRIMETYPE_CHOICES, OnlineTypes
from django.db.models import Q
from .forms import NewReportForm, NewOnlineReportForm
from django.contrib.contenttypes.models import ContentType
from rest_framework import status
from rest_framework.response import Response
from apps.profiles.models import LevelTypes
from apps.notifications.models import Notification
from apps.profiles.decorator_tests import *
from django.contrib.auth.mixins import UserPassesTestMixin
from django_countries import countries
from rest_framework.permissions import AllowAny, IsAuthenticated


class CreateReportAPIView(CreateAPIView):
    """
    Creates a new report and returns the new report's ID
    """
    serializer_class = ReportCreateUpdateSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)


class UpdateReportAPIView(UserPassesTestMixin, UpdateAPIView):
    """
    Updates a report
    """
    serializer_class = ReportCreateUpdateSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)
        else:
            obj_type = self.kwargs['type']
            obj_id = self.kwargs['pk']
            if obj_type == ContentType.objects.get_for_model(Report).id:
                report = Report.objects.filter(id=obj_id).first()
            elif obj_type == ContentType.objects.get_for_model(OnlineReport).id:
                report = OnlineReport.objects.filter(id=obj_id).first()
            else:
                return False
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_queryset(self):
        report = Report.objects.get(id=self.kwargs['pk'])
        if report.author:
            current_user_profile = self.request.user.profile
            if report.author == current_user_profile and not report.read_only:
                return Report.objects.filter(id=report.id, read_only=False)
            else:
                return Report.objects.none()
        else:
            correct_token = report.edit_token
            transmitted_token = self.kwargs['token']
            if len(correct_token) == 32 and len(
                    transmitted_token) == 32 and correct_token == transmitted_token and not report.author:
                return Report.objects.filter(id=report.id, read_only=False)
            else:
                return Report.objects.none()


class CreateOnlineReportAPIView(CreateAPIView):
    """
    Creates a new online report and returns the new report's ID
    """
    serializer_class = OnlineReportCreateUpdateSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)


class UpdateOnlineReportAPIView(UserPassesTestMixin, UpdateAPIView):
    """
    Updates an online report
    """
    serializer_class = OnlineReportCreateUpdateSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)
        else:
            obj_type = self.kwargs['type']
            obj_id = self.kwargs['pk']
            if obj_type == ContentType.objects.get_for_model(Report).id:
                report = Report.objects.filter(id=obj_id).first()
            elif obj_type == ContentType.objects.get_for_model(OnlineReport).id:
                report = OnlineReport.objects.filter(id=obj_id).first()
            else:
                return False
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_queryset(self):
        report = OnlineReport.objects.get(id=self.kwargs['pk'])
        if report.author:
            current_user_profile = self.request.user.profile
            if report.author == current_user_profile and not report.read_only:
                return OnlineReport.objects.filter(id=report.id, read_only=False)
            else:
                return OnlineReport.objects.none()
        else:
            correct_token = report.edit_token
            transmitted_token = self.kwargs['token']
            if len(correct_token) == 32 and len(
                    transmitted_token) == 32 and correct_token == transmitted_token and not report.author:
                return OnlineReport.objects.filter(id=report.id, read_only=False)
            else:
                return OnlineReport.objects.none()


class CreateReportChoiceEntryPoint(TemplateView):
    template_name = 'newreportchoice.html'

    def get_context_data(self, **kwargs):
        context = super(CreateReportChoiceEntryPoint, self).get_context_data(**kwargs)
        context['type'] = {'report': ContentType.objects.get_for_model(Report).id, 'onlinereport': ContentType.objects.get_for_model(OnlineReport).id}
        context['authenticated'] = self.request.user.is_authenticated
        return context


@method_decorator(csp_update(STYLE_SRC=("'unsafe-inline'",)), name='dispatch')
class CreateReportView(FormView):
    """
    Creates a new report and returns the new report's ID
    """
    form_class = NewReportForm
    template_name = "newreport.html"

    def get_context_data(self, **kwargs):
        context = super(CreateReportView, self).get_context_data(**kwargs)
        context['type'] = {'report': ContentType.objects.get_for_model(Report).id, 'onlinereport': ContentType.objects.get_for_model(OnlineReport).id}
        context['this_type'] = "report"
        context['mode'] = 'new'
        context['authenticated'] = self.request.user.is_authenticated
        return context

    # def get_success_url(self):
    #    return reverse('report-add-images', kwargs={'pk': self.object.pk, 'type': ContentType.objects.get_for_model(Report).id})


class CreateOnlineReportView(FormView):
    """
    Creates a new report and returns the new report's ID
    """
    form_class = NewOnlineReportForm
    template_name = "newonlinereport.html"

    def get_context_data(self, **kwargs):
        context = super(CreateOnlineReportView, self).get_context_data(**kwargs)
        context['type'] = {'report': ContentType.objects.get_for_model(Report).id, 'onlinereport': ContentType.objects.get_for_model(OnlineReport).id}
        context['this_type'] = "onlinereport"
        context['mode'] = 'new'
        context['authenticated'] = self.request.user.is_authenticated
        return context

    # def get_success_url(self):
    #    return reverse('onlinereport-add-images', kwargs={'pk': self.object.pk, 'type': ContentType.objects.get_for_model(OnlineReport).id})


@method_decorator(csp_update(STYLE_SRC=("'unsafe-inline'",)), name='dispatch')
class UpdateReportView(UserPassesTestMixin, FormView):
    serializer_class = ReportSerializer
    form_class = NewReportForm
    template_name = "newreport.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_context_data(self, **kwargs):
        context = super(UpdateReportView, self).get_context_data(**kwargs)
        context['type'] = {'report': ContentType.objects.get_for_model(Report).id, 'onlinereport': ContentType.objects.get_for_model(OnlineReport).id}
        context['this_type'] = "report"
        context['mode'] = 'update'
        context['authenticated'] = self.request.user.is_authenticated
        context['report_id'] = self.kwargs['pk']
        return context

    def get_object(self, *args, **kwargs):
        id_filter = Q(id=self.kwargs['pk'])
        author_filter = Q(author=self.request.user.profile)
        write_filter = Q(read_only=False)
        return Report.objects.get(id_filter & author_filter & write_filter)

    # def get_success_url(self):
    #     return reverse('report-add-images', kwargs={'pk': self.object.pk, 'type': ContentType.objects.get_for_model(Report).id})


class UpdateOnlineReportView(UserPassesTestMixin, FormView):
    serializer_class = OnlineReportSerializer
    form_class = NewOnlineReportForm
    template_name = "newonlinereport.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_context_data(self, **kwargs):
        context = super(UpdateOnlineReportView, self).get_context_data(**kwargs)
        context['type'] = {'report': ContentType.objects.get_for_model(Report).id, 'onlinereport': ContentType.objects.get_for_model(OnlineReport).id}
        context['this_type'] = "onlinereport"
        context['mode'] = 'update'
        context['authenticated'] = self.request.user.is_authenticated
        context['report_id'] = self.kwargs['pk']
        return context

    def get_object(self, *args, **kwargs):
        id_filter = Q(id=self.kwargs['pk'])
        author_filter = Q(author=self.request.user.profile)
        write_filter = Q(read_only=False)
        return OnlineReport.objects.get(id_filter & author_filter & write_filter)

    # def get_success_url(self):
    #     return reverse('onlinereport-add-images', kwargs={'pk': self.object.pk, 'type': ContentType.objects.get_for_model(OnlineReport).id})


@method_decorator(csp_update(STYLE_SRC=("'unsafe-inline'",)), name='dispatch')
class ReportsSearchTemplateView(UserPassesTestMixin, TemplateView):
    template_name = 'reports_search.html'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u)

    def get_context_data(self, **kwargs):
        context = super(ReportsSearchTemplateView, self).get_context_data(**kwargs)
        current_user = self.request.user
        current_user_profile = current_user.profile
        current_user_primary_org = current_user_profile.primary_org
        context['categories'] = CRIMETYPE_CHOICES
        context['online_categories'] = OnlineTypes.choices
        context['locationtypes'] = LocationType.choices
        if current_user_primary_org.level_type == LevelTypes.N.value:
            context['countries'] = current_user_primary_org.countries
        else:
            context['countries'] = countries.countries
        return context


class FinalizeReportAPIView(UserPassesTestMixin, UpdateAPIView):
    """
    Finalizes the report after having uploaded images
    """
    serializer_class = ReportFinalizeSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        obj_id = self.kwargs['pk']
        report = Report.objects.filter(id=obj_id).first()
        if u.is_authenticated:
            return (is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)) and report.author == u.profile
        else:
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_object(self):
        id_filter = Q(id=self.kwargs['pk'])
        writeable_filter = Q(read_only=False)
        return Report.objects.get(id_filter & writeable_filter)

    def update(self, request, *args, **kwargs):
        obj_instance = self.get_object()
        if obj_instance is not None and not obj_instance.read_only:
            obj_instance.read_only = True
            obj_instance.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FinalizeOnlineReportAPIView(UserPassesTestMixin, UpdateAPIView):
    """
    Finalizes the online report after having uploaded images
    """
    serializer_class = OnlineReportFinalizeSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        obj_id = self.kwargs['pk']
        report = OnlineReport.objects.filter(id=obj_id).first()
        if u.is_authenticated:
            return (is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)) and report.author == u.profile
        else:
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_object(self):
        id_filter = Q(id=self.kwargs['pk'])
        writeable_filter = Q(read_only=False)
        return OnlineReport.objects.get(id_filter & writeable_filter)

    def update(self, request, *args, **kwargs):
        obj_instance = self.get_object()
        if obj_instance is not None and not obj_instance.read_only:
            obj_instance.read_only = True
            obj_instance.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AddImagesToReportView(UserPassesTestMixin, DetailView):
    model = Report
    template_name = "addimages.html"
    context_object_name = "report"

    def test_func(self):
        u = self.request.user
        obj_id = self.kwargs['pk']
        report = Report.objects.filter(id=obj_id).first()
        if u.is_authenticated:
            return (is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)) and report.author == u.profile
        else:
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_context_data(self, **kwargs):
        context = super(AddImagesToReportView, self).get_context_data(**kwargs)
        context['type'] = {'report': ContentType.objects.get_for_model(Report).id, 'onlinereport': ContentType.objects.get_for_model(OnlineReport).id}
        context['authenticated'] = self.request.user.is_authenticated
        return context

    def get_object(self, queryset=None):
        report_id = self.kwargs['pk']
        return Report.objects.get(id=report_id, read_only=False)


class AddImagesToOnlineReportView(UserPassesTestMixin, DetailView):
    model = OnlineReport
    template_name = "addimages.html"
    context_object_name = "report"

    def test_func(self):
        u = self.request.user
        obj_id = self.kwargs['pk']
        report = OnlineReport.objects.filter(id=obj_id).first()
        if u.is_authenticated:
            return (is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)) and u.profile == report.author
        else:
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_context_data(self, **kwargs):
        context = super(AddImagesToOnlineReportView, self).get_context_data(**kwargs)
        context['type'] = {'report': ContentType.objects.get_for_model(Report).id, 'onlinereport': ContentType.objects.get_for_model(OnlineReport).id}
        context['authenticated'] = self.request.user.is_authenticated
        return context

    def get_object(self, queryset=None):
        report_id = self.kwargs['pk']
        return OnlineReport.objects.get(id=report_id, read_only=False)


class UploadImageForReportById(UserPassesTestMixin, CreateAPIView):
    model = ReportImage
    serializer_class = ReportImagesSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)
        else:
            obj_type = self.kwargs['type']
            obj_id = self.kwargs['pk']
            if int(obj_type) == ContentType.objects.get_for_model(Report).id:
                report = Report.objects.filter(id=obj_id).first()
            elif int(obj_type) == ContentType.objects.get_for_model(OnlineReport).id:
                report = OnlineReport.objects.filter(id=obj_id).first()
            else:
                return False
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token


class DeleteImageByImageId(UserPassesTestMixin, DestroyAPIView):
    model = ReportImage
    serializer_class = ReportImagesSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)
        else:
            obj_type = self.kwargs['type']
            obj_id = self.kwargs['pk']
            report_image = ReportImage.objects.filter(pk=obj_id).first()
            if not report_image:
                return False
            report_id = report_image.object_id
            if int(obj_type) == ContentType.objects.get_for_model(Report).id:
                report = Report.objects.filter(id=report_id).first()
            elif int(obj_type) == ContentType.objects.get_for_model(OnlineReport).id:
                report = OnlineReport.objects.filter(id=report_id).first()
            else:
                return False
            print(report)
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_queryset(self):
        id_filter = Q(id=self.kwargs['pk'])
        report_type = self.kwargs['type']
        writeable_filter = Q(read_only=False)
        if report_type == 'r' or report_type == 'report' or report_type == str(ContentType.objects.get_for_model(Report).id):
            type_filter = Q(content_type=ContentType.objects.get_for_model(Report))
        elif report_type == 'o' or report_type == 'onlinereport' or report_type == str(ContentType.objects.get_for_model(OnlineReport).id):
            type_filter = Q(content_type=ContentType.objects.get_for_model(OnlineReport))
        else:
            type_filter = Q(content_type__model='invalid')  # class does not exist, making sure no one tampers with params
        return ReportImage.objects.filter(id_filter & type_filter & writeable_filter)

    def destroy(self, request, *args, **kwargs):
        image_id = self.kwargs['pk']
        report_id = ReportImage.objects.get(id=image_id).object_id
        report_type = self.kwargs['type']
        if report_type == 'r' or report_type == 'report' or report_type == str(ContentType.objects.get_for_model(Report).id):
            associated_report = Report.objects.get(id=report_id)
        elif report_type == 'o' or report_type == 'onlinereport' or report_type == str(ContentType.objects.get_for_model(OnlineReport).id):
            associated_report = OnlineReport.objects.get(id=report_id)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not associated_report.read_only:
            id_filter = Q(id=image_id)
            if report_type == 'r' or report_type == 'report' or report_type == str(ContentType.objects.get_for_model(Report).id):
                type_filter = Q(content_type=ContentType.objects.get_for_model(Report))
            elif report_type == 'o' or report_type == 'onlinereport' or report_type == str(ContentType.objects.get_for_model(OnlineReport).id):
                type_filter = Q(content_type=ContentType.objects.get_for_model(OnlineReport))
            else:
                type_filter = Q(content_type__model='invalid')  # class does not exist, making sure no one tampers with params
            if associated_report.author:
                instance = ReportImage.objects.get(id_filter & type_filter)
                if instance is None:
                    return Response(status=status.HTTP_404_NOT_FOUND)
                self.perform_destroy(instance)
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                correct_token = associated_report.edit_token
                transmitted_token = self.kwargs['token']
                if correct_token == '' or len(correct_token) != 32 or transmitted_token == '' or len(transmitted_token) != 32:
                    return Response(status=status.HTTP_404_NOT_FOUND)
                if correct_token == transmitted_token:
                    instance = ReportImage.objects.get(id_filter & type_filter)
                    self.perform_destroy(instance)
                    return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ListImagesByReportId(UserPassesTestMixin, ListAPIView):  # TODO implement AuthZ check
    model = ReportImage
    serializer_class = ReportImagesSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)
        else:
            obj_type = self.kwargs['type']
            obj_id = self.kwargs['pk']
            if int(obj_type) == ContentType.objects.get_for_model(Report).id:
                report = Report.objects.filter(id=obj_id).first()
            elif int(obj_type) == ContentType.objects.get_for_model(OnlineReport).id:
                report = OnlineReport.objects.filter(id=obj_id).first()
            else:
                return False
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_queryset(self):
        print("Gathering queryset")
        report_id = self.kwargs['pk']
        report_type = self.kwargs['type']
        obj_id_filter = Q(object_id=report_id)
        if report_type == 'r' or report_type == str(ContentType.objects.get_for_model(Report).id):
            type_filter = Q(content_type=ContentType.objects.get_for_model(Report))
        elif report_type == 'o' or report_type == str(ContentType.objects.get_for_model(OnlineReport).id):
            type_filter = Q(content_type=ContentType.objects.get_for_model(OnlineReport))
        else:
            type_filter = Q(content_type__model='invalid')  # class does not exist, making sure no one tampers with params
        queryset = ReportImage.objects.filter(obj_id_filter & type_filter)
        return queryset


class DestroyReportByIdAPIView(UserPassesTestMixin, DestroyAPIView):
    serializer_class = ReportSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_queryset(self):
        author_filter = Q(author=self.request.user.profile)
        return Report.objects.filter(author_filter)

    def perform_destroy(self, instance):
        if instance.author == self.request.user.profile:
            # delete all images:
            type_filter = Q(content_type=ContentType.objects.get_for_model(Report))
            obj_id_filter = Q(object_id=instance.id)
            ReportImage.objects.filter(type_filter & obj_id_filter).delete()
            # delete all notifications:
            Notification.objects.filter(type_filter & obj_id_filter).delete()
            instance.delete()


class DestroyOnlineReportByIdAPIView(UserPassesTestMixin, DestroyAPIView):
    serializer_class = OnlineReportSerializer

    def get_queryset(self):
        author_filter = Q(author=self.request.user.profile)
        return OnlineReport.objects.filter(author_filter)

    def perform_destroy(self, instance):
        if instance.author == self.request.user.profile:
            # delete all images:
            type_filter = Q(content_type=ContentType.objects.get_for_model(OnlineReport))
            obj_id_filter = Q(object_id=instance.id)
            ReportImage.objects.filter(type_filter & obj_id_filter).delete()
            # delete all notifications:
            Notification.objects.filter(type_filter & obj_id_filter).delete()
            instance.delete()

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)


class ListMyReportsAPIView(UserPassesTestMixin, ListAPIView):  # UserPassestextMixin removed b/c of issues with JWT
    serializer_class = ReportGeoSerializer
    permission_classes = (IsAuthenticated,)
    authentication_classes = [JWTAuthentication, SessionAuthentication]

    def get_queryset(self):
        user_profile = self.request.user.profile
        queryset = Report.objects.filter(author=user_profile, read_only=True).order_by("-timestamp")
        return queryset

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)
        else:
            return False


class ListMyOnlineReportsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = OnlineReportSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]

    def get_queryset(self):
        user_profile = self.request.user.profile
        queryset = OnlineReport.objects.filter(author=user_profile, read_only=True).order_by("-timestamp")
        return queryset

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)
        else:
            return False


class ListMyReportsView(UserPassesTestMixin, TemplateView):
    template_name = "myreports.html"

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_context_data(self, **kwargs):
        context = super(ListMyReportsView, self).get_context_data(**kwargs)
        context['categories'] = CRIMETYPE_CHOICES
        context['locationtypes'] = LocationType.choices
        context['onlinecategories'] = OnlineTypes.choices
        return context


class ListUserReportsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ReportSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u)

    def get_queryset(self):
        user_id = self.kwargs['pk']
        queryset = Report.objects.filter(author__id=user_id).order_by("-timestamp")
        return queryset


class SearchReportsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = ReportGeoSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u)

    def get_queryset(self):
        country = self.request.query_params['country'].split(',') if 'country' in self.request.query_params.keys() and self.request.query_params['country'] != '' else None
        start_date = self.request.query_params['sdate'] if 'sdate' in self.request.query_params.keys() and self.request.query_params['sdate'] != '' else None
        end_date = self.request.query_params['edate'] if 'edate' in self.request.query_params.keys() and self.request.query_params['edate'] != '' else None
        categories = self.request.query_params['categories'].split(',') if 'categories' in self.request.query_params.keys() and self.request.query_params['categories'] != '' else None
        specifics = self.request.query_params['details'].split(',') if 'details' in self.request.query_params.keys() and self.request.query_params['details'] != '' else None

        query_q = Q(read_only=True)  # making sure only finalized reports are shown

        user_org = self.request.user.profile.primary_org
        if user_org.level_type == LevelTypes.N.value:  # if it is a national-level org, limit search to countries where the org is active
            user_org_countries = user_org.countries
            query_q = query_q & Q(country__in=user_org_countries)

        if country is not None and country != '':
            query_q = query_q & Q(country__in=country)
        if categories is not None and categories != '':
            query_q = query_q & Q(category__in=categories)
        if specifics is not None and specifics != '':
            query_q = query_q & Q(location_type__in=specifics)
        if start_date is not None and end_date is not None and start_date != '' and end_date != '':
            query_q = query_q & Q(timestamp__range=[start_date, end_date])
        elif start_date is not None and start_date != '':
            query_q = query_q & Q(timestamp__range=[start_date, '9999-12-12'])
        elif end_date is not None and end_date != '':
            query_q = query_q & Q(timestamp__range=['0-1-1', end_date])

        queryset = Report.objects.filter(query_q).order_by("-timestamp").prefetch_related('images')
        return queryset


class SearchOnlineReportsAPIView(UserPassesTestMixin, ListAPIView):
    serializer_class = OnlineReportSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u)

    def get_queryset(self):
        start_date = self.request.query_params['sdate'] if 'sdate' in self.request.query_params.keys() and self.request.query_params['sdate'] != '' else None
        end_date = self.request.query_params['edate'] if 'edate' in self.request.query_params.keys() and self.request.query_params['edate'] != '' else None
        categories = self.request.query_params['categories'].split(',') if 'categories' in self.request.query_params.keys() and self.request.query_params['categories'] != '' else None

        query_q = Q(read_only=True)  # making sure only finalized reports are shown

        if categories is not None and categories != '':
            query_q = query_q & Q(category__in=categories)
        if start_date is not None and end_date is not None and start_date != '' and end_date != '':
            query_q = query_q & Q(timestamp__range=[start_date, end_date])
        elif start_date is not None and start_date != '':
            query_q = query_q & Q(timestamp__range=[start_date, '9999-12-12'])
        elif end_date is not None and end_date != '':
            query_q = query_q & Q(timestamp__range=['0-1-1', end_date])

        queryset = OnlineReport.objects.filter(query_q).order_by("-timestamp").prefetch_related('images')
        return queryset


class RetrieveReportByIdAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = ReportSerializer
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)
        else:
            obj_type = self.kwargs['type']
            obj_id = self.kwargs['pk']
            if obj_type == ContentType.objects.get_for_model(Report).id:
                report = Report.objects.filter(id=obj_id).first()
            elif obj_type == ContentType.objects.get_for_model(OnlineReport).id:
                report = OnlineReport.objects.filter(id=obj_id).first()
            else:
                return False
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_queryset(self):
        current_user_org = self.request.user.profile.primary_org
        if current_user_org.level_type == LevelTypes.N.value:
            return Report.objects.filter(id=self.kwargs['pk'], country__in=current_user_org.countries)
        else:
            return Report.objects.filter(id=self.kwargs['pk'])


class RetrieveOnlineReportByIdAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = OnlineReportSerializer
    permission_classes = (AllowAny,)

    def test_func(self):
        u = self.request.user
        if u.is_authenticated:
            return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(
                u) or is_anonymous_contributor(u)
        else:
            obj_type = self.kwargs['type']
            obj_id = self.kwargs['pk']
            if obj_type == ContentType.objects.get_for_model(Report).id:
                report = Report.objects.filter(id=obj_id).first()
            elif obj_type == ContentType.objects.get_for_model(OnlineReport).id:
                report = OnlineReport.objects.filter(id=obj_id).first()
            else:
                return False
            if not report:
                return False
            if report.author or report.edit_token == '' or not len(report.edit_token) == 32:
                return False
            transmitted_token = self.kwargs['token']
            if len(transmitted_token) != 32:
                return False
            return transmitted_token == report.edit_token

    def get_queryset(self):
        current_user_org = self.request.user.profile.primary_org
        if current_user_org.level_type == LevelTypes.N.value:
            return OnlineReport.objects.filter(id=self.kwargs['pk'], country__in=current_user_org.countries)
        else:
            return OnlineReport.objects.filter(id=self.kwargs['pk'])


class RetrieveReportAsGeoJSONByIdAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = ReportGeoSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_queryset(self):
        current_user_org = self.request.user.profile.primary_org
        if current_user_org.level_type == LevelTypes.N.value:
            return Report.objects.filter(id=self.kwargs['pk'], country__in=current_user_org.countries)
        else:
            return Report.objects.filter(id=self.kwargs['pk'])


class RetrieveReportByIdDetailView(UserPassesTestMixin, DetailView):
    template_name = 'reportdetail.html'
    serializer_class = ReportSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_context_data(self, **kwargs):
        context = super(RetrieveReportByIdDetailView, self).get_context_data(**kwargs)
        context['photos'] = ReportImage.objects.filter(Q(content_type__model='report') & Q(object_id=self.kwargs['pk']))
        context['categories'] = CRIMETYPE_CHOICES
        context['locationtypes'] = LocationType.choices
        context['ctid'] = ContentType.objects.get_for_model(Report).id
        context['ctid_reportcomment'] = ContentType.objects.get_for_model(ReportComment).id
        return context

    def get_queryset(self):
        current_user_org = self.request.user.profile.primary_org
        if current_user_org.level_type == LevelTypes.N.value:
            return Report.objects.filter(id=self.kwargs['pk'], country__in=current_user_org.countries, read_only=True)
        else:
            return Report.objects.filter(id=self.kwargs['pk'])


class RetrieveOnlineReportByIdDetailView(UserPassesTestMixin, DetailView):
    template_name = 'onlinereportdetail.html'
    serializer_class = OnlineReportSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_context_data(self, **kwargs):
        context = super(RetrieveOnlineReportByIdDetailView, self).get_context_data(**kwargs)
        context['photos'] = ReportImage.objects.filter(Q(content_type__model='onlinereport') & Q(object_id=self.kwargs['pk']))
        context['categories'] = CRIMETYPE_CHOICES
        context['locationtypes'] = LocationType.choices
        context['ctid'] = ContentType.objects.get_for_model(OnlineReport).id
        context['ctid_onlinereportcomment'] = ContentType.objects.get_for_model(OnlineReportComment).id
        return context

    def get_queryset(self):
        return OnlineReport.objects.filter(id=self.kwargs['pk'], read_only=True)


class ListReportCommentThreads(UserPassesTestMixin, ListAPIView):
    serializer_class = ReportCommentThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_queryset(self):
        report_id = self.kwargs['pk']
        return ReportCommentThread.objects.filter(report=report_id).order_by("-last_post_datetime")


class ListOnlineReportCommentThreads(UserPassesTestMixin, ListAPIView):
    serializer_class = OnlineReportCommentThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u) or is_anonymous_contributor(u)

    def get_queryset(self):
        online_report_id = self.kwargs['pk']
        return OnlineReportCommentThread.objects.filter(report=online_report_id).order_by("-last_post_datetime")


class SendMessageToReportThreadAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = CreateReportCommentSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)


class StartNewReportThreadCreateAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = ReportCommentThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)


class SendMessageToOnlineReportThreadAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = CreateOnlineReportCommentSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)


class StartNewOnlineReportThreadCreateAPIView(UserPassesTestMixin, CreateAPIView):
    serializer_class = OnlineReportCommentThreadSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_volunteer(u) or is_commercial_entity_employee(u)

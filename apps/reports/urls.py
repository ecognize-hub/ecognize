from django.conf.urls import url
from django.urls import path
from django.contrib.auth.decorators import login_required
from .views import CreateReportAPIView, ListMyReportsAPIView, RetrieveReportByIdAPIView, ListUserReportsAPIView, \
    FinalizeReportAPIView, DestroyReportByIdAPIView, SearchReportsAPIView, RetrieveReportByIdDetailView, \
    RetrieveReportAsGeoJSONByIdAPIView, CreateReportView, ListImagesByReportId, AddImagesToReportView, \
    UploadImageForReportById, DeleteImageByImageId, AddImagesToOnlineReportView, FinalizeOnlineReportAPIView, \
    RetrieveOnlineReportByIdDetailView, ListMyReportsView, ListMyOnlineReportsAPIView, CreateReportChoiceEntryPoint, \
    UpdateReportView, UpdateOnlineReportView, DestroyOnlineReportByIdAPIView, SearchOnlineReportsAPIView, \
    CreateOnlineReportAPIView, RetrieveOnlineReportByIdAPIView, UpdateReportAPIView, UpdateOnlineReportAPIView, \
    ReportsSearchTemplateView, ListReportCommentThreads, ListOnlineReportCommentThreads, CreateOnlineReportView, \
    StartNewReportThreadCreateAPIView, SendMessageToReportThreadAPIView, StartNewOnlineReportThreadCreateAPIView, \
    SendMessageToOnlineReportThreadAPIView

urlpatterns = [
    url(r'api/user/me/r$', ListMyReportsAPIView.as_view(), name="api-my-reports-list"),  # GET
    url(r'api/user/me/o$', ListMyOnlineReportsAPIView.as_view(), name="api-my-onlinereports-list"),  # GET
    url(r'user/me?$', login_required(ListMyReportsView.as_view()), name="my-reports-list"),  # GET
    url(r'api/user/(?P<pk>[0-9]+)$', ListUserReportsAPIView.as_view(), name="user-reports-list"),  # GET
    url(r'api/new/[r](eport)?$', CreateReportAPIView.as_view(), name="report-api-create"),  # POST
    url(r'api/new/[o](nlinereport)?$', CreateOnlineReportAPIView.as_view(), name="onlinereport-api-create"),  # POST
    url(r'api/search/reports(/)?', login_required(SearchReportsAPIView.as_view()), name="reports-search"),  # GET
    url(r'api/search/onlinereports(/)?', login_required(SearchOnlineReportsAPIView.as_view()), name="onlinereports-search"),  # GET
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/json$', login_required(RetrieveReportByIdAPIView.as_view()), name="report-api-detail"),  # GET
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/json/(?P<token>[A-Za-z0-9]+)$', RetrieveReportByIdAPIView.as_view(), name="report-api-detail-keyed"),  # GET
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/json$', login_required(RetrieveOnlineReportByIdAPIView.as_view()), name="onlinereport-api-detail"),  # GET
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/json/(?P<token>[A-Za-z0-9]+)$', RetrieveOnlineReportByIdAPIView.as_view(), name="onlinereport-api-detail-keyed"),  # GET
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/geojson$', login_required(RetrieveReportAsGeoJSONByIdAPIView.as_view()), name="report-api-detail-geojson"),  # GET
    url(r'api/id/(?P<type>[a-zA-Z0-9]+)/(?P<pk>[0-9]+)/images$', login_required(ListImagesByReportId.as_view()), name="report-api-images"),  # GET
    url(r'api/id/(?P<type>[a-zA-Z0-9]+)/(?P<pk>[0-9]+)/images/(?P<token>[A-Za-z0-9]+)$', ListImagesByReportId.as_view(), name="report-api-images-keyed"),  # GET
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/update$', login_required(UpdateReportAPIView.as_view()), name="api-report-update"),  # PUT/PATCH
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/update/(?P<token>[A-Za-z0-9]+)$', UpdateReportAPIView.as_view(), name="api-report-update-keyed"),  # PUT/PATCH
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/update$', login_required(UpdateOnlineReportAPIView.as_view()), name="api-onlinereport-update"),  # PUT/PATCH
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/update/(?P<token>[A-Za-z0-9]+)$', login_required(UpdateOnlineReportAPIView.as_view()), name="api-onlinereport-update-keyed"),  # PUT/PATCH
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/finalize$', login_required(FinalizeReportAPIView.as_view()), name="api-report-finalize"),  # PUT/PATCH
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/finalize/(?P<token>[A-Za-z0-9]+)$', FinalizeReportAPIView.as_view(), name="api-report-finalize-keyed"),  # PUT/PATCH
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/finalize$', login_required(FinalizeOnlineReportAPIView.as_view()), name="api-onlinereport-finalize"),  # PUT/PATCH
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/finalize/(?P<token>[A-Za-z0-9]+)$', FinalizeOnlineReportAPIView.as_view(), name="api-onlinereport-finalize-keyed"),  # PUT/PATCH
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/delete$', login_required(DestroyReportByIdAPIView.as_view()), name="report-delete"),  # DELETE
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/delete$', login_required(DestroyOnlineReportByIdAPIView.as_view()), name="onlinereport-delete"),  # DELETE
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/threads$', login_required(ListReportCommentThreads.as_view()), name="api-report-commentthreads-list"),  # GET
    url(r'api/id/[r](eport)?/(?P<pk>[0-9]+)/threads/new$', login_required(StartNewReportThreadCreateAPIView.as_view()), name="api-report-commentthreads-start"),  # POST
    url(r'api/id/[r](eport)?/(?P<report>[0-9]+)/threads/(?P<pk>[0-9]+)/send$', login_required(SendMessageToReportThreadAPIView.as_view()), name='api-report-commentthreads-send'),  # POST
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/threads$', login_required(ListOnlineReportCommentThreads.as_view()), name="api-onlinereport-commentthreads-list"),  # GET
    url(r'api/id/[o](nlinereport)?/(?P<pk>[0-9]+)/threads/new$', login_required(StartNewOnlineReportThreadCreateAPIView.as_view()), name="api-onlinereport-commentthreads-start"),  # POST
    url(r'api/id/[o](nlinereport)?/(?P<onlinereport>[0-9]+)/threads/(?P<pk>[0-9]+)/send$', login_required(SendMessageToOnlineReportThreadAPIView.as_view()), name='api-onlinereport-commentthreads-send'),  # POST
    url(r'api/id/(?P<type>[0-9]+)/(?P<pk>[0-9]+)/image/new$', login_required(UploadImageForReportById.as_view()), name="report-api-add-image"),  # POST
    url(r'api/id/(?P<type>[0-9]+)/(?P<pk>[0-9]+)/image/new/(?P<token>[A-Za-z0-9]+)$', UploadImageForReportById.as_view(), name="report-api-add-image-keyed"),  # POST
    url(r'api/id/(?P<type>[a-zA-Z0-9]+)/(?P<pk>[0-9]+)/image/delete$', login_required(DeleteImageByImageId.as_view()), name="report-api-del-image"),  # POST
    url(r'api/id/(?P<type>[a-zA-Z0-9]+)/(?P<pk>[0-9]+)/image/delete/(?P<token>[A-Za-z0-9]+)$', DeleteImageByImageId.as_view(), name="report-api-del-image-keyed"),  # POST
    url(r'id/[r](eport)?/(?P<pk>[0-9]+)$', login_required(RetrieveReportByIdDetailView.as_view()), name="report-detail"),  # GET
    url(r'id/[o](nlinereport)?/(?P<pk>[0-9]+)$', login_required(RetrieveOnlineReportByIdDetailView.as_view()), name="onlinereport-detail"),  # GET
    url(r'^new$', CreateReportChoiceEntryPoint.as_view(), name="report-create-choice"),  # GET & POST
    url(r'^new/report$', CreateReportView.as_view(), name="report-create"),  # GET & POST
    url(r'^new/onlinereport$', CreateOnlineReportView.as_view(), name="onlinereport-create"),  # GET & POST
    url(r'^id/r(eport)?/(?P<type>[a-zA-Z0-9]+)/(?P<pk>[0-9]+)/edit$', login_required(UpdateReportView.as_view()), name="report-edit"),  # PUT/PATCH
    url(r'^id/r(eport)?/(?P<type>[a-zA-Z0-9]+)/(?P<pk>[0-9]+)/edit/(?P<token>[A-Za-z0-9]+)$', UpdateReportView.as_view(), name="report-edit-keyed"),  # PUT/PATCH
    url(r'^id/o(nlinereport)?/(?P<type>[a-zA-Z0-9]+)/(?P<pk>[0-9]+)/edit$', login_required(UpdateOnlineReportView.as_view()), name="onlinereport-edit"),  # PUT/PATCH
    url(r'^id/o(nlinereport)?/(?P<type>[a-zA-Z0-9]+)/(?P<pk>[0-9]+)/edit/(?P<token>[A-Za-z0-9]+)$', UpdateOnlineReportView.as_view(), name="onlinereport-edit-keyed"),  # PUT/PATCH
    url(r'^id/r(eport)?/(?P<pk>[0-9]+)/addimages$', login_required(AddImagesToReportView.as_view()), name="report-add-images"),  # GET (addition via API via POST)
    url(r'^id/r(eport)?/(?P<pk>[0-9]+)/addimages/(?P<token>[A-Za-z0-9]+)$', AddImagesToReportView.as_view(), name="report-add-images-keyed"),  # GET (addition via API via POST)
    url(r'^id/o(nlinereport)?/(?P<pk>[0-9]+)/addimages$', login_required(AddImagesToOnlineReportView.as_view()), name="onlinereport-add-images"),  # GET (addition via API via POST)
    url(r'^id/o(nlinereport)?/(?P<pk>[0-9]+)/addimages/(?P<token>[A-Za-z0-9]+)$', AddImagesToOnlineReportView.as_view(), name="onlinereport-add-images-keyed"),  # GET (addition via API via POST)
    path('search', login_required(ReportsSearchTemplateView.as_view()), name='view-reports-search'),
]

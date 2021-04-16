from .views import MyFiles, ListFoldersInFolder, ListFilesInFolder, DeleteMyFile, DeleteMyFolder, \
    UpdateFile, UpdateFolder, CreateNewFolder, CreateNewFile, ListRootSharedFolders, ListRootSharedFiles, \
    UpdateExistingFileContent, FolderOverview, FileDetailView, FilesDetailAPIView
from django.urls import path
from django.conf.urls import url
from django.contrib.auth.decorators import login_required


urlpatterns = [
    url(r'^api/folder/shared-root-folder$', login_required(ListRootSharedFolders.as_view()), name='api-shared_folders-list'),  # GET
    url(r'^api/folder/shared-root-files$', login_required(ListRootSharedFiles.as_view()), name='api-shared_files-list'),  # GET
    url(r'^api/folder/(?P<pk>[0-9]+)/folders$', login_required(ListFoldersInFolder.as_view()), name='api-folders-list'),  # GET
    url(r'^api/folder/(?P<pk>[0-9]+)/delete$', login_required(DeleteMyFolder.as_view()), name='api-folder-delete'),  # DELETE
    url(r'^api/folder/(?P<pk>[0-9]+)/update$', login_required(UpdateFolder.as_view()), name='api-folder-update'),  # PUT/PATCH
    url(r'^api/folder/(?P<pk>[0-9]+)/folders/new$', login_required(CreateNewFolder.as_view()), name='api-folder-create'),  # POST
    url(r'^api/folder/(?P<pk>[0-9]+)/files/new/(?P<filename>[^/]+)$', login_required(CreateNewFile.as_view()), name='api-files-create'),  # POST
    url(r'^api/folder/(?P<pk>[0-9]+)/files$', login_required(ListFilesInFolder.as_view()), name='api-files-list'),  # GET
    url(r'^api/file/(?P<pk>[0-9]+)/info$', login_required(FilesDetailAPIView.as_view()), name='api-file-info'),  # DELETE
    url(r'^api/file/(?P<pk>[0-9]+)/delete$', login_required(DeleteMyFile.as_view()), name='api-file-delete'),  # DELETE
    url(r'^api/file/(?P<pk>[0-9]+)/update/meta$', login_required(UpdateFile.as_view()), name='api-file-meta-update'),  # PUT
    url(r'^api/file/(?P<pk>[0-9]+)/update/content/(?P<filename>[^/]+)$', login_required(UpdateExistingFileContent.as_view()), name='api-file-content-update'),  # PUT
    url(r'^folder/(?P<pk>[0-9]+)$', login_required(FolderOverview.as_view()), name='view-folder-by-id'),  # GET
    url(r'^file/(?P<pk>[0-9]+)$', login_required(FileDetailView.as_view()), name='view-file-by-id'),  # GET
    path('mine', MyFiles.as_view(), name='files-mine'),
]

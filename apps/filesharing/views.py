from django.views.generic import TemplateView
from django.db.models import Q
from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView, UpdateAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser
from rest_framework import status
from rest_framework.exceptions import ParseError
from .models import SharedFolder, SharedFile
from .serializers import FolderReadOnlySerializer, FileReadOnlySerializer, FolderUpdateSerializer, FileUpdateSerializer, FolderCreateSerializer
from crum import get_current_user
from apps.profiles.decorator_tests import *
from django.contrib.auth.mixins import UserPassesTestMixin

from ..quotas.models import Quota


class MyFiles(UserPassesTestMixin, TemplateView):
    template_name = 'files.html'

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_context_data(self, **kwargs):
        current_org = get_current_user().profile.primary_org
        current_org_id = current_org.id
        context = super(MyFiles, self).get_context_data(**kwargs)
        usage_raw = Quota.objects.get(pk=current_org_id).get_usage_and_limit("filesharing")
        context['org_name'] = current_org.display_name
        context['usage'] = (round(usage_raw[0] / (1024*1024), 2), round(usage_raw[1] / (1024*1024), 2))
        return context


class FolderOverview(UserPassesTestMixin, TemplateView):
    template_name = 'folder.html'

    def test_func(self):
        u = self.request.user
        if not (is_non_profit_employee(u) or is_commercial_entity_employee(u)):
            return False
        folder = SharedFolder.objects.filter(id=self.kwargs['pk']).first()
        if not folder:
            return False
        profile = u.profile
        users_read = folder.users_read.all()
        users_write = folder.users_write.all()
        orgs_read = folder.orgs_read.all()
        orgs_write = folder.orgs_write.all()
        user_primary_org = profile.primary_org
        return profile in users_read or profile in users_write or user_primary_org in orgs_read or user_primary_org in orgs_write

    def get_context_data(self, **kwargs):
        context = super(FolderOverview, self).get_context_data()
        folder = SharedFolder.objects.get(id=self.kwargs['pk'])
        context['folder_id'] = self.kwargs['pk']
        context['mine'] = folder.owner_id == self.request.user.profile.id
        context['folder_name'] = folder.name  # TODO only show of user is authorized
        return context


class FileDetailView(UserPassesTestMixin, TemplateView):
    template_name = 'file.html'

    def test_func(self):
        u = self.request.user
        if not (is_non_profit_employee(u) or is_commercial_entity_employee(u)):
            return False
        this_file = SharedFile.objects.filter(id=self.kwargs['pk']).first()
        if not this_file:
            return False
        profile = u.profile
        users_read = this_file.users_read.all()
        users_write = this_file.users_write.all()
        orgs_read = this_file.orgs_read.all()
        orgs_write = this_file.orgs_write.all()
        user_primary_org = profile.primary_org
        return profile in users_read or profile in users_write or user_primary_org in orgs_read or user_primary_org in orgs_write

    def get_context_data(self, **kwargs):
        context = super(FileDetailView, self).get_context_data()
        file_to_display = SharedFile.objects.get(id=self.kwargs['pk'])
        current_user = self.request.user
        current_profile = current_user.profile
        primary_org = current_profile.primary_org

        profiles_write_access = file_to_display.users_write.all()
        orgs_write_access = file_to_display.orgs_write.all()

        context['can_write'] = current_profile in profiles_write_access or primary_org in orgs_write_access or file_to_display.owner_id == current_profile.id
        context['file_id'] = self.kwargs['pk']
        context['mine'] = file_to_display.owner_id == current_profile.id
        context['file_name'] = file_to_display.file.name.split('/')[-1]  # TODO only show of user is authorized
        context['file_path'] = file_to_display.file.name  # TODO only show of user is authorized
        return context


class FilesDetailAPIView(UserPassesTestMixin, RetrieveAPIView):
    serializer_class = FileReadOnlySerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        file_id = int(self.kwargs['pk'])  # 0 or any negative number is the root folder
        current_user_profile = self.request.user.profile

        current_users_org = current_user_profile.primary_org
        my_file = SharedFile.objects.get(id=file_id)
        if current_user_profile == my_file.owner or current_user_profile in my_file.users_read.all() or current_user_profile in my_file.users_write.all() or current_users_org in my_file.orgs_read.all() or current_users_org in my_file.orgs_write.all():
            return SharedFile.objects.filter(id=file_id)
        else:
            return SharedFile.objects.none()


class DeleteMyFile(UserPassesTestMixin, DestroyAPIView):
    serializer_class = FileReadOnlySerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = get_current_user().profile.id
        return SharedFile.objects.filter(owner=current_user_profile)

    def perform_destroy(self, instance):
        current_users_org = get_current_user().profile.primary_org
        quota_obj = Quota.objects.get(pk=current_users_org.id)
        quota_obj.update_usage("filesharing", -instance.file.size)
        return super(DeleteMyFile, self).perform_destroy(instance)


class UpdateFile(UserPassesTestMixin, UpdateAPIView):
    serializer_class = FileUpdateSerializer
    queryset = SharedFile.objects.all()

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_object(self):
        file_to_change = self.get_queryset().get(id=self.kwargs['pk'])
        current_user_profile = get_current_user().profile
        current_users_org = current_user_profile.primary_org
        if file_to_change.owner == current_user_profile or current_user_profile in file_to_change.users_write.all() or current_users_org in file_to_change.orgs_write.all():
            return file_to_change
        else:
            return SharedFile.objects.none()


class UpdateFolder(UserPassesTestMixin, UpdateAPIView):
    serializer_class = FolderUpdateSerializer
    queryset = SharedFolder.objects.all()

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_object(self):
        folder_to_change = self.get_queryset().get(id=self.kwargs['pk'])
        current_user_profile = get_current_user().profile
        current_users_org = current_user_profile.primary_org
        if folder_to_change.owner == current_user_profile or current_user_profile in folder_to_change.users_write.all() or current_users_org in folder_to_change.orgs_write.all():
            return folder_to_change
        else:
            return SharedFolder.objects.none()


class DeleteMyFolder(UserPassesTestMixin, DestroyAPIView):
    serializer_class = FolderReadOnlySerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = get_current_user().profile.id
        return SharedFolder.objects.filter(owner=current_user_profile)


class ListFoldersInFolder(UserPassesTestMixin, ListAPIView):
    serializer_class = FolderReadOnlySerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        folder_id = int(self.kwargs['pk'])  # 0 or any negative number is the root folder
        current_user_profile = get_current_user().profile

        if folder_id < 1:
            return SharedFolder.objects.filter(parent_folder=None, owner=current_user_profile)
        else:
            current_users_org = current_user_profile.primary_org
            folder = SharedFolder.objects.get(id=folder_id)
            if current_user_profile == folder.owner or current_user_profile in folder.users_read.all() or current_user_profile in folder.users_write.all() or current_users_org in folder.orgs_read.all() or current_users_org in folder.orgs_write.all():
                # read_filter = Q(users_read=current_user_profile)
                # write_filter = Q(users_write=current_user_profile)
                # org_read_filter = Q(orgs_read=current_users_org)
                # org_write_filter = Q(orgs_write=current_users_org)
                # owner_filter = Q(owner=current_user_profile)
                return folder.contained_folders.all()  # .filter(owner_filter | read_filter | write_filter | org_read_filter | org_write_filter).distinct()
            else:
                return SharedFolder.objects.none()


class ListFilesInFolder(UserPassesTestMixin, ListAPIView):
    serializer_class = FileReadOnlySerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        folder_id = int(self.kwargs['pk'])  # 0 or any negative number is the root folder
        current_user_profile = get_current_user().profile

        if folder_id < 1:
            return SharedFile.objects.filter(parent_folder=None, owner=current_user_profile)
        else:
            current_users_org = current_user_profile.primary_org
            folder = SharedFolder.objects.get(id=folder_id)
            if current_user_profile == folder.owner or current_user_profile in folder.users_read.all() or current_user_profile in folder.users_write.all() or current_users_org in folder.orgs_read.all() or current_users_org in folder.orgs_write.all():
                # read_filter = Q(users_read=current_user_profile)
                # write_filter = Q(users_write=current_user_profile)
                # org_read_filter = Q(orgs_read=current_users_org)
                # org_write_filter = Q(orgs_write=current_users_org)
                # owner_filter = Q(owner=current_user_profile)
                return folder.contained_files.all()  # .filter(owner_filter | read_filter | write_filter | org_read_filter | org_write_filter).distinct()
            else:
                return SharedFile.objects.none()


class CreateNewFolder(UserPassesTestMixin, CreateAPIView):
    serializer_class = FolderCreateSerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def create(self, request, *args, **kwargs):
        folder_id = int(self.kwargs['pk'])  # 0 or any negative number is the root folder

        if folder_id < 1:
            request.data.pop('parent_folder', None)
            return super(CreateNewFolder, self).create(request, *args, **kwargs)
        else:
            request.data['parent_folder'] = folder_id
            folder = SharedFolder.objects.get(id=folder_id)
            if folder is None:
                return Response(status=status.HTTP_404_NOT_FOUND)
            current_user_profile = get_current_user().profile
            current_users_org = current_user_profile.primary_org
            if current_user_profile == folder.owner or current_user_profile in folder.users_write.all() or current_users_org in folder.orgs_write.all():
                return super(CreateNewFolder, self).create(request, *args, **kwargs)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)


class CreateNewFile(UserPassesTestMixin, APIView):
    parser_classes = (FileUploadParser,)

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def put(self, request, filename, format=None, *args, **kwargs):
        if 'file' not in request.data:
            raise ParseError("Empty content")

        f = self.request.FILES['file']
        new_size = f.size
        print("New size: {}".format(new_size))

        folder_id = int(self.kwargs['pk'])  # 0 or any negative number is the root folder
        current_user_profile = get_current_user().profile
        current_users_org = current_user_profile.primary_org
        if folder_id > 0:
            folder = SharedFolder.objects.get(id=folder_id)
            if folder is None:
                return Response(status=status.HTTP_404_NOT_FOUND)

            if current_user_profile == folder.owner or current_user_profile in folder.users_write.all() or current_users_org in folder.orgs_write.all():
                new_file = SharedFile(parent_folder=SharedFolder.objects.get(id=folder_id))
                # quota checks to see if user can still upload files:
                quota_obj = Quota.objects.get(pk=current_users_org.id)
                in_quota = quota_obj.check_within_quota("filesharing", new_size)
                if in_quota:
                    new_file.save()
                    new_file.file.save(filename, f, save=True)
                    quota_obj.update_usage("filesharing", new_size)
                    return Response(status=status.HTTP_201_CREATED)
                else:
                    raise ParseError(code=status.HTTP_403_FORBIDDEN, detail={"file": "File size exceeds your organization's usage limit."})
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
        else:
            # quota checks to see if user can still upload files:
            quota_obj = Quota.objects.get(pk=current_users_org.id)
            in_quota = quota_obj.check_within_quota("filesharing", new_size)
            if in_quota:
                new_file = SharedFile(parent_folder=None)
                new_file.save()
                new_file.file.save(filename, f, save=True)
                quota_obj.update_usage("filesharing", new_size)
                return Response(status=status.HTTP_201_CREATED)
            else:
                raise ParseError(code=status.HTTP_403_FORBIDDEN, detail={"file": "File size exceeds your organization's usage limit."})


class UpdateExistingFileContent(UserPassesTestMixin, APIView):
    parser_classes = (FileUploadParser,)

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def put(self, request, filename, format=None, *args, **kwargs):
        if 'file' not in request.data:
            raise ParseError("Empty content")

        f = self.request.FILES['file']
        new_size = f.size

        file_id = int(self.kwargs['pk'])  # 0 or any negative number is the root folder
        if file_id > 0:
            file = SharedFile.objects.get(id=file_id)
            if file is None:
                return Response(status=status.HTTP_404_NOT_FOUND)
            current_user_profile = get_current_user().profile
            current_users_org = current_user_profile.primary_org
            if current_user_profile == file.owner or current_user_profile in file.users_write.all() or current_users_org in file.orgs_write.all():
                # quota checks to see if user can still upload files:
                quota_obj_uploader = Quota.objects.get(pk=current_users_org.id)
                old_size = file.file.size
                # check if we are changing quota usage within same organization:
                if current_users_org.id == file.owner.primary_org.id:
                    in_quota = quota_obj_uploader.check_within_quota("filesharing", new_size - old_size)
                else:
                    in_quota = quota_obj_uploader.check_within_quota("filesharing", new_size)
                if in_quota:
                    quota_obj_owner = Quota.objects.get(pk=file.owner.primary_org.id)
                    quota_obj_owner.update_usage("filesharing", -old_size)
                    quota_obj_uploader.update_usage("filesharing", new_size)
                    file.file.save(filename, f, save=True)
                    return Response(status=status.HTTP_204_NO_CONTENT)
                else:
                    raise ParseError(code=status.HTTP_403_FORBIDDEN, detail={"file": "File size exceeds your organization's usage limit."})
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)


# find all elements where the parent element is not shared - this should identify
# all root shared elements
class ListRootSharedFolders(UserPassesTestMixin, ListAPIView):
    serializer_class = FolderReadOnlySerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = get_current_user().profile

        not_owner_filter = ~Q(owner=current_user_profile)

        users_read_filter = Q(users_read=current_user_profile)
        orgs_read_filter = Q(orgs_read=current_user_profile.primary_org)

        parent_users_read_filter = Q(parent_folder__users_read=current_user_profile)
        parent_orgs_read_filter = Q(parent_folder__orgs_read=current_user_profile.primary_org)

        no_parent_folder_filter = Q(parent_folder=None)

        non_root_shared_folders = SharedFolder.objects.filter(~no_parent_folder_filter & not_owner_filter & (users_read_filter | orgs_read_filter)).filter(~parent_users_read_filter & ~parent_orgs_read_filter).distinct()
        root_shared_folders = SharedFolder.objects.filter(no_parent_folder_filter & not_owner_filter & (users_read_filter | orgs_read_filter)).distinct()

        res = non_root_shared_folders.union(root_shared_folders)

        return res


class ListRootSharedFiles(UserPassesTestMixin, ListAPIView):
    serializer_class = FileReadOnlySerializer

    def test_func(self):
        u = self.request.user
        return is_non_profit_employee(u) or is_commercial_entity_employee(u)

    def get_queryset(self):
        current_user_profile = get_current_user().profile

        not_owner_filter = ~Q(owner=current_user_profile)

        users_read_filter = Q(users_read=current_user_profile)
        orgs_read_filter = Q(orgs_read=current_user_profile.primary_org)

        parent_users_read_filter = Q(parent_folder__users_read=current_user_profile)
        parent_orgs_read_filter = Q(parent_folder__orgs_read=current_user_profile.primary_org)

        no_parent_folder_filter = Q(parent_folder=None)
        non_root_shared_files = SharedFile.objects.filter(~no_parent_folder_filter & not_owner_filter & (users_read_filter | orgs_read_filter)).filter(~parent_users_read_filter & ~parent_orgs_read_filter).distinct()
        root_shared_files = SharedFile.objects.filter(no_parent_folder_filter & not_owner_filter & (users_read_filter | orgs_read_filter)).distinct()

        res = non_root_shared_files.union(root_shared_files)

        return res

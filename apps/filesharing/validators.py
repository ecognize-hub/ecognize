import os
import magic
from django.core.exceptions import ValidationError


def validate_file_content_and_extension(file):
    if len(file) == 0:
        raise ValidationError('Empty file.')
    valid_mime_types = ['application/pdf', 'image/png', 'image/jpg', 'image/bmp', 'application/x-bzip', 'application/x-bzip2',
                        'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/epub+zip', 'application/gzip', 'image/gif', 'image/jpeg', 'audio/mpeg', 'video/mpeg',
                        'video/x-msvideo', 'application/vnd.amazon.ebook', 'application/vnd.oasis.opendocument.presentation',
                        'application/vnd.oasis.opendocument.spreadsheet', 'application/vnd.oasis.opendocument.text', 'audio/ogg',
                        'video/ogg', 'audio/opus', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'application/vnd.rar', 'application/rtf', 'image/svg+xml', 'application/x-tar', 'image/tiff',
                        'text/plain', 'audio/wav', 'audio/webm', 'video/webm', 'image/webp', 'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip',
                        'application/x-7z-compressed', 'video/mp4']
    file_mime_type = magic.from_buffer(file.read(2048), mime=True)
    if file_mime_type not in valid_mime_types:
        raise ValidationError('Unsupported file type.')
    valid_file_extensions = ['.pdf', '.png', '.jpg', '.jpeg', '.bmp', '.bz', '.bz2', '.csv', '.doc', '.docx', '.epub',
                             '.gz', '.gif', '.mp3', '.mpeg', '.avi', '.azw', '.odp', '.ods', '.odt', '.oga', '.ogv',
                             '.opus', '.ppt', '.pptx', '.rar', '.rtf', '.svg', '.tar', '.tgz', '.tiff', '.tif', '.txt',
                             '.wav', '.weba', '.webm', '.webp', '.xls', '.xlsx', '.zip', '.7z', '.mp4']
    ext = os.path.splitext(file.name)[1]
    if ext.lower() not in valid_file_extensions:
        raise ValidationError('Unacceptable file extension.')

from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        all_errors = response.data
        new_response = Response(data={}, status=response.status_code)
        new_response.data['status_code'] = response.status_code
        new_response.data['errors'] = all_errors
        return new_response

    return response

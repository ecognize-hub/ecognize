from apps.profiles.models import UserType


def base_template_name_context_processor(request):
    if not request.user.is_authenticated:
        base_template_name = 'base_unauth.html'
    else:
        if request.user.is_superuser:
            base_template_name = 'base_admin.html'
        else:
            if request.user.profile.type == UserType.VOL.value:
                base_template_name = 'base_vol.html'
            elif request.user.profile.type == UserType.ANO.value:
                base_template_name = 'base_ano.html'
            else:
                base_template_name = 'base_nonvolano.html'

    return {
        'base_template_name': base_template_name,
    }

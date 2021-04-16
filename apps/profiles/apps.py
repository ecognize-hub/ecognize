from django.apps import AppConfig
from django.db.models.signals import post_save


class ProfilesConfig(AppConfig):
    name = 'apps.profiles'

    def ready(self):
        from .signals import create_user_profile
        from django.contrib.auth.models import User
        post_save.connect(create_user_profile, sender=User)

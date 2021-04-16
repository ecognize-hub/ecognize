from .models import UserProfile, UserSettings


def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile = UserProfile.objects.create(user=instance)
        UserSettings.objects.create(user=profile)

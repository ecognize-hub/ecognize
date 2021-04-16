from django.contrib.auth.tokens import PasswordResetTokenGenerator


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) +
            str(user.profile.email_confirmed)
        )


class OrgActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, org_request, timestamp):
        return (
            str(org_request.pk) + str(timestamp) +
            str(org_request.email_confirmed)
        )


account_activation_token = AccountActivationTokenGenerator()
org_activation_token = OrgActivationTokenGenerator()

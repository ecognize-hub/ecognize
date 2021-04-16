from datetime import date, datetime
from django.db import models
from apps.profiles.models import OrganizationGroup


class Plans(models.TextChoices):
    FREE = "F", "free"
    SUPP = "S", "supporter"


class UsageLimitations:
    limitations = {
        'forums': {
            Plans.FREE.value: 25,    # number
            Plans.SUPP.value: 30000  # number
        },
        'filesharing': {
            Plans.FREE.value:   50 * 1024 * 1024,  # MB
            Plans.SUPP.value: 2000 * 1024 * 1024   # MB
        }
    }


class PaymentFrequencies(models.TextChoices):
    MONTHLY = 'M', 'monthly'
    ANNUALLY = 'A', 'annually'
    NEVER = 'N', 'never'


class Pricing:
    pricing = {
        Plans.FREE.value: {
            PaymentFrequencies.MONTHLY.value: {
                'USD': 0,
                'EUR': 0
            },
            PaymentFrequencies.ANNUALLY.value: {
                'USD': 0,
                'EUR': 0
            }
        },
        Plans.SUPP.value:  {
            PaymentFrequencies.MONTHLY.value: {
                'USD': 10,
                'EUR': 10
            },
            PaymentFrequencies.ANNUALLY.value: {
                'USD': 100,
                'EUR': 100
            }
        }
    }


class Quota(models.Model):
    org = models.OneToOneField(OrganizationGroup, verbose_name='Organization', primary_key=True, on_delete=models.CASCADE)
    usage_forums = models.PositiveSmallIntegerField(null=False, default=0)
    usage_filesharing = models.PositiveIntegerField(null=False, default=0)
    plan = models.CharField(choices=Plans.choices, default=Plans.FREE.value, max_length=1)
    paid_until = models.DateField(default=date(2020, 10, 16))  # any point in the past; free plan does not evaluate this value
    last_paid = models.DateField(null=True, blank=True)
    payment_frequency = models.CharField(choices=PaymentFrequencies.choices, max_length=1, blank=False, default=PaymentFrequencies.NEVER.value)
    auto_extend = models.BooleanField(default=False)

    def get_usage_and_limit(self, resource_name: str) -> (int, int):
        plan = Plans.FREE.value
        # check if user had another subscription plan and if it is still valid:
        if self.plan != Plans.FREE.value:
            if self.paid_until > datetime.today():
                plan = self.plan

        if resource_name == "forums":
            return self.usage_forums, UsageLimitations.limitations[resource_name][plan]
        elif resource_name == 'filesharing':
            return self.usage_filesharing, UsageLimitations.limitations[resource_name][plan]
        else:
            raise ValueError("Invalid value for {}".format(resource_name))

    def check_within_quota(self, resource_name: str, value: int) -> bool:
        plan = Plans.FREE.value
        # check if user had another subscription plan and if it is still valid:
        if self.plan != Plans.FREE.value:
            if self.paid_until > datetime.today():
                plan = self.plan

        if resource_name == "forums":
            print("Current usage: {}, adding {}, limit: {}.".format(self.usage_forums, value, UsageLimitations.limitations[resource_name][plan]))
            return self.usage_forums + value < UsageLimitations.limitations[resource_name][plan]
        elif resource_name == 'filesharing':
            print("Current usage: {}, adding {}, limit: {}.".format(self.usage_filesharing, value,
                                                                    UsageLimitations.limitations[resource_name][plan]))
            return self.usage_filesharing + value < UsageLimitations.limitations[resource_name][plan]
        else:
            raise ValueError("Invalid value for {}".format(resource_name))

    def update_usage(self, resource_name: str, value: int):
        if resource_name == "forums":
            self.usage_forums = self.usage_forums + value
            self.save()
        elif resource_name == 'filesharing':
            self.usage_filesharing = self.usage_filesharing + value
            self.save()
        else:
            raise ValueError("Invalid value for {}".format(resource_name))

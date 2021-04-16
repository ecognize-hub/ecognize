from crum import get_current_user
from django.views.generic import TemplateView
from apps.quotas.models import UsageLimitations, Quota, Plans


class PlanOverview(TemplateView):
    template_name = "plans_overview.html"

    def get_context_data(self, **kwargs):
        context = super(PlanOverview, self).get_context_data()
        current_user = get_current_user()
        current_org = current_user.profile.primary_org
        context['limitations'] = UsageLimitations.limitations
        quota_obj = Quota.objects.get(pk=current_org.pk)
        context['plan_name'] = quota_obj.get_plan_display()
        context['limitations_filesharing_F'] = UsageLimitations.limitations['filesharing']['F'] / (1024 * 1024)
        context['limitations_filesharing_S'] = UsageLimitations.limitations['filesharing']['S'] / (1024 * 1024)
        if quota_obj.plan == Plans.FREE.value:
            context['plan_validity_date'] = "unlimited"
        else:
            context['plan_validity_date'] = quota_obj.paid_until
        return context

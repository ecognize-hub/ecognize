from django.views.generic import TemplateView


class HomePageView(TemplateView):
    template_name = 'home.html'

    def get_template_names(self):
        if not self.request.user.is_authenticated:
            return ['home.html', ]
        else:
            return ['home_authenticated.html', ]


class ImprintView(TemplateView):
    template_name = 'imprint.html'


class PrivacyPolicyView(TemplateView):
    template_name = 'privacy_policy.html'


class TermsAndConditionsView(TemplateView):
    template_name = 'terms_and_conditions.html'

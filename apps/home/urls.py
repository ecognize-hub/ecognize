from .views import HomePageView, ImprintView, PrivacyPolicyView, TermsAndConditionsView
from django.urls import path


urlpatterns = [
    path('', HomePageView.as_view(), name='home'),
    path('imprint', ImprintView.as_view(), name='imprint'),
    path('privacy_policy', PrivacyPolicyView.as_view(), name='privacy-policy'),
    path('terms_and_conditions', TermsAndConditionsView.as_view(), name='terms-and-conditions'),
]

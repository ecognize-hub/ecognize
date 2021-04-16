from django.conf.urls import url
from django.contrib.auth.decorators import login_required
from .views import PlanOverview

urlpatterns = [
    url(r'plans$', login_required(PlanOverview.as_view()), name='view-plans-overview'),  # GET
]

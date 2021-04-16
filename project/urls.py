"""project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.home.urls')),
    path('reports/', include('apps.reports.urls')),
    path('profile/', include('apps.profiles.urls')),
    path('auth/', include('apps.usermgmt.urls')),
    path('notifications/', include('apps.notifications.urls')),
    path('social/', include('apps.social.urls')),
    path('events/', include('apps.events.urls')),
    path('forums/', include('apps.forums.urls')),
    path('file_exchange/', include('apps.filesharing.urls')),
    path('feedback/', include('apps.feedback.urls')),
    path('mgmt/', include('apps.mgmt.urls')),
    path('quotas/', include('apps.quotas.urls')),
    url(r'^captcha/', include('captcha.urls')),
    url(r'^api/captcha/', include('rest_captcha.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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
from django.urls import include, path
from django.views.generic import RedirectView

urlpatterns = [
    path("", RedirectView.as_view(url="/dashboard/index/", permanent=True)),
    path("admin/", admin.site.urls),
    # Removing legacy login pages, uncomment to see them again.
    path("accounts/", include("allauth.urls")),
    path("accounts/", include("allauth.socialaccount.urls")),
    path("_allauth/", include("allauth.headless.urls")),
    path("info/", include("info.urls")),
    path("maps/", include("maps.urls")),  # TODO: remove maps app and merge functionality with dashboard
    path("users/", include("users.urls")),
    path("dashboard/", include("dashboard.urls")),
]

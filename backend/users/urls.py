from django.urls import path

from .api import api
from .views import login_view, logout_view, profile_view, signup_view

urlpatterns = [
    path("api/", api.urls),
    path("accounts/signup/", signup_view),
    path("accounts/login/", login_view),
    path("accounts/logout/", logout_view),
    path("accounts/profile/", profile_view),
]

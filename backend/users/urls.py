from django.urls import path

from .api import api
from .views import login_view, logout_view, signup_view

urlpatterns = [
    path("api/", api.urls),
    path("login/", login_view),
    path("logout/", logout_view),
    path("signup/", signup_view),
]

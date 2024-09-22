from django.urls import path

from .api import api
from .views import auth_view

urlpatterns = [
    path("api/", api.urls),
    path("auth/", auth_view),
]

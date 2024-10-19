from django.urls import path

from .api import api

app_name = "maps"

urlpatterns = [
  path("api/", api.urls),
]

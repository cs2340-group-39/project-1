from django.urls import path

from .api import api
from .views import maps_view

app_name = "maps"

urlpatterns = [
    path("maps_view/", maps_view, name="maps_view"),  # TODO: Mark for deprecation
    path("api/", api.urls),
]

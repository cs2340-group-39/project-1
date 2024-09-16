from django.urls import path

from .views import index, map

app_name = "maps"

urlpatterns = [
    path("map/", map, name="map"),
]

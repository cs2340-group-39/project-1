from django.urls import path

from .views import index, map_view

app_name = "maps"

urlpatterns = [
    path("index/", index, name="map_index"),
    path("map_view/", map_view, name="map_view"),
]

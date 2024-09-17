from django.urls import path

from .views import index, maps_view

app_name = "maps"

urlpatterns = [
    path("index/", index, name="maps_index"),
    path("maps_view/", maps_view, name="maps_view"),
]

from django.urls import path

from .views import maps_view

app_name = "maps"

urlpatterns = [
    path("maps_view/", maps_view, name="maps_view"),
]

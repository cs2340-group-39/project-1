from django.urls import path

from .views import info_view

app_name = "info"

urlpatterns = [
  path("index/", info_view, name="info_view"),
]

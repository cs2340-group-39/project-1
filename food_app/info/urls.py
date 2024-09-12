from django.urls import include, path

from .views import index

app_name = "info"

urlpatterns = [
    path("", index),
]

from django.urls import path

from .views import index

app_name = "info"

urlpatterns = [
    path("index", index, name="index"),
]

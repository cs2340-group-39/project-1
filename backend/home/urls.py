from django.urls import path

from .views import home_view

app_name = "home"

urlpatterns = [
    path("index/", home_view, name="home_view"),
]

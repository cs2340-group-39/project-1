from django.urls import path

from .views import dashboard_home

app_name = 'dashboard'

urlpatterns = [
  path('index/', dashboard_home, name='dashboard_home'),
]

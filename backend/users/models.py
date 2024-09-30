from django.contrib.auth.models import User
from django.db import models
from maps.models import Place


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorite_places = models.JSONField(blank=True, default=list)

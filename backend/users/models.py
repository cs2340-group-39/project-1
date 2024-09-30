from django.db import models
from django.contrib.auth.models import User

from maps.models import Place


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    favorite_places = models.ManyToManyField(Place, related_name="favorited_by")

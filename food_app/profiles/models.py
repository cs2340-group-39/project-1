from django.db import models
from django.contrib.postgres.fields import ArrayField

from maps.models import Place


class UserProfile(models.Model):
  favorite_restauraunts = ArrayField(Place(), max_length=10)

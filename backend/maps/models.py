from django.contrib.postgres.fields import ArrayField
from django.db import models


class FavioritePlace(models.Field):
    place_id = models.CharField(max_length=100)

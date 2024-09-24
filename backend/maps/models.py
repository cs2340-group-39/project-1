from django.contrib.postgres.fields import ArrayField
from django.db import models


class PlaceReview(models.Field):
    # review_content = models.TextField()
    pass


class Place(models.Field):
    identifier = None  # We need some unique identifier for each place here
    reviews = ArrayField(PlaceReview(), max_length=500)

# from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.db import models
from maps.models import Place, PlaceReview


class UserProfile(models.Model):
    user = models.OneToOneField()  # Link to user model
    favorite_restauraunts = ArrayField(Place(), max_length=10)
    user_reviews = ArrayField(PlaceReview, max_length=100)

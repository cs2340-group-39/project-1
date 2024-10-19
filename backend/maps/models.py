from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Place(models.Model):
  google_place_id = models.CharField(max_length=100, unique=True)


class PlaceReview(models.Model):
  place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="reviews_for_place")
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_for_user")
  rating = models.FloatField(validators=[MinValueValidator(1.0), MaxValueValidator(5.0)])
  text = models.TextField(max_length=300)
  timestamp = models.DateTimeField(auto_now_add=True)

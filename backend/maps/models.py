from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


def is_valid_rating(value):
    """
    Rating must be between 1 and 5 with only half steps
    """
    if not (1 <= value <= 5) or (value * 2) % 1 != 0:
        raise ValidationError(
            "Rating must be between 1 and 5 with only half steps allowed."
        )


class Place(models.Model):
    google_place_id = models.CharField(max_length=100, unique=True)


class PlaceReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.FloatField(
        validators=[MinValueValidator(1.0), MaxValueValidator(5.0), is_valid_rating]
    )
    text = models.TextField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)
    place = models.ForeignKey(Place, on_delete=models.CASCADE)

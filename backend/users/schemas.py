from ninja import Schema
from typing import List
from datetime import datetime
from pydantic import field_validator


class UserSchema(Schema):
    id: int
    username: str
    email: str


class PlaceSchema(Schema):
    id: int
    google_place_id: str


class UserProfileSchema(Schema):
    id: int
    user: UserSchema
    favorite_places: List[PlaceSchema]


class PlaceReviewInSchema(Schema):
    rating: float
    text: str
    place_id: int

    @field_validator("rating")
    def validate_rating(cls, v):
        if not (1 <= v <= 5) or (v * 2) % 1 != 0:
            raise ValueError(
                "Rating must be between 1 and 5 with only half steps allowed."
            )
        return v


class PlaceReviewOutSchema(PlaceReviewInSchema):
    id: int
    user: UserSchema
    place: PlaceSchema
    timestamp: datetime


class FavoritePlaceSchema(Schema):
    place_id: str

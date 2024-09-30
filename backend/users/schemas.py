from ninja import Schema
from typing import List
from datetime import datetime


class UserSchema(Schema):
    id: int
    username: str
    email: str


class PlaceSchema(Schema):
    google_place_id: str


class UserProfileSchema(Schema):
    id: int
    user: UserSchema
    favorite_places: List[PlaceSchema]


class PlaceReviewSchema(Schema):
    id: int
    user: UserSchema
    place: PlaceSchema
    text: str
    rating: float

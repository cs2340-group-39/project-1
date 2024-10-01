from typing import List

from ninja import Schema


class UserSchema(Schema):
    id: int


class PlaceSchema(Schema):
    google_place_id: str


class UserProfileSchema(Schema):
    user: UserSchema
    favorite_places: List[PlaceSchema]


class PlaceReviewSchema(Schema):
    place: PlaceSchema
    text: str
    rating: float

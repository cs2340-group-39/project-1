import os
import re
from http import HTTPStatus

import googlemaps
from django.forms.models import model_to_dict
from django.http import HttpRequest
from maps.models import Place, PlaceReview
from ninja import NinjaAPI

from .models import UserProfile
from .schemas import PlaceReviewSchema, PlaceSchema

api = NinjaAPI(urls_namespace="users")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)


# @api.get("/account/confirm_email")
# def confirm_email(request: HttpRequest, code: str):
#     response = requests.post("http://127.0.0.1:8000/_allauth/browser/v1/auth/email/verify", json={
#         "key": code
#     })
#     return response.json()

@api.get("/get_favorite_places")
def get_favorite_places(request: HttpRequest):
    if not request.user.is_authenticated:
        return {"status": HTTPStatus.FORBIDDEN, "msg": "User must be authenticated for this method."}
    
    def parse_address(address_string):
        pattern = r'<span class="([^"]+)">([^<]+)</span>'
        matches = re.findall(pattern, address_string)
        address_dict = {class_name.replace("-", "_"): content for class_name, content in matches}
        return address_dict

    profile = UserProfile.objects.get(user=request.user)

    favorite_places = []
    for place in profile.favorite_places:
        place_result = gmaps.place(place_id=place["google_place_id"])["result"]
        favorite_places.append(
            {
                "google_place_id": place["google_place_id"],
                "place_name": place_result.get("name"),
                "place_address": parse_address(place_result["adr_address"]),
                "google_maps_page": place_result.get("url"),
            }
        )

    return {
        "status": HTTPStatus.OK,
        "user_id": profile.user.id,
        "favorite_places": favorite_places,
    }

@api.post("/add_favorite_place")
def add_favorite_place(request: HttpRequest, params: PlaceSchema):
    if not request.user.is_authenticated:
        return {
            "status": HTTPStatus.FORBIDDEN,
            "msg": "User must be authenticated for this method.",
        }

    profile = UserProfile.objects.get(user=request.user)
    place, created = Place.objects.get_or_create(google_place_id=params.google_place_id)

    if model_to_dict(place).get("google_place_id") in [
        favorite_place.get("google_place_id") for favorite_place in profile.favorite_places
    ]:
        return {
            "status": HTTPStatus.BAD_REQUEST,
            "user_id": profile.user.id,
            "msg": f"The place id '{params.google_place_id}' has already been favorited by this user.",
        }

    profile.favorite_places.append(model_to_dict(place))
    profile.save()

    return {
        "status": HTTPStatus.OK,
        "user_id": profile.user.id,
        "favorite_place": {
            "place_id": place.google_place_id,
        },
    }


@api.put("/remove_favorite_place")
def remove_favorite_place(request: HttpRequest, params: PlaceSchema):
    if not request.user.is_authenticated:
        return {
            "status": HTTPStatus.FORBIDDEN,
            "msg": "User must be authenticated for this method.",
        }

    profile = UserProfile.objects.get(user=request.user)
    place, created = Place.objects.get_or_create(google_place_id=params.google_place_id)

    if model_to_dict(place).get("google_place_id")  not in [
        favorite_place.get("google_place_id") for favorite_place in profile.favorite_places
    ]:
        return {
            "status": HTTPStatus.BAD_REQUEST,
            "user_id": profile.user.id,
            "msg": f"The place id '{params.google_place_id}' has not already been favorited by this user.",
        }

    profile.favorite_places.remove(model_to_dict(place))
    profile.save()

    return {
        "status": HTTPStatus.OK,
        "user_id": profile.user.id,
        "favorite_place_removed": {
            "place_id": place.google_place_id,
        },
    }


@api.get("/get_reviews")
def get_reviews(request: HttpRequest):
    if not request.user.is_authenticated:
        return {"status": HTTPStatus.FORBIDDEN, "msg": "User must be authenticated for this method."}
    
    def parse_address(address_string):
        pattern = r'<span class="([^"]+)">([^<]+)</span>'
        matches = re.findall(pattern, address_string)
        address_dict = {class_name.replace("-", "_"): content for class_name, content in matches}
        return address_dict

    user_reviews = []
    for review in request.user.reviews_for_user.all():
        place_result = gmaps.place(place_id=review.place.google_place_id)["result"]
        user_reviews.append(
            {
                "google_place_id": review.place.google_place_id,
                "place_name": place_result.get("name"),
                "place_address": parse_address(place_result["adr_address"]),
                "google_maps_page": place_result.get("url"),
                "rating": review.rating,
                "text": review.text,
                "timestamp": review.timestamp,
            }
        )

    return {
        "status": HTTPStatus.OK,
        "user_id": request.user.id,
        "username": request.user.username,
        "reviews": user_reviews
    }


@api.post("/add_review")
def add_review(request: HttpRequest, params: PlaceReviewSchema):
    if not request.user.is_authenticated:
        return {"status": HTTPStatus.FORBIDDEN, "msg": "User must be authenticated for this method."}

    place, created = Place.objects.get_or_create(google_place_id=params.place.google_place_id)
    place_review = PlaceReview.objects.create(
        place=place, user=request.user, rating=params.rating, text=params.text
    )

    return {
        "status": HTTPStatus.OK,
        "user_id": request.user.id,
        "username": request.user.username,
        "review": {
            "place": model_to_dict(place_review.place),
            "username": place_review.user.username,
            "rating": place_review.rating,
            "text": place_review.text,
            "timestamp": place_review.timestamp,
        },
    }

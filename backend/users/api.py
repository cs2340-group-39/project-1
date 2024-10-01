from datetime import datetime
from http import HTTPStatus

from django.forms.models import model_to_dict
from django.http import HttpRequest
from maps.models import Place, PlaceReview
from ninja import NinjaAPI

from .models import UserProfile
from .schemas import PlaceReviewSchema, PlaceSchema

api = NinjaAPI(urls_namespace="users")


@api.get("/get_favorite_places")
def get_favorite_places(request: HttpRequest):
    if not request.user.is_authenticated:
        return {"status": HTTPStatus.FORBIDDEN, "msg": "User must be authenticated for this method."}

    profile = UserProfile.objects.get(user=request.user)

    return {
        "status": HTTPStatus.OK,
        "user_id": profile.user.id,
        "favorite_places": [
            {
                "google_place_id": place.google_place_id,
            }
            for place in profile.favorite_places.all()
        ],
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

    return {
        "status": HTTPStatus.OK,
        "user_id": request.user.id,
        "reviews": [
            {
                "google_place_id": review.place.google_place_id,
                "rating": review.rating,
                "text": review.text,
                "timestamp": review.timestamp,
            }
            for review in request.user.reviews_for_user.all()
        ],
    }


@api.post("/add_favorite_place")
def add_review(request: HttpRequest, params: PlaceReviewSchema):
    if not request.user.is_authenticated:
        return {"status": HTTPStatus.FORBIDDEN, "msg": "User must be authenticated for this method."}

    place, created = Place.objects.get_or_create(google_place_id=params.place.google_place_id)
    place_review = PlaceReview.objects.create(
        place=place, user=request.user, rating=params.rating, text=params.text, timestamp=datetime.now()
    )

    return {
        "status": HTTPStatus.OK,
        "user_id": request.user.id,
        "review": {
            "place": place_review.place,
            "user": place_review.user,
            "rating": place_review.rating,
            "text": place_review.text,
            "timestamp": place_review.timestamp,
        },
    }

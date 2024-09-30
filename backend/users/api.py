from django.http import HttpRequest
from ninja import NinjaAPI
from http import HTTPStatus

from .schemas import FavoritePlaceSchema, UserProfileSchema
from .models import UserProfile

api = NinjaAPI(urls_namespace="users")


@api.get("/get_favorite_places", response=UserProfileSchema)
def get_favorite_places(request: HttpRequest):
    if not request.user.is_authenticated:
        return {
            "status": HTTPStatus.FORBIDDEN,
            "msg": "User must be authenticated for this method.",
        }

    profile = UserProfile.objects.filter(user=request.user)[0]
    return profile


@api.post("/add_favorite_place")
def add_favorite_place(request: HttpRequest, params: FavoritePlaceSchema):
    pass

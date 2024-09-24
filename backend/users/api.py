from django.http import HttpRequest
from ninja import NinjaAPI

api = NinjaAPI()


@api.get("/user_reviews")
def get_reviews_for_user(request: HttpRequest):
    pass


@api.post("/user_reviews")
def create_review_from_user(request: HttpRequest):
    pass

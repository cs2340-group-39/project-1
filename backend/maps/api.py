from django.http import HttpRequest
from ninja import NinjaAPI

api = NinjaAPI()


@api.get("/place_reviews")
def get_reviews_for_place(request: HttpRequest):
    pass


@api.post("/place_reviews")
def create_review_for_place(request: HttpRequest):
    pass

from django.http import HttpRequest
from ninja import NinjaAPI

api = NinjaAPI()


@api.get("/hello")
def hello(request: HttpRequest):
    return "Hello world"


@api.post("/signup")
def signup(request: HttpRequest):
    pass

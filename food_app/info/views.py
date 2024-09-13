from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def index(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return HttpResponse(f"Hello, {request.user.get_username()}")
    else:
        return HttpResponse(
            "This is the info screen. You are seeing this screen because you "
            "are not logged in. Here, we will tell users about our app and "
            "include a button which will redirect them to the login screen."
        )

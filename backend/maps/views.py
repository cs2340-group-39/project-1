import os

from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def maps_view(request: HttpRequest) -> HttpResponse:
    # You can pass the API key or any other necessary data here
    return render(
        request,
        "maps/mapapp.html",
        {"api_key": os.getenv("GOOGLE_PLACES_API_KEY")},
    )

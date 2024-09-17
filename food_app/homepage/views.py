import os

from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

# Create your views here.
def homepage_view(request: HttpRequest) -> HttpRequest:
    # You can pass the API key or any other necessary data here
    return render(
        request,
        "homepage/homepage_view.html",
        #{
        #   "api_key": os.getenv("GOOGLE_PLACES_API_KEY"),
        #},
    )
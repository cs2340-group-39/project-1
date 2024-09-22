import json

from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def auth_view(request: HttpRequest) -> HttpResponse:
    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/allauth.html", context)

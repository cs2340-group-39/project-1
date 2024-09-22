import json

from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def login_view(request: HttpRequest) -> HttpResponse:
    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/login.html", context)


def logout_view(request: HttpRequest) -> HttpResponse:
    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/logout.html", context)


def signup_view(request: HttpRequest) -> HttpResponse:
    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/signup.html", context)

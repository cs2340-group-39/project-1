import json

from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render


def signup_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("/users/accounts/profile/")

    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/signup.html", context)


def login_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return redirect("/users/accounts/profile/")

    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/login.html", context)


def logout_view(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return redirect("/")

    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/logout.html", context)


def profile_view(request: HttpRequest) -> HttpResponse:
    if not request.user.is_authenticated:
        return redirect("/users/accounts/signup")

    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/profile.html", context)


def code_form_view(request: HttpRequest) -> HttpResponse:
    data = {}
    context = {"data": json.dumps(data)}
    return render(request, "users/code_form.html", context)

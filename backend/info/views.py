from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def info_view(request: HttpRequest) -> HttpResponse:
    return render(request, "info/index.html")

import json

from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def info_view(request: HttpRequest) -> HttpResponse:
    data = {"message": "Hello from Django"}
    context = {"data": json.dumps(data)}
    print(context)
    return render(request, "info/index.html", context)

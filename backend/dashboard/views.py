import json

from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render


def dashboard_home(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        data = {"username": request.user.username}
        context = {"data": json.dumps(data)}
        print(context)
        return render(request, "dashboard/index.html", context)
    else:
        return redirect("/info/index/", permanent=True)

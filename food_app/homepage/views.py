from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render


def home_view(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return render(request, "home/home_view.html")
    else:
        return redirect("/info/index/")

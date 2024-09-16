from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

# Create your views here.

def index(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return HttpResponse(f"Hello, {request.user.get_username()}, welcome to Maps")
    else:
        return HttpResponse(
            "Welcome to the Maps Page! Here you'll be able to see maps of restaurants"
        )
def map(request):
    # You can pass the API key or any other necessary data here
    return render(request, 'maps/mapapp.html', {'api_key': 'AIzaSyDP3ajlMY1m8tfXZhe21XLXj_XEyg6cpoM'})

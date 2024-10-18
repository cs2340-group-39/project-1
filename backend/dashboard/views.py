import json
import os

from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect, render


def dashboard_home(request: HttpRequest) -> HttpResponse:
  if request.user.is_authenticated:
    data = {
      'username': request.user.username,
      'googleMapsApiKey': os.getenv('GOOGLE_PLACES_API_KEY'),
      'mapBoxAccessToken': os.getenv('MAPBOX_ACCESS_TOKEN'),
    }
    context = {'data': json.dumps(data)}
    return render(request, 'dashboard/index.html', context)
  else:
    return redirect('/info/index/', permanent=True)

import json

from django.http import HttpRequest, HttpResponse
from django.shortcuts import render


def info_view(request: HttpRequest) -> HttpResponse:
  data = {
    'username': request.user.username,
    'userLoggedIn': request.user.is_authenticated,
  }
  context = {'data': json.dumps(data)}
  return render(request, 'info/index.html', context)

from django.http import HttpRequest, HttpResponse


def info_view(request: HttpRequest) -> HttpResponse:
    return HttpResponse(
        "This is the info screen. You are seeing this screen because you are not logged in. Here, we will tell users about our app and include a button which will redirect them to the login screen."
    )

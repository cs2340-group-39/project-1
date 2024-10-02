import datetime
import os
import re
from http import HTTPStatus

import googlemaps
import pytz
from django.http import HttpRequest
from ninja import NinjaAPI
from users.models import UserProfile

from .models import Place
from .schemas import SearchParams

api = NinjaAPI(urls_namespace="maps")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)


@api.get("/get_location")
def get_location(request: HttpRequest):
    location = gmaps.geolocate()
    timezone_id = gmaps.timezone(location=location["location"])["timeZoneId"]
    timezone = pytz.timezone(timezone_id)
    current_time = datetime.datetime.now(timezone).strftime("%H")
    return {
        "latitude": location["location"]["lat"],
        "longitude": location["location"]["lng"],
        "hour": int(current_time),
    }


@api.post("/search_for_restaurants")
def search_for_restaurants(request: HttpRequest, params: SearchParams):
    """
    Example request body:

    {
        "location": {"lat": 37.7749, "lng": -122.4194},
        "search_mode": "cuisine_type",
        "query": "Italian",
        "radius": 1000,
        "rating": 4.0
    }
    """
    if not request.user.is_authenticated:
        return {"status": HTTPStatus.FORBIDDEN, "msg": "User must be authenticated for this method."}

    response = []

    profile = UserProfile.objects.get(user=request.user)
    favorite_google_place_ids = [favorite_place["google_place_id"] for favorite_place in profile.favorite_places]

    query = ""
    search_location = params.location
    if params.location_name != "":
        geocode_result = gmaps.geocode(address=params.location_name)
        if len(geocode_result) > 0:
            search_location = geocode_result[-0]["geometry"]["location"]
    if params.query == "cuisine_type":
        query += f"Cuisine type: {params.cuisine_type}"
    if params.query == "restaurant_name":
        query += f"; Restaurant name: {params.restaurant_name}"

    result = gmaps.places(location=search_location, query=query, radius=params.radius, type=[ 'restaurant', 'bakery', 'cafe', 'meal_delivery', 'meal_takeaway' ])

    def parse_address(address_string):
        pattern = r'<span class="([^"]+)">([^<]+)</span>'
        matches = re.findall(pattern, address_string)
        address_dict = {class_name.replace("-", "_"): content for class_name, content in matches}
        return address_dict

    for place in result["results"]:
        if place["business_status"] != "OPERATIONAL":
            continue

        if place.get("rating") and place.get("rating") < params.rating:
            continue

        place_result = gmaps.place(place_id=place["place_id"], reviews_sort="most_relevant")["result"]
        place_model, created = Place.objects.get_or_create(google_place_id=place["place_id"])

        custom_place_reviews = []
        if not created:
            custom_place_reviews = place_model.reviews_for_place.all()

        is_favorite_place = False
        if not created:
            is_favorite_place = place["place_id"] in favorite_google_place_ids

        response.append({
            "place_id": place["place_id"],
            "place_name": place["name"],
            "contact_info": {
                "address": parse_address(place_result["adr_address"]),
                "phone_number": place_result.get("international_phone_number"),
                "google_maps_page": place_result.get("url"),
            },
            "location": {
                "latitude": place["geometry"]["location"]["lat"],
                "longitude": place["geometry"]["location"]["lng"],
            },
            "rating": place.get("rating"),
            "is_open_now": (place.get("opening_hours").get("open_now") if place.get("opening_hours") else None),
            "timings": (
                place_result.get("opening_hours").get("periods") if place_result.get("opening_hours") else None
            ),
            "reviews": (
                [
                    {
                        "author_name": review["author_name"],
                        "rating": review["rating"],
                        "time": review["time"],
                        "text": review["text"],
                    }
                    for review in place_result.get("reviews")
                ]
                if place_result.get("reviews")
                else []
            ),
            "custom_reviews": [
                {
                    "author_name": custom_review.user.username,
                    "rating": custom_review.rating,
                    "time": custom_review.timestamp,
                    "text": custom_review.text,
                }
                for custom_review in custom_place_reviews
            ],
            "is_favorite_place": is_favorite_place,
            "cuisine_type": place_result.get("editorial_summary")["overview"] if place_result.get("editorial_summary") else "Ambiguous Restaurant",
        })

    return response

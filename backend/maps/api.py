import os
import re
import datetime
import pytz

from django.http import HttpRequest
from ninja import NinjaAPI
from http import HTTPStatus
import googlemaps

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
    response = []

    if params.search_mode not in ["cuisine_type", "restaurant_name", "location"]:
        return {"status": HTTPStatus.BAD_REQUEST, "message": "Unsupported search mode."}

    if params.search_mode == "cuisine_type":
        result = gmaps.places(
            location=params.location,
            query=f"cuisine type: {params.query}",
            radius=params.radius,
        )
    if params.search_mode == "restaurant_name":
        result = gmaps.places(
            location=params.location,
            query=f"restaurant name: {params.query}",
            radius=params.radius,
        )
    if params.search_mode == "location":
        result = gmaps.places(
            location=params.location,
            query=f"search for restaurants on: {params.query}",
            radius=params.radius,
        )

    def parse_address(address_string):
        pattern = r'<span class="([^"]+)">([^<]+)</span>'
        matches = re.findall(pattern, address_string)
        address_dict = {
            class_name.replace("-", "_"): content for class_name, content in matches
        }
        return address_dict

    for place in result["results"]:
        if place["business_status"] != "OPERATIONAL":
            continue

        if place.get("rating") and place.get("rating") < params.rating:
            continue

        place_result = gmaps.place(
            place_id=place["place_id"], reviews_sort="most_relevant"
        )["result"]

        response.append(
            {
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
                "is_open_now": (
                    place.get("opening_hours").get("open_now")
                    if place.get("opening_hours")
                    else None
                ),
                "timings": (
                    place_result.get("opening_hours").get("periods")
                    if place_result.get("opening_hours")
                    else None
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
            }
        )

    return response

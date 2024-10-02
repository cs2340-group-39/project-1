import datetime
import os
import re
from http import HTTPStatus

import googlemaps
import pytz
import torch
from django.http import HttpRequest
from ninja import NinjaAPI
from sentence_transformers import SentenceTransformer, util
from users.models import UserProfile

from .models import Place
from .schemas import SearchParams

api = NinjaAPI(urls_namespace="maps")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)
model = SentenceTransformer('all-MiniLM-L6-v2')


def predict_top_cuisines(description, cuisine_types, top_k=3):
    description_embedding = model.encode(description, convert_to_tensor=True)
    cuisine_embeddings = model.encode(cuisine_types, convert_to_tensor=True)
    cosine_scores = util.cos_sim(description_embedding, cuisine_embeddings)[0]
    top_results = torch.topk(cosine_scores, k=top_k)
    top_cuisines = [cuisine_types[idx] for score, idx in
                    zip(top_results.values, top_results.indices)]
    return top_cuisines


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
  
        description = place_result.get("editorial_summary")["overview"] if place_result.get("editorial_summary") else None
        cuisine_types = [
            "American",
            "Italian",
            "Mexican",
            "Japanese",
            "Thai",
            "Chinese",
            "Indian",
            "European",
            "Coffee Shop",
            "Fast Food Chain",
            "Diner",
            "Original Restaurant",
            "Pub",
            "Pizza Place",
            "Burger Joint",
            "Steakhouse",
            "Seafood",
        ]
        top_cuisine_types = predict_top_cuisines(description if description else place["name"], cuisine_types, top_k=2)

        cuisine_type = ""
        if description:
            cuisine_type = ", ".join(top_cuisine_types)
        else:
            cuisine_type = "Our advanced prediction model predicts these cuisine types from the name of this restaurant: " + ", ".join(top_cuisine_types)
  

        response.append({
            "place_id": place["place_id"],
            "place_name": place["name"],
            "contact_info": {
                "address": parse_address(place_result["adr_address"]),
                "phone_number": place_result.get("international_phone_number") if place_result.get("international_phone_number") else "No phone number available",
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
            "description": description if description else "No description available.",
            "cuisine_type": cuisine_type,
        })

    return response

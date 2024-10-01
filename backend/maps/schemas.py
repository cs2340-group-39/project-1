from ninja import Schema


class SearchParams(Schema):
    location: dict[str, float]
    location_name: str
    restaurant_name: str
    cuisine_type: str
    search_mode: str
    query: str
    radius: int
    rating: float

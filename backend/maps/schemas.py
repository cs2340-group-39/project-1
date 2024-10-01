from ninja import Schema


class SearchParams(Schema):
    location: dict[str, float]
    location_name: str
    cuisine_type: str
    restaurant_name: str
    query: str
    radius: int
    rating: float

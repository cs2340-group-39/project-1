from ninja import Schema


class SearchParams(Schema):
    location: dict[str, float]
    search_mode: str
    query: str
    radius: int
    rating: float


class FavoritePlaceSchema(Schema):
    place_id: str
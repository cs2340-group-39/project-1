import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import axios from "axios";
import { StarIcon } from "lucide-react";
import mapboxgl from "mapbox-gl";
import { MutableRefObject, RefObject, useEffect, useRef, useState } from "react";
import ToasterLayout from "../../layouts/toaster-layout";
import createTextLayer from "../three/create-text-layer";
import { Card, CardContent } from "../ui/card";
import { HoverBorderGradient } from "../ui/hover-border-gradient";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LinkPreview } from "../ui/link-preview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "../hooks/use-toast";

// Example API request body
// {
//     "location": {"lat": 37.7749, "lng": -122.4194},
//     "search_mode": "cuisine_type",
//     "query": "Italian",
//     "radius": 1000,
//     "rating": 4.0
// }
// @ts-ignore
const PLACES_SEARCH_API_URL = "http://127.0.0.1:8000/maps/api/search_for_restaurants";
const USER_INFO_API_URL = "http://127.0.0.1:8000/maps/api/get_location";
const POST_FAVORITE_RESTAURANT_FOR_USER_URL = "http://127.0.0.1:8000/users/api/add_favorite_place";
const PUT_FAVORITE_RESTAURANT_FOR_USER_URL = "http://127.0.0.1:8000/users/api/remove_favorite_place";
const POST_REVIEW_FROM_USER_URL = "http://127.0.0.1:8000/users/api/add_review";

interface HashTable<T> {
    [key: number | string]: T;
}

interface UserInfo {
    latitude: number;
    longitude: number;
    hour: number;
}

interface Pin {
    lat: number;
    lng: number;
    label: string;
    contentId: number;
}

interface PlaceReview {
    authorName: string;
    rating: number;
    text: string;
    time: number;
}

interface Content {
    contactInfo: {
        address: {
            countryName: string;
            locality: string;
            postalCode: string;
            region: string;
            streetAddress: string;
        };
        googleMapsPage: string;
        phoneNumber: string;
    };
    placeId: string;
    placeName: string;
    rating: number;
    reviews: PlaceReview[];
    customReviews: PlaceReview[];
    isFavoritePlace: boolean;
}

interface MapsData {
    googleMapsApiKey: string;
    mapBoxAccessToken: string;
}

export default function Maps({ googleMapsApiKey, mapBoxAccessToken }: MapsData) {
    googleMapsApiKey;

    const mapContainerRef: RefObject<HTMLDivElement | undefined> = useRef();
    // @ts-ignore
    const mapRef: MutableRefObject<mapboxgl.Map> = useRef();
    const deckOverlayRef: MutableRefObject<MapboxOverlay | null> = useRef(null);

    const [searchLoading, setSearchLoading] = useState(false); //true if currently searching, changes Search button text
    const [lightPreset, setLightPreset] = useState("day");
    const [showPlaceLabels, setShowPlaceLabels] = useState(true);
    const [showPOILabels, setShowPOILabels] = useState(true);
    const [showRoadLabels, setShowRoadLabels] = useState(true);
    const [showTransitLabels, setShowTransitLabels] = useState(true);
    const [styleLoaded, setStyleLoaded] = useState(false);
    // @ts-ignore
    const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
    const [zoom, setZoom] = useState(15.1);
    const [query, setQuery] = useState("");
    // @ts-ignore
    const [searchMode, setSearchMode] = useState("cuisine_type");
    const [radius, setRadius] = useState(1000);
    const [rating, setRating] = useState(4.0);
    // @ts-ignore
    const [currentUserInfo, setCurrentUserInfo] = useState({} as UserInfo);
    const [pinData, setPinData] = useState([] as Pin[]);
    // @ts-ignore
    const [contentData, setContentData] = useState({} as HashTable<Content>);
    // @ts-ignore
    const [newReview, setNewReview] = useState({ text: "", rating: 0 });
    const [errorMessages, setErrorMessages] = useState([] as string[]);

    const [cuisineType, setCuisineType] = useState("");
    const [restaurantName, setRestaurantName] = useState("");
    const [locationName, setLocation] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [presetsOpen, setPresetsOpen] = useState(false);
    const filtersRef = useRef<HTMLDivElement>(null);
    const presetsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (filtersRef.current) {
            filtersRef.current.style.maxHeight = filtersOpen ? `${filtersRef.current.scrollHeight}px` : "0";
        }
    }, [filtersOpen, cuisineType, restaurantName, locationName, query, radius, rating]);

    useEffect(() => {
        if (presetsRef.current) {
            presetsRef.current.style.maxHeight = presetsOpen ? `${presetsRef.current.scrollHeight}px` : "0";
        }
    }, [presetsOpen, lightPreset, showPlaceLabels, showPOILabels, showRoadLabels, showTransitLabels]);

    const handleSaveAsFavorite = async () => {
        const payload = {
            google_place_id: contentData[selectedPin!.contentId]!.placeId,
        };
        await axios.post(POST_FAVORITE_RESTAURANT_FOR_USER_URL, payload);

        setContentData((prevContentData) => ({
            ...prevContentData,
            [selectedPin!.contentId]: {
                ...prevContentData[selectedPin!.contentId],
                isFavoritePlace: true,
            },
        }));

        toast({
            title: "Restaurant successfully added to favorites.",
            description: `This specific restaurant named ${
                contentData[selectedPin!.contentId].placeName
            } should now be in your favorite places.`,
        });
    };

    const handleRemoveFromFavorites = async () => {
        const payload = {
            google_place_id: contentData[selectedPin!.contentId]!.placeId,
        };
        await axios.put(PUT_FAVORITE_RESTAURANT_FOR_USER_URL, payload);

        setContentData((prevContentData) => ({
            ...prevContentData,
            [selectedPin!.contentId]: {
                ...prevContentData[selectedPin!.contentId],
                isFavoritePlace: false,
            },
        }));

        toast({
            title: "Restaurant successfully removed from favorites.",
            description: `This specific restaurant named ${
                contentData[selectedPin!.contentId].placeName
            } should now be in your favorite places.`,
        });
    };

    const handleSubmitReview = async () => {
        let newErrorMessages: string[] = [];

        // First validate the data
        if (newReview.text.length > 500) {
            newErrorMessages.push("Your review is too long, please keep it under 500 characters.");
        }

        if (newReview.rating == 0) {
            newErrorMessages.push("Please select a rating.");
        }

        if (newErrorMessages.length > 0) {
            setErrorMessages(newErrorMessages);
            return;
        }

        const payload = {
            place: {
                google_place_id: contentData[selectedPin!.contentId]?.placeId,
            },
            text: newReview.text,
            rating: newReview.rating,
        };
        const response = await axios.post(POST_REVIEW_FROM_USER_URL, payload);

        setContentData((prevContentData) => ({
            ...prevContentData,
            [selectedPin!.contentId]: {
                ...prevContentData[selectedPin!.contentId],
                customReviews: [
                    ...prevContentData[selectedPin!.contentId].customReviews,
                    {
                        authorName: response.data.username,
                        rating: newReview.rating,
                        text: newReview.text,
                        time: response.data.review.timestamp,
                    },
                ],
            },
        }));

        toast({
            title: "Restaurant review successfully added.",
            description: `Your review of this specific restaurant named ${
                contentData[selectedPin!.contentId].placeName
            } should should now be listed. Please consider that your rating will not affect the overall rating of this restaurant`,
        });
    };

    const handleSearch = async () => {
        setSearchLoading(true); //change search text to Searching...

        toast({
            title: "Search pending...",
            description: "Please wait while we search for restaurants matching your query.",
        });

        const userInfoResponse = await axios.get(USER_INFO_API_URL);
        const location = {
            lat: userInfoResponse.data.latitude,
            lng: userInfoResponse.data.longitude,
        };

        setCurrentUserInfo(userInfoResponse.data);

        const payload = {
            location: location,
            query: query,
            cuisine_type: cuisineType,
            location_name: locationName,
            restaurant_name: restaurantName,
            radius: radius,
            rating: rating,
        };

        const searchResponse = await axios.post(PLACES_SEARCH_API_URL, payload);

        let newPinData: Pin[] = [];
        let newContentData: HashTable<Content> = {};
        let itId = 0;
        for (const placeData of searchResponse.data) {
            newPinData.push({
                lat: placeData.location.latitude,
                lng: placeData.location.longitude,
                label: placeData.place_name,
                contentId: itId,
            });

            newContentData[itId] = {
                contactInfo: {
                    address: {
                        countryName: placeData.contact_info.address.country_name,
                        locality: placeData.contact_info.address.locality,
                        postalCode: placeData.contact_info.address.postal_code,
                        region: placeData.contact_info.address.region,
                        streetAddress: placeData.contact_info.address.street_address,
                    },
                    googleMapsPage: placeData.contact_info.google_maps_page,
                    phoneNumber: placeData.contact_info.phone_number,
                },
                placeId: placeData.place_id,
                placeName: placeData.place_name,
                rating: placeData.rating,
                reviews: placeData.reviews.map((review: any) => {
                    return {
                        authorName: review.author_name,
                        rating: review.rating,
                        text: review.text,
                        time: review.time,
                    };
                }),
                customReviews: placeData.custom_reviews.map((customReview: any) => {
                    return {
                        authorName: customReview.author_name,
                        rating: customReview.rating,
                        text: customReview.text,
                        time: customReview.time,
                    };
                }),
                isFavoritePlace: placeData.is_favorite_place,
            };

            itId++;
        }

        setSearchLoading(false);
        setPinData(newPinData);
        setContentData(newContentData);

        console.log(newContentData);
    };

    const getLightPresetByHour = (hour: number) => {
        if (hour >= 5 && hour < 8) return "dawn";
        if (hour >= 8 && hour < 18) return "day";
        if (hour >= 18 && hour < 21) return "dusk";
        return "night";
    };

    useEffect(() => {
        let userInfo: UserInfo = {} as UserInfo;
        const fetchData = async () => {
            const locationResponse = await axios.get(USER_INFO_API_URL);
            setCurrentUserInfo(locationResponse.data);
            userInfo = locationResponse.data;

            mapboxgl.accessToken = mapBoxAccessToken;

            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current!,
                center: [userInfo.longitude, userInfo.latitude],
                zoom: zoom,
                pitch: 45,
                bearing: 0,
                antialias: true,
            });

            // Set the initial light preset based on the hour
            const initialLightPreset = getLightPresetByHour(userInfo.hour);
            setLightPreset(initialLightPreset);

            mapRef.current.on("style.load", () => {
                setStyleLoaded(true);
                mapRef.current.setConfigProperty("basemap", "lightPreset", initialLightPreset);
            });

            mapRef.current.on("zoom", () => {
                setZoom(mapRef.current.getZoom());
            });

            mapRef.current.once("load", () => {
                deckOverlayRef.current = new MapboxOverlay({
                    interleaved: false,
                    layers: [
                        new ScenegraphLayer<Pin>({
                            id: "ScenegraphLayer1",
                            data: pinData.filter((d) => contentData[d.contentId].isFavoritePlace),
                            getPosition: (d: Pin) => [d.lng, d.lat, 0],
                            getOrientation: (_: Pin) => [180, 0, 0],
                            scenegraph: new URL("./3d-models/favorite-pin.gltf", import.meta.url).href,
                            sizeScale: 30,
                            _lighting: "pbr",
                            pickable: true,
                            autoHighlight: true,
                            onClick: (info) => {
                                if (info.object) {
                                    setSelectedPin(info.object);
                                    mapRef.current.flyTo({
                                        center: [info.object.lng, info.object.lat],
                                        zoom: 17,
                                        duration: 2000,
                                    });
                                }
                            },
                        }),
                        new ScenegraphLayer<Pin>({
                            id: "ScenegraphLayer2",
                            data: pinData.filter((d) => !contentData[d.contentId].isFavoritePlace),
                            getPosition: (d: Pin) => [d.lng, d.lat, 0],
                            getOrientation: (_: Pin) => [180, 0, 0],
                            scenegraph: new URL("./3d-models/normal-pin.gltf", import.meta.url).href,
                            sizeScale: 30, // Apply adjusted sizeScale here
                            _lighting: "pbr",
                            pickable: true,
                            autoHighlight: true,
                            onClick: (info) => {
                                if (info.object) {
                                    setSelectedPin(info.object);
                                    mapRef.current.flyTo({
                                        center: [info.object.lng, info.object.lat],
                                        zoom: 17,
                                        duration: 2000,
                                    });
                                }
                            },
                        }),
                    ],
                });

                mapRef.current.addControl(deckOverlayRef.current);
            });

            return () => mapRef.current.remove();
        };

        fetchData().then((result) => {
            return result;
        });
    }, []);

    useEffect(() => {
        if (!styleLoaded) return;

        pinData.forEach((pin, i) => {
            const layerId = `text-layer-${i}`;
            if (mapRef.current.getLayer(layerId)) {
                mapRef.current.removeLayer(layerId);
            }
            mapRef.current.addLayer(createTextLayer(layerId, pin.label, [pin.lng, pin.lat], i * 100 + 100));
        });

        if (pinData.length > 0) {
            mapRef.current.flyTo({
                center: [pinData[0].lng, pinData[0].lat],
                zoom: 17,
                duration: 2000,
            });
        } else {
            toast({
                title: "No places found for your query.",
                description:
                    "There were no places found for your specific query. Try changing the query parameters and search again, or search with a different query.",
            });
        }
    }, [pinData]);

    useEffect(() => {
        if (zoom < 6) return; // Globe gets really round here!!!

        if (deckOverlayRef.current) {
            // Adjust size scale to keep pins visible and not too small or too large
            const sizeScale = Math.pow(2, 20 - zoom);

            deckOverlayRef.current.setProps({
                interleaved: false,
                layers: [
                    new ScenegraphLayer<Pin>({
                        id: "ScenegraphLayer1",
                        data: pinData.filter((d) => contentData[d.contentId].isFavoritePlace),
                        getPosition: (d: Pin) => [d.lng, d.lat, 0],
                        getOrientation: (_: Pin) => [180, 0, 0],
                        scenegraph: new URL("./3d-models/favorite-pin.gltf", import.meta.url).href,
                        sizeScale: sizeScale,
                        _lighting: "pbr",
                        pickable: true,
                        autoHighlight: true,
                        onClick: (info) => {
                            if (info.object) {
                                setSelectedPin(info.object);
                                mapRef.current.flyTo({
                                    center: [info.object.lng, info.object.lat],
                                    zoom: 17,
                                    duration: 2000,
                                });
                            }
                        },
                    }),
                    new ScenegraphLayer<Pin>({
                        id: "ScenegraphLayer2",
                        data: pinData.filter((d) => !contentData[d.contentId].isFavoritePlace),
                        getPosition: (d: Pin) => [d.lng, d.lat, 0],
                        getOrientation: (_: Pin) => [180, 0, 0],
                        scenegraph: new URL("./3d-models/normal-pin.gltf", import.meta.url).href,
                        sizeScale: sizeScale, // Apply adjusted sizeScale here
                        _lighting: "pbr",
                        pickable: true,
                        autoHighlight: true,
                        onClick: (info) => {
                            if (info.object) {
                                setSelectedPin(info.object);
                                mapRef.current.flyTo({
                                    center: [info.object.lng, info.object.lat],
                                    zoom: 17,
                                    duration: 2000,
                                });
                            }
                        },
                    }),
                ],
            });
        }
    }, [zoom]);

    // For changing map appearance
    useEffect(() => {
        if (!styleLoaded) return;

        mapRef.current.setConfigProperty("basemap", "lightPreset", lightPreset);
        mapRef.current.setConfigProperty("basemap", "showPlaceLabels", showPlaceLabels);
        mapRef.current.setConfigProperty("basemap", "showPointOfInterestLabels", showPOILabels);
        mapRef.current.setConfigProperty("basemap", "showRoadLabels", showRoadLabels);
        mapRef.current.setConfigProperty("basemap", "showTransitLabels", showTransitLabels);
    }, [lightPreset, showPlaceLabels, showPOILabels, showRoadLabels, showTransitLabels]);

    return (
        <ToasterLayout>
            <div className="relative h-screen w-screen overflow-hidden">
                {/* @ts-ignore */}
                <div ref={mapContainerRef} className="h-full w-full" />
                {/* Map Presets Dropdown */}
                <Card className="absolute left-80 top-4 w-64">
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            <div onClick={() => setPresetsOpen(!presetsOpen)} className="cursor-pointer">
                                <h3 className="text-lg font-semibold">Map Presets</h3>
                            </div>
                            <div
                                ref={presetsRef}
                                className="space-y-4 overflow-hidden transition-all duration-300 ease-in-out"
                                style={{ maxHeight: "0" }}
                            >
                                {/* Light Preset Dropdown */}
                                <div className="space-y-2">
                                    <Label htmlFor="lightPreset">Light Preset</Label>
                                    <Select value={lightPreset} onValueChange={setLightPreset}>
                                        <SelectTrigger id="lightPreset">
                                            <SelectValue placeholder="Select light preset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dawn">Dawn</SelectItem>
                                            <SelectItem value="day">Day</SelectItem>
                                            <SelectItem value="dusk">Dusk</SelectItem>
                                            <SelectItem value="night">Night</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Show Place Labels Toggle */}
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showPlaceLabels">Show place labels</Label>
                                    <Switch
                                        id="showPlaceLabels"
                                        checked={showPlaceLabels}
                                        onCheckedChange={setShowPlaceLabels}
                                    />
                                </div>

                                {/* Show POI Labels Toggle */}
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showPOILabels">Show POI labels</Label>
                                    <Switch
                                        id="showPOILabels"
                                        checked={showPOILabels}
                                        onCheckedChange={setShowPOILabels}
                                    />
                                </div>

                                {/* Show Road Labels Toggle */}
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showRoadLabels">Show road labels</Label>
                                    <Switch
                                        id="showRoadLabels"
                                        checked={showRoadLabels}
                                        onCheckedChange={setShowRoadLabels}
                                    />
                                </div>

                                {/* Show Transit Labels Toggle */}
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="showTransitLabels">Show transit labels</Label>
                                    <Switch
                                        id="showTransitLabels"
                                        checked={showTransitLabels}
                                        onCheckedChange={setShowTransitLabels}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Filters Dropdown */}
                <Card className="absolute left-4 top-4 w-64">
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            <div onClick={() => setFiltersOpen(!filtersOpen)} className="cursor-pointer">
                                <h3 className="text-lg font-semibold">Filters</h3>
                            </div>
                            <div
                                ref={filtersRef}
                                className="space-y-4 overflow-hidden transition-all duration-300 ease-in-out"
                                style={{ maxHeight: "0" }}
                            >
                                <div className="space-y-4 mt-2">
                                    {/* Location Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={locationName}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Enter location"
                                        />
                                    </div>

                                    {/* Cuisine Type Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="cuisineType">Cuisine Type</Label>
                                        <Input
                                            id="cuisineType"
                                            value={cuisineType}
                                            onChange={(e) => setCuisineType(e.target.value)}
                                            placeholder="Enter cuisine type"
                                        />
                                    </div>

                                    {/* Restaurant Name Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="restaurantName">Restaurant Name</Label>
                                        <Input
                                            id="restaurantName"
                                            value={restaurantName}
                                            onChange={(e) => setRestaurantName(e.target.value)}
                                            placeholder="Enter restaurant name"
                                        />
                                    </div>

                                    {/* Query Parameter Dropdown */}
                                    <div className="space-y-2">
                                        <Label htmlFor="queryType">Query Type</Label>
                                        <Select value={query} onValueChange={setQuery}>
                                            <SelectTrigger id="queryType">
                                                <SelectValue placeholder="Select query type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="restaurant_name">Restaurant Name</SelectItem>
                                                <SelectItem value="cuisine_type">Cuisine Type</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Radius Slider */}
                                    <div className="space-y-2">
                                        <Label htmlFor="radius">Radius (meters): {radius}</Label>
                                        <Slider
                                            id="radius"
                                            min={100}
                                            max={5000}
                                            step={100}
                                            value={[radius]}
                                            onValueChange={(value) => setRadius(value[0])}
                                        />
                                    </div>

                                    {/* Rating Slider */}
                                    <div className="space-y-2">
                                        <Label htmlFor="rating">Minimum Rating: {rating}</Label>
                                        <Slider
                                            id="rating"
                                            min={1}
                                            max={5}
                                            step={0.1}
                                            value={[rating]}
                                            onValueChange={(value) => setRating(value[0])}
                                        />
                                    </div>

                                    {/* Search Button */}
                                    <HoverBorderGradient
                                        containerClassName="w-full rounded-md border-transparent transition duration-1000 scale-100 hover:scale-110"
                                        className="w-full py-2 inline-flex border-transparent animate-shimmer items-center justify-center rounded-md bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                        as="button"
                                        onClick={handleSearch}
                                    >
                                        {searchLoading ? "Searching..." : "Search"}
                                    </HoverBorderGradient>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Sheet
                    open={selectedPin !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setErrorMessages([]);
                            setNewReview({ text: "", rating: 0 });
                            setSelectedPin(null);
                        }
                    }}
                >
                    <SheetContent side="right" className="overflow-y-auto w-[36rem] sm:max-w-xl">
                        {selectedPin && (
                            <div className="space-y-6">
                                <SheetHeader className="text-center">
                                    <SheetTitle className="text-2xl font-bold">
                                        {contentData[selectedPin.contentId]?.placeName}
                                    </SheetTitle>
                                    <SheetDescription className="text-lg">
                                        Rating: {contentData[selectedPin.contentId]?.rating} / 5
                                    </SheetDescription>
                                </SheetHeader>

                                {/* Display Contact Info */}
                                <div className="p-6 b-2 border-zinc-500 rounded-lg shadow-lg shadow-zinc-300 dark:shadow-zinc-600 text-black dark:text-white bg-white dark:bg-black">
                                    <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
                                        Contact Information
                                    </h3>
                                    <div className="space-y-2 text-black dark:text-white">
                                        <p>
                                            <span className="font-medium">Phone:</span>{" "}
                                            {contentData[selectedPin.contentId]?.contactInfo.phoneNumber}
                                        </p>
                                        <p>
                                            <span className="font-medium">Address:</span>{" "}
                                            {contentData[selectedPin.contentId]?.contactInfo.address.streetAddress},{" "}
                                            {contentData[selectedPin.contentId]?.contactInfo.address.locality},{" "}
                                            {contentData[selectedPin.contentId]?.contactInfo.address.region},{" "}
                                            {contentData[selectedPin.contentId]?.contactInfo.address.countryName},{" "}
                                            {contentData[selectedPin.contentId]?.contactInfo.address.postalCode}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex flex-row gap-x-8">
                                        <LinkPreview
                                            url={contentData[selectedPin.contentId]?.contactInfo.googleMapsPage}
                                            className="w-fit px-4 py-2 text-black dark:text-white rounded-md"
                                        >
                                            View on Google Maps
                                        </LinkPreview>
                                        {contentData[selectedPin.contentId]?.isFavoritePlace ? (
                                            <HoverBorderGradient
                                                containerClassName="w-fit rounded-md border-transparent transition duration-1000 scale-100 hover:scale-110"
                                                className="w-fit py-2 inline-flex border-transparent animate-shimmer items-center justify-center rounded-md bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                                as="button"
                                                onClick={handleRemoveFromFavorites}
                                            >
                                                Remove from favorites
                                            </HoverBorderGradient>
                                        ) : (
                                            <HoverBorderGradient
                                                containerClassName="w-fit rounded-md border-transparent transition duration-1000 scale-100 hover:scale-110"
                                                className="w-fit py-2 inline-flex border-transparent animate-shimmer items-center justify-center rounded-md bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                                as="button"
                                                onClick={handleSaveAsFavorite}
                                            >
                                                Save as Favorite
                                            </HoverBorderGradient>
                                        )}
                                    </div>
                                </div>

                                {/* Write a Review */}
                                <div className="p-6 b-2 border-zinc-500 rounded-lg shadow-lg shadow-zinc-300 dark:shadow-zinc-600 text-black dark:text-white bg-white dark:bg-black">
                                    <h3 className="text-xl font-semibold mb-4 text-black dark:text-white">
                                        Write a Review
                                    </h3>
                                    <div className="space-y-4">
                                        <ErrorMessages messages={errorMessages} />
                                        <div className="flex items-center space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon
                                                    key={star}
                                                    className={`w-6 h-6 cursor-pointer ${
                                                        star <= newReview.rating
                                                            ? "text-yellow-400"
                                                            : "text-black dark:text-white"
                                                    }`}
                                                    onClick={() =>
                                                        setNewReview({
                                                            ...newReview,
                                                            rating: star,
                                                        })
                                                    }
                                                />
                                            ))}
                                        </div>
                                        <Textarea
                                            placeholder="Write your review here..."
                                            value={newReview.text}
                                            // @ts-ignore
                                            onChange={(e) =>
                                                setNewReview({
                                                    ...newReview,
                                                    text: e.target.value,
                                                })
                                            }
                                            className="w-full p-2 text-white bg-black rounded-md"
                                        />
                                        <HoverBorderGradient
                                            containerClassName="w-full rounded-md border-transparent transition duration-1000 scale-100 hover:scale-110"
                                            className="w-full py-2 inline-flex border-transparent animate-shimmer items-center justify-center rounded-md bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                                            as="button"
                                            onClick={handleSubmitReview}
                                        >
                                            Submit Review
                                        </HoverBorderGradient>
                                    </div>
                                </div>

                                {/* Display custom reviews */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-black dark:text-white">
                                        Reviews from our Users
                                    </h3>
                                    {contentData[selectedPin.contentId]?.customReviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {contentData[selectedPin.contentId]?.customReviews.map((review, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 b-2 border-zinc-500 rounded-lg shadow-lg shadow-zinc-300 dark:shadow-zinc-600 text-black dark:text-white bg-white dark:bg-black"
                                                >
                                                    <p className="font-semibold text-lg text-black dark:text-white">
                                                        {review.authorName}
                                                    </p>
                                                    <p className="text-yellow-400">Rating: {review.rating} / 5</p>
                                                    <p className="mt-2 text-black dark:text-white">{review.text}</p>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                                                        {new Date(review.time * 1000).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-gradient-to-r bg-white dark:bg-black shadow-lg shadow-zinc-300 dark:shadow-zinc-600">
                                            <p className="text-black dark:text-white">
                                                None of our users have left a review for this restaurant.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Display Reviews */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-black dark:text-white">
                                        Reviews from Google
                                    </h3>
                                    {contentData[selectedPin.contentId]?.reviews.length > 0 ? (
                                        <div className="space-y-4">
                                            {contentData[selectedPin.contentId]?.reviews.map((review, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 b-2 border-zinc-500 rounded-lg shadow-lg shadow-zinc-300 dark:shadow-zinc-600 text-black dark:text-white bg-white dark:bg-black"
                                                >
                                                    <p className="font-semibold text-lg text-black dark:text-white">
                                                        {review.authorName}
                                                    </p>
                                                    <p className="text-yellow-400">Rating: {review.rating} / 5</p>
                                                    <p className="mt-2 text-black dark:text-white">{review.text}</p>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                                                        {new Date(review.time * 1000).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg shadow-zinc-300 dark:shadow-zinc-600">
                                            <p className="text-black dark:text-white">
                                                No reviews are available from Google.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <SheetClose className="mt-6 w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                                    Close
                                </SheetClose>
                            </div>
                        )}
                    </SheetContent>
                </Sheet>
            </div>
        </ToasterLayout>
    );
}

interface ErrorMessagesProps {
    messages: string[];
}

const ErrorMessages: React.FC<ErrorMessagesProps> = ({ messages }) => {
    const [height, setHeight] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const newHeight = messages.length > 0 ? ref.current.scrollHeight : 0;
            setHeight(newHeight);
        }
    }, [messages]);

    return messages.length > 0 ? (
        <div className="transition-all duration-300 ease-in-out" style={{ height: height }}>
            <div ref={ref} className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 my-4">
                {messages.map((message, index) => (
                    <p key={index} className="text-red-600 dark:text-red-400 mb-2 last:mb-0">
                        {message}
                    </p>
                ))}
            </div>
        </div>
    ) : null;
};

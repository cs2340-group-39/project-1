// GoogleMapSearch.tsx

import { Loader } from "@googlemaps/js-api-loader";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collabsible";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";

interface GoogleMapsSearchData {
    apiKey: string;
}

export default function GoogleMapSearch({ apiKey }: GoogleMapsSearchData) {
    const mapRef = useRef<HTMLDivElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);
    const cuisineInputRef = useRef<HTMLInputElement>(null);

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [service, setService] = useState<google.maps.places.PlacesService | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
    const [currentRating, setCurrentRating] = useState<number>(1.0);
    const [currentRadius, setCurrentRadius] = useState<number>(1);
    const [currentUnit, setCurrentUnit] = useState<"kilometers" | "miles">("kilometers");
    const [locationInput, setLocationInput] = useState<string>("");
    const [cuisineInput, setCuisineInput] = useState<string>("");
    // @ts-ignore
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
    const [infoPanelContent, setInfoPanelContent] = useState<string>("");
    const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);
    const [place, setPlace] = useState<google.maps.places.PlaceResult | null>(null);

    useEffect(() => {
        const loader = new Loader({
            apiKey: apiKey, // Replace with your API key
            libraries: ["places"],
        });

        loader.load().then(() => {
            if (mapRef.current) {
                const google = window.google;
                const mapOptions = {
                    zoom: 8,
                    center: { lat: 0, lng: 0 },
                };

                const mapInstance = new google.maps.Map(mapRef.current, mapOptions);
                setMap(mapInstance);

                const serviceInstance = new google.maps.places.PlacesService(mapInstance);
                setService(serviceInstance);

                if (locationInputRef.current) {
                    const autocompleteInstance = new google.maps.places.Autocomplete(locationInputRef.current);
                    setAutocomplete(autocompleteInstance);

                    autocompleteInstance.bindTo("bounds", mapInstance);

                    autocompleteInstance.addListener("place_changed", () => {
                        const selectedPlace = autocompleteInstance.getPlace();
                        setPlace(selectedPlace);
                        handlePlaceChanged(selectedPlace);
                    });
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const currentLocation = new google.maps.LatLng(
                                position.coords.latitude,
                                position.coords.longitude
                            );
                            setUserLocation(currentLocation);
                            mapInstance.setCenter(currentLocation);
                        },
                        () => {
                            // Handle location error
                        }
                    );
                } else {
                    // Browser doesn't support Geolocation
                }
            }
        });
    }, []);

    const handlePlaceChanged = (selectedPlace: google.maps.places.PlaceResult) => {
        if (map && selectedPlace.geometry) {
            // Clear existing markers
            markers.forEach((marker) => marker.setMap(null));
            setMarkers([]);

            if (selectedPlace.geometry.viewport) {
                map.fitBounds(selectedPlace.geometry.viewport);
            } else {
                map.setCenter(selectedPlace.geometry.location!);
                map.setZoom(15);
            }

            const currLocMarker = new google.maps.Marker({
                map: map,
                position: selectedPlace.geometry.location,
                title: selectedPlace.name,
            });

            currLocMarker.addListener("click", () => {
                const infoWindowInstance = new google.maps.InfoWindow({
                    content: selectedPlace.name,
                });
                infoWindowInstance.open(map, currLocMarker);
            });

            setMarkers((prevMarkers) => [...prevMarkers, currLocMarker]);

            // Perform the nearby search
            const radiusInMeters = currentRadius * 1000 * (currentUnit === "miles" ? 1.60934 : 1);
            const request: google.maps.places.PlaceSearchRequest = {
                location: selectedPlace.geometry.location,
                radius: radiusInMeters,
                type: "restaurant",
                keyword: cuisineInput,
            };
            performNearbySearch(request);
        } else {
            alert(`No details available for input: '${selectedPlace.name}'`);
        }
    };

    const handleCuisineInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const handleSearch = () => {
        if ((place && place.geometry) || userLocation) {
            const radiusInMeters = currentRadius * 1000 * (currentUnit === "miles" ? 1.60934 : 1);
            const request: google.maps.places.PlaceSearchRequest = {
                location: place?.geometry?.location || userLocation!,
                radius: radiusInMeters,
                type: "restaurant",
                keyword: cuisineInput,
            };
            performNearbySearch(request);
        } else {
            alert("Please select a location first.");
        }
    };

    const performNearbySearch = (request: google.maps.places.PlaceSearchRequest) => {
        if (service) {
            // Clear existing markers
            markers.forEach((marker) => marker.setMap(null));
            setMarkers([]);

            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    const newMarkers: google.maps.Marker[] = [];

                    results.forEach((result) => {
                        if (result.place_id) {
                            service.getDetails({ placeId: result.place_id }, (details, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK && details) {
                                    if ((details.rating || 0) >= currentRating) {
                                        const marker = new google.maps.Marker({
                                            map: map!,
                                            position: details.geometry?.location,
                                            title: details.name,
                                            icon: {
                                                url: new URL("icons/restaurant.png", import.meta.url).href, // Adjust the icon path
                                                scaledSize: new google.maps.Size(40, 40),
                                            },
                                        });
                                        marker.addListener("click", () => {
                                            const contentString = createContentString(details);
                                            const infoWindowInstance = new google.maps.InfoWindow({
                                                content: contentString,
                                            });
                                            infoWindowInstance.open(map!, marker);
                                            // Handle info panel
                                            setInfoPanelContent(contentString);
                                            setShowInfoPanel(true);

                                            if (infoWindow) {
                                                infoWindow.close();
                                            }
                                            setInfoWindow(infoWindowInstance);
                                        });
                                        newMarkers.push(marker);
                                        setMarkers((prevMarkers) => [...prevMarkers, marker]);
                                    }
                                }
                            });
                        }
                    });
                } else {
                    console.error("Places search failed due to: " + status);
                }
            });
        }
    };

    const createContentString = (details: google.maps.places.PlaceResult): string => {
        let contentString = `<div><strong>${details.name}</strong><br>`;
        if (details.rating) {
            const ratingStr = createStarRating(details.rating);
            contentString += `Rating: ${ratingStr} <br>`;
        }
        if (details.formatted_address) {
            contentString += `Address: ${details.formatted_address} <br>`;
        }
        if (details.formatted_phone_number) {
            contentString += `Phone: ${details.formatted_phone_number} <br>`;
        }
        if (details.photos && details.photos.length > 0) {
            contentString += `<img src="${details.photos[0].getUrl({
                maxWidth: 300,
                maxHeight: 300,
            })}" alt="${details.name}" style="width:100%; height:auto;"><br>`;
        }
        contentString += `</div>`;
        return contentString;
    };

    const createStarRating = (rating: number): string => {
        const roundedRating = Math.round(rating);
        const maxStars = 5;
        let starHTML = "";
        for (let i = 1; i <= maxStars; i++) {
            if (i <= roundedRating) {
                starHTML += "★"; // Full star
            } else {
                starHTML += "☆"; // Empty star
            }
        }
        return starHTML;
    };

    const toggleUnit = () => {
        setCurrentUnit((prevUnit) => (prevUnit === "kilometers" ? "miles" : "kilometers"));
    };

    const closeInfoPanel = () => {
        setShowInfoPanel(false);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Google Maps Search</h1>

            <div className="mb-4">
                <label htmlFor="location-search-box" className="block mb-1">
                    Location:
                </label>
                <Input
                    id="location-search-box"
                    ref={locationInputRef}
                    placeholder="Search for places..."
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label htmlFor="cuisine-search-box" className="block mb-1">
                    Cuisine:
                </label>
                <Input
                    id="cuisine-search-box"
                    ref={cuisineInputRef}
                    placeholder="Search for cuisine type..."
                    value={cuisineInput}
                    onChange={(e) => setCuisineInput(e.target.value)}
                    onKeyDown={handleCuisineInputKeyDown}
                />
            </div>

            {/* Filters */}
            <div className="mb-4">
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button variant="outline">Filter Options</Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="mt-4">
                            <label htmlFor="rating" className="block mb-1">
                                Minimum Rating: {currentRating}
                            </label>
                            <Slider
                                min={1}
                                max={5}
                                step={0.1}
                                value={[currentRating]}
                                onValueChange={(value) => setCurrentRating(value[0])}
                            ></Slider>

                            <div className="mt-4">
                                <label htmlFor="radiusValue" className="block mb-1">
                                    Radius:
                                </label>
                                <Input
                                    id="radiusValue"
                                    value={currentRadius}
                                    onChange={(e) => setCurrentRadius(Number(e.target.value))}
                                    type="number"
                                    min={0}
                                    max={10}
                                    step={0.1}
                                />
                                <Button variant="outline" className="ml-2" onClick={toggleUnit}>
                                    {currentUnit}
                                </Button>
                            </div>

                            <Button className="mt-4" onClick={handleSearch}>
                                Search
                            </Button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>

            {/* Map */}
            <div id="map" ref={mapRef} style={{ height: "500px", width: "100%" }}></div>

            {/* Info Panel */}
            {showInfoPanel && (
                <div className="info-panel fixed top-0 right-0 w-80 h-full bg-white border-l border-gray-300 p-4 overflow-y-auto shadow-lg z-50">
                    <Button variant="ghost" className="absolute top-2 right-2" onClick={closeInfoPanel}>
                        &times;
                    </Button>
                    <div dangerouslySetInnerHTML={{ __html: infoPanelContent }}></div>
                </div>
            )}
        </div>
    );
}

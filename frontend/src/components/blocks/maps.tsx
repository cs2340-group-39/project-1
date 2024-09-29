import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import mapboxgl from "mapbox-gl";
import { MutableRefObject, RefObject, useEffect, useRef, useState } from "react";
import createTextLayer from "../three/create-text-layer";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";

import "mapbox-gl/dist/mapbox-gl.css";

interface Pin {
    lat: number;
    lng: number;
    label: string;
}

const mockPinData: Pin[] = [
    { lat: 40.76, lng: -73.983, label: "New York" },
    { lat: 34.052, lng: -118.244, label: "Los Angeles" },
    { lat: 51.507, lng: -0.128, label: "London" },
    { lat: 35.682, lng: 139.759, label: "Tokyo" },
];

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

    const [lightPreset, setLightPreset] = useState("day");
    const [showPlaceLabels, setShowPlaceLabels] = useState(true);
    const [showPOILabels, setShowPOILabels] = useState(true);
    const [showRoadLabels, setShowRoadLabels] = useState(true);
    const [showTransitLabels, setShowTransitLabels] = useState(true);
    const [styleLoaded, setStyleLoaded] = useState(false);
    // @ts-ignore
    const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
    const [zoom, setZoom] = useState(15.1);

    useEffect(() => {
        mapboxgl.accessToken = mapBoxAccessToken;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current!,
            center: [mockPinData[0].lng, mockPinData[0].lat],
            zoom: zoom,
            pitch: 45,
            bearing: 0,
            antialias: true,
        });

        mapRef.current.on("style.load", () => {
            setStyleLoaded(true);

            let i = 0;
            mockPinData.forEach((pin) => {
                mapRef.current.addLayer(createTextLayer(`text-layer-${i}`, pin.label, 300, [pin.lng, pin.lat], 150));
                i++;
            });
        });

        mapRef.current.on("zoom", () => {
            setZoom(mapRef.current.getZoom());
        });

        mapRef.current.once("load", () => {
            deckOverlayRef.current = new MapboxOverlay({
                interleaved: false,
                layers: [
                    new ScenegraphLayer<Pin>({
                        id: "ScenegraphLayer",
                        data: mockPinData,
                        getPosition: (d: Pin) => [d.lng, d.lat, 0],
                        getOrientation: (_: Pin) => [180, 0, 0],
                        scenegraph: "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf",
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
                ],
            });

            mapRef.current.addControl(deckOverlayRef.current);
        });

        return () => mapRef.current.remove();
    }, []);

    useEffect(() => {
        if (deckOverlayRef.current) {
            // Adjust size scale to keep pins visible and not too small or too large
            const sizeScale = Math.pow(2, 20 - zoom);

            deckOverlayRef.current.setProps({
                interleaved: false,
                layers: [
                    new ScenegraphLayer<Pin>({
                        id: "ScenegraphLayer",
                        data: mockPinData,
                        getPosition: (d: Pin) => [d.lng, d.lat, sizeScale], // Apply adjusted heightScale here
                        getOrientation: (_: Pin) => [180, 0, 0],
                        scenegraph: "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf",
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
        <div className="relative h-screen w-screen overflow-hidden">
            {/* @ts-ignore */}
            <div ref={mapContainerRef} className="h-full w-full" />
            <Card className="absolute left-4 top-4 w-64">
                <CardContent className="p-4">
                    <div className="space-y-4">
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
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showPlaceLabels">Show place labels</Label>
                            <Switch
                                id="showPlaceLabels"
                                checked={showPlaceLabels}
                                onCheckedChange={setShowPlaceLabels}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showPOILabels">Show POI labels</Label>
                            <Switch id="showPOILabels" checked={showPOILabels} onCheckedChange={setShowPOILabels} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showRoadLabels">Show road labels</Label>
                            <Switch id="showRoadLabels" checked={showRoadLabels} onCheckedChange={setShowRoadLabels} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="showTransitLabels">Show transit labels</Label>
                            <Switch
                                id="showTransitLabels"
                                checked={showTransitLabels}
                                onCheckedChange={setShowTransitLabels}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

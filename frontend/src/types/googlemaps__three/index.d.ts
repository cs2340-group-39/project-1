// googlemaps-three.d.ts

declare module "@googlemaps/three" {
    import * as THREE from "three";

    export interface ThreeJSOverlayViewOptions {
        map: google.maps.Map;
        scene: THREE.Scene;
        anchor: google.maps.LatLngAltitudeLiteral;
        THREE: typeof THREE;
    }

    export class ThreeJSOverlayView extends google.maps.MVCObject {
        constructor(options: ThreeJSOverlayViewOptions);

        // Properties
        coordinateTransformer: {
            fromLatLngAltitude: (latLngAlt: google.maps.LatLngAltitudeLiteral) => THREE.Vector3;
            // Add other methods if necessary
        };

        // Methods from google.maps.OverlayView
        onAdd?: () => void;
        draw?: () => void;
        onRemove?: () => void;
        setMap(map: google.maps.Map | null): void;
        getMap(): google.maps.Map | null;

        // Additional properties if any
        // Allow assigning to onAdd
        [key: string]: any;
    }
}

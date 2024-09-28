import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { Easing, Group, Tween } from "@tweenjs/tween.js";
import { useCallback, useEffect, useRef, useState } from "react";

// @ts-ignore
import { ThreeJSOverlayView } from "@googlemaps/three";
import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface MapsLegacyData {
    apiKey: string;
}

// @ts-ignore
interface RequiredCameraOptions extends google.maps.CameraOptions {
    center: google.maps.LatLngLiteral;
    heading: number;
    tilt: number;
    zoom: number;
}

interface PinLocation {
    lat: number;
    lng: number;
}

const mapContainerStyle = {
    width: "100vw",
    height: "100vh",
};

const pinLocations: PinLocation[] = [
    { lat: 40.76, lng: -73.983 },
    { lat: 34.052, lng: -118.244 },
    { lat: 51.507, lng: -0.128 },
    { lat: 35.682, lng: 139.759 },
];

const pinLabels = ["New York", "Los Angeles", "London", "Tokyo"];

export default function MapsLegacy({ apiKey }: MapsLegacyData) {
    const mapRef = useRef<google.maps.Map | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedPin, setSelectedPin] = useState(0); // Updated to index
    const [cameraOptions, setCameraOptions] = useState({
        tilt: 0,
        heading: 0,
        zoom: 3,
        center: pinLocations[0],
    });
    const overlayViewsRef = useRef<ThreeJSOverlayView[]>([]);
    const modelRefs = useRef<(THREE.Group | null)[]>([]);

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: apiKey,
    });

    const textMeshesRef = useRef<THREE.Mesh[]>([]);

    const updateModelScale = useCallback((zoom: number) => {
        modelRefs.current.forEach((model, index) => {
            if (model) {
                const scaleFactor = 500000 / Math.pow(2, zoom);
                if (scaleFactor > 10) {
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    // Scale the text mesh
                    const textMesh = textMeshesRef.current[index];
                    if (textMesh) {
                        const textScaleFactor = scaleFactor * 0.05; // Adjust this multiplier to fine-tune text size
                        textMesh.scale.set(textScaleFactor, textScaleFactor, textScaleFactor);
                        textMesh.position.y = scaleFactor * 8.5; // Adjust height based on pin size
                    }
                }
            }
        });
    }, []);

    const createGlassyMaterial = () => {
        const vertexShader = `
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
            `;

        const fragmentShader = `
            uniform vec3 color;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);

                float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 5.0);

                vec3 halfDir = normalize(viewDir + vec3(0.0, 1.0, 0.0));
                float specAngle = max(dot(normal, halfDir), 0.0);
                float glossiness = pow(specAngle, 64.0);

                vec3 baseColor = color * 0.8;
                vec3 reflectedColor = mix(baseColor, vec3(1.0), fresnel * 0.8 + glossiness * 0.4);

                float opacity = 0.6 + fresnel * 0.4;

                gl_FragColor = vec4(reflectedColor, opacity);
            }
            `;

        return new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0x3a7ca5) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
        });
    };

    const createPin = useCallback(
        (location: PinLocation, index: number) => {
            const scene = new THREE.Scene();

            // Add Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 10, 50);
            scene.add(directionalLight);

            const pointLight = new THREE.PointLight(0xffffff, 0.5);
            pointLight.position.set(0, 200, 0);
            scene.add(pointLight);

            const loader = new GLTFLoader();
            const modelUrl = "https://raw.githubusercontent.com/googlemaps/js-samples/main/assets/pin.gltf";

            loader.load(modelUrl, (gltf) => {
                gltf.scene.scale.set(10, 10, 10);
                gltf.scene.rotation.x = 0;
                gltf.scene.rotation.y = Math.PI;
                scene.add(gltf.scene);
                modelRefs.current[index] = gltf.scene;

                // Create 3D text with enhanced glassy effect
                const fontLoader = new FontLoader();
                fontLoader.load("https://threejs.org/examples/fonts/helvetiker_bold.typeface.json", (font) => {
                    const textGeometry = new TextGeometry(pinLabels[index], {
                        font: font,
                        size: 150,
                        height: 15,
                        curveSegments: 20,
                        bevelEnabled: true,
                        bevelThickness: 2,
                        bevelSize: 1.5,
                        bevelOffset: 0,
                        bevelSegments: 5,
                    });

                    const glassyMaterial = createGlassyMaterial();
                    const textMesh = new THREE.Mesh(textGeometry, glassyMaterial);

                    textMesh.position.set(0, 160, 0);
                    textMesh.rotation.x = Math.PI / 4;
                    scene.add(textMesh);

                    // Center the text
                    textGeometry.computeBoundingBox();
                    const textWidth = textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x;
                    textMesh.position.x = -textWidth / 2;

                    // Store the text mesh reference
                    textMeshesRef.current[index] = textMesh;
                });

                // Create ThreeJSOverlayView
                const overlay = new ThreeJSOverlayView({
                    map: mapRef.current!,
                    scene: scene,
                    anchor: { ...location, altitude: 100 },
                    THREE: THREE,
                });

                overlayViewsRef.current.push(overlay);

                // Force an update of the overlay
                if (mapRef.current) {
                    const currentCenter = mapRef.current.getCenter();
                    if (currentCenter) {
                        mapRef.current.setCenter(currentCenter);
                    }
                }

                // Initial scale update
                updateModelScale(mapRef.current!.getZoom()!);
            });
        },
        [updateModelScale]
    );

    const onLoad = useCallback(
        (mapInstance: google.maps.Map) => {
            mapRef.current = mapInstance;
            setMap(mapInstance);

            pinLocations.forEach((location, index) => {
                createPin(location, index);
            });

            // Add zoom change listener
            mapInstance.addListener("zoom_changed", () => {
                updateModelScale(mapInstance.getZoom()!);
            });

            // Add idle listener to ensure overlays are updated
            mapInstance.addListener("idle", () => {
                overlayViewsRef.current.forEach((overlay) => {
                    overlay.requestRedraw();
                });
            });

            // Add custom tilt controls
            const tiltControlDiv = document.createElement("div");
            // @ts-ignore
            const tiltControl = createTiltControl(tiltControlDiv, mapInstance);
            mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(tiltControlDiv);
        },
        [createPin, updateModelScale]
    );

    const onUnmount = useCallback(() => {
        mapRef.current = null;
        setMap(null);
        overlayViewsRef.current.forEach((overlay) => {
            overlay.setMap(null);
        });
        overlayViewsRef.current = [];
    }, []);

    useEffect(() => {
        if (isLoaded && map) {
            const targetLocation = pinLocations[selectedPin];

            // First tween: Zoom out and rotate
            const tweenOut = new Tween(cameraOptions)
                .to({ tilt: 0, heading: 0, zoom: 5, center: cameraOptions.center }, 5000)
                .easing(Easing.Quadratic.InOut)
                .onUpdate(() => {
                    updateModelScale(cameraOptions.zoom);
                    map.moveCamera(cameraOptions);
                    setCameraOptions(cameraOptions);
                });

            // Second tween: Move to the target location
            const tweenMove = new Tween(cameraOptions)
                .to({ tilt: 0, heading: 0, zoom: 5, center: targetLocation }, 5000)
                .easing(Easing.Quadratic.InOut)
                .onUpdate(() => {
                    updateModelScale(cameraOptions.zoom);
                    map.moveCamera(cameraOptions);
                    setCameraOptions(cameraOptions);
                });

            // Third tween: Zoom in to the target location
            const tweenIn = new Tween(cameraOptions)
                .to({ tilt: 65, heading: 360, zoom: 18, center: targetLocation }, 5000)
                .easing(Easing.Quadratic.InOut)
                .onUpdate(() => {
                    updateModelScale(cameraOptions.zoom);
                    map.moveCamera(cameraOptions);
                    setCameraOptions(cameraOptions);
                });

            // Chain the tweens
            tweenOut.chain(tweenMove);
            tweenMove.chain(tweenIn);
            tweenOut.start();

            const group = new Group();
            group.add(tweenOut);
            group.add(tweenMove);
            group.add(tweenIn);

            const animate = () => {
                requestAnimationFrame(animate);
                group.update();
                // Request redraw for all overlays
                overlayViewsRef.current.forEach((overlay) => {
                    overlay.requestRedraw();
                });
            };
            animate();

            // Clean up function
            return () => {
                tweenOut.stop();
                tweenIn.stop();
            };
        }
    }, [isLoaded, map, updateModelScale, selectedPin]);

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div>
            {/* Selection Panel */}
            <div className="pin-selection-panel" style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
                {pinLabels.map((label, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedPin(index)}
                        style={{
                            margin: "5px",
                            padding: "10px",
                            backgroundColor: selectedPin === index ? "#3a7ca5" : "#fff",
                            color: selectedPin === index ? "#fff" : "#000",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Google Map */}
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    mapId: "15431d2b469f209e",
                    disableDefaultUI: false,
                    gestureHandling: "greedy",
                    rotateControl: true,
                    tiltInteractionEnabled: true,
                    keyboardShortcuts: false,
                    tilt: cameraOptions.tilt,
                    heading: cameraOptions.heading,
                    zoom: cameraOptions.zoom,
                    center: cameraOptions.center,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
            />
        </div>
    );
}

function createTiltControl(controlDiv: HTMLDivElement, map: google.maps.Map) {
    // Set CSS for the control border
    const controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.border = "2px solid #fff";
    controlUI.style.borderRadius = "3px";
    controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlUI.style.cursor = "pointer";
    controlUI.style.marginTop = "8px";
    controlUI.style.marginRight = "8px";
    controlUI.style.textAlign = "center";
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior
    const controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = "Tilt +";
    controlUI.appendChild(controlText);

    // Setup the click event listeners
    controlUI.addEventListener("click", () => {
        const currentTilt = map.getTilt() || 0;
        const newTilt = Math.min(currentTilt + 15, 67); // Max tilt is usually 67 degrees
        map.setTilt(newTilt);
    });

    // Add a second button for decreasing tilt
    const decreaseTiltUI = controlUI.cloneNode(true) as HTMLDivElement;
    const decreaseTiltText = decreaseTiltUI.querySelector("div") as HTMLDivElement;
    decreaseTiltText.innerHTML = "Tilt -";
    controlDiv.appendChild(decreaseTiltUI);

    decreaseTiltUI.addEventListener("click", () => {
        const currentTilt = map.getTilt() || 0;
        const newTilt = Math.max(currentTilt - 15, 0);
        map.setTilt(newTilt);
    });
}

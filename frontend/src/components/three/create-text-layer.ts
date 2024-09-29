// @ts-nocheck

import mapboxgl, { CustomLayerInterface } from "mapbox-gl";
import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

export default function createTextLayer(
    layerId: string,
    text: string,
    textSize: number,
    modelOrigin: [number, number],
    modelAltitude: number
) {
    // parameters to ensure the model is georeferenced correctly on the map
    const modelRotate = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);

    // transformation parameters to position, rotate and scale the 3D model onto the map
    const modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        /* Since the 3D model is in real world meters, a scale transform needs to be
         * applied since the CustomLayerInterface expects units in MercatorCoordinates.
         */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
    };

    // configuration of the custom layer for a 3D model per the CustomLayerInterface
    const customLayer: CustomLayerInterface = {
        id: layerId,
        type: "custom",
        renderingMode: "3d",
        onAdd: function (map, gl) {
            customLayer.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            // Add lights to the scene
            const directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);

            const directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);

            // Load the font and create 3D text
            const loader = new FontLoader();
            loader.load("https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", (font) => {
                const textGeometry = new TextGeometry(text, {
                    font: font,
                    size: textSize,
                    height: 15,
                    curveSegments: 20,
                    bevelEnabled: true,
                    bevelThickness: 2,
                    bevelSize: 1.5,
                    bevelOffset: 0,
                    bevelSegments: 5,
                });

                // Center the text
                textGeometry.computeBoundingBox();
                const centerOffset = -0.5 * (textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x);

                const textMaterial = new THREE.MeshPhongMaterial({
                    color: 0x2194ce, // Base color of the material
                    specular: 0x111111, // Color of the specular highlights
                    shininess: 100, // How shiny the material appears (higher is shinier)
                    emissive: 0x000000, // Color the material appears to emit
                    emissiveIntensity: 0.5, // Intensity of the emissive color
                    transparent: true, // Allows the material to be transparent
                    opacity: 0.9, // Overall opacity of the material
                    side: THREE.DoubleSide, // Render both sides of the material
                });
                const mesh = new THREE.Mesh(textGeometry, textMaterial);

                mesh.position.x = centerOffset;
                mesh.position.y = 0;
                mesh.position.z = 0;

                this.scene.add(mesh);
            });

            this.map = map;

            // Use the Mapbox GL JS map canvas for three.js
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true,
            });

            this.renderer.autoClear = false;
        },
        render: function (gl, matrix) {
            gl;

            const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
            const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
            const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

            const m = new THREE.Matrix4().fromArray(matrix);
            const l = new THREE.Matrix4()
                .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        },
    };

    return customLayer;
}

// mapboxgl.accessToken = "pk.eyJ1IjoiYXJqdW4yMDA1IiwiYSI6ImNtMWw5b2U5djAzMjEyanBybmI1eTBmaWMifQ.oXft7GdhdAgWBYQK1Fikcw";
// const map = new mapboxgl.Map({
//     container: "map",
//     // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
//     style: "mapbox://styles/mapbox/light-v11",
//     zoom: 18,
//     center: [148.9819, -35.3981],
//     pitch: 60,
//     antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
// });

// const modelOrigin = [148.9819, -35.39847];
// const modelAltitude = 350;

// map.on("style.load", () => {
//     map.addLayer(createCustomLayer("Hello", modelOrigin, modelAltitude), "waterway-label");
// });

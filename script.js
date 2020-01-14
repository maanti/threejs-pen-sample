"use strict";

import * as THREE from "./lib/three.module.js";
import {OrbitControls} from "./lib/OrbitControls.js";
import {GLTFLoader} from "./lib/GLTFLoader.js";

let camera;
let scene;
let renderer;
let bulbLight;
let pointLightMat;
let skyLight;
let ballMat;
let cubeMat;
let floorMat;
let torusMat;
window.previousShadowMap = false;
const params = {
    shadows: true,
    exposure: 0.68,
    bulbPower: 400,
    hemiIrradiance: 0.5
};

init();
animate();

function init() {
    setUpCamera();
    createScene();

    setUpPointLight();
    setUpSkyLight();
    setUpSpotLight();
    initMaterials();

    createFloor();
    createBall();
    createCube();
    createTorus();
    createObject();

    createSnow();

    createRenderer();

    initControls();

    window.addEventListener("resize", onWindowResize, false);
}

function setUpCamera() {
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.x = -4;
    camera.position.z = 4;
    camera.position.y = 2;
}

function setUpPointLight() {
    const bulbGeometry = new THREE.SphereBufferGeometry(0.02, 16, 8);
    bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);
    pointLightMat = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    });
    bulbLight.add(new THREE.Mesh(bulbGeometry, pointLightMat));
    bulbLight.position.set(0, 2, 0);
    bulbLight.castShadow = true;
    scene.add(bulbLight);
}

function setUpSpotLight() {
    const spotLight = new THREE.SpotLight(0xffffff, 10, 0, 0.4);
    spotLight.position.set(-2, 4, 0.6);
    spotLight.castShadows = true;
    scene.add(spotLight);
}

function setUpSkyLight() {
    skyLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
    scene.add(skyLight); // A light source positioned directly above the scene

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight); // This light globally illuminates all objects in the scene equally
}

function initMaterials() {
    floorMat = new THREE.MeshStandardMaterial({
        roughness: 0.8,
        color: 0xffffff,
        metalness: 0.2,
        bumpScale: 0.0005
    });
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("textures/hardwood2_diffuse.jpg", (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        map.encoding = THREE.sRGBEncoding;
        floorMat.map = map;
        floorMat.needsUpdate = true;
    });
    textureLoader.load("textures/hardwood2_bump.jpg", (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        floorMat.bumpMap = map;
        floorMat.needsUpdate = true;
    });
    textureLoader.load("textures/hardwood2_roughness.jpg", (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        floorMat.roughnessMap = map;
        floorMat.needsUpdate = true;
    });
    cubeMat = new THREE.MeshStandardMaterial({
        roughness: 0.7,
        color: 0xffffff,
        bumpScale: 0.002,
        metalness: 0.2
    });
    textureLoader.load("textures/brick_diffuse.jpg", (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(1, 1);
        map.encoding = THREE.sRGBEncoding;
        cubeMat.map = map;
        cubeMat.needsUpdate = true;
    });
    textureLoader.load("textures/brick_bump.jpg", (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(1, 1);
        cubeMat.bumpMap = map;
        cubeMat.needsUpdate = true;
    });
    ballMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 1.0
    });
    textureLoader.load("textures/earth_atmos_2048.jpg", (map) => {
        map.anisotropy = 4;
        map.encoding = THREE.sRGBEncoding;
        ballMat.map = map;
        ballMat.needsUpdate = true;
    });
    textureLoader.load("textures/earth_specular_2048.jpg", (map) => {
        map.anisotropy = 4;
        map.encoding = THREE.sRGBEncoding;
        ballMat.metalnessMap = map;
        ballMat.needsUpdate = true;
    });
    torusMat = new THREE.MeshStandardMaterial({
        roughness: 0.7,
        color: 0xffffff,
        bumpScale: 0.002,
        metalness: 0.2
    });
    textureLoader.load("textures/organic_diffuse.jpg", (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(1, 1);
        map.encoding = THREE.sRGBEncoding;
        torusMat.map = map;
        torusMat.needsUpdate = true;
    });
    textureLoader.load("textures/organic_bump.png", (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(1, 1);
        torusMat.bumpMap = map;
        torusMat.needsUpdate = true;
    });
}

function createFloor() {
    const floorGeometry = new THREE.PlaneBufferGeometry(10, 10);
    const floorMesh = new THREE.Mesh(floorGeometry, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;
    scene.add(floorMesh);
}

function createBall() {
    const ballGeometry = new THREE.SphereBufferGeometry(0.25, 32, 32);
    const ballMesh = new THREE.Mesh(ballGeometry, ballMat);
    ballMesh.position.set(1, 0.25, 1);
    ballMesh.rotation.y = Math.PI;
    ballMesh.castShadow = true;
    scene.add(ballMesh);
}

function createCube() {
    const boxGeometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);
    const boxMesh = new THREE.Mesh(boxGeometry, cubeMat);
    boxMesh.position.set(-0.5, 0.25, -1);
    boxMesh.castShadow = true;
    scene.add(boxMesh);
}

function createTorus() {
    const torusGeometry = new THREE.TorusGeometry(0.3, 0.1, 10, 100);
    const torusMesh = new THREE.Mesh(torusGeometry, torusMat);
    torusMesh.position.set(1, 1, -1);
    torusMesh.castShadow = true;
    scene.add(torusMesh);
}

function createObject() {
    const loader = new GLTFLoader();

    loader.load("objects/scene.gltf", (gltf) => {
        gltf.scene.position.z = 0;
        gltf.scene.position.x = 1;
        gltf.scene.position.y = -0.5;
        gltf.scene.scale.x = 0.05;
        gltf.scene.scale.y = 0.05;
        gltf.scene.scale.z = 0.05;
        scene.add(gltf.scene);

    });
}

function createRenderer() {
    const container = document.getElementById("container");
    renderer = new THREE.WebGLRenderer();
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
}

function createScene() {
    scene = new THREE.Scene();
}

function createSnow() {
    const flakeCount = 12000;
    const flakeGeometry = new THREE.ConeGeometry(0.012, 0.001, 7);
    const flakeMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
    const snow = new THREE.Group();

    for (let i = 0; i < flakeCount; i++) {
        const flakeMesh = new THREE.Mesh(flakeGeometry, flakeMaterial);
        flakeMesh.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 40
        );
        snow.add(flakeMesh);
    }

    scene.add(snow);
    window.snow = snow;

    window.flakeArray = snow.children;
}

function initControls() {
    window.controls = new OrbitControls(camera, renderer.domElement);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.toneMappingExposure = Math.pow(params.exposure, 5.0);
    renderer.shadowMap.enabled = params.shadows;
    bulbLight.castShadow = params.shadows;
    if (params.shadows !== window.previousShadowMap) {
        ballMat.needsUpdate = true;
        cubeMat.needsUpdate = true;
        floorMat.needsUpdate = true;
        window.previousShadowMap = params.shadows;
    }
    bulbLight.power = params.bulbPower;
    pointLightMat.emissiveIntensity = bulbLight.intensity / Math.pow(0.02, 2.0);
    skyLight.intensity = params.hemiIrradiance;
    const time = Date.now() * 0.0005;
    bulbLight.position.y = Math.cos(time) * 0.75 + 1.25;
    const flakeArray = window.flakeArray;
    for (let i = 0; i < flakeArray.length / 2; i++) {
        flakeArray[i].rotation.y += 0.01;
        flakeArray[i].rotation.x += 0.02;
        flakeArray[i].rotation.z += 0.03;
        flakeArray[i].position.y -= 0.018;
        if (flakeArray[i].position.y < -4) {
            flakeArray[i].position.y += 10;
        }
    }
    for (let i = flakeArray.length / 2; i < flakeArray.length; i++) {
        flakeArray[i].rotation.y -= 0.03;
        flakeArray[i].rotation.x -= 0.03;
        flakeArray[i].rotation.z -= 0.02;
        flakeArray[i].position.y -= 0.016;
        if (flakeArray[i].position.y < -4) {
            flakeArray[i].position.y += 9.5;
        }

        window.snow.rotation.y -= 0.0000002;
    }

    renderer.render(scene, camera);
}

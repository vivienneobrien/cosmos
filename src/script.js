import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */

// Debug
const gui = new GUI(); // { width: 200 }

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Cosmos/ Galaxy
 */

const parameters = {};
parameters.count = 100000;
parameters.size = 0.01;
parameters.radius = 5;
parameters.branches = 3;
parameters.spin = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = "#ff6030";
parameters.outsideColor = "#1b3984";

let galaxyBufferGeometry = null;
let galaxyPointMaterial = null;
let points = null;

const generateGalaxy = () => {
  // Destroy old galaxy
  if (galaxyPointMaterial !== null) {
    galaxyBufferGeometry.dispose(); // remember this
    galaxyPointMaterial.dispose(); // you can not dispose of mesh that is why here
    scene.remove(points);
  }
  // RULE: If you have an experience where something is being created and removed, make sure you remove/clear everything or else memory leaks/ performance issues
  galaxyBufferGeometry = new THREE.BufferGeometry(); // always use if we know how to make them
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3); // because RGB
  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius; // we will get something between 0 and 5

    const spinAngel = radius * parameters.spin; // spiral shape

    const branchAngel =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    if (i < 20) {
      console.log(i, branchAngel);
    }

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3] = Math.cos(branchAngel + spinAngel) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngel + spinAngel) * radius + randomZ;

    // Color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);
    colors[i3] = mixedColor.r; // R
    colors[i3 + 1] = mixedColor.g; // G
    colors[i3 + 2] = mixedColor.b; // B
  }
  galaxyBufferGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  galaxyBufferGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3)
  );
  /**
   * Material
   */
  galaxyPointMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAtteniuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
  /**
   * Points
   */
  points = new THREE.Points(galaxyBufferGeometry, galaxyPointMaterial); // like a mesh
  scene.add(points);
};
generateGalaxy();

gui
  .add(parameters, "count")
  .min(0)
  .max(100000)
  .step(100)
  .name("Number of particles")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .name("Size of particles")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .name("Radius of galaxy")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .name("Branches of galaxy")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("Spin of galaxy")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .name("Randomness of galaxy")
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.002)
  .name("RandomnessPower of galaxy")
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

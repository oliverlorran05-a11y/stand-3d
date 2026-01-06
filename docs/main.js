import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.162.0/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three@0.162.0/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.162.0/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://unpkg.com/three@0.162.0/examples/jsm/loaders/RGBELoader.js';

// ================= CANVAS & OVERLAY =================
const canvas = document.getElementById('webgl');
const loadingOverlay = document.getElementById('loading-overlay');

// ================= SCENE =================
const scene = new THREE.Scene();

// ================= CAMERA =================
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// ================= RENDERER =================
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ================= CONTROLS =================
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI/2.2;
controls.minPolarAngle = Math.PI/6;

// ================= LIGHT =================
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// ================= HDRI =================
new RGBELoader().load('assets/hdri/studio.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// ================= GLB LOADER =================
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load('assets/models/stand.glb', (gltf)=>{
  const model = gltf.scene;
  scene.add(model);

  // centralizar câmera
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  controls.target.copy(center);
  camera.lookAt(center);

  // Vídeo emissivo na TV
  const video = document.createElement('video');
  video.src = 'assets/videos/video.mp4';
  video.loop = true;
  video.muted = true;
  video.play();

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.encoding = THREE.sRGBEncoding;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  model.traverse((child)=>{
    if(child.isMesh && child.name.toLowerCase().includes('tv')){
      child.material.emissiveMap = videoTexture;
      child.material.emissiveIntensity = 1;
      child.material.needsUpdate = true;
    }
  });

  // remover overlay
  loadingOverlay.style.display = 'none';
},
xhr => console.log(`Carregando GLB: ${(xhr.loaded/xhr.total*100).toFixed(2)}%`),
err => console.error(err)
);

// ================= UI =================
let autoRotate = false;

document.getElementById('btn-fullscreen').addEventListener('click', ()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});

document.getElementById('btn-autorotate').addEventListener('click', ()=> autoRotate = !autoRotate);

document.getElementById('btn-light').addEventListener('click', ()=>{
  ambientLight.visible = !ambientLight.visible;
});

// ================= TOP VIEW =================
document.getElementById('btn-topview').addEventListener('click', ()=>{
  camera.position.set(0, 10, 0);
  controls.target.set(0,0,0);
  controls.update();
});

// ================= ZOOM =================
document.getElementById('btn-zoom').addEventListener('click', ()=>{
  camera.position.multiplyScalar(1.2);
  controls.update();
});

// ================= ANIMATE =================
function animate(){
  requestAnimationFrame(animate);
  if(autoRotate) controls.update();
  renderer.render(scene, camera);
}
animate();

// ================= RESIZE =================
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

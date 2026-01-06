import * as THREE from 'three';
// Importando carregadores para seus modelos e HDR
		import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const scene = new THREE.Scene();

// Exemplo de como carregar o seu HDRI (studio.hdr)
new RGBELoader()
    .setPath('assets/hdri/')
    .load('studio.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    });

// Exemplo de como carregar o seu modelo (stand.glb)
const loader = new GLTFLoader();
loader.load('assets/models/stand.glb', function (gltf) {
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

// ... restante do seu código (camera, renderer, animate)
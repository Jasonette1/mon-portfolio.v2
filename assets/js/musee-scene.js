/**
 * TEMPLE GREC 3D - SCENE WITH ANIMATED GRASS v2
 * Terrain simplifié pour debugging
 */

import * as THREE from 'three';
import { TextureManager } from './components/texture-manager.js';
import { createLainDesk } from './components/lain-desk.js';
import { Ordinateur2001 } from './components/ecran-2001.js';

// Load shaders
let grassVertexShader, grassFragmentShader;
let skyVertexShader, skyFragmentShader;
let firefliesVertexShader, firefliesFragmentShader;
let beamVertexShader, beamFragmentShader;

// Wait for DOM
window.addEventListener('DOMContentLoaded', async () => {
    // Load shaders
    const loadShader = (path) => fetch(path).then(r => r.text());

    [grassVertexShader, grassFragmentShader, skyVertexShader, skyFragmentShader, firefliesVertexShader, firefliesFragmentShader, beamVertexShader, beamFragmentShader] = await Promise.all([
        loadShader('assets/shaders/grass.vert'),
        loadShader('assets/shaders/grass.frag'),
        loadShader('assets/shaders/sky.vert'),
        loadShader('assets/shaders/sky.frag'),
        loadShader('assets/shaders/fireflies.vert'),
        loadShader('assets/shaders/fireflies.frag'),
        loadShader('assets/shaders/beam.vert'),
        loadShader('assets/shaders/beam.frag')
    ]);

    initTempleScene();
});

function initTempleScene() {
    console.log('🚀 Initialisation scène temple...');

    // ===== SCENE SETUP =====
    const scene = new THREE.Scene();
    // Twilight fog color (matches horizon)
    const fogColor = new THREE.Color(0xdcae96);
    scene.background = fogColor;
    scene.fog = new THREE.Fog(fogColor, 20, 100);

    // ===== SKY DOME =====
    const skyGeo = new THREE.SphereGeometry(400, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x354b75) }, // Deep twilight blue
            bottomColor: { value: new THREE.Color(0xdcae96) }, // Soft orange/pink horizon
            offset: { value: 33 },
            exponent: { value: 0.6 }
        },
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // ===== FIREFLIES =====
    console.log('✨ Ajout des lucioles...');
    const fireflies = createFireflies();
    scene.add(fireflies);

    // ===== GOD RAYS =====
    console.log('✨ Ajout des rayons divins...');
    const godRays = createGodRays();
    scene.add(godRays);

    // ===== CAMERA =====
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // Position de départ : très bas, au niveau de l'herbe
    camera.position.set(0, 0.2, -40);
    camera.lookAt(0, 0, 0);

    // ===== RENDERER =====
    const canvas = document.getElementById('webgl-canvas');

    // Attempt to create renderer with fallback options
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true, // Re-enabled for better quality
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false
        });
    } catch (e) {
        console.error("WebGL Context Creation Failed", e);
        alert("Impossible de démarrer la 3D. Votre navigateur ou carte graphique semble avoir un problème (WebGL).");
        return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Dynamic shadows enabled for maximum correctness
    renderer.shadowMap.autoUpdate = true;

    // ===== LIGHTING =====
    // Hemisphere Light (Sky vs Ground ambient) - Better for outdoor
    const hemiLight = new THREE.HemisphereLight(0x354b75, 0xdcae96, 0.7); // Sky color, Ground color, Intensity
    scene.add(hemiLight);

    // Sunset Sun (Warmer) -> BEHIND the building (Backlighting / Contre-jour)
    // Kept behind to create the rim effect user asked for, but we need to fight the shadow it creates.
    const sun = new THREE.DirectionalLight(0xffaa70, 2.0); // Boosted intensity for stronger rim
    sun.position.set(0, 20, 60); // Higher and behind
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024; // Reduced from 2048 for performance
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    // Front Fill Light (Blue-ish to contrast with warm sun)
    // Offset slightly to avoid direct specular reflection on the path
    const fillLight = new THREE.DirectionalLight(0x607090, 1.5);
    fillLight.position.set(15, 15, -40);
    scene.add(fillLight);

    // ===== TERRAIN PLAT =====
    console.log('🔥 TERRAIN PLAT - OPUS');
    const terrainGeo = new THREE.PlaneGeometry(200, 200);

    // Texture Loading
    const textureManager = new TextureManager();
    const terrainMaps = textureManager.loadPBR('assets/textures/floor/Grass001_2K-JPG', { repeat: 16 });

    // Fallback color if textures load slowly
    const terrainMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        ...terrainMaps,
        roughness: 1.0, // Force fully rough to avoid shiny spots
        metalness: 0.0,
        side: THREE.DoubleSide
    });

    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.1;  // Juste sous l'herbe
    terrain.receiveShadow = true; // Fix: Ground was glowing because it didn't receive shadows from the wall
    scene.add(terrain);
    console.log('✅ Terrain plat ajouté!');

    // ===== ANIMATED GRASS =====
    console.log('🌾 Création de l\'herbe...');
    const grass = createAnimatedGrass();
    scene.add(grass);
    console.log('✅ Herbe ajoutée à la scène!');

    // ===== AUTEL =====
    console.log('⛪ Création de l\'autel...');
    const altar = createAltar();
    scene.add(altar);
    console.log('✅ Autel ajouté!');

    // ===== MUR ARRIÈRE =====
    console.log('🏛️ Création du mur arrière...');
    const backWall = createBackWall();
    scene.add(backWall);
    console.log('✅ Mur arrière ajouté!');

    // ===== COLONNES =====
    console.log('🏛️ Création des colonnes...');
    const columns = createColumns();
    scene.add(columns);
    console.log('✅ Colonnes ajoutées!');

    // ===== DÉCOR D'ARRIÈRE-PLAN =====
    console.log('🏔️ Création du décor d\'arrière-plan...');
    const scenery = createBackgroundScenery();
    scene.add(scenery);
    console.log('✅ Décor ajouté!');

    // ===== ORDINATEUR DE L'AUTEL (écran « 2001 ») =====
    scene.updateMatrixWorld(); // positions du bureau à jour : l'ordinateur mesure l'écran et les zones cliquables
    const backButton = document.getElementById('back-button');
    const boutonSon = document.getElementById('bouton-son');
    const dalle = altar.getObjectByName('dalle-acer');
    const ordinateur = new Ordinateur2001({
        dalle,
        menton: altar.getObjectByName('menton-acer'),
        zones: [dalle, altar.getObjectByName('clavier'), altar.getObjectByName('souris')],
        voileCalme: document.getElementById('voile-calme'),
        voileFinal: document.getElementById('voile-final'),
        boutonSon,
        aEffacer: [backButton, boutonSon],
        quandEteint: () => {
            cameraMode = 'screenClose';
            majBoutonSon();
        }
    });
    scene.add(ordinateur.lumiere);
    ordinateur.preparer(renderer, camera, scene);

    // ===== CAMERA ANIMATION =====
    const clock = new THREE.Clock();
    let animationProgress = 0;
    const animationDuration = 8;
    let cameraMode = 'animation'; // 'animation', 'front', 'left', 'right'
    let targetCameraPos = null;
    let cameraTransitionProgress = 0;
    let transitionSpeed = 2.0; // Vitesse par défaut

    const startPos = new THREE.Vector3(0, 0.2, -40);
    const midPos = new THREE.Vector3(0, 0.3, -20);
    const endPos = new THREE.Vector3(0, 5, 10);

    // Positions des différentes vues
    const frontViewPos = new THREE.Vector3(0, 5, 10);
    const leftViewPos = new THREE.Vector3(-15, 5, 25);
    const rightViewPos = new THREE.Vector3(15, 5, 25);
    const altarViewPos = new THREE.Vector3(0, 2.5, 22.5); // Vue face rapprochée

    // Vues d'inspection (Temporaire pour validation setup)
    const altarLeftViewPos = new THREE.Vector3(-2.5, 2.5, 25.5);
    const altarRightViewPos = new THREE.Vector3(2.5, 2.5, 25.5);

    // Vue ultra proche de l'écran (< 1m)
    const screenCloseViewPos = new THREE.Vector3(0, 2.2, 26.2);

    // Cible du regard hors intro : l'autel (Z=27)
    const regardAutel = new THREE.Vector3(0, 2.0, 27);

    function animateCamera(deltaTime) {
        // Animation initiale
        if (cameraMode === 'animation' && animationProgress < 1) {
            animationProgress += deltaTime / animationDuration;
            animationProgress = Math.min(animationProgress, 1);

            const eased = easeInOutCubic(animationProgress);

            if (eased < 0.6) {
                const t = eased / 0.6;
                camera.position.lerpVectors(startPos, midPos, t);
                camera.position.y += Math.sin(clock.getElapsedTime() * 3) * 0.02;
                camera.rotation.z = Math.sin(clock.getElapsedTime() * 2) * 0.01;
            } else {
                const t = (eased - 0.6) / 0.4;
                camera.position.lerpVectors(midPos, endPos, t);
            }

            const lookTarget = new THREE.Vector3(0, 2.5, camera.position.z + 20);
            camera.lookAt(lookTarget);

            if (animationProgress >= 1) {
                cameraMode = 'front';
                backButton.classList.remove('hidden'); // bouton Retour visible après l'intro
            }
        }

        // Ordinateur allumé : pendant le travelling, c'est lui qui pilote la caméra
        if (cameraMode === 'ecran' && ordinateur.piloterCamera(camera, regardAutel)) return;

        // Transitions entre vues
        if (cameraMode !== 'animation' && targetCameraPos) {
            cameraTransitionProgress += deltaTime * transitionSpeed;
            cameraTransitionProgress = Math.min(cameraTransitionProgress, 1);

            const startTransition = camera.position.clone();
            camera.position.lerpVectors(startTransition, targetCameraPos, easeInOutCubic(cameraTransitionProgress));
            camera.lookAt(regardAutel);

            if (cameraTransitionProgress >= 1) {
                targetCameraPos = null;
                cameraTransitionProgress = 0;
            }
        }

        // Si pas de transition, s'assurer qu'on regarde au bon endroit
        if (cameraMode !== 'animation' && !targetCameraPos) {
            camera.lookAt(regardAutel);
        }
    }

    // ===== CONTRÔLES INTERACTIFS =====
    const raycaster = new THREE.Raycaster();
    const pointeur = new THREE.Vector2();
    const pointeurGrossier = window.matchMedia('(pointer: coarse)'); // doigt : zones cliquables élargies

    // Le pointeur est-il sur l'écran, le clavier ou la souris de l'ordinateur ?
    function visePoste(event) {
        pointeur.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
        raycaster.setFromCamera(pointeur, camera);
        return ordinateur.vise(raycaster.ray, pointeurGrossier.matches);
    }

    // Main au survol de l'ordinateur, seulement tout près de l'écran
    function majCurseur(event) {
        canvas.classList.toggle('est-cliquable', cameraMode === 'screenClose' && event.pointerType === 'mouse' && visePoste(event));
    }

    // Le bouton son n'apparaît que tout près de l'écran (l'ordinateur l'efface pendant le travelling)
    function majBoutonSon() {
        boutonSon.classList.toggle('hidden', cameraMode !== 'screenClose');
    }

    function allumerOrdinateur() {
        cameraMode = 'ecran';
        canvas.classList.remove('est-cliquable');
        ordinateur.allumer();
    }

    canvas.addEventListener('pointermove', majCurseur);

    canvas.addEventListener('click', (event) => {
        if (cameraMode === 'animation') return; // Attendre la fin de l'animation initiale
        if (cameraMode === 'ecran') return; // Ordinateur allumé : Échap seul l'interrompt

        // Tout près de l'écran : un clic sur l'ordinateur l'allume, ailleurs on recule comme avant
        if (cameraMode === 'screenClose' && visePoste(event)) {
            allumerOrdinateur();
            return;
        }

        const screenWidth = window.innerWidth;
        const clickX = event.clientX;

        // Diviser l'écran en 3 zones
        if (clickX < screenWidth * 0.25) {
            // Clic à GAUCHE
            if (cameraMode === 'altar') {
                // Si on est sur l'autel -> Inspection Gauche
                cameraMode = 'altarLeft';
                targetCameraPos = altarLeftViewPos.clone();
                transitionSpeed = 1.5;
                cameraTransitionProgress = 0;
            } else if (cameraMode !== 'right' && cameraMode !== 'altarLeft') {
                cameraMode = 'right'; // Profil général droit (inversion)
                targetCameraPos = rightViewPos.clone();
                transitionSpeed = 2.0;
                cameraTransitionProgress = 0;
            }
        } else if (clickX > screenWidth * 0.75) {
            // Clic à DROITE
            if (cameraMode === 'altar') {
                // Si on est sur l'autel -> Inspection Droite
                cameraMode = 'altarRight';
                targetCameraPos = altarRightViewPos.clone();
                transitionSpeed = 1.5;
                cameraTransitionProgress = 0;
            } else if (cameraMode !== 'left' && cameraMode !== 'altarRight') {
                cameraMode = 'left'; // Profil général gauche (inversion)
                targetCameraPos = leftViewPos.clone();
                transitionSpeed = 2.0;
                cameraTransitionProgress = 0;
            }
        } else {
            // Clic au CENTRE
            if (cameraMode === 'front') {
                // Si on est devant -> Zoom Autel
                cameraMode = 'altar';
                targetCameraPos = altarViewPos.clone();
                transitionSpeed = 0.5;
                cameraTransitionProgress = 0;
            } else if (cameraMode === 'altar') {
                // Si on est sur l'autel -> Vue ultra proche écran
                cameraMode = 'screenClose';
                targetCameraPos = screenCloseViewPos.clone();
                transitionSpeed = 1.0;
                cameraTransitionProgress = 0;
            } else if (cameraMode === 'screenClose') {
                // Si on est très proche -> Retour autel
                cameraMode = 'altar';
                targetCameraPos = altarViewPos.clone();
                transitionSpeed = 1.0;
                cameraTransitionProgress = 0;
            } else if (['altarLeft', 'altarRight'].includes(cameraMode)) {
                // Depuis les côtés -> Retour autel
                cameraMode = 'altar';
                targetCameraPos = altarViewPos.clone();
                transitionSpeed = 1.5;
                cameraTransitionProgress = 0;
            } else {
                // Retour defaut
                cameraMode = 'front';
                targetCameraPos = frontViewPos.clone();
                transitionSpeed = 2.0;
                cameraTransitionProgress = 0;
            }
        }

        majBoutonSon();
        majCurseur(event);
    });

    // Clavier : Entrée ou Espace allument l'ordinateur tout près de l'écran, Échap l'interrompt
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (cameraMode === 'ecran') ordinateur.interrompre();
            return;
        }
        if ((event.key !== 'Enter' && event.key !== ' ') || cameraMode !== 'screenClose') return;
        if (event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
        // Sur un lien ou un bouton, la touche garde son action propre
        if (event.target instanceof Element && event.target.closest('a, button, input, select, textarea, [contenteditable]')) return;
        event.preventDefault();
        allumerOrdinateur();
    });

    // Retour arrière depuis la galerie, page restaurée telle quelle par le navigateur :
    // l'ordinateur est rééteint et la caméra revient tout près de l'écran
    window.addEventListener('pageshow', (event) => {
        if (!event.persisted || cameraMode !== 'ecran') return;
        ordinateur.reinitialiser();
        camera.position.copy(screenCloseViewPos);
        camera.lookAt(regardAutel);
        targetCameraPos = null;
        cameraMode = 'screenClose';
        majBoutonSon();
    });

    // ===== ANIMATION LOOP =====
    function animate() {
        requestAnimationFrame(animate);

        const deltaTime = Math.min(clock.getDelta(), 0.1); // Prevent huge jumps if frame drops
        const elapsedTime = clock.getElapsedTime();

        ordinateur.mettreAJour(deltaTime);
        animateCamera(deltaTime);

        if (grass.material.uniforms) {
            grass.material.uniforms.uTime.value = elapsedTime;
            grass.material.uniforms.uCameraPosition.value.copy(camera.position);
        }

        if (fireflies.material.uniforms) {
            fireflies.material.uniforms.uTime.value = elapsedTime;
        }

        if (godRays.material.uniforms) {
            godRays.material.uniforms.uTime.value = elapsedTime;
        }

        renderer.render(scene, camera);
    }

    // ===== WINDOW RESIZE =====
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ===== START =====
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
        animate();
    }, 1000);

    console.log('🎬 Animation démarrée!');
}

// ===== HELPER FUNCTIONS =====

function createAnimatedGrass() {
    const bladeGeometry = new THREE.PlaneGeometry(0.08, 0.6, 1, 3);
    bladeGeometry.translate(0, 0.3, 0);

    const grassCount = 15000;

    const grassMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uCameraPosition: { value: new THREE.Vector3() },
            uWindStrength: { value: 1.0 },
            uMap: { value: new THREE.Texture() },
            uAlphaMap: { value: new THREE.Texture() },
            uColorTop: { value: new THREE.Color(0xb8e5b3) },
            uColorBottom: { value: new THREE.Color(0x88b583) }
        },
        vertexShader: grassVertexShader,
        fragmentShader: grassFragmentShader,
        side: THREE.DoubleSide
    });

    const grassMesh = new THREE.InstancedMesh(
        bladeGeometry,
        grassMaterial,
        grassCount
    );

    // Chargement de l'Atlas (Couleur + Alpha)
    const texLoader = new THREE.TextureLoader();

    // 1. La Couleur
    texLoader.load('assets/textures/foliage/Foliage001_2K-JPG_Color.jpg', (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        grassMaterial.uniforms.uMap.value = texture;
    });

    // 2. L'Opacité (Masque N&B)
    texLoader.load('assets/textures/foliage/Foliage001_2K-JPG_Opacity.jpg', (texture) => {
        // Pas de SRGB pour les data maps (normal, alpha, roughness...)
        grassMaterial.uniforms.uAlphaMap.value = texture;
    });

    // Attribut personnalisé pour l'index de texture (variation)
    const textureIndices = new Float32Array(grassCount);
    for (let i = 0; i < grassCount; i++) {
        // Choisir un index aléatoire entre 0 et 8 (car 9 brins sur l'image)
        textureIndices[i] = Math.floor(Math.random() * 9);
    }
    bladeGeometry.setAttribute('aTextureIndex', new THREE.InstancedBufferAttribute(textureIndices, 1));

    const dummy = new THREE.Object3D();

    // Zone de la dalle de base de l'autel (en coordonnées absolues)
    // L'autel est à z=25, la dalle est décalée de -2, donc z=23
    // Dalle : 13m x 11m, donc x: -6.5 à +6.5, z: 17.5 à 28.5
    const platformMinX = -6.5;
    const platformMaxX = 6.5;
    const platformMinZ = 17.5;
    const platformMaxZ = 28.5;

    let placedGrass = 0;
    while (placedGrass < grassCount) {
        const x = (Math.random() - 0.5) * 120;
        const z = (Math.random() - 0.5) * 120;

        // Skip si dans la zone de la dalle
        if (x >= platformMinX && x <= platformMaxX &&
            z >= platformMinZ && z <= platformMaxZ) {
            continue;
        }

        const y = 0;  // Plat, au niveau 0

        dummy.position.set(x, y, z);
        dummy.rotation.y = Math.random() * Math.PI * 2;

        const scale = 0.8 + Math.random() * 0.4;
        dummy.scale.set(scale, scale, scale);

        dummy.updateMatrix();
        grassMesh.setMatrixAt(placedGrass, dummy.matrix);
        placedGrass++;
    }

    grassMesh.castShadow = false; // PERFORMANCE: Disable shadow casting for grass (too expensive)
    grassMesh.receiveShadow = true;

    return grassMesh;
}

function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ===== DÉCOR D'ARRIÈRE-PLAN =====
function createBackgroundScenery() {
    const sceneryGroup = new THREE.Group();

    // Matériaux
    const hillMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a7a4a,  // Vert colline
        roughness: 0.9,
        metalness: 0.0
    });

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a8580,  // Pierre grise
        roughness: 0.95,
        metalness: 0.0
    });

    // ===== COLLINES EN ARRIÈRE-PLAN =====
    // Grande colline gauche
    const hill1Geo = new THREE.SphereGeometry(25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hill1 = new THREE.Mesh(hill1Geo, hillMaterial);
    hill1.scale.set(2, 0.4, 1.5);
    hill1.position.set(-60, -2, 60);
    sceneryGroup.add(hill1);

    // Colline droite
    const hill3Geo = new THREE.SphereGeometry(20, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hill3 = new THREE.Mesh(hill3Geo, hillMaterial);
    hill3.scale.set(1.8, 0.5, 1.2);
    hill3.position.set(55, -2, 55);
    sceneryGroup.add(hill3);


    return sceneryGroup;
}

// ===== FIREFLIES CREATION =====
function createFireflies() {
    const fireflyCount = 50; // Reduced from 200
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(fireflyCount * 3);
    const scales = new Float32Array(fireflyCount);

    for (let i = 0; i < fireflyCount; i++) {
        // Position mostly along the camera path (Z: -40 to 15)
        // Camera moves from Z=-40 to Z=10
        // X range narrower (-8 to 8) to keep them in view

        const x = (Math.random() - 0.5) * 16; // -8 to +8
        const z = -40 + Math.random() * 55;   // -40 to +15
        const y = Math.random() * 2.5 + 0.8;  // Raised minimum height to 0.8m to bump off floor

        positions[i * 3 + 0] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        scales[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
        },
        vertexShader: firefliesVertexShader,
        fragmentShader: firefliesFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const fireflies = new THREE.Points(geometry, material);
    return fireflies;
}

// ===== GOD RAYS CREATION =====
function createGodRays() {
    // Geometry: Cylinder/Cone pointing down/forward
    // Top radius matches window (2.75), Bottom larger (spread), Height long enough to hit floor roughly
    const height = 40;
    const geometry = new THREE.CylinderGeometry(2.6, 6.0, height, 32, 1, true); // Open ended, radius 2.6

    // Shift center so pivot is at the top (source)
    geometry.translate(0, -height / 2, 0);
    // Cylinder is vertical by default.
    // Top is at Y=0, moves down to Y=-height.

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 }
        },
        vertexShader: beamVertexShader,
        fragmentShader: beamFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.FrontSide // Only render outside to avoid back-face transparency issues
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Position at the window center
    // Window is at 0, 8.0, 28.5 (Back Wall)
    // Moving slightly forward to avoid Z-fighting with wall
    mesh.position.set(0, 8.0, 28.4);

    // Rotate to point somewhat downwards and towards camera
    // Camera is at Z=-40. Sun is roughly behind (Z=60).
    // Angle: atan((20-8)/(60-28.5)) ~= 0.38 rad
    // We need to rotate NEGATIVE from horizontal to point down.
    mesh.rotation.x = Math.PI / 2 - 0.38;

    return mesh;
}

// ===== ALTAR CREATION (WITH LAIN DESK ON TOP) =====
function createAltar() {
    const altarGroup = new THREE.Group();

    // Matériau pierre (Marble012 - AmbientCG)
    const textureManager = new TextureManager();
    // 1. Matériau pour l'Autel (Marbre Blanc)
    const marbleMaps = textureManager.loadPBR('assets/textures/detail/Marble012_2K-JPG', {
        repeat: 2,
        suffixes: {
            color: 'Color',
            normal: 'NormalGL',
            roughness: 'Roughness'
        }
    });

    const marbleMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        ...marbleMaps,
        roughness: 0.8,
        side: THREE.DoubleSide
    });

    // 2. Matériau pour la Dalle au sol (Pierre vieillie / Rock Tile)
    const floorMaps = textureManager.loadPBR('assets/textures/detail/rock_tile_floor', {
        repeat: 4,
        suffixes: {
            color: 'diff_2k',
            normal: 'nor_gl_2k',
            roughness: 'rough_2k',
            ao: 'ao_2k'
        }
    });

    const slabMaterial = new THREE.MeshStandardMaterial({
        color: 0xbbbbbb,
        ...floorMaps,
        roughness: 0.9,
        side: THREE.DoubleSide
    });

    // DALLE DE BASE - Plateforme d'église 13m x 13.5m
    const baseSlabGeometry = new THREE.BoxGeometry(13, 0.1, 13.5);
    const baseSlab = new THREE.Mesh(baseSlabGeometry, slabMaterial);
    baseSlab.position.set(0, 0.05, -2);
    baseSlab.castShadow = true;
    baseSlab.receiveShadow = true;
    altarGroup.add(baseSlab);

    // MARCHES - Première marche (la plus large, au sol)
    const step1Geometry = new THREE.BoxGeometry(6, 0.20, 3);
    const step1 = new THREE.Mesh(step1Geometry, marbleMaterial);
    step1.position.y = 0.20;
    step1.castShadow = true;
    step1.receiveShadow = true;
    altarGroup.add(step1);

    // MARCHES - Deuxième marche (plus petite)
    const step2Geometry = new THREE.BoxGeometry(5, 0.30, 2.5);
    const step2 = new THREE.Mesh(step2Geometry, marbleMaterial);
    step2.position.y = 0.45;
    step2.castShadow = true;
    step2.receiveShadow = true;
    altarGroup.add(step2);

    // Socle en bas (sur les marches)
    const pedestalGeometry = new THREE.BoxGeometry(3.4, 0.25, 1.9);
    const pedestal = new THREE.Mesh(pedestalGeometry, marbleMaterial);
    pedestal.position.y = 0.725;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    altarGroup.add(pedestal);

    // Base de l'autel (bloc rectangulaire)
    const baseGeometry = new THREE.BoxGeometry(3, 0.85, 1.5);
    const base = new THREE.Mesh(baseGeometry, marbleMaterial);
    base.position.y = 1.275;
    base.castShadow = true;
    base.receiveShadow = true;
    altarGroup.add(base);

    // Plateau supérieur (plus large) - Surface où sera posé le setup
    const topGeometry = new THREE.BoxGeometry(3.2, 0.20, 1.7);
    const top = new THREE.Mesh(topGeometry, marbleMaterial);
    top.position.y = 1.80;
    top.castShadow = true;
    top.receiveShadow = true;
    altarGroup.add(top);

    // === LAIN DESK SETUP ON TOP OF ALTAR ===
    const lainDesk = createLainDesk();
    // Position on top of the altar surface (y = 1.80 + 0.10 for top surface + 0.01 margin)
    lainDesk.position.set(0, 1.91, 0);
    altarGroup.add(lainDesk);

    // Position reculée pour coller au mur arrière
    altarGroup.position.set(0, 0, 27);

    return altarGroup;
}

// ===== BACK WALL CREATION =====
function createBackWall() {
    const wallGroup = new THREE.Group();

    // Matériau pierre (Medieval Blocks)
    const textureManager = new TextureManager();
    const wallMaps = textureManager.loadPBR('assets/textures/wall/medieval_blocks_03', {
        repeat: 0.4, // Les UV sont en mètres (0..21), donc 0.4 donne ~2.5m par texture 
        suffixes: {
            color: 'diff_2k',
            normal: 'nor_gl_2k',
            roughness: 'rough_2k',
            ao: 'ao_2k'
        }
    });

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        map: wallMaps.map,
        normalMap: wallMaps.normalMap,
        roughnessMap: wallMaps.roughnessMap,
        aoMap: wallMaps.aoMap,
        roughness: 0.9,
        side: THREE.DoubleSide
    });

    // 1. DÉFINITION DE LA FORME PRINCIPALE (Pignon)
    const wallShape = new THREE.Shape();

    // Dimensions
    const width = 21;
    const halfWidth = width / 2;
    const baseHeight = 4;   // Hauteur du mur vertical avant le toit
    const peakHeight = 14;  // Hauteur du sommet
    const peakOffset = 0.75; // Décalage du sommet vers la droite

    // Tracé du contour (sens anti-horaire)
    wallShape.moveTo(-halfWidth, 0);          // Coin bas gauche
    wallShape.lineTo(halfWidth, 0);           // Coin bas droit
    wallShape.lineTo(halfWidth, baseHeight);  // Mur droit

    // Côté droit du toit (SIMPLE - Ligne droite coupée)
    // On coupe le sommet nettement plus bas (niveau des 3 dernières marches)
    // On élargit l'écart pour suivre à peu près la pente du toit
    const brokenTopRightX = peakOffset + 2.0;
    const brokenTopRightY = peakHeight - 2.5;

    const brokenTopLeftX = peakOffset - 1.5;
    const brokenTopLeftY = peakHeight - 2.2;

    // Côté droit: Courbe concave vers le sommet cassé
    // Calcul d'un point de contrôle pour une légère courbure concave (vers l'intérieur)
    const cpX = (halfWidth + brokenTopRightX) / 2;
    const cpY = (baseHeight + brokenTopRightY) / 2 - 1.5; // -1.5m pour l'aspect affaissé/creusé

    // Courbe quadratique depuis (halfWidth, baseHeight) jusqu'à l'épaule droite
    wallShape.quadraticCurveTo(cpX, cpY, brokenTopRightX, brokenTopRightY);

    wallShape.lineTo(brokenTopLeftX, brokenTopLeftY);   // Épaule gauche

    // Côté gauche du toit (EN ESCALIER RUINÉ)
    // On descend de l'épaule gauche vers la gauche

    const numSteps = 25;
    const targetX = -halfWidth;

    // On recalcule les distances à parcourir depuis le nouveau sommet coupé
    let currentX = brokenTopLeftX;
    let currentY = brokenTopLeftY;

    const totalX = Math.abs(targetX - currentX); // Distance horizontale restante
    const totalY = currentY - baseHeight;        // Distance verticale restante

    for (let i = 0; i < numSteps; i++) {
        // 1. On descend d'abord (vertical)
        const stepHeight = (totalY / numSteps);
        const randomHeightData = [1.1, 0.9, 1.2, 0.8, 1.0, 0.9, 1.1];
        currentY -= stepHeight * randomHeightData[i % 7];

        if (currentY < baseHeight) currentY = baseHeight;

        wallShape.lineTo(currentX, currentY);

        // 2. On va vers la gauche (horizontal)
        const stepWidth = (totalX / numSteps);
        const randomWidthData = [0.9, 1.1, 0.8, 1.2, 1.0, 1.1, 0.9];
        currentX -= stepWidth * randomWidthData[i % 7];

        if (currentX < targetX) currentX = targetX;

        wallShape.lineTo(currentX, currentY);
    }

    // Assurer qu'on rejoint bien le coin mur gauche
    wallShape.lineTo(-halfWidth, baseHeight); // Mur gauche

    wallShape.autoClose = true;

    // 2. PERCEMENT DES OUVERTURES (Holes)

    // Grande Rosace (Cercle)
    const roseRadius = 2.75; // Réduit encore (3.0 -> 2.75)
    const roseCenterY = 8.0; // Rabaissé de 1.5m (9.5 -> 8.0)
    const roseHole = new THREE.Path();
    roseHole.absarc(0, roseCenterY, roseRadius, 0, Math.PI * 2, true); // true = sens horaire pour les trous
    wallShape.holes.push(roseHole);

    // 3. CRÉATION DU VOLUME (Extrusion)
    const extrudeSettings = {
        steps: 1,
        depth: 0.8,  // Épaisseur du mur
        bevelEnabled: false,
        curveSegments: 24 // Fluidité des courbes
    };

    const wallGeometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
    const wall = new THREE.Mesh(wallGeometry, stoneMaterial);

    // Positionnement
    // L'extrusion se fait en Z positif par défaut, on centre l'épaisseur ?
    // On place le mur au fond, le pied à Y=0
    wall.position.set(0, 0, 28.5);
    wall.castShadow = true;
    wall.receiveShadow = true;

    wallGroup.add(wall);

    // 4. REMPLAGE DE LA ROSACE (Tracery)
    const tracery = createRoseTracery(roseRadius, roseCenterY);
    tracery.position.set(0, 0, 28.5 + 0.2); // Légèrement décalé pour le relief
    wallGroup.add(tracery);

    return wallGroup;
}

// ===== ROSE WINDOW TRACERY =====
function createRoseTracery(radius, centerY) {
    const traceryGroup = new THREE.Group();

    // Reuse texture from TextureManager, but we need to load it again if we don't pass it
    // Or just create a new instance (browser cache handles the file download)
    const textureManager = new TextureManager();
    const traceryMaps = textureManager.loadPBR('assets/textures/wall/medieval_blocks_03', {
        repeat: 1, // Detail is small
        suffixes: {
            color: 'diff_2k',
            normal: 'nor_gl_2k',
            roughness: 'rough_2k',
            ao: 'ao_2k'
        }
    });

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        map: traceryMaps.map,
        normalMap: traceryMaps.normalMap,
        roughnessMap: traceryMaps.roughnessMap,
        aoMap: traceryMaps.aoMap,
        roughness: 0.9,
        metalness: 0.1
    });

    // 1. Cercle extérieur (anneau principal)
    const outerRingGeo = new THREE.TorusGeometry(radius - 0.1, 0.15, 12, 48);
    const outerRing = new THREE.Mesh(outerRingGeo, stoneMaterial);
    outerRing.position.y = centerY;
    traceryGroup.add(outerRing);

    // 2. Cercle intérieur (petit anneau central)
    const innerRadius = radius * 0.2;
    const innerRingGeo = new THREE.TorusGeometry(innerRadius, 0.1, 12, 24);
    const innerRing = new THREE.Mesh(innerRingGeo, stoneMaterial);
    innerRing.position.y = centerY;
    traceryGroup.add(innerRing);

    // 3. Rayons (Spokes) - Colonnettes rayonnantes
    const numSpokes = 12; // 12 rayons comme sur la photo
    for (let i = 0; i < numSpokes; i++) {
        const angle = (i / numSpokes) * Math.PI * 2;
        const spokeLength = (radius - 0.25) - innerRadius;

        const spokeGeo = new THREE.CylinderGeometry(0.08, 0.08, spokeLength, 8);
        const spoke = new THREE.Mesh(spokeGeo, stoneMaterial);

        // Positionnement à mi-chemin entre intérieur et extérieur
        const midRadius = innerRadius + spokeLength / 2;
        spoke.position.set(
            Math.cos(angle) * midRadius,
            centerY + Math.sin(angle) * midRadius,
            0
        );

        // Rotation pour pointer vers le centre
        spoke.rotation.z = angle - Math.PI / 2;
        // spoke.rotation.x = Math.PI / 2; // RETIRÉ

        traceryGroup.add(spoke);

        // Petit détail au bout du rayon (chapiteau/arcature simple)
        const lobeSize = (Math.PI * radius * 2) / numSpokes * 0.4;
        const lobeGeo = new THREE.TorusGeometry(lobeSize, 0.05, 8, 16);
        const lobe = new THREE.Mesh(lobeGeo, stoneMaterial);
        lobe.position.set(
            Math.cos(angle) * (radius - 0.4),
            centerY + Math.sin(angle) * (radius - 0.4),
            0
        );
        lobe.rotation.z = angle;
        traceryGroup.add(lobe);
    }

    return traceryGroup;
}

// ===== COLONNES CRÉATION =====
function createColumns() {
    const columnsGroup = new THREE.Group();

    // Matériau pierre pour colonnes (Medieval Blocks)
    // Les colonnes réutilisent la pierre des murs (wall/) : mêmes images, téléchargées une seule fois
    const textureManager = new TextureManager();
    const columnMaps = textureManager.loadPBR('assets/textures/wall/medieval_blocks_03', {
        repeat: 2,
        suffixes: {
            color: 'diff_2k',
            normal: 'nor_gl_2k',
            roughness: 'rough_2k',
            ao: 'ao_2k'
        }
    });

    // Texture verticale pour les fûts (repeat différent pour éviter l'écrasement)
    const columnMapsVertical = textureManager.loadPBR('assets/textures/wall/medieval_blocks_03', {
        repeat: 1, // Moins de répétition verticale pour les colonnes
        suffixes: {
            color: 'diff_2k',
            normal: 'nor_gl_2k',
            roughness: 'rough_2k',
            ao: 'ao_2k'
        }
    });
    // Chaque appel à loadPBR crée ses propres textures : columnMapsVertical (cannelures des fûts)
    // garde bien sa répétition de 1, columnMaps celle de 2 ; les images ne sont téléchargées qu'une fois.

    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        map: columnMaps.map,
        normalMap: columnMaps.normalMap,
        roughnessMap: columnMaps.roughnessMap,
        aoMap: columnMaps.aoMap,
        roughness: 0.9,
        side: THREE.DoubleSide
    });

    // Dimensions colonne
    const columnRadius = 0.4;
    const columnHeight = 3.5;
    const columnGeo = new THREE.CylinderGeometry(columnRadius, columnRadius * 1.1, columnHeight, 12);

    // Nombre et espacement des colonnes
    const numColumns = 5;  // 5 colonnes de chaque côté
    const platformDepth = 11;  // Profondeur de la dalle
    const startZ = 23 - platformDepth / 2;  // Début (bord sud)
    const spacing = platformDepth / (numColumns - 1);

    // Optimized Geometries (Reuse to reduce draw calls setup)
    const grooveRadius = 0.084;
    const grooveGeo = new THREE.CylinderGeometry(grooveRadius, grooveRadius, columnHeight - 0.2, 8);

    const capitalSize = 0.9;
    const capitalHeight = 0.25;
    const standardCapitalGeo = new THREE.BoxGeometry(capitalSize, capitalHeight, capitalSize);

    const largeCapitalSize = 1.05;
    const largeCapitalHeight = 0.4;
    const largeCapitalGeo = new THREE.BoxGeometry(largeCapitalSize, largeCapitalHeight, largeCapitalSize);

    // COLONNES GAUCHE
    for (let i = 0; i < numColumns; i++) {
        if (i === 3) continue;  // Sauter la 4ème rangée
        if (i === 0) continue;  // Retirer la première rangée

        // BASE CARRÉE pour la 2ème rangée
        if (i === 1) {
            const baseSize = 2.25;  // 2.25m x 2.25m
            const baseHeight = 0.8;  // 0.8m de hauteur
            const baseGeo = new THREE.BoxGeometry(baseSize, baseHeight, baseSize);
            const base = new THREE.Mesh(baseGeo, columnMaterial);
            // Bord avant aligné avec le bord de la plateforme
            const platformEdgeZ = 18.25;  // Bord avant de la plateforme
            const platformEdgeX = -6.5;   // Bord latéral gauche de la plateforme
            const row2Z = platformEdgeZ + baseSize / 2;  // Centre reculé pour que le bord avant touche le bord
            const baseX = platformEdgeX + baseSize / 2;  // Centre décalé pour que le bord latéral touche le bord
            base.position.set(baseX, baseHeight / 2, row2Z);
            base.castShadow = true;
            base.receiveShadow = true;
            columnsGroup.add(base);

            // PILIER ROND CANNELÉ NORMAL pour la 2ème rangée (gauche)
            const pillarRadius = 0.7;  // Rayon agrandi
            const pillarHeight = columnHeight;

            // Corps principal du pilier (cylindre légèrement évasé)
            const pillarGeo = new THREE.CylinderGeometry(pillarRadius, pillarRadius * 1.1, pillarHeight, 24);
            const pillar = new THREE.Mesh(pillarGeo, columnMaterial);
            pillar.position.set(baseX, pillarHeight / 2 + 0.8, row2Z);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            columnsGroup.add(pillar);

            // Cannelures verticales autour du cylindre (taille proportionnelle)
            const numGrooves = 12;
            const grooveRadius = 0.084;  // +40% proportionnel au rayon
            const grooveMaterial = new THREE.MeshStandardMaterial({
                color: 0xdddddd,
                map: columnMapsVertical.map,
                normalMap: columnMapsVertical.normalMap,
                roughnessMap: columnMapsVertical.roughnessMap,
                aoMap: columnMapsVertical.aoMap,
                roughness: 0.9,
                side: THREE.DoubleSide
            });

            for (let g = 0; g < numGrooves; g++) {
                const angle = (g / numGrooves) * Math.PI * 2;
                // Reuse grooveGeo
                const groove = new THREE.Mesh(grooveGeo, grooveMaterial);
                groove.position.set(
                    baseX + Math.cos(angle) * (pillarRadius + grooveRadius * 0.5),
                    pillarHeight / 2 + 0.8,
                    row2Z + Math.sin(angle) * (pillarRadius + grooveRadius * 0.5)
                );
                columnsGroup.add(groove);
            }

            continue;  // Passer à l'itération suivante, ne pas créer la colonne cylindrique
        }

        const column = new THREE.Mesh(columnGeo, columnMaterial);
        let zOffset = (i === 2) ? 2.0 : 0;  // Décalage de 2.0m pour la 3ème rangée (rapporchée de 50cm)
        if (i === 4) zOffset = -0.25;  // Avancer la dernière rangée de 0.25m du mur
        column.position.set(-5.5, columnHeight / 2 + (i === 1 ? 0.6 : 0), startZ + i * spacing + zOffset);
        column.castShadow = true;
        column.receiveShadow = true;
        columnsGroup.add(column);

        // CHAPITEAU pour les 1ère et 2ème rangées
        if (i === 0 || i === 1) {
            // Reuse standardCapitalGeo
            const capital = new THREE.Mesh(standardCapitalGeo, columnMaterial);
            const columnTopY = (i === 1 ? 0.6 : 0) + columnHeight;
            capital.position.set(-5.5, columnTopY + capitalHeight / 2, startZ + i * spacing + zOffset);
            capital.castShadow = true;
            capital.receiveShadow = true;
            columnsGroup.add(capital);
        }

        // CHAPITEAU pour la rangée 4 (pour supporter l'arche)
        if (i === 4) {
            // Reuse largeCapitalGeo
            const capital = new THREE.Mesh(largeCapitalGeo, columnMaterial);
            capital.position.set(-5.5, columnHeight + largeCapitalHeight / 2, startZ + i * spacing + zOffset);
            capital.castShadow = true;
            capital.receiveShadow = true;
            columnsGroup.add(capital);
        }

        // CHAPITEAU pour la rangée 3 (index 2)
        if (i === 2) {
            // Reuse largeCapitalGeo
            const capital = new THREE.Mesh(largeCapitalGeo, columnMaterial);
            capital.position.set(-5.5, columnHeight + largeCapitalHeight / 2, startZ + i * spacing + zOffset);
            capital.castShadow = true;
            capital.receiveShadow = true;
            columnsGroup.add(capital);
        }
    }

    // ===== NOUVELLE RANGÉE ENTRE 2 ET 3 (GAUCHE) =====
    // Même espacement qu'entre 3 et 4
    const row3Z = startZ + 2 * spacing + 2.0;  // Position rangée 3
    const row4Z_temp = startZ + 4 * spacing - 0.25;  // Position rangée 4
    const spacingBetween3And4 = Math.abs(row4Z_temp - row3Z);
    const newRowZ = row3Z - spacingBetween3And4;  // Nouvelle rangée avant la rangée 3

    // Colonne nouvelle rangée gauche
    const newColumnLeft = new THREE.Mesh(columnGeo, columnMaterial);
    newColumnLeft.position.set(-5.5, columnHeight / 2, newRowZ);
    newColumnLeft.castShadow = true;
    newColumnLeft.receiveShadow = true;
    columnsGroup.add(newColumnLeft);

    // Chapiteau nouvelle rangée gauche
    // Reuse largeCapitalGeo
    const newCapitalLeft = new THREE.Mesh(largeCapitalGeo, columnMaterial);
    newCapitalLeft.position.set(-5.5, columnHeight + largeCapitalHeight / 2, newRowZ);
    newCapitalLeft.castShadow = true;
    newCapitalLeft.receiveShadow = true;
    columnsGroup.add(newCapitalLeft);

    // COLONNES DROITE
    for (let i = 0; i < numColumns; i++) {
        if (i === 3) continue;  // Sauter la 4ème rangée
        if (i === 0) continue;  // Retirer la première rangée

        // BASE CARRÉE pour la 2ème rangée
        if (i === 1) {
            const baseSize = 2.25;  // 2.25m x 2.25m (comme à gauche)
            const baseHeight = 0.8;  // 0.8m de hauteur
            const baseGeo = new THREE.BoxGeometry(baseSize, baseHeight, baseSize);
            const base = new THREE.Mesh(baseGeo, columnMaterial);
            // Bord avant et latéral alignés avec le bord de la plateforme
            const platformEdgeZ = 18.25;  // Bord avant de la plateforme
            const platformEdgeX = 6.5;    // Bord latéral droit de la plateforme
            const row2Z = platformEdgeZ + baseSize / 2;  // Centre reculé
            const baseX = platformEdgeX - baseSize / 2;  // Centre décalé (côté droit)
            base.position.set(baseX, baseHeight / 2, row2Z);
            base.castShadow = true;
            base.receiveShadow = true;
            columnsGroup.add(base);

            // PILIER ROND CANNELÉ RUINÉ pour la 2ème rangée (droite)
            const pillarRadius = 0.7;  // Rayon agrandi (comme à gauche)
            const pillarHeight = columnHeight * 0.65;  // Hauteur réduite (ruine)

            // Corps principal du pilier (plus court)
            const pillarGeo = new THREE.CylinderGeometry(pillarRadius, pillarRadius * 1.1, pillarHeight, 24);
            const pillar = new THREE.Mesh(pillarGeo, columnMaterial);
            pillar.position.set(baseX, pillarHeight / 2 + 0.8, row2Z);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            columnsGroup.add(pillar);

            // === IMPERFECTIONS AU SOMMET (débris proportionnels au rayon) ===
            const debrisMaterial = new THREE.MeshStandardMaterial({
                color: 0xbcbcbc,
                map: columnMaps.map,
                normalMap: columnMaps.normalMap,
                roughnessMap: columnMaps.roughnessMap,
                aoMap: columnMaps.aoMap,
                roughness: 0.9,
                side: THREE.DoubleSide
            });

            // Plusieurs morceaux de pierre cassée au sommet (taille augmentée proportionnellement)
            for (let d = 0; d < 7; d++) {
                const debrisSize = 0.14 + Math.random() * 0.28;  // +40% proportionnel au rayon
                const debrisHeight = 0.14 + Math.random() * 0.35;
                const debrisGeo = new THREE.BoxGeometry(debrisSize, debrisHeight, debrisSize);
                const debris = new THREE.Mesh(debrisGeo, debrisMaterial);

                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * pillarRadius * 0.8;
                debris.position.set(
                    baseX + Math.cos(angle) * dist,
                    pillarHeight + 0.8 + debrisHeight / 2 - 0.05,
                    row2Z + Math.sin(angle) * dist
                );
                debris.rotation.y = Math.random() * Math.PI;
                debris.rotation.z = (Math.random() - 0.5) * 0.3;
                debris.castShadow = true;
                columnsGroup.add(debris);
            }

            // Morceaux plus gros sur le bord (taille augmentée proportionnellement)
            for (let d = 0; d < 4; d++) {
                const chunkWidth = 0.21 + Math.random() * 0.21;  // +40%
                const chunkHeight = 0.28 + Math.random() * 0.42;  // +40%
                const chunkGeo = new THREE.BoxGeometry(chunkWidth, chunkHeight, chunkWidth);
                const chunk = new THREE.Mesh(chunkGeo, columnMaterial);

                const angle = (d / 4) * Math.PI * 2 + Math.random() * 0.5;
                chunk.position.set(
                    baseX + Math.cos(angle) * (pillarRadius * 0.6),
                    pillarHeight + 0.8 + chunkHeight / 2 - 0.1,
                    row2Z + Math.sin(angle) * (pillarRadius * 0.6)
                );
                chunk.rotation.y = Math.random() * Math.PI;
                chunk.rotation.x = (Math.random() - 0.5) * 0.4;
                chunk.castShadow = true;
                columnsGroup.add(chunk);
            }

            // Cannelures verticales (taille rainure augmentée)
            const numGrooves = 12;
            const grooveRadius = 0.084;  // +40%
            const grooveMaterial = new THREE.MeshStandardMaterial({
                color: 0xdddddd,
                map: columnMapsVertical.map,
                normalMap: columnMapsVertical.normalMap,
                roughnessMap: columnMapsVertical.roughnessMap,
                aoMap: columnMapsVertical.aoMap,
                roughness: 0.9,
                side: THREE.DoubleSide
            });

            for (let g = 0; g < numGrooves; g++) {
                const angle = (g / numGrooves) * Math.PI * 2;
                const grooveHeight = pillarHeight - 0.2 - Math.random() * 0.3;
                const grooveGeo = new THREE.CylinderGeometry(grooveRadius, grooveRadius, grooveHeight, 8);
                const groove = new THREE.Mesh(grooveGeo, grooveMaterial);
                groove.position.set(
                    baseX + Math.cos(angle) * (pillarRadius + grooveRadius * 0.5),
                    grooveHeight / 2 + 0.8,
                    row2Z + Math.sin(angle) * (pillarRadius + grooveRadius * 0.5)
                );
                columnsGroup.add(groove);
            }

            continue;
        }

        const column = new THREE.Mesh(columnGeo, columnMaterial);
        let zOffset = (i === 2) ? 2.0 : 0;  // Décalage de 2.0m pour la 3ème rangée (rapprochée de 50cm)
        if (i === 4) zOffset = -0.25;  // Avancer la dernière rangée de 0.25m du mur
        column.position.set(5.5, columnHeight / 2 + (i === 1 ? 0.6 : 0), startZ + i * spacing + zOffset);
        column.castShadow = true;
        column.receiveShadow = true;
        columnsGroup.add(column);

        // CHAPITEAU pour les 1ère et 2ème rangées
        if (i === 0 || i === 1) {
            const capitalSize = 0.9;  // Plus large que la colonne
            const capitalHeight = 0.25;
            const capitalGeo = new THREE.BoxGeometry(capitalSize, capitalHeight, capitalSize);
            const capital = new THREE.Mesh(capitalGeo, columnMaterial);
            const columnTopY = (i === 1 ? 0.6 : 0) + columnHeight;
            capital.position.set(5.5, columnTopY + capitalHeight / 2, startZ + i * spacing + zOffset);
            capital.castShadow = true;
            capital.receiveShadow = true;
            columnsGroup.add(capital);
        }

        // CHAPITEAU pour la rangée 4 (pour supporter l'arche)
        if (i === 4) {
            const capitalSize = 1.05;  // 1.05m x 1.05m
            const capitalHeight = 0.4; // 0.4m de hauteur
            const capitalGeo = new THREE.BoxGeometry(capitalSize, capitalHeight, capitalSize);
            const capital = new THREE.Mesh(capitalGeo, columnMaterial);
            capital.position.set(5.5, columnHeight + capitalHeight / 2, startZ + i * spacing + zOffset);
            capital.castShadow = true;
            capital.receiveShadow = true;
            columnsGroup.add(capital);
        }

        // CHAPITEAU pour la rangée 3 (index 2)
        if (i === 2) {
            const capitalSize = 1.05;  // 1.05m x 1.05m
            const capitalHeight = 0.4; // 0.4m de hauteur
            const capitalGeo = new THREE.BoxGeometry(capitalSize, capitalHeight, capitalSize);
            const capital = new THREE.Mesh(capitalGeo, columnMaterial);
            capital.position.set(5.5, columnHeight + capitalHeight / 2, startZ + i * spacing + zOffset);
            capital.castShadow = true;
            capital.receiveShadow = true;
            columnsGroup.add(capital);
        }
    }

    // ===== NOUVELLE RANGÉE ENTRE 2 ET 3 (DROITE) =====
    // Colonne nouvelle rangée droite
    const newColumnRight = new THREE.Mesh(columnGeo, columnMaterial);
    newColumnRight.position.set(5.5, columnHeight / 2, newRowZ);
    newColumnRight.castShadow = true;
    newColumnRight.receiveShadow = true;
    columnsGroup.add(newColumnRight);

    // Chapiteau nouvelle rangée droite
    // Reuse largeCapitalGeo
    const newCapitalRight = new THREE.Mesh(largeCapitalGeo, columnMaterial);
    newCapitalRight.position.set(5.5, columnHeight + largeCapitalHeight / 2, newRowZ);
    newCapitalRight.castShadow = true;
    newCapitalRight.receiveShadow = true;
    columnsGroup.add(newCapitalRight);

    // ===== ARCHES ENTRE COLONNES 3 ET 5 =====
    // Position des colonnes concernées
    const row2Z = startZ + 2 * spacing + 2.0;  // Rangée 3 (index 2) avec offset 2.0m
    const row4Z = startZ + 4 * spacing - 0.25;  // Rangée 5 (index 4) avec offset (-0.25m)
    const distanceBetweenColumns = Math.abs(row4Z - row2Z);

    // Matériau pour arches
    const archMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        map: columnMaps.map,
        normalMap: columnMaps.normalMap,
        roughnessMap: columnMaps.roughnessMap,
        aoMap: columnMaps.aoMap,
        roughness: 0.9,
        side: THREE.DoubleSide
    });

    // Nouvelle arche - plus petite et plus lisse
    const archRadius = distanceBetweenColumns / 2.5;  // Rayon réduit pour arche plus intérieure
    const numSegments = 20;  // Plus de segments pour meilleure qualité
    const archWidth = 0.45;   // Largeur de pierre (augmentée à 0.45m)
    const archDepth = 0.4;    // Profondeur modérée
    const archCapitalHeight = 0.3;
    const archCenterZ = (row2Z + row4Z) / 2;  // Point milieu entre les deux colonnes

    // ARCHE GAUCHE (Skip i=0 et i=numSegments pour éviter les segments horizontaux)
    for (let i = 1; i < numSegments; i++) {
        const angle = (Math.PI / numSegments) * i;  // De 0 à π
        const segmentLength = (archRadius * Math.PI) / numSegments;

        const segmentGeo = new THREE.BoxGeometry(archWidth, archDepth, segmentLength);
        const segment = new THREE.Mesh(segmentGeo, archMaterial);

        // Position en arc - sommet centré entre les deux colonnes
        // Use renamed variable
        const y = columnHeight + archCapitalHeight + archRadius * Math.sin(angle);
        const z = archCenterZ + archRadius * Math.cos(angle);  // Sommet au centre

        segment.position.set(-5.5, y, z);
        segment.rotation.x = -angle;  // Orienter chaque segment
        segment.castShadow = true;
        columnsGroup.add(segment);
    }

    // ARCHE DROITE
    for (let i = 1; i < numSegments; i++) {
        const angle = (Math.PI / numSegments) * i;
        const segmentLength = (archRadius * Math.PI) / numSegments;

        const segmentGeo = new THREE.BoxGeometry(archWidth, archDepth, segmentLength);
        const segment = new THREE.Mesh(segmentGeo, archMaterial);

        const y = columnHeight + archCapitalHeight + archRadius * Math.sin(angle);
        const z = archCenterZ + archRadius * Math.cos(angle);  // Sommet au centre

        segment.position.set(5.5, y, z);
        segment.rotation.x = -angle;
        segment.castShadow = true;
        columnsGroup.add(segment);
    }

    // ===== ARCHE EXTÉRIEURE (ARCHIVOLTE) =====
    const outerArchMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        map: columnMaps.map,
        normalMap: columnMaps.normalMap,
        roughnessMap: columnMaps.roughnessMap,
        aoMap: columnMaps.aoMap,
        roughness: 0.9,
        side: THREE.DoubleSide
    });

    const outerArchRadius = archRadius * 1.175;  // Rayon plus grand (17.5% plus grand = 1.76m)
    const outerArchWidth = 0.9;   // 90cm de large
    const outerArchDepth = 0.6;   // 60cm de profondeur
    const outerArchZOffset = 0.15; // Décalage vers l'arrière (vers le mur)

    // ARCHE EXTÉRIEURE GAUCHE
    for (let i = 1; i < numSegments; i++) {
        const angle = (Math.PI / numSegments) * i;
        const segmentLength = (outerArchRadius * Math.PI) / numSegments;

        const segmentGeo = new THREE.BoxGeometry(outerArchWidth, outerArchDepth, segmentLength);
        const segment = new THREE.Mesh(segmentGeo, outerArchMaterial);

        const y = columnHeight + capitalHeight + outerArchRadius * Math.sin(angle);
        const z = archCenterZ + outerArchRadius * Math.cos(angle);  // Sommet au centre

        segment.position.set(-5.5, y, z);
        segment.rotation.x = -angle;
        segment.castShadow = true;
        columnsGroup.add(segment);
    }

    // ARCHE EXTÉRIEURE DROITE
    for (let i = 1; i < numSegments; i++) {
        const angle = (Math.PI / numSegments) * i;
        const segmentLength = (outerArchRadius * Math.PI) / numSegments;

        const segmentGeo = new THREE.BoxGeometry(outerArchWidth, outerArchDepth, segmentLength);
        const segment = new THREE.Mesh(segmentGeo, outerArchMaterial);

        const y = columnHeight + capitalHeight + outerArchRadius * Math.sin(angle);
        const z = archCenterZ + outerArchRadius * Math.cos(angle);  // Sommet au centre

        segment.position.set(5.5, y, z);
        segment.rotation.x = -angle;
        segment.castShadow = true;
        columnsGroup.add(segment);
    }

    // ===== ARCHES ENTRE NOUVELLE RANGÉE ET RANGÉE 3 =====
    // Utilise le même espacement que les arches existantes
    const newArchCenterZ = (newRowZ + row3Z) / 2;  // Centre entre nouvelle rangée et rangée 3

    // ARCHE INTÉRIEURE GAUCHE (nouvelle)
    for (let i = 1; i < numSegments; i++) {
        const angle = (Math.PI / numSegments) * i;
        const segmentLength = (archRadius * Math.PI) / numSegments;

        const segmentGeo = new THREE.BoxGeometry(archWidth, archDepth, segmentLength);
        const segment = new THREE.Mesh(segmentGeo, archMaterial);

        const y = columnHeight + capitalHeight + archRadius * Math.sin(angle);
        const z = newArchCenterZ + archRadius * Math.cos(angle);

        segment.position.set(-5.5, y, z);
        segment.rotation.x = -angle;
        segment.castShadow = true;
        columnsGroup.add(segment);
    }

    // ARCHE INTÉRIEURE DROITE (nouvelle)
    for (let i = 1; i < numSegments; i++) {
        const angle = (Math.PI / numSegments) * i;
        const segmentLength = (archRadius * Math.PI) / numSegments;

        const segmentGeo = new THREE.BoxGeometry(archWidth, archDepth, segmentLength);
        const segment = new THREE.Mesh(segmentGeo, archMaterial);

        const y = columnHeight + capitalHeight + archRadius * Math.sin(angle);
        const z = newArchCenterZ + archRadius * Math.cos(angle);

        segment.position.set(5.5, y, z);
        segment.rotation.x = -angle;
        segment.castShadow = true;
        columnsGroup.add(segment);
    }

    // ARCHE EXTÉRIEURE GAUCHE (nouvelle)
    for (let i = 1; i < numSegments; i++) {
        const angle = (Math.PI / numSegments) * i;
        const segmentLength = (outerArchRadius * Math.PI) / numSegments;

        const segmentGeo = new THREE.BoxGeometry(outerArchWidth, outerArchDepth, segmentLength);
        const segment = new THREE.Mesh(segmentGeo, outerArchMaterial);

        const y = columnHeight + capitalHeight + outerArchRadius * Math.sin(angle);
        const z = newArchCenterZ + outerArchRadius * Math.cos(angle);

        segment.position.set(-5.5, y, z);
        segment.rotation.x = -angle;
        segment.castShadow = true;
        columnsGroup.add(segment);
    }

    // ARCHE EXTÉRIEURE DROITE (nouvelle)
    for (let i = 1; i < numSegments; i++) {
        const angle = (Math.PI / numSegments) * i;
        const segmentLength = (outerArchRadius * Math.PI) / numSegments;

        const segmentGeo = new THREE.BoxGeometry(outerArchWidth, outerArchDepth, segmentLength);
        const segment = new THREE.Mesh(segmentGeo, outerArchMaterial);

        const y = columnHeight + capitalHeight + outerArchRadius * Math.sin(angle);
        const z = newArchCenterZ + outerArchRadius * Math.cos(angle);

        segment.position.set(5.5, y, z);
        segment.rotation.x = -angle;
        segment.castShadow = true;
        columnsGroup.add(segment);
    }

    // ===== MUR DE REMPLISSAGE (GAUCHE - "PAN ESCALIER") =====
    // Version corrigée: le bas de la forme suit les arches au lieu d'être une ligne droite

    // Paramètres
    const wallBaseY = columnHeight + 0.3; // Niveau de base (bas des arches)
    const wallTopY = wallBaseY + outerArchRadius + 0.25; // Haut du mur

    // Marges réduites 
    const startZ_Wall = newRowZ - 0.15;
    const endZ_Wall = row4Z + 0.15;

    // Points clés des arches
    const arch1LeftFoot = newArchCenterZ - outerArchRadius + 0.05;
    const arch1RightFoot = newArchCenterZ + outerArchRadius - 0.05;
    const arch2LeftFoot = archCenterZ - outerArchRadius + 0.05;
    const arch2RightFoot = archCenterZ + outerArchRadius - 0.05;

    const wallShape = new THREE.Shape();

    // Tracé de la forme (sens anti-horaire, coordonnées: x=Z_World, y=Y_World)
    // On commence en bas à droite et on trace en évitant les ouvertures d'arches

    // 1. Départ: bas à droite (près de startZ_Wall)
    wallShape.moveTo(startZ_Wall, wallBaseY);

    // 2. Monter au niveau du sommet gauche abimé
    wallShape.lineTo(startZ_Wall, wallTopY - 0.35);

    // 3. Coin abimé
    wallShape.lineTo(startZ_Wall + 0.1, wallTopY - 0.1);
    wallShape.lineTo(startZ_Wall + 0.25, wallTopY - 0.15);
    wallShape.lineTo(startZ_Wall + 0.4, wallTopY);

    // 4. Haut du mur jusqu'à l'autre côté
    wallShape.lineTo(endZ_Wall, wallTopY);

    // 5. Descendre à droite
    wallShape.lineTo(endZ_Wall, wallBaseY);

    // 6. Aller vers le pied droit de l'arche 2, puis arc au-dessus
    wallShape.lineTo(arch2RightFoot, wallBaseY);
    wallShape.absarc(archCenterZ, wallBaseY, outerArchRadius - 0.05, 0, Math.PI, false);

    // 7. Du pied gauche arche 2 au pied droit arche 1
    wallShape.lineTo(arch1RightFoot, wallBaseY);
    wallShape.absarc(newArchCenterZ, wallBaseY, outerArchRadius - 0.05, 0, Math.PI, false);

    // 8. Retour au point de départ
    wallShape.lineTo(startZ_Wall, wallBaseY);

    const wallExtrudeSettings = {
        steps: 1,
        depth: outerArchWidth,
        bevelEnabled: false,
        curveSegments: 16
    };

    const wallGeo = new THREE.ExtrudeGeometry(wallShape, wallExtrudeSettings);
    const wallMesh = new THREE.Mesh(wallGeo, outerArchMaterial);

    wallMesh.rotation.y = -Math.PI / 2;
    wallMesh.position.set(-5.5 + outerArchWidth / 2, 0, 0);

    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    columnsGroup.add(wallMesh);

    return columnsGroup;
}

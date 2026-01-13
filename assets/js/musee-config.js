/**
 * MUSÉE 3D - CONFIGURATION
 * Centralisez ici tous vos paramètres de personnalisation
 */

export const CONFIG = {
    // ===== SCÈNE =====
    scene: {
        backgroundColor: 0x120900,  // Noir Portal
        fogColor: 0x120900,
        fogNear: 10,
        fogFar: 50
    },

    // ===== CAMÉRA =====
    camera: {
        fov: 75,                    // Field of view (angle de vue)
        startPosition: { x: 0, y: 2, z: 12 },
        endPosition: { x: 0, y: 1.0, z: 2.2 },
        lookAt: { x: 0, y: 1, z: 0 }
    },

    // ===== ANIMATION =====
    animation: {
        duration: 4000,             // Durée du travelling (millisecondes)
        enableAutoTravel: true,     // Animation automatique au chargement
        enableOrbitControls: true,  // Contrôles à la souris après l'animation
        showBackButton: true        // Bouton retour visible
    },

    // ===== LUMIÈRES =====
    lights: {
        ambient: {
            color: 0xffb000,        // Ambre
            intensity: 0.3
        },
        main: {
            color: 0xffd8a3,        // Ambre clair
            intensity: 0.8,
            position: { x: 5, y: 8, z: 5 },
            castShadow: true
        },
        rim: {
            color: 0xffb000,
            intensity: 0.4,
            position: { x: -5, y: 3, z: -5 }
        }
    },

    // ===== MONITEUR =====
    monitor: {
        frame: {
            size: { width: 3.2, height: 2.4, depth: 0.5 },
            color: 0xd4c4a8,        // Beige rétro
            roughness: 0.7,
            metalness: 0.1
        },
        screen: {
            size: { width: 2.8, height: 2.0, depth: 0.1 },
            color: 0xffffff,        // Blanc
            emissive: 0xffffff,
            emissiveIntensity: 0.8
        },
        position: { x: 0, y: 1, z: 0 },
        enableRotation: false       // Rotation subtile désactivée
    },

    // ===== ENVIRONNEMENT =====
    environment: {
        floor: {
            size: 30,
            color: 0x0a0500,        // Brun très foncé
            roughness: 0.8,
            metalness: 0.2,
            position: -1,
            visible: true
        },
        grid: {
            size: 30,
            divisions: 30,
            colorCenterLine: 0xffb000,
            colorGrid: 0xa86e22,
            opacity: 0.2,
            visible: true
        }
    },

    // ===== PARTICULES =====
    particles: {
        count: 200,
        color: 0xffb000,
        size: 0.05,
        opacity: 0.6,
        spread: 30,                 // Zone de dispersion
        rotationSpeed: 0.0005,
        visible: true
    },

    // ===== OBJETS PERSONNALISÉS =====
    // Ajoutez vos propres objets ici !
    customObjects: [
        // Exemple : Cube rouge à gauche
        // {
        //     type: 'box',
        //     size: { width: 1, height: 1, depth: 1 },
        //     color: 0xff0000,
        //     position: { x: -3, y: 1, z: 0 },
        //     rotation: { x: 0, y: 0, z: 0 },
        //     metalness: 0.5,
        //     roughness: 0.5,
        //     animate: true  // Fait tourner l'objet
        // },
        // Exemple : Sphère verte à droite
        // {
        //     type: 'sphere',
        //     radius: 0.5,
        //     color: 0x00ff00,
        //     emissive: 0x00ff00,
        //     emissiveIntensity: 0.3,
        //     position: { x: 3, y: 1.5, z: 0 }
        // }
    ]
};

// ===== PRESETS THÉMATIQUES =====
// Décommentez un preset pour l'appliquer

// CYBERPUNK
// CONFIG.scene.backgroundColor = 0x0a0a1a;
// CONFIG.lights.ambient.color = 0x00ffff;
// CONFIG.lights.main.color = 0x0088ff;
// CONFIG.particles.color = 0x00ffff;

// MATRIX
// CONFIG.scene.backgroundColor = 0x000000;
// CONFIG.lights.ambient.color = 0x00ff00;
// CONFIG.lights.main.color = 0x00ff88;
// CONFIG.particles.color = 0x00ff00;
// CONFIG.monitor.screen.color = 0x00ff00;
// CONFIG.monitor.screen.emissive = 0x00ff00;

// SUNSET
// CONFIG.scene.backgroundColor = 0x1a0a00;
// CONFIG.lights.ambient.color = 0xff4400;
// CONFIG.lights.main.color = 0xff8800;
// CONFIG.particles.color = 0xff6600;

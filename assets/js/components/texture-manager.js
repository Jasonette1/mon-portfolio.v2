/**
 * Texture Manager for Musee 3D
 * Simplifies loading and configuring PBR textures
 */

import * as THREE from 'three';

export class TextureManager {
    constructor() {
        this.loader = new THREE.TextureLoader();
    }

    /**
     * Loads a set of PBR textures for a material
     * @param {string} basePath - Base path to textures (e.g., 'assets/textures/floor/Grass001_2K-JPG')
     * @param {Object} options - Configuration options
     * @param {number} options.repeat - Number of times texture repeats
     * @returns {Object} maps object ready for MeshStandardMaterial
     */
    loadPBR(basePath, options = {}) {
        const {
            repeat = 1,
            suffixes = {
                color: 'Color',
                normal: 'NormalGL',
                roughness: 'Roughness',
                ao: 'AmbientOcclusion'
            }
        } = options;

        const maps = {};

        // Helper to load and configure a single texture
        const loadMap = (suffix, type) => {
            if (!suffix) return null; // Skip if suffix is explicitly null

            return this.loader.load(`${basePath}_${suffix}.jpg`, (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeat, repeat);

                // Color map needs sRGB encoding
                if (type === 'color') {
                    texture.colorSpace = THREE.SRGBColorSpace;
                }
            });
        };

        maps.map = loadMap(suffixes.color, 'color');
        maps.normalMap = loadMap(suffixes.normal, 'normal');
        maps.roughnessMap = loadMap(suffixes.roughness, 'roughness');
        maps.aoMap = loadMap(suffixes.ao, 'ao');

        return maps;
    }
}

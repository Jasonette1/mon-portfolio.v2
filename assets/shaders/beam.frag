varying vec2 vUv;
varying vec3 vWorldPosition;
uniform float uTime;

void main() {
    // Gradient vertical (Atténuation avec la distance)
    // vUv.y est 0 en bas du cylindre, 1 en haut (source)
    // Ou l'inverse selon la géométrie Three.js. On vérifiera. 
    // CylinderGeometry : y=0 bottom, y=1 top ? Usually.
    
    // On veut que ça soit brillant en haut (près de la fenêtre) et transparent en bas
    float beamStrength = smoothstep(0.0, 1.0, vUv.y); 
    
    // Effet "Rayons" striés (Noise simulé avec sin/cos sur l'angle)
    // Moins de contraste pour plus de douceur
    // vUv.x fait le tour du cylindre (0 à 1)
    float rays = sin(vUv.x * 40.0 + uTime * 0.5) * 0.05 + 0.95;
    
    // Couleur chaude
    vec3 color = vec3(1.0, 0.95, 0.8);
    
    // Atténuation globale - Encore plus discret (0.02 max)
    float alpha = beamStrength * rays * 0.02; 
    
    // Soft interaction with depth would be nice but complex without depth buffer access
    
    gl_FragColor = vec4(color, alpha);
}

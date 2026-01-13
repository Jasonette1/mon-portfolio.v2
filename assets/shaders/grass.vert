// Vertex Shader pour l'herbe animée (Version Atlas)
uniform float uTime;
uniform vec3 uCameraPosition;
uniform float uWindStrength;

attribute float aTextureIndex; // Index pour choisir le brin d'herbe (0 à N-1)

varying vec2 vUv;
varying float vDistance;

void main() {
    // Gestion de l'Atlas de texture (9 brins dans l'image)
    // On divise l'UV x par le nombre de brins et on décale selon l'index
    float totalBladesInTexture = 9.0;
    float bladeWidth = 1.0 / totalBladesInTexture;
    
    vUv = uv;
    // Rétrécir l'UV horizontalement et le décaler vers la bonne "colonne" de l'image
    vUv.x = (vUv.x * bladeWidth) + (aTextureIndex * bladeWidth);
    
    // Position de l'instance dans le monde
    vec4 worldPosition = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    
    // Distance de la caméra à ce brin d'herbe
    float distanceToCamera = distance(worldPosition.xyz, uCameraPosition);
    vDistance = distanceToCamera;
    
    // Effet de vent global (oscillation naturelle)
    float windWave = sin(uTime * 0.5 + worldPosition.x * 0.3 + worldPosition.z * 0.3) * 0.15;
    
    // Effet de bourrasque quand la caméra est proche
    float cameraInfluence = smoothstep(8.0, 0.0, distanceToCamera);
    
    // Direction depuis le brin vers la caméra
    vec3 directionFromCamera = normalize(worldPosition.xyz - uCameraPosition);
    
    // Application de la déformation
    vec3 pos = position;
    
    // L'herbe se penche seulement en haut (uv.y proche de 1)
    float bendFactor = uv.y; // 0 en bas (racines), 1 en haut
    
    // Combinaison : vent naturel + effet caméra (effet amplifié)
    float totalBend = (windWave * uWindStrength * 0.3) + (cameraInfluence * 2.5);
    
    // Appliquer la déformation
    pos.x += directionFromCamera.x * totalBend * bendFactor;
    pos.z += directionFromCamera.z * totalBend * bendFactor;
    
    // Légère courbure vers le bas quand très influencé
    pos.y -= cameraInfluence * bendFactor * 0.3;
    
    // Transformation finale
    vec4 modelPosition = instanceMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
}

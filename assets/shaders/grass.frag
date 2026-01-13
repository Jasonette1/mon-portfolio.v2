// Fragment Shader pour l'herbe textured
uniform sampler2D uMap;
uniform sampler2D uAlphaMap; // Optionnel si l'alpha est séparé
uniform vec3 uColorTop;
uniform vec3 uColorBottom;

varying vec2 vUv;
varying float vDistance;

void main() {
    // Échantillonnage de la texture (Atlas)
    vec4 textureColor = texture2D(uMap, vUv);
    vec4 alphaColor = texture2D(uAlphaMap, vUv);
    
    // Gestion de la transparence avec la map d'opacité
    // (Les fichiers JPG n'ont pas de transparence intégrée, on utilise le fichier Opacity)
    if (alphaColor.r < 0.5) discard;
    
    // On garde un peu de la logique couleur pour pouvoir teinter l'herbe si besoin
    // Mais on mixe fortement avec la texture
    // vec3 gradientColor = mix(uColorBottom, uColorTop, vUv.y);
    // vec3 finalColor = mix(gradientColor, textureColor.rgb, 0.8); // 80% texture, 20% teinte
    
    vec3 finalColor = textureColor.rgb;

    // Assombrir légèrement le bas des brins (vUv.y proche de 0) pour effet d'occlusion
    // Attention : comme vUv.x change par brin, vUv.y reste 0..1 verticalement
    // MAIS l'UV est maintenant transformé dans le Vertex, il faut espérer que y est intact. OUI.
    // wait vUv dans vertex est modifié sur X mais Y reste 0..1 de la géométrie originale ?
    // Non, "uv" vient de la géométrie. bladeGeometry est Plane(0..1, 0..1).
    // Donc vUv.y va bien de 0 (bas) à 1 (haut).
    
    finalColor *= mix(0.5, 1.0, vUv.y); // Bas plus sombre

    // Légère atténuation avec la distance (Fog)
    float fogFactor = smoothstep(30.0, 50.0, vDistance);
    vec3 fogColor = vec3(0.78, 0.87, 0.96);
    
    gl_FragColor = vec4(mix(finalColor, fogColor, fogFactor * 0.4), 1.0);
}

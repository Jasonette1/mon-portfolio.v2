uniform float uTime;
uniform float uPixelRatio;

attribute float aScale;

varying vec2 vUv;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Floating animation
    modelPosition.y += sin(uTime + modelPosition.x * 100.0) * aScale * 0.2;
    modelPosition.x += cos(uTime + modelPosition.z * 50.0) * aScale * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    
    // Size attenuation
    gl_PointSize = uPixelRatio * aScale * 100.0;
    gl_PointSize *= (1.0 / -viewPosition.z);
}

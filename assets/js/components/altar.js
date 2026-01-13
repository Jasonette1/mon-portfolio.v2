// Fonction pour créer l'autel en pierre au centre
function createAltar() {
    const altarGroup = new THREE.Group();

    // Matériau pierre vieillie (gris-beige comme sur les photos)
    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xa39e93,  // Beige-gris pierre
        roughness: 0.9,
        metalness: 0.0
    });

    // Base de l'autel (bloc rectangulaire)
    const baseGeometry = new THREE.BoxGeometry(3, 0.8, 1.5);
    const base = new THREE.Mesh(baseGeometry, stoneMaterial);
    base.position.y = 0.4;
    altarGroup.add(base);

    // Plateau supérieur (plus large)
    const topGeometry = new THREE.BoxGeometry(3.2, 0.15, 1.7);
    const top = new THREE.Mesh(topGeometry, stoneMaterial);
    top.position.y = 0.875;
    altarGroup.add(top);

    // Socle en bas
    const pedestalGeometry = new THREE.BoxGeometry(3.4, 0.2, 1.9);
    const pedestal = new THREE.Mesh(pedestalGeometry, stoneMaterial);
    pedestal.position.y = 0.1;
    altarGroup.add(pedestal);

    // Position au centre de la scène, sur le sol
    altarGroup.position.set(0, 0, 5);  // Légèrement devant pour être visible

    return altarGroup;
}

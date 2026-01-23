function createBackWall() {
    const wallGroup = new THREE.Group();

    // Matériau pierre identique à l'autel
    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xa39e93,
        roughness: 0.9,
        metalness: 0.0
    });

    // Matériau plus sombre pour les ombres et détails
    const darkStoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x8a8580,
        roughness: 0.95,
        metalness: 0.0
    });

    // PARTIE BASSE - Mur rectangulaire (22m large, 8m haut, 0.8m épais)
    const lowerWallGeometry = new THREE.BoxGeometry(22, 8, 0.8);
    const lowerWall = new THREE.Mesh(lowerWallGeometry, stoneMaterial);
    lowerWall.position.y = 4;  // Moitié de 8m
    lowerWall.castShadow = true;
    lowerWall.receiveShadow = true;
    wallGroup.add(lowerWall);

    // PIGNON - Partie triangulaire (forme de toit)
    // Créer un triangle extrudé
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-11, 0);      // Coin bas gauche
    gableShape.lineTo(11, 0);       // Coin bas droit  
    gableShape.lineTo(0, 6);        // Sommet (6m au-dessus = 14m total)
    gableShape.lineTo(-11, 0);      // Retour au début

    const extrudeSettings = {
        steps: 1,
        depth: 0.8,
        bevelEnabled: false
    };

    const gableGeometry = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);
    const gable = new THREE.Mesh(gableGeometry, stoneMaterial);
    gable.position.set(0, 8, -0.4);  // Au-dessus du mur bas, centré en Z
    gable.castShadow = true;
    gable.receiveShadow = true;
    wallGroup.add(gable);

    // ROSACE GOTHIQUE - Cercle ajouré au sommet
    const roseRadius = 2;
    const roseGeometry = new THREE.TorusGeometry(roseRadius, 0.15, 16, 32);
    const rose = new THREE.Mesh(roseGeometry, darkStoneMaterial);
    rose.position.set(0, 11, 0.05);  // Centré, proche du sommet
    rose.rotation.y = Math.PI / 2;   // Perpendiculaire au mur
    rose.castShadow = true;
    wallGroup.add(rose);

    // Motif de rosace - rayons
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rayGeometry = new THREE.BoxGeometry(0.1, roseRadius * 2, 0.1);
        const ray = new THREE.Mesh(rayGeometry, darkStoneMaterial);
        ray.position.set(0, 11, 0.05);
        ray.rotation.z = angle;
        ray.rotation.y = Math.PI / 2;
        wallGroup.add(ray);
    }

    // Position du mur entier - derrière l'autel
    wallGroup.position.set(0, 0, 32);  // Derrière l'autel qui est à z=25

    return wallGroup;
}

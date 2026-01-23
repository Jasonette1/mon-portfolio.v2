/**
 * MY DESK - Reproduction of User's Actual Setup
 * Acer 27" Curved (Concave 1800R), Iiyama 24", Razer KB, Pulsar Mouse, Corsair Tower
 */

import * as THREE from 'three';

export function createLainDesk() {
    const setupGroup = new THREE.Group();

    // ===== MATERIALS =====
    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.6,
        metalness: 0.2
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.5,
        metalness: 0.6
    });

    const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        roughness: 0.4,
        metalness: 0.1
    });

    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.1,
        metalness: 0.9,
        side: THREE.DoubleSide
    });

    // ===== 1. ACER 27" CURVED MONITOR (CENTRE) =====
    const acerGroup = new THREE.Group();
    acerGroup.position.set(0, 0, 0);

    // ╔════════════════════════════════════════════════════════════╗
    // ║  ROTATION 180° - NE JAMAIS MODIFIER CETTE LIGNE !         ║
    // ║  Cette rotation fait face à l'utilisateur.                ║
    // ║  Toute modification cassera l'orientation de l'écran.     ║
    // ╚════════════════════════════════════════════════════════════╝
    acerGroup.rotation.y = Math.PI;

    const acerW = 0.60;
    const acerH = 0.36;
    const acerD = 0.05;

    // === PIED EN Y (BOOMERANG) - BASE AU SOL ===
    // Géométrie précise pour éliminer tout décalage visuel

    const standMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9,
        metalness: 0.1
    });

    // Dimensions de la base
    const baseHeight = 0.015;
    const baseTopY = baseHeight; // Haut de la base = 0.015m

    // Centre de jonction (au milieu, légèrement allongé vers l'arrière pour accueillir le tronc)
    const centerLength = 0.10; // Plus long pour couvrir la zone du tronc
    const centerGeo = new THREE.BoxGeometry(0.05, baseHeight, centerLength);
    const center = new THREE.Mesh(centerGeo, standMat);
    center.position.set(0, baseHeight / 2, -0.01); // Légèrement décalé vers l'arrière
    center.castShadow = true;
    center.receiveShadow = true;
    acerGroup.add(center);

    // Branches en Y (partent du centre vers l'avant)
    const armGeo = new THREE.BoxGeometry(0.18, baseHeight, 0.035);

    const armL = new THREE.Mesh(armGeo, standMat);
    armL.rotation.y = Math.PI / 4.5;
    armL.position.set(-0.07, baseHeight / 2, 0.04);
    armL.castShadow = true;
    armL.receiveShadow = true;
    acerGroup.add(armL);

    const armR = new THREE.Mesh(armGeo, standMat);
    armR.rotation.y = -Math.PI / 4.5;
    armR.position.set(0.07, baseHeight / 2, 0.04);
    armR.castShadow = true;
    armR.receiveShadow = true;
    acerGroup.add(armR);

    // === TRONC VERTICAL ===
    // Le tronc part de l'arrière du centre de jonction et monte jusqu'au hub

    const trunkZ = -0.04; // Arrière de la jonction centrale (centerZ - centerLength/2 + marge)
    const monitorY = 0.09 + 0.36 / 2; // = 0.27m - centre de l'écran
    const trunkH = monitorY - baseHeight + 0.02; // De la base jusqu'au hub avec chevauchement
    const trunkBaseY = baseHeight - 0.005; // 5mm de chevauchement dans la base
    const trunkCenterY = trunkBaseY + trunkH / 2;

    const trunkGeo = new THREE.CylinderGeometry(0.025, 0.025, trunkH, 32);
    const trunk = new THREE.Mesh(trunkGeo, standMat);
    trunk.position.set(0, trunkCenterY, trunkZ);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    acerGroup.add(trunk);

    // Position Z du dos de l'écran (pour le hub)
    const backZ = -0.05;

    // === ÉCRAN INCURVÉ (CONCAVE 1800R) ===

    const curveRadius = 1.8;
    const screenWidth = acerW - 0.015;
    const screenHeight = acerH - 0.03;
    const arcAngle = screenWidth / curveRadius;

    const cylinderCenterZ = curveRadius;
    const clearance = 0.09;
    // monitorY déjà défini plus haut (= 0.27)

    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, monitorY, cylinderCenterZ);
    acerGroup.add(screenGroup);

    // 1. Surface de l'écran
    const screenGeo = new THREE.CylinderGeometry(
        curveRadius, curveRadius, screenHeight,
        64, 1, true,
        Math.PI - arcAngle / 2, arcAngle
    );
    const smoothScreen = new THREE.Mesh(screenGeo, screenMat);
    smoothScreen.scale.set(-1, 1, 1);
    screenGroup.add(smoothScreen);

    // 2. Boîtier arrière
    const housingRadius = curveRadius + acerD;
    const backGeo = new THREE.CylinderGeometry(
        housingRadius, housingRadius, acerH,
        64, 1, true,
        Math.PI - arcAngle / 2 - 0.02, arcAngle + 0.04
    );
    const backHousing = new THREE.Mesh(backGeo, blackMat);
    screenGroup.add(backHousing);

    // 3. Cadre (bezel) et menton
    const chinH = 0.025;
    const bezelRadius = curveRadius - 0.004;

    const frontChinGeo = new THREE.CylinderGeometry(
        bezelRadius, bezelRadius, chinH,
        64, 1, true,
        Math.PI - arcAngle / 2 - 0.005, arcAngle + 0.01
    );
    const frontChin = new THREE.Mesh(frontChinGeo, blackMat);
    frontChin.scale.set(-1, 1, 1);
    frontChin.position.y = -acerH / 2 + chinH / 2;
    screenGroup.add(frontChin);

    const topBezelGeo = new THREE.CylinderGeometry(
        bezelRadius, bezelRadius, 0.005,
        64, 1, true,
        Math.PI - arcAngle / 2 - 0.005, arcAngle + 0.01
    );
    const topBezel = new THREE.Mesh(topBezelGeo, blackMat);
    topBezel.scale.set(-1, 1, 1);
    topBezel.position.y = acerH / 2 - 0.0025;
    screenGroup.add(topBezel);

    // 4. Logo Acer
    const logoR = bezelRadius - 0.001;
    const logoGeoCurve = new THREE.CylinderGeometry(
        logoR, logoR, 0.008,
        16, 1, true,
        Math.PI - 0.02, 0.04
    );
    const logoMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const logo = new THREE.Mesh(logoGeoCurve, logoMat);
    logo.scale.set(-1, 1, 1);
    logo.position.y = -acerH / 2 + chinH / 2;
    screenGroup.add(logo);

    // === MOYEU DE CONNEXION (HUB) ===
    // Point d'attache entre le tronc et l'écran, à l'arrière du boîtier

    const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.025, 32);
    const hub = new THREE.Mesh(hubGeo, standMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, monitorY, backZ - 0.015);
    hub.castShadow = true;
    hub.receiveShadow = true;
    acerGroup.add(hub);

    setupGroup.add(acerGroup);


    // ===== 2. IIYAMA PROLITE PL2491H 24" (DROITE) =====
    const iiyamaGroup = new THREE.Group();
    iiyamaGroup.position.set(0.51, 0, -0.17); // (0.51, 0, -0.17)

    // ╔════════════════════════════════════════════════════════════╗
    // ║  ROTATION 180° - NE JAMAIS MODIFIER CETTE LIGNE !         ║
    // ║  Cette rotation fait face à l'utilisateur.                ║
    // ║  Angle supplémentaire appliqué après.                     ║
    // ╚════════════════════════════════════════════════════════════╝
    iiyamaGroup.rotation.y = Math.PI + (5 * Math.PI / 18); // 180° + 50° = 230°

    // Dimensions réelles Iiyama 24"
    const iiW = 0.53;  // 53cm largeur
    const iiH = 0.30;  // 30cm hauteur
    const iiD = 0.045; // 4.5cm profondeur

    // === PIED IIYAMA (MÉTHODE ACER) ===
    // Base allongée + Tronc qui chevauche

    const iiStandMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.85,
        metalness: 0.15
    });

    // Dimensions de la base (RÉDUITE)
    const iiBaseH = 0.012;
    const iiBaseTopY = iiBaseH;

    // Base rectangulaire plus petite
    const iiBaseLength = 0.12; // Réduit de 0.18 à 0.12
    const iiBaseGeo = new THREE.BoxGeometry(0.14, iiBaseH, iiBaseLength); // Réduit de 0.20 à 0.14
    const iiBase = new THREE.Mesh(iiBaseGeo, iiStandMat);
    iiBase.position.set(0, iiBaseH / 2, -0.01);
    iiBase.castShadow = true;
    iiBase.receiveShadow = true;
    iiyamaGroup.add(iiBase);

    // Tronc vertical (col) - plus fin
    const iiNeckZ = -0.04; // Ajusté pour la base plus petite
    const iiMonitorY = iiBaseH + 0.08 + 0.02; // Hauteur encore réduite
    const iiNeckH = iiMonitorY + iiH / 2 - iiBaseH + 0.02;
    const iiNeckBaseY = iiBaseH - 0.004;
    const iiNeckCenterY = iiNeckBaseY + iiNeckH / 2;

    const iiNeckR = 0.014; // Réduit de 0.018 à 0.014
    const iiNeckGeo = new THREE.CylinderGeometry(iiNeckR, iiNeckR, iiNeckH, 32);
    const iiNeck = new THREE.Mesh(iiNeckGeo, iiStandMat);
    iiNeck.position.set(0, iiNeckCenterY, iiNeckZ);
    iiNeck.castShadow = true;
    iiNeck.receiveShadow = true;
    iiyamaGroup.add(iiNeck);

    // Hub de connexion écran
    const iiScreenY = iiMonitorY; // Position bas écran
    const iiHubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 24);
    const iiHub = new THREE.Mesh(iiHubGeo, iiStandMat);
    iiHub.rotation.x = Math.PI / 2;
    iiHub.position.set(0, iiScreenY + iiH / 2, -iiD / 2 - 0.01);
    iiHub.castShadow = true;
    iiHub.receiveShadow = true;
    iiyamaGroup.add(iiHub);

    // === BOÎTIER ET ÉCRAN ===

    const iiHousingMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.2
    });

    // Boîtier arrière
    const iiHousingGeo = new THREE.BoxGeometry(iiW, iiH, iiD);
    const iiHousing = new THREE.Mesh(iiHousingGeo, iiHousingMat);
    iiHousing.position.set(0, iiScreenY + iiH / 2, 0);
    iiHousing.castShadow = true;
    iiHousing.receiveShadow = true;
    iiyamaGroup.add(iiHousing);

    // Surface écran
    const iiScreenGeo = new THREE.PlaneGeometry(iiW - 0.015, iiH - 0.015);
    const iiScreen = new THREE.Mesh(iiScreenGeo, screenMat);
    iiScreen.position.set(0, iiScreenY + iiH / 2, iiD / 2 + 0.001);
    iiyamaGroup.add(iiScreen);

    // === CADRES (BEZELS) ===

    const iiBezelMat = new THREE.MeshStandardMaterial({
        color: 0x0f0f0f,
        roughness: 0.8,
        metalness: 0.1
    });

    const iiBezelThickness = 0.008;

    // Cadre haut
    const iiTopBezelGeo = new THREE.BoxGeometry(iiW, iiBezelThickness, 0.003);
    const iiTopBezel = new THREE.Mesh(iiTopBezelGeo, iiBezelMat);
    iiTopBezel.position.set(0, iiScreenY + iiH - iiBezelThickness / 2, iiD / 2 + 0.002);
    iiyamaGroup.add(iiTopBezel);

    // Cadre bas (chin)
    const iiBotBezelGeo = new THREE.BoxGeometry(iiW, iiBezelThickness, 0.003);
    const iiBotBezel = new THREE.Mesh(iiBotBezelGeo, iiBezelMat);
    iiBotBezel.position.set(0, iiScreenY + iiBezelThickness / 2, iiD / 2 + 0.002);
    iiyamaGroup.add(iiBotBezel);

    // Cadre gauche
    const iiLeftBezelGeo = new THREE.BoxGeometry(iiBezelThickness, iiH - 2 * iiBezelThickness, 0.003);
    const iiLeftBezel = new THREE.Mesh(iiLeftBezelGeo, iiBezelMat);
    iiLeftBezel.position.set(-iiW / 2 + iiBezelThickness / 2, iiScreenY + iiH / 2, iiD / 2 + 0.002);
    iiyamaGroup.add(iiLeftBezel);

    // Cadre droit
    const iiRightBezelGeo = new THREE.BoxGeometry(iiBezelThickness, iiH - 2 * iiBezelThickness, 0.003);
    const iiRightBezel = new THREE.Mesh(iiRightBezelGeo, iiBezelMat);
    iiRightBezel.position.set(iiW / 2 - iiBezelThickness / 2, iiScreenY + iiH / 2, iiD / 2 + 0.002);
    iiyamaGroup.add(iiRightBezel);

    // Logo iiyama (petit rectangle gris)
    const iiLogoGeo = new THREE.BoxGeometry(0.04, 0.006, 0.002);
    const iiLogoMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const iiLogo = new THREE.Mesh(iiLogoGeo, iiLogoMat);
    iiLogo.position.set(0, iiScreenY + iiBezelThickness / 2, iiD / 2 + 0.003);
    iiyamaGroup.add(iiLogo);

    setupGroup.add(iiyamaGroup);


    // ===== 3. CORSAIR 4000D AIRFLOW (DROITE ARRIÈRE) =====
    const towerGroup = new THREE.Group();
    towerGroup.position.set(0.85, 0, 0.35);
    towerGroup.rotation.y = -Math.PI / 10; // ~18°

    // Dimensions Corsair 4000D
    const caseH = 0.466; // 466mm
    const caseW = 0.230; // 230mm
    const caseD = 0.453; // 453mm
    const feetH = 0.025; // Pieds surélevés

    // Matériaux
    const caseBlackMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.7,
        metalness: 0.3
    });

    const meshMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.9,
        metalness: 0.1,
        // side: THREE.DoubleSide
    });

    // 1. Châssis principal (Corps)
    const bodyH = caseH - feetH;
    const bodyGeo = new THREE.BoxGeometry(caseW, bodyH, caseD);
    const body = new THREE.Mesh(bodyGeo, caseBlackMat);
    body.position.y = feetH + bodyH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    towerGroup.add(body);

    // 2. Pieds (4 coins)
    const footGeo = new THREE.BoxGeometry(0.04, feetH, 0.04);
    const footPos = [
        { x: -caseW / 2 + 0.03, z: -caseD / 2 + 0.03 },
        { x: caseW / 2 - 0.03, z: -caseD / 2 + 0.03 },
        { x: -caseW / 2 + 0.03, z: caseD / 2 - 0.03 },
        { x: caseW / 2 - 0.03, z: caseD / 2 - 0.03 }
    ];

    footPos.forEach(pos => {
        const foot = new THREE.Mesh(footGeo, caseBlackMat);
        foot.position.set(pos.x, feetH / 2, pos.z);
        foot.castShadow = true;
        foot.receiveShadow = true;
        towerGroup.add(foot);
    });

    // 3. Façade Avant (Airflow)
    // Cadre
    const frontFrameGeo = new THREE.BoxGeometry(caseW, bodyH - 0.005, 0.03);
    const frontFrame = new THREE.Mesh(frontFrameGeo, caseBlackMat);
    frontFrame.position.set(0, feetH + bodyH / 2, -caseD / 2 - 0.015);
    towerGroup.add(frontFrame);

    // Grille Mesh (Insert au milieu de la façade)
    const frontMeshGeo = new THREE.BoxGeometry(caseW - 0.04, bodyH - 0.04, 0.01);
    const frontMesh = new THREE.Mesh(frontMeshGeo, meshMat);
    frontMesh.position.set(0, feetH + bodyH / 2, -caseD / 2 - 0.035); // Légèrement devant le cadre
    towerGroup.add(frontMesh);

    // 4. Panneau Latéral Gauche (Verre Trempé)
    // Le panneau est sur le côté GAUCHE si on regarde de face, donc à "-caseW/2"

    // Cadre du verre (Bordures noires)
    const glassFrameGeo = new THREE.PlaneGeometry(caseD, bodyH);
    // On utilise une texture ou un matériau différent pour le cadre si on veut, 
    // mais ici on va simuler le cadre avec un Plane légèrement plus grand derrière ou juste le verre teinté.
    // Pour faire simple et propre : Verre Teinté Sombre.

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x050505, // Verre teinté très sombre
        transparent: true,
        opacity: 0.6,    // Assez opaque pour masquer le vide, assez transparent pour l'effet verre
        roughness: 0.0,
        metalness: 0.9,  // Reflets
        clearcoat: 1.0,
        clearcoatRoughness: 0.0
    });

    const glassPanel = new THREE.Mesh(glassFrameGeo, glassMat);
    // Positionné sur le flanc gauche (vers l'intérieur du bureau)
    glassPanel.position.set(-caseW / 2 - 0.002, feetH + bodyH / 2, 0);
    glassPanel.rotation.y = -Math.PI / 2;
    towerGroup.add(glassPanel);

    // Vis de fixation du verre (4 coins)
    const screwGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.005, 12);
    const screwMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const screwPos = [
        { y: feetH + bodyH - 0.03, z: -caseD / 2 + 0.03 },
        { y: feetH + bodyH - 0.03, z: caseD / 2 - 0.03 },
        { y: feetH + 0.03, z: -caseD / 2 + 0.03 },
        { y: feetH + 0.03, z: caseD / 2 - 0.03 }
    ];

    screwPos.forEach(pos => {
        const screw = new THREE.Mesh(screwGeo, screwMat);
        screw.rotation.z = Math.PI / 2;
        screw.position.set(-caseW / 2 - 0.005, pos.y, pos.z);
        towerGroup.add(screw);
    });

    setupGroup.add(towerGroup);


    // ===== 4. CLAVIER RAZER BLACKWIDOW V3 MINI (REFONTE TOTALE) =====
    // Concept : Layout 65% Compact, Touches Flottantes, RGB subtil
    const kbGroup = new THREE.Group();
    kbGroup.position.set(0, 0, -0.35);
    // Inclinaison globale du clavier (Wedge shape + pieds)
    // Pente positive : L'arrière (Z-) est plus haut que l'avant (Z+)
    kbGroup.rotation.x = 0.13; // ~7.5 deg (augmenté pour plus d'inclinaison)
    kbGroup.rotation.y = Math.PI; // 180° - Barre espace face caméra

    // A. CHÂSSIS (Base block)
    const kbW = 0.32;   // 32cm
    const kbD = 0.11;   // 11cm
    const kbH = 0.022;  // 2.2cm (Assez épais pour la base)

    const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x050505, // Presque noir
        roughness: 0.7,
        metalness: 0.5
    });

    const chassisGeo = new THREE.BoxGeometry(kbW, kbH, kbD);
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    // On pose le chassis de sorte que le haut soit à Y = kbH
    chassis.position.y = kbH / 2;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    kbGroup.add(chassis);

    // B. TOUCHES (Floating Keys Design)
    // Paramètres
    const uSize = 0.018;     // 1.8cm par touche
    const gap = 0.001;       // Espace
    const capHeight = 0.007; // Hauteur du keycap
    const stemHeight = 0.004; // Hauteur du switch (tige visible)

    // Position verticale
    // Surface Châssis = kbH
    // Switch Stem démarre à kbH
    // Keycap démarre à kbH + stemHeight
    const stemY = kbH + stemHeight / 2;
    const capY = kbH + stemHeight + capHeight / 2;

    // Matériaux - NOUVELLE APPROCHE : Keycaps noirs + underglow RGB
    const keyMat = new THREE.MeshStandardMaterial({
        color: 0x151515, // Gris très foncé uniforme
        roughness: 0.55,
        metalness: 0.25,
        flatShading: false // Assure un rendu lisse
    });

    const stemMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.5
    });

    // Matériau pour les plans lumineux (underglow RGB)
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.55, // Augmenté pour meilleure visibilité
        side: THREE.DoubleSide,
        depthWrite: false // Important pour transparence
    });

    // Géométries
    const maxKeys = 80;
    const capGeo = new THREE.BoxGeometry(uSize, capHeight, uSize);
    const stemGeo = new THREE.BoxGeometry(uSize * 0.6, stemHeight, uSize * 0.6);

    // Plan horizontal pour le glow (sous chaque touche)
    const glowSize = uSize * 0.85;
    const glowGeo = new THREE.PlaneGeometry(glowSize, glowSize);

    const instancedCaps = new THREE.InstancedMesh(capGeo, keyMat, maxKeys);
    const instancedStems = new THREE.InstancedMesh(stemGeo, stemMat, maxKeys);
    const instancedGlows = new THREE.InstancedMesh(glowGeo, glowMat, maxKeys);

    instancedCaps.castShadow = true;
    instancedStems.castShadow = true;

    // Activer les couleurs par instance pour les glows RGB uniquement
    instancedGlows.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(maxKeys * 3), 3
    );

    kbGroup.add(instancedCaps);
    kbGroup.add(instancedStems);
    kbGroup.add(instancedGlows);

    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();
    let idx = 0;

    // Fonction Helper ajout touche
    // Row 0 = Back (Chiffres), Row 4 = Front (Space)
    // Z coords: -kbD/2 (Back) -> +kbD/2 (Front)
    // Centrage vertical : (rows * uTotal) / 2

    const uStep = uSize + gap;
    const gridH = 5 * uStep;
    const gridW = 15 * uStep; // Approx 65% width

    // Points de départ (Coin arrière-gauche du layout)
    const startX = -kbW / 2 + 0.01; // Petite marge gauche
    const startZ = -kbD / 2 + 0.015; // Marge arrière

    // Définition complète du layout 65% (Razer Blackwidow V3 Mini)
    // Format: [width_in_units, ...] pour chaque rangée
    // Row numbering: 0 (Top/Numbers) -> 4 (Bottom/Space)

    const layoutDef = [
        // R0: Esc + Chiffres (1-=) + Backspace(2u) + Del = 16u total
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
        // R1: Tab(1.5u) + QWERTY + Backslash(1.5u) + PgUp = 16u
        [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1],
        // R2: Caps(1.75u) + ASDF + Enter(2.25u) + PgDn = 16u
        [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1],
        // R3: LShift(2.25u) + ZXCV + RShift(2.75u) + Up = 16u
        [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, 1],
        // R4: Ctrl(1.25) Win(1.25) Alt(1.25) Space(6.25) Fn(1.5) Ctrl(1.5) + Left Down Right = 16u
        [1.25, 1.25, 1.25, 6.25, 1.5, 1.5, 1, 1, 1]
    ];

    // Helper: Créer une touche (Cap + Stem)
    function createKey(x, z, width) {
        const keyW = uSize * width - gap;


        // Calculer la couleur RGB basée sur la position X (arc-en-ciel horizontal)
        const xNorm = (x - startX) / (kbW - 0.02);
        const hue = xNorm * 0.85;
        tempColor.setHSL(hue, 1.0, 0.5);

        // Position Y du glow (entre chassis et keycap)
        const glowY = kbH + stemHeight * 0.75;

        if (width === 1) {
            // Touche 1u
            // Keycap (noir, pas de RGB)
            dummy.position.set(x, capY, z);
            dummy.updateMatrix();
            instancedCaps.setMatrixAt(idx, dummy.matrix);

            // Stem
            dummy.position.set(x, stemY, z);
            dummy.updateMatrix();
            instancedStems.setMatrixAt(idx, dummy.matrix);

            // Glow RGB (plan horizontal sous la touche)
            dummy.position.set(x, glowY, z);
            dummy.rotation.set(-Math.PI / 2, 0, 0); // Plan horizontal
            dummy.updateMatrix();
            instancedGlows.setMatrixAt(idx, dummy.matrix);
            instancedGlows.setColorAt(idx, tempColor);

            // Réinitialiser la rotation pour éviter qu'elle affecte les prochaines touches
            dummy.rotation.set(0, 0, 0);

            idx++;
        } else {
            // Touche large
            // Keycap (noir)
            const largeCap = new THREE.Mesh(
                new THREE.BoxGeometry(keyW, capHeight, uSize),
                keyMat
            );
            largeCap.position.set(x, capY, z);
            largeCap.castShadow = true;
            largeCap.receiveShadow = true;
            kbGroup.add(largeCap);

            // Stem
            const largeStem = new THREE.Mesh(
                new THREE.BoxGeometry(keyW * 0.6, stemHeight, uSize * 0.6),
                stemMat
            );
            largeStem.position.set(x, stemY, z);
            kbGroup.add(largeStem);

            // Glow RGB (plan custom pour largeur de touche)
            const largeGlowMat = glowMat.clone();
            largeGlowMat.color.copy(tempColor);
            const largeGlow = new THREE.Mesh(
                new THREE.PlaneGeometry(keyW * 0.9, glowSize),
                largeGlowMat
            );
            largeGlow.position.set(x, glowY, z);
            largeGlow.rotation.x = -Math.PI / 2;
            kbGroup.add(largeGlow);
        }
    }

    // Génération de toutes les rangées
    layoutDef.forEach((rowKeys, rowIdx) => {
        const z = startZ + rowIdx * uStep;
        let currentX = startX;

        rowKeys.forEach(keyWidth => {
            // Position X au centre de la touche
            const keyCenter = currentX + (uSize * keyWidth) / 2;
            createKey(keyCenter, z, keyWidth);

            // Avancer le curseur X
            currentX += uSize * keyWidth + gap;
        });
    });

    setupGroup.add(kbGroup);


    // ===== 5. SOURIS PULSAR ZYWOO (BLANCHE) =====
    const mouseGroup = new THREE.Group();
    mouseGroup.position.set(-0.30, 0, -0.35);
    mouseGroup.rotation.y = Math.PI; // 180° - face à l'utilisateur

    // Matériau blanc mat
    const mouseMat = new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.5,
        metalness: 0.1
    });

    // Dimensions réelles Pulsar ZywOo
    const mW = 0.063;   // 6.3cm largeur
    const mL = 0.115;   // 11.5cm longueur
    const mH = 0.026;   // 2.6cm hauteur corps

    // === FORME SIMPLIFIÉE (2 pièces) ===



    // Forme bombée (ellipsoïde via sphère étirée)
    const sphereR = 0.032;
    const mouseBodyGeo = new THREE.SphereGeometry(sphereR, 24, 16);
    mouseBodyGeo.scale(mW / (sphereR * 2), (mH * 1.5) / (sphereR * 2), mL / (sphereR * 2.05));

    const mouseBody = new THREE.Mesh(mouseBodyGeo, mouseMat);
    mouseBody.position.set(0, mH * 0.75, 0);
    mouseBody.castShadow = true;
    mouseBody.receiveShadow = true;
    mouseGroup.add(mouseBody);




    // === INDICATEUR DE BATTERIE (trait pink à l'extrémité nord) ===
    const batteryGeo = new THREE.BoxGeometry(0.004, 0.008, 0.003);
    const batteryMat = new THREE.MeshBasicMaterial({
        color: 0xff1a5a // Rose vif, pas besoin d'emissive pour BasicMaterial
    });
    const batteryInd = new THREE.Mesh(batteryGeo, batteryMat);
    // Positionné sur la surface courbe (Y calculé selon Z)
    batteryInd.position.set(0, mH * 1.36, -mL * 0.28);
    mouseGroup.add(batteryInd);

    // === MOLETTE (centrée, en retrait de l'indicateur) ===
    const wheelR = 0.003;
    const wheelW = 0.009;
    const wheelGeo = new THREE.CylinderGeometry(wheelR, wheelR, wheelW, 16);
    const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.65,
        metalness: 0.3
    });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    // Position sur la courbure (plus haut car plus centré)
    wheel.position.set(0, mH * 1.43, -mL * 0.20);
    wheel.rotation.x = Math.PI / 2;
    wheel.castShadow = true;
    mouseGroup.add(wheel);


    // === CONTOURS DES BOUTONS (lignes courbes comme la vraie souris) ===




    // === LIGNE CENTRALE SÉPARATION BOUTONS ===
    const lineMat = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.95
    });
    const centerLineGeo = new THREE.BoxGeometry(0.0015, mH * 0.10, mL * 0.20);
    const centerLine = new THREE.Mesh(centerLineGeo, lineMat);
    centerLine.position.set(0, mH * 1.45, -mL * 0.12);
    mouseGroup.add(centerLine);




    setupGroup.add(mouseGroup);


    return setupGroup;
}

# Édu - Lassiaz Youen

<div align="center">

![Build Status](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge&logo=github)
![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3-orange?style=for-the-badge&logo=html5)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> **Projet réalisé en "Vibe Coding"** : 95% du code a été généré avec l'assistance de l'agent **Google Antigravity** et du modèle **Gemini Pro 3**, offerte via GitHub Student Developer Pack ainsi que du programme Student de Google. Je me suis réservé la séléction des idées et de la rédaction des paragraphes plus personnels. Bonne découverte à vous.

[Voir le Portfolio en ligne](https://lassiazyouen.page)

</div>

---

## À propos

Bienvenue sur le dépôt source de mon portfolio personnel. Ce projet est une vitrine interactive conçue pour présenter mon parcours d'étudiant en Sciences de l'Éducation, mes compétences quelles qu'elles soient et mes projets annexes.

Il sert de CV en ligne dynamique et de plateforme de partage via un ***"Livre d'Or"*** intégré.

## Architecture & Technologies

Ce projet est conçu comme un site statique moderne, privilégiant la performance et la simplicité, sans framework lourd.

*   **Core** : HTML5 sémantique, CSS3 (Variables, Flexbox/Grid), JavaScript (ES6+ Vanilla).
*   **3D / WebGL** : Three.js pour l'expérience du Musée virtuel.
*   **Assets** : FontAwesome 6 (Icônes).
*   **Backend (Livre d'Or)** : Google Firebase (Firestore) pour la persistance des messages en temps réel.
*   **Infrastructure** :
    *   Hébergé sur **GitHub Pages**.
    *   Domaine personnalisé : `lassiazyouen.page` fourni par Name.com

## Installation & Développement Local

Bien que ce soit un site statique, voici comment récupérer et tester le projet sur votre machine :

```bash
# 1. Cloner le dépôt
git clone https://github.com/Jasonette1/V2.git

# 2. Accéder au dossier
cd V2

# 3. Ouvrir le projet
# Vous pouvez simplement ouvrir index.html dans votre navigateur
# OU utiliser une extension comme "Live Server" sur VS Code pour une meilleure expérience (recommandé pour les modules JS).
```

## Structure du Projet

Voici un aperçu de l'organisation des fichiers sources :

```plaintext
/
├── assets/
│   ├── css/           # Feuilles de style (main.css, portal.css, musee.css)
│   ├── js/            # Scripts principaux (main.js, portal.js, guestbook.js...)
│   │   ├── libs/      # Bibliothèques externes (Three.js, OrbitControls)
│   │   └── components/# Composants modulaires (3D objects, logic)
│   ├── icons/         # Favicons et manifestes PWA
│   ├── img/           # Images du site et textures 3D
│   ├── shaders/       # Shaders WebGL (GLSL)
│   └── fonts/         # Polices personnalisées
├── index.html         # Page d'accueil principale (CV, Compétences)
├── perso.html         # Index personnel (Interface style Portal)
├── sites.html         # Collection de sites utiles (avec moteur physique)
├── ascii.html         # Galerie d'Art ASCII
├── musee.html         # Expérience 3D interactive (Temple/Musée)
└── README.md          # Documentation du projet
```

## Fonctionnalités Clés

*   **Mode Public / Privé** : Gestion de messages publics ou privés dans le Livre d'Or.
*   **Interface Portal** : Design rétro-futuriste inspiré du jeu Portal pour la section personnelle.
*   **Musée 3D** : Une scène 3D interactive (Three.js) avec gestion de la lumière, shaders personnalisés (herbe, lucioles) et caméras dynamiques.
*   **Physique 2D** : Utilisation de Matter.js sur la page `sites.html` pour des interactions ludiques avec les icônes.

## Auteur

**Youen Lassiaz**
*   Étudiant en Sciences de l'Éducation & Interessé par les nouvelles technologies.
*   [Profil GitHub (@Jasonette1)](https://github.com/Jasonette1)
*   [LinkedIn](https://www.linkedin.com/in/youenlassiaz-education/)

---
<div align="center">
    <small>Fait avec coeur, c'est avant tout une expérimentation gratuite et un side-project qui m'a un peu occupé. Merci pour votre attention.</small>
</div>

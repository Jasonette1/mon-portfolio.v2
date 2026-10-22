# Édu - Lassiaz Youen

<div align="center">

![Stack : HTML, CSS, JavaScript, Three.js, Matter.js, Firebase](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JavaScript%20%7C%20Three.js%20%7C%20Matter.js%20%7C%20Firebase-orange?style=for-the-badge&logo=html5)
[![Code sous licence MIT](https://img.shields.io/badge/Code-MIT-blue?style=for-the-badge)](LICENSE)
[![Créations sous licence CC BY-NC 4.0](https://img.shields.io/badge/Cr%C3%A9ations-CC%20BY--NC%204.0-lightgrey?style=for-the-badge&logo=creativecommons)](https://creativecommons.org/licenses/by-nc/4.0/deed.fr)

> **Projet réalisé en "Vibe Coding"** : 95% du code a été généré avec l'assistance de l'agent **Google Antigravity** et du modèle **Gemini Pro 3**, offerte via GitHub Student Developer Pack ainsi que du programme Student de Google. Je me suis réservé la sélection des idées et de la rédaction des paragraphes plus personnels. Bonne découverte à vous.

> **Octobre 2026, la reprise** : les lignes ci-dessus datent de janvier 2026. Le site est ensuite resté en pause jusqu'en octobre 2026, où je l'ai repris avec l'agent **Hermes** (Nous Research) et le modèle **Claude** (Anthropic), qui écrivent depuis l'essentiel du nouveau code. Le partage ne change pas : les idées, les textes personnels et le dernier mot sur tout ce qui se voit me reviennent.

[Voir le Portfolio en ligne](https://lassiazyouen.page)

</div>

---

## À propos

Bienvenue sur le dépôt source de mon portfolio personnel. Ce projet est une vitrine interactive conçue pour présenter mon parcours d'étudiant en Sciences de l'Éducation, mes compétences quelles qu'elles soient et mes projets annexes.

Il sert de CV en ligne dynamique et de plateforme de partage via un ***"Livre d'Or"*** intégré.

À côté de cette vitrine vivent des pages plus personnelles : un index à la manière des vieux terminaux de *Portal*, une archive d'art ASCII, une collection de sites utiles et un musée en 3D.

## Historique

*   **11 février 2025** : première version en ligne connue, l'accueil seul, publiée sur Netlify.
*   **26 décembre 2025** : dernière version publiée sur Netlify, avec le livre d'or et les premières pages personnelles.
*   **2 janvier 2026** : création de ce dépôt ; le site passe sur GitHub Pages, à l'adresse [lassiazyouen.page](https://lassiazyouen.page).
*   **Janvier 2026** : construction du musée 3D et de la page *Portal* avec [Google Antigravity](https://antigravity.google/) et Gemini Pro 3.
*   **De janvier à octobre 2026** : pause.
*   **Octobre 2026** : reprise avec [Hermes](https://hermes-agent.nousresearch.com/) (Nous Research) et [Claude](https://www.anthropic.com/claude) (Anthropic) : l'ordinateur de l'autel du musée, le ménage dans le code, les polices et les bibliothèques rapatriées dans le site, le livre d'or ouvert en mode privé, ce README et les licences. L'ancienne adresse Netlify renvoie désormais vers lassiazyouen.page.

## Architecture & Technologies

Ce projet est conçu comme un site statique moderne, privilégiant la performance et la simplicité, sans framework lourd. Il n'a aucune étape de compilation : les fichiers du dépôt sont exactement ceux que sert le site.

*   **Core** : HTML5 sémantique, CSS3 (Variables, Flexbox/Grid), JavaScript (ES6+ Vanilla).
*   **3D / WebGL** : Three.js (r170, hébergé dans `assets/js/libs/` avec ses compléments `RectAreaLight`) pour l'expérience du Musée virtuel, et des shaders GLSL (`assets/shaders/`).
*   **Physique 2D** : Matter.js 0.19.0, hébergé dans `assets/js/libs/`, pour la page des sites utiles.
*   **Polices** : celles des pages personnelles et du musée sont hébergées dans `assets/fonts/`, avec leurs licences ; l'accueil utilise les polices du système.
*   **Assets** : FontAwesome 6.0.0 (icônes de l'accueil, chargées depuis cdnjs).
*   **Backend (Livre d'Or)** : Google Firebase (Firestore) pour la persistance des messages en temps réel, avec le SDK web 10.7.1 chargé depuis gstatic.com.
*   **Infrastructure** :
    *   Hébergé sur **GitHub Pages**.
    *   Domaine personnalisé : `lassiazyouen.page` fourni par Name.com.

## Installation & Développement Local

Bien que ce soit un site statique, voici comment récupérer et tester le projet sur votre machine (il faut [Git](https://git-scm.com/) et [Python 3](https://www.python.org/)) :

```bash
# 1. Cloner le dépôt (environ 62 Mo à télécharger, surtout les textures du musée)
git clone https://github.com/Jasonette1/mon-portfolio.v2.git

# 2. Accéder au dossier
cd mon-portfolio.v2

# 3. Lancer un petit serveur local (sous macOS ou Linux, la commande peut s'appeler python3)
python -m http.server 8000
```

Puis ouvrir [http://localhost:8000](http://localhost:8000) dans le navigateur, et arrêter le serveur avec `Ctrl+C` à la fin.

*   Ouvrir directement `index.html` depuis le disque ne suffit pas : le navigateur y bloque les modules JavaScript, et le musée ou le livre d'or ne se chargent pas. N'importe quel serveur local fait l'affaire (l'extension « Live Server » de VS Code par exemple).
*   Le livre d'or d'une copie locale reste branché sur la vraie base du site : un message envoyé depuis chez vous y arrive pour de vrai.

## Structure du Projet

Voici un aperçu de l'organisation des fichiers sources :

```plaintext
/
├── assets/
│   ├── css/            # Feuilles de style (main.css, portal.css, polices.css, musee.css, galerie.css)
│   ├── js/             # Scripts principaux (main.js, portal.js, guestbook.js...)
│   │   ├── libs/       # Bibliothèques externes hébergées (Three.js et ses compléments RectAreaLight, Matter.js)
│   │   └── components/ # Composants modulaires du musée 3D (bureau, ordinateur de l'autel, textures)
│   ├── icons/          # Favicons et manifeste PWA
│   ├── img/            # Images du site (logos des sites utiles, miniatures, image d'aperçu de l'accueil)
│   ├── textures/       # Textures 3D du musée (marbre, pierre, herbe, feuillage)
│   ├── shaders/        # Shaders WebGL (GLSL)
│   └── fonts/          # Polices hébergées et leurs licences
├── index.html          # Page d'accueil principale (CV, Compétences, Livre d'Or)
├── perso.html          # Index personnel (Interface style Portal)
├── portal.html         # Page d'inspiration : Portal et Aperture Science
├── sites.html          # Collection de sites utiles (avec moteur physique)
├── ascii.html          # Archive d'art ASCII
├── musee.html          # Expérience 3D interactive (Temple/Musée)
├── galerie.html        # Galerie (en travaux), ouverte par l'ordinateur du musée
├── CNAME               # Domaine personnalisé pour GitHub Pages
├── LICENSE             # Licence MIT du code
├── .gitattributes      # Fins de ligne des fichiers texte
└── README.md           # Documentation du projet
```

## Fonctionnalités Clés

*   **Mode Public / Privé** : Gestion de messages publics ou privés dans le Livre d'Or, qui s'ouvre en mode privé.
*   **Thème clair / sombre et Mode Lite** sur la page d'accueil.
*   **Interface Portal** : Design rétro-futuriste inspiré du jeu Portal pour la section personnelle, avec un choix de polices.
*   **Musée 3D** : Une scène 3D interactive (Three.js) avec gestion de la lumière, shaders personnalisés (herbe, lucioles) et caméras dynamiques ; sur l'autel, un ordinateur s'allume façon *2001 : l'Odyssée de l'espace* et mène à la galerie.
*   **Physique 2D** : Utilisation de Matter.js sur la page `sites.html` pour des interactions ludiques avec les icônes.
*   **Archive ASCII** : une galerie d'art ASCII, avec la source de chaque œuvre quand elle est connue.

## Licences

Ce dépôt réunit trois sortes de contenus :

1.  **Le code écrit pour le site** (HTML, CSS, JavaScript, GLSL) est sous **licence MIT** : voir [`LICENSE`](LICENSE).
2.  **Mes créations** (textes, dessins dont le logo d'onglet, photos, art ASCII de ma main) sont sous licence **Creative Commons Attribution - Pas d'Utilisation Commerciale 4.0 International** ([CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.fr)) : vous pouvez les reprendre et les transformer en me citant, sans usage commercial.
3.  **Les éléments d'autres auteurs** gardent leur propre licence, indiquée ci-dessous ; les deux licences précédentes ne s'y appliquent pas.

| Élément | Auteur et source | Licence |
| --- | --- | --- |
| Three.js r170 et ses compléments `RectAreaLight` (`assets/js/libs/`) | [Three.js Authors](https://github.com/mrdoob/three.js) | MIT |
| Shader du ciel (`assets/shaders/sky.vert`, `sky.frag`) | Repris de l'exemple [`webgl_lights_hemisphere`](https://github.com/mrdoob/three.js/blob/r170/examples/webgl_lights_hemisphere.html) de Three.js | MIT |
| Matter.js 0.19.0 (`assets/js/libs/matter.min.js`) | [Liam Brummitt et contributeurs](https://github.com/liabru/matter-js) | MIT |
| Textures Marble012, Grass001 et Foliage001 (`assets/textures/`) | [ambientCG](https://ambientcg.com/) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.fr) |
| Texture Rock Tile Floor (`assets/textures/detail/`) | Charlotte Baglioni, [Poly Haven](https://polyhaven.com/a/rock_tile_floor) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.fr) |
| Texture Medieval Blocks 03 (`assets/textures/wall/`) | Rob Tuytel, [Poly Haven](https://polyhaven.com/a/medieval_blocks_03) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/deed.fr) |
| Polices Michroma, Inconsolata et Noto Sans Mono (`assets/fonts/`) | [The Michroma Project Authors](https://github.com/googlefonts/Michroma-font) (Vernon Adams) ; [The Inconsolata Project Authors](https://github.com/googlefonts/Inconsolata) (Raph Levien) ; [The Noto Project Authors](https://github.com/notofonts/latin-greek-cyrillic) | [SIL OFL 1.1](https://openfontlicense.org/), texte joint à chaque police |
| Police Cascadia Mono (`assets/fonts/`) | [Microsoft](https://github.com/microsoft/cascadia-code) | [SIL OFL 1.1](https://openfontlicense.org/), texte joint |
| Police PxPlus IBM VGA8 (`assets/fonts/`) | VileR, [The Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.fr) |
| Polices Tenebris et Terminal Gothic (`assets/fonts/`) | [littlebitspace](https://littlebitspace.com/resources/) | Aucune licence publiée par l'auteur ; proposées en téléchargement libre sur sa page |
| Logo d'Aperture Science en ASCII (`ascii.html`) | [Jamison Judd](https://archive.jamisonjudd.com/aperture-science-logo/), d'après le logo du jeu *Portal* (Valve) | Aucune licence libre indiquée par l'auteur |
| Lain Iwakura en ASCII (`ascii.html`) | Source inconnue | Inconnue |
| Cœur brisé en ASCII (`ascii.html`) | Source inconnue | Inconnue |
| Fleur en ASCII d'après une image de l'anime *Aku no Hana* (`ascii.html`) | Source inconnue | Inconnue |
| Logos des sites utiles (`assets/img/`) | Leurs propriétaires respectifs ; l'icône d'Ollama vient du dépôt [ollama/ollama](https://github.com/ollama/ollama) | Marques de leurs propriétaires ; icône d'Ollama sous licence MIT |
| Miniatures des playlists YouTube (`assets/img/thumb_*.jpg`) | Les auteurs des vidéos | Droits de leurs auteurs |
| Font Awesome Free 6.0.0 (chargé depuis cdnjs, non hébergé ici) | [Fonticons](https://fontawesome.com/license/free) | Icônes CC BY 4.0, polices SIL OFL 1.1, code MIT |
| SDK web de Firebase 10.7.1 (chargé depuis gstatic.com, non hébergé ici) | [Google](https://github.com/firebase/firebase-js-sdk) | Apache 2.0 |

Les noms et marques cités (*Portal* et Aperture Science de Valve, *Serial Experiments Lain*, *Aku no Hana*, *2001 : l'Odyssée de l'espace*, les services de la page des sites utiles) appartiennent à leurs propriétaires.

## Auteur

**Youen Lassiaz**
*   Étudiant en Sciences de l'Éducation & Intéressé par les nouvelles technologies.
*   [Profil GitHub (@Jasonette1)](https://github.com/Jasonette1)
*   [LinkedIn](https://www.linkedin.com/in/youenlassiaz-education/)

---
<div align="center">
    <sub>Fait avec coeur, c'est avant tout une expérimentation gratuite et un side-project qui m'a un peu occupé. Merci pour votre attention.</sub>
</div>

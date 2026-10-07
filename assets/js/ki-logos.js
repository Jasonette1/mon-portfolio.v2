/**
 * SITES-LOGOS.JS (Renamed to ki-logos.js)
 * positions logos in the right column corresponding to sections in the left column.
 * Uses "Best Candidate" algorithm for random dispersion within zones.
 * Updated to use OFFSET logic for robust symmetry.
 * NOW WITH GRAVITY (Matter.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    const leftCol = document.querySelector('.ki-col-left');
    const rightCol = document.querySelector('.ki-col-right');

    if (!leftCol || !rightCol) return;

    // --- CONFIGURATION ---
    const LOGO_SIZE = 64;   // Match CSS
    const SAFETY_MARGIN_RIGHT = 50; // Increased to prevent truncation
    const SAFETY_MARGIN_LEFT = 30; // Increased for symmetry

    // Strict padding to ensure logos never touch the dotted lines
    const SAFETY_PADDING = 8;

    const NUM_CANDIDATES = 50; // Tries for Best Candidate (higher = better spread, slower)

    // --- FRAME TOGGLE LOGIC ---
    const STORAGE_KEY = 'ki-frames-enabled';
    const toggleBtn = document.getElementById('frame-toggle-btn');
    const statusLabel = document.getElementById('frame-status-label');
    const body = document.body;

    // 0. Initialize State
    const savedState = localStorage.getItem(STORAGE_KEY);
    // Default to true (Frames ON)
    let isFramesEnabled = savedState === null ? true : (savedState === 'true');

    // --- PHYSICS ENGINE STATE ---
    let engine = null;
    let renderLoop = null;
    let runner = null;
    let ground = null;
    let walls = [];
    let bodiesMap = new Map(); // DOM Element -> Matter Body

    function updateState(enabled) {
        isFramesEnabled = enabled;

        // UI Updates
        if (enabled) {
            body.classList.add('show-frames');
            toggleBtn?.setAttribute('aria-pressed', 'false'); // "False" means switch is LEFT (ON due to CSS logic)
            if (statusLabel) statusLabel.textContent = 'ON';

            // Disable Gravity -> Restore layout
            disableGravity();
            // Force re-layout after a brief tick to ensure DOM clean
            setTimeout(updatePositions, 50);
        } else {
            body.classList.remove('show-frames');
            toggleBtn?.setAttribute('aria-pressed', 'true'); // "True" means switch is RIGHT (OFF)
            if (statusLabel) statusLabel.textContent = 'OFF';

            // Enable Gravity!
            enableGravity();
        }
        localStorage.setItem(STORAGE_KEY, enabled);
    }

    // 1. Toggle Click Listener
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            updateState(!isFramesEnabled);
        });
    }

    // --- MANUAL OVERRIDES (PRIORITY) ---
    const CUSTOM_LOGOS = {
        'antigravity.google': 'assets/img/antigravity.png',
        'hermes-agent.nousresearch.com': 'assets/img/hermes.png',
        'firebase.google.com': 'assets/img/firebase.png',
        'github.com': 'assets/img/github.png',
        'code.visualstudio.com': 'assets/img/vscode.png',
        'codepen.io': 'assets/img/codepen.png',
        'uiball.com': 'assets/img/uiball.png',
        'inkscape.org': 'assets/img/inkscape.svg',
        'gimp.org': 'assets/img/gimp.png',
        'realfavicongenerator.net': 'assets/img/realfavicon.png',
        'justgetflux.com': 'assets/img/flux.png',
        'obsidian.md': 'assets/img/obsidian.png',
        'developer.chrome.com': 'assets/img/lighthouse.svg',
        'prettier.io': 'assets/img/prettier.png',
        'webaim.org': 'assets/img/wave.png',
        'mynoise.net': 'assets/img/mynoise.ico',
        'youtube.com': 'assets/img/youtube.png',
        // Playlists
        'playlist.dnb': 'assets/img/thumb_dnb.jpg',
        'playlist.dnb2': 'assets/img/thumb_dnb2.jpg',
        'playlist.romantic': 'assets/img/thumb_romantic.jpg',
        'playlist.wanderloots': 'assets/img/thumb_wanderloots.jpg'
    };

    // --- UTILS: Deterministic Random ---
    function hashCode(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function createPRNG(seed) {
        let state = seed;
        return function () {
            state = (state * 9301 + 49297) % 233280;
            return state / 233280;
        }
    }

    // --- STATIC LAYOUT (Frames ON) ---
    // Chaque logo est placé avec ses vraies dimensions (carré de 64 px ou miniature de playlist plus large).
    // Le premier tirage est le tirage historique (graine = titre de la section). Si deux logos se touchent,
    // on recommence avec une autre graine : pour une même largeur d'écran, la disposition reste toujours la même.
    const MAX_LAYOUT_DRAWS = 300;

    function logosTouch(a, b) {
        return a.x < b.x + b.w + SAFETY_PADDING && a.x + a.w + SAFETY_PADDING > b.x &&
            a.y < b.y + b.h + SAFETY_PADDING && a.y + a.h + SAFETY_PADDING > b.y;
    }

    function countTouching(placed) {
        let count = 0;
        for (let i = 0; i < placed.length; i++) {
            for (let j = i + 1; j < placed.length; j++) {
                if (logosTouch(placed[i], placed[j])) count++;
            }
        }
        return count;
    }

    // Une zone par section de la colonne de gauche (hors NAVIGATION), avec ses logos et leurs dimensions.
    function collectZones() {
        const zones = [];
        leftCol.querySelectorAll('.ki-games').forEach(section => {
            const listItems = section.querySelectorAll('li[data-domain]');
            if (listItems.length === 0) return;

            const titleEl = section.querySelector('.ki-section-title');
            if (titleEl && titleEl.textContent.trim().toUpperCase() === 'NAVIGATION') return;

            const logos = [];
            listItems.forEach(li => {
                const domain = li.getAttribute('data-domain');
                if (!domain) return;
                const link = getOrCreateLogo(domain, li, rightCol);
                link.style.transform = 'none'; // Reset what gravity may have changed
                link.style.position = 'absolute';
                logos.push({ link, w: link.offsetWidth || LOGO_SIZE, h: link.offsetHeight || LOGO_SIZE });
            });

            zones.push({
                title: titleEl?.textContent || 'Sec',
                top: section.offsetTop,
                bottom: section.offsetTop + section.offsetHeight,
                logos
            });
        });
        return zones;
    }

    // Un tirage complet : place tous les logos, section après section.
    function drawLayout(zones, colWidth, draw) {
        const placed = [];

        zones.forEach(zone => {
            const rng = createPRNG(hashCode(zone.title + 'BaseSeed' + (draw || '')));

            zone.logos.forEach(({ link, w, h }) => {
                const minX = SAFETY_MARGIN_LEFT;
                const maxX = Math.max(minX, colWidth - w - SAFETY_MARGIN_RIGHT);

                let minY = zone.top + SAFETY_PADDING;
                let maxY = zone.bottom - h - SAFETY_PADDING;
                if (maxY < minY) {
                    minY = zone.top + (zone.bottom - zone.top) / 2 - h / 2;
                    maxY = minY;
                }

                // Find Best Spot : le candidat libre le plus éloigné des logos déjà placés
                let best = null;
                let maxDist = -1;
                for (let i = 0; i < NUM_CANDIDATES; i++) {
                    const candidate = { link, w, h, x: minX + rng() * (maxX - minX), y: minY + rng() * (maxY - minY) };
                    let minDist = Infinity;
                    for (const p of placed) {
                        if (logosTouch(candidate, p)) {
                            minDist = -1;
                            break;
                        }
                        const d = Math.hypot(candidate.x + w / 2 - (p.x + p.w / 2), candidate.y + h / 2 - (p.y + p.h / 2));
                        if (d < minDist) minDist = d;
                    }
                    if (minDist > maxDist) {
                        maxDist = minDist;
                        best = candidate;
                    }
                }

                // Aucun candidat libre : position au hasard, le tirage sera jugé (et sans doute refait) ensuite
                placed.push(best || { link, w, h, x: minX + rng() * (maxX - minX), y: minY + rng() * (maxY - minY) });
            });
        });

        return placed;
    }

    function updatePositions() {
        if (!isFramesEnabled) return; // Do not calculate static layout if gravity is on

        const colWidth = rightCol.clientWidth;
        if (colWidth < SAFETY_MARGIN_LEFT + LOGO_SIZE + SAFETY_MARGIN_RIGHT) return;

        const zones = collectZones();

        let layout = null;
        let touching = Infinity;
        for (let draw = 0; draw < MAX_LAYOUT_DRAWS && touching > 0; draw++) {
            const candidate = drawLayout(zones, colWidth, draw);
            const count = countTouching(candidate);
            if (count < touching) {
                layout = candidate;
                touching = count;
            }
        }

        if (!layout) return;
        layout.forEach(({ link, x, y }) => {
            link.style.left = x + 'px';
            link.style.top = y + 'px';
        });
    }

    function getOrCreateLogo(domain, liElement, container) {
        let logoLink = container.querySelector(`.ki-logo-item[data-for="${domain}"]`);
        if (!logoLink) {
            logoLink = document.createElement('a');
            logoLink.classList.add('ki-logo-item');
            logoLink.setAttribute('data-for', domain);
            logoLink.target = '_blank';
            // Décoratif : le lien identique de la liste de gauche reste le chemin au clavier et au lecteur d'écran
            logoLink.setAttribute('aria-hidden', 'true');
            logoLink.tabIndex = -1;
            const linkInLi = liElement.querySelector('a');
            if (linkInLi && linkInLi.href) {
                logoLink.href = linkInLi.href;
            }
            const img = document.createElement('img');
            img.alt = '';
            if (CUSTOM_LOGOS[domain]) {
                img.src = CUSTOM_LOGOS[domain];
            } else {
                img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
            }
            // Dragging fix for mouse interaction
            img.style.pointerEvents = 'none';

            logoLink.appendChild(img);
            container.appendChild(logoLink);
        }
        logoLink.style.display = 'block';
        return logoLink;
    }

    // --- GRAVITY / PHYSICS (Matter.js) ---
    function enableGravity() {
        if (!window.Matter) {
            console.error("Matter.js not loaded");
            return;
        }

        const Engine = Matter.Engine,
            Render = Matter.Render, // We don't use the canvas render, but we need the runner
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite;

        // 1. Create Engine
        engine = Engine.create();
        const world = engine.world;

        // 2. Define Boundaries (Floor and Walls)
        // We use the right column dimensions
        const width = rightCol.clientWidth;
        // Important: Use scrollHeight to get the full height if content was there, 
        // BUT for gravity we might want them to fall to the visual bottom of the viewport-ish 
        // OR the bottom of the container. 
        // NOTE: If the container is small, they will pile up fast.
        // Let's use getBoundingClientRect or offsetHeight.
        const height = rightCol.clientHeight || 800;

        // Walls thickness
        const wallThick = 60;

        // Ground
        const groundBody = Bodies.rectangle(width / 2, height + (wallThick / 2), width, wallThick, {
            isStatic: true,
            render: { visible: false }
        });

        // Left Wall
        const leftWall = Bodies.rectangle(0 - (wallThick / 2), height / 2, wallThick, height * 2, { isStatic: true });
        // Right Wall
        const rightWall = Bodies.rectangle(width + (wallThick / 2), height / 2, wallThick, height * 2, { isStatic: true });

        Composite.add(world, [groundBody, leftWall, rightWall]);
        walls = [groundBody, leftWall, rightWall];

        // 3. Create Bodies for Logos
        const logos = rightCol.querySelectorAll('.ki-logo-item');
        logos.forEach(logo => {
            // Get current visual position to start simulation from there
            const x = parseFloat(logo.style.left) || 0;
            const y = parseFloat(logo.style.top) || 0;

            // Get actual dimensions (handles wide playlists 114px vs normal 64px)
            const w = logo.offsetWidth || LOGO_SIZE;
            const h = logo.offsetHeight || LOGO_SIZE;

            // Adjust to center (Matter.js uses center)
            const cx = x + w / 2;
            const cy = y + h / 2;

            // Box Body
            // We use a Chamfer to round corners slightly, making them roll nicer
            const body = Bodies.rectangle(cx, cy, w, h, {
                restitution: 0.5, // Bouncy
                friction: 0.3,
                chamfer: { radius: 10 }
            });

            // Random rotation handling?
            // Optionally give them a tiny spin to look natural falling
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

            Composite.add(world, body);
            bodiesMap.set(logo, body);
        });

        // 4. Mouse Control (Optional but fun)
        // To make drag work on DOM elements, we have to map mouse events to the engine.
        // For now, let's just let them fall. Simplest implementation.

        // 5. Run the engine
        runner = Runner.create();
        Runner.run(runner, engine);

        // 6. Custom Render Loop (Sync Physics -> DOM)
        // We use requestAnimationFrame to update DOM positions
        function step() {
            if (!engine) return; // Stopped

            bodiesMap.forEach((body, domEl) => {
                const { x, y } = body.position;
                const angle = body.angle;

                // Update DOM
                // Position top-left is center - half size (using actual element size)
                const w = domEl.offsetWidth;
                const h = domEl.offsetHeight;

                const top = y - h / 2;
                const left = x - w / 2;

                domEl.style.top = `${top}px`;
                domEl.style.left = `${left}px`;
                domEl.style.transform = `rotate(${angle}rad)`;
            });

            renderLoop = requestAnimationFrame(step);
        }
        step();
    }

    function disableGravity() {
        if (!engine) return;

        // Stop updates
        cancelAnimationFrame(renderLoop);
        renderLoop = null;

        // Stop Matter
        Matter.Runner.stop(runner);
        Matter.Engine.clear(engine);
        if (engine.world) {
            Matter.Composite.clear(engine.world, false, true);
        }

        // Cleanup
        engine = null;
        runner = null;
        walls = [];
        bodiesMap.clear();

        // Reset Styles on DOM elements so updatePositions can work
        const logos = rightCol.querySelectorAll('.ki-logo-item');
        logos.forEach(logo => {
            logo.style.transform = 'none';
        });
    }

    // --- INIT ---
    // Make sure we have logos generated (first pass)
    // We must ensure logos exist before we can "enableGravity" if we start with Frames OFF.
    // So we force a "static layout" calculation at least once to create the DOM elements.
    // Trick: Temporarily set frames enabled logic to true just for generation? 
    // Or just run the generation logic without checking flag if list is empty.

    // Better: Allow updatePositions to GENERATE only if missing? 
    // Simplified: Just run updatePositions once with IsFramesEnabled = true internally?

    // Initial Load Logic
    if (Object.keys(CUSTOM_LOGOS).length > 0) {
        // Force generation of DOM elements by tricking the function
        const originalState = isFramesEnabled;
        isFramesEnabled = true;
        updatePositions();
        isFramesEnabled = originalState; // Restore

        // Now apply state
        updateState(isFramesEnabled);
    }

    // Observers need to be careful not to reset gravity constantly
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (isFramesEnabled) {
                updatePositions();
            } else {
                // If gravity is on, we might need to update walls? 
                // For now, simple resize restart:
                disableGravity();

                // Re-calc static positions for new width so they fall from correct places?
                // Or just keep them where they are? 

                // Let's reset to provide a clean experience
                const originalState = isFramesEnabled;
                isFramesEnabled = true;
                updatePositions();
                isFramesEnabled = originalState;

                enableGravity();
            }
        }, 300);
    });
});

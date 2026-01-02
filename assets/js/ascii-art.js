/* =========================================================
   PORTAL / AMBER INDEX - ASCII ART LOGIC
   Adapté de Obsidian DataviewJS pour le Web
   ========================================================= */

const ASCII_DATA = {
    // Placeholder static data if needed
};

/* ===== CONSTANTES ===== */
const BASE_ART_PX = 12, MIN_ART_PX = 9, HARD_MIN_PX = 7, BREAKPOINT_PX = 760;
const MIDLINE_W_PX = 22, RIGHT_MIN_FR = 0.35, RIGHT_MAX_FR = 0.94, LEFT_MIN_W = 260;
const EDGE_FUDGE = 3, SAFETY_MARGIN = 6;
const ROTATE_MS = 20000;

/* ===== HELPERS ===== */
const px = v => Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0;

/* ===== LOGIQUE GRID & FITTING ===== */
const grid = document.querySelector('.ki-grid');
const artWrap = document.querySelector('.ki-art-wrap');
const art = document.querySelector('.ki-art');

function solveColumnsFor(usable, desiredRightPx) {
    const minRight = RIGHT_MIN_FR * usable, maxRight = RIGHT_MAX_FR * usable;
    let right = Math.max(minRight, Math.min(desiredRightPx, maxRight));
    let left = usable - right;

    if (left < LEFT_MIN_W) {
        right = Math.max(minRight, usable - LEFT_MIN_W);
        left = usable - right;
    }

    left = Math.max(LEFT_MIN_W, Math.floor(left));
    right = Math.max(0, Math.max(usable - left, 0));
    return { left, right };
}

function adjustColumnsAndFit() {
    if (!grid || !artWrap || !art) return;

    const csGrid = getComputedStyle(grid);
    const pl = px(csGrid.paddingLeft), pr = px(csGrid.paddingRight);
    const gridContentW = Math.max(0, grid.clientWidth - pl - pr - EDGE_FUDGE);
    const isCompact = window.innerWidth <= 768; // CSS breakpoint

    // Compact Mode (Mobile)
    if (isCompact) {
        grid.style.gridTemplateColumns = '1fr';

        const csWrap = getComputedStyle(artWrap);
        const gl = px(csWrap.paddingLeft), gr = px(csWrap.paddingRight);
        const gutters = gl + gr + SAFETY_MARGIN;

        let allowed = Math.max(0, gridContentW - gutters - EDGE_FUDGE);
        let size = BASE_ART_PX;

        // Tester et réduire
        art.style.fontSize = size + "px";
        art.style.lineHeight = (size + 1) + "px";
        let artW = Math.ceil(art.scrollWidth || art.getBoundingClientRect().width || 0);

        while (artW > allowed && size > HARD_MIN_PX) {
            size -= 1;
            art.style.fontSize = size + "px";
            art.style.lineHeight = (size + 1) + "px";
            artW = Math.ceil(art.scrollWidth || art.getBoundingClientRect().width || 0);
        }
        return;
    }

    // Desktop Mode (Split Columns)
    const csWrap = getComputedStyle(artWrap);
    const gl = px(csWrap.paddingLeft), gr = px(csWrap.paddingRight);
    const gutters = gl + gr + SAFETY_MARGIN;
    const usable = Math.max(0, gridContentW - MIDLINE_W_PX);

    let size = BASE_ART_PX;
    let safety = 24;
    let artW = 0;

    // Itération pour trouver la bonne taille et répartition
    while (safety-- > 0) {
        art.style.fontSize = size + "px";
        art.style.lineHeight = (size + 1) + "px";
        artW = Math.ceil(art.scrollWidth || art.getBoundingClientRect().width || 0);

        const desiredRight = Math.ceil(artW + gutters);
        const s = solveColumnsFor(usable, desiredRight);
        const allowed = Math.max(0, s.right - gutters - EDGE_FUDGE);

        if (artW <= allowed || size <= HARD_MIN_PX) {
            grid.style.gridTemplateColumns = `${s.left}px ${MIDLINE_W_PX}px ${s.right}px`;
            break;
        }

        // Réduire la taille
        let target = Math.floor(size * (allowed / Math.max(1, artW)));
        let newSize = Math.min(size - 1, Math.max(HARD_MIN_PX, target));
        if (newSize === size) newSize = size - 1;
        size = newSize;
    }
}

/* ===== ANIMATION & ROTATION LOGIC ===== */

const FPS = 12;
const FRAME_DURATION = 1000 / FPS;

let animationId = null;
let lastFrameTime = 0;
let frameIndex = 0;
let pingPongSequence = [];

/* --- Générateur de Séquence Ping-Pong --- */
function buildPingPongSequence(frames) {
    if (!frames || frames.length === 0) return [];
    // Forward
    const forward = frames.slice();
    // Backward (sans dupliquer le premier et dernier frame pour fluidité)
    const backward = frames.slice(1, frames.length - 1).reverse();
    return forward.concat(backward);
}

/* --- Player --- */
function playAnimation(timestamp) {
    if (!lastFrameTime) lastFrameTime = timestamp;
    const elapsed = timestamp - lastFrameTime;

    if (elapsed > FRAME_DURATION) {
        // Avancer frame
        frameIndex = (frameIndex + 1) % pingPongSequence.length;

        const artText = pingPongSequence[frameIndex];
        // Seulement mettre à jour si le texte change
        if (art.textContent !== artText) {
            art.textContent = artText;
        }

        lastFrameTime = timestamp;
    }

    animationId = requestAnimationFrame(playAnimation);
}

/* --- Init --- */

function initAsciiManager() {
    // 1. Si FLEURS_FRAMES est dispo (généré par le script PowerShell/Node)
    if (typeof FLEURS_FRAMES !== 'undefined' && FLEURS_FRAMES.length > 0) {
        console.log("Starting Fleur du Mal animation...");
        pingPongSequence = buildPingPongSequence(FLEURS_FRAMES);

        // Initial fit sur le premier frame
        art.textContent = pingPongSequence[0];
        adjustColumnsAndFit();

        // Démarrer boucle
        animationId = requestAnimationFrame(playAnimation);

        // Resize observer pour re-fit fenêtre
        window.addEventListener('resize', adjustColumnsAndFit);
    }
    // 2. Fallback
    else {
        console.warn("FLEURS_FRAMES not found. Please run extraction script.");
        art.textContent = "ANIMATION DATA MISSING";
        adjustColumnsAndFit();
    }
}

// Démarrage
initAsciiManager();

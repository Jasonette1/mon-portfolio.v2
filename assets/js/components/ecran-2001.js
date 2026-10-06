/**
 * ORDINATEUR DE L'AUTEL : l'écran Acer s'allume façon « 2001 : l'Odyssée de l'espace »,
 * puis la caméra avance jusqu'à ce qu'il remplisse la fenêtre et la galerie prend le relais.
 *
 * Rendu repris de la maquette validée par Youen le 6 octobre 2026 : deux clignotements bleus,
 * glissement vers un fond sombre, lignes d'initialisation, huit panneaux, flash, fondu dans le
 * bleu, travelling jusqu'au bord à bord avec un léger débordement.
 * Le contenu de l'écran est dessiné dans un canvas hors page, servi à la 3D comme texture.
 * Les bips sont fabriqués par le navigateur (Web Audio), sans fichier son.
 * Réglage « moins d'animations » : ni panneaux ni travelling ; un voile noir où trois lignes se
 * tapent au centre, puis la galerie.
 */

import * as THREE from 'three';
import { RectAreaLightUniformsLib } from '../libs/RectAreaLightUniformsLib.js';

// ===== TEXTES : de la plume de Youen, à venir (« /En travaux/ » en attendant) =====
const TEXTES = {
    // Séquence complète : lignes tapées en haut à gauche de l'écran
    initialisation: ['00  /En travaux/', '01  /En travaux/', '02  /En travaux/', '03  /En travaux/', '04  /En travaux/'],
    // Version « moins d'animations » : lignes tapées au centre du voile noir
    calme: ['/En travaux/', '/En travaux/', '/En travaux/']
};

// ===== DÉROULÉ (secondes depuis le geste qui allume) =====
const T = {
    CLIGNOTEMENT: 0.6, // premier clignotement bleu
    PAUSE: 0.85,       // l'écran se rééteint…
    RALLUMAGE: 1.15,   // …puis se rallume
    GLISSEMENT: 1.25,  // glissement vers le fond sombre ; les lignes commencent
    PANNEAUX: 2.5,     // premier panneau, puis un toutes les 0,38 s
    FLASH: 6.4,
    TRAVELLING: 7.0,
    FIN: 8.55,         // l'écran remplit la fenêtre : la page d'attente prend le relais
    FIN_CALME: 2.6
};
const ECART_LIGNES = 0.24, FRAPPE = 60;                        // lignes d'initialisation (s, caractères par seconde)
const DEBUT_CALME = 0.6, ECART_CALME = 0.45, FRAPPE_CALME = 40; // lignes de la version calme
const ECART_PANNEAUX = 0.38;
const FONDU_NOIR = 500, FONDU_BLEU = 600;                       // voiles HTML (ms)
const DUREE_RETOUR = 0.9;                                       // recul quand Échap interrompt le travelling (s)
const DEBORD = 1.045;                                           // fin du travelling : l'image déborde de 4,5 %
const DESTINATION = 'galerie.html';

// ===== RÉGLAGES DE LA SCÈNE =====
const LUMINANCE_LUEUR = 2.6; // lueur de l'écran sur le bureau (luminance de la dalle, en nits)
const MARGE_DOIGT = 0.02;    // zones cliquables élargies de 2 cm sur écran tactile (m)
const LISERE = 0.006;        // liseré noir entre l'image et le cadre, comme sur un vrai écran (m)
const CLE_SON = 'sonOrdinateur';

// ===== DESSIN =====
const LARGEUR = 1280, HAUTEUR = 720; // repère de dessin de la maquette (16/9, comme la dalle)
const P = 250;                       // côté d'un panneau
// Inconsolata est plus étroite que la Consolas de la maquette (0,5 em contre 0,55 em) :
// tailles × 1,1 pour garder la même mise en page
const mono = (taille) => `${taille * 1.1}px "Inconsolata", monospace`;
// Grandes lettres espacées : Michroma, cousine libre de l'Eurostile Extended des écrans du film, n'existe
// qu'en graisse normale ; un contour de 4 px lui donne le poids de l'Arial Black de la maquette. Taille,
// étirement et espacement calibrés pour que chaque lettre occupe la même place que dans la maquette.
const GRANDES = { police: '"Michroma", sans-serif', taille: 37.2, etirement: 1.22, espace: 0.595, contour: 4 };

const COULEURS = {
    clignotement: '#1d47b0', fond: '#05070f', final: '#123a8c', curseur: '#cfe8ff',
    trait: '#d8ecff', vif: '#ffffff', jaune: '#e8c84a', grille: '#e6d9ff', halo: '#9a8cff', flash: '#dcebff',
    panneaux: ['#1d3a99', '#6a3a7c', '#1f3d9a', '#3d9ccc', '#1f7f99', '#87408c', '#17123f', '#a3242a']
};
// Huit panneaux sur deux rangées de quatre, chacun avec son bip (codes décoratifs provisoires)
const PANNEAUX = [
    { x: 50, y: 90, type: 'etiquette', code: 'LIF:13-AG', mot: 'GDE', c: 0, bip: 660 },
    { x: 980, y: 380, type: 'etiquette', code: 'MRN:90-EJ', mot: 'ATM', c: 7, bip: 990 },
    { x: 360, y: 90, type: 'courbe', c: 2, bip: 520 },
    { x: 670, y: 90, type: 'grille', c: 5, bip: 1320 },
    { x: 50, y: 380, type: 'orbites', c: 1, bip: 880 },
    { x: 670, y: 380, type: 'radar', c: 4, bip: 740 },
    { x: 980, y: 90, type: 'nombres', c: 3, bip: 1180 },
    { x: 360, y: 380, type: 'viseur', c: 6, bip: 600 }
].map((p, i) => ({ ...p, t: T.PANNEAUX + i * ECART_PANNEAUX }));

// ===== OUTILS =====
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lisse = (u) => u * u * (3 - 2 * u);
const alea = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }; // hasard reproductible
const rvb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const melange = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
const css = (c) => `rgb(${c.map(Math.round).join(',')})`;
const R_CLIGNOTEMENT = rvb(COULEURS.clignotement), R_FOND = rvb(COULEURS.fond), R_FINAL = rvb(COULEURS.final);
const R_FLASH = rvb(COULEURS.flash), R_PANNEAUX = COULEURS.panneaux.map(rvb);
const AIRE_PANNEAU = (P * P) / (LARGEUR * HAUTEUR);

function rectangleArrondi(s, x, y, l, h, r) {
    s.beginPath(); s.moveTo(x + r, y);
    s.arcTo(x + l, y, x + l, y + h, r); s.arcTo(x + l, y + h, x, y + h, r);
    s.arcTo(x, y + h, x, y, r); s.arcTo(x, y, x + l, y, r); s.closePath();
}

// ===== DÉROULÉ, INSTANT PAR INSTANT =====
const estAllume = (t) => t >= T.CLIGNOTEMENT && !(t >= T.PAUSE && t < T.RALLUMAGE);
const progresTravelling = (t) => lisse(clamp((t - T.TRAVELLING) / (T.FIN - T.TRAVELLING)));

function couleurFond(t) {
    if (t >= T.TRAVELLING) return R_FINAL;
    if (t < T.GLISSEMENT) return R_CLIGNOTEMENT;
    if (t < T.FLASH) return melange(R_CLIGNOTEMENT, R_FOND, clamp((t - T.GLISSEMENT) / 0.6));
    return melange(R_FOND, R_FINAL, clamp((t - T.FLASH) / 0.6));
}
// Les panneaux s'effacent juste après le flash
const alphaPanneaux = (t) => 1 - clamp((t - T.FLASH - 0.15) / 0.45);
// Apparition d'un panneau : fondu court, avec un léger grésillement
function opacitePanneau(p, t, alpha) {
    const lt = t - p.t;
    if (lt < 0) return 0;
    const a = clamp(lt / 0.15) * alpha;
    return lt < 0.25 && Math.floor(lt * 30) % 3 === 0 ? a * 0.45 : a;
}
const forceFlash = (t) => (t >= T.FLASH && t < T.FLASH + 0.22 ? 0.35 * (1 - (t - T.FLASH) / 0.22) : 0);

// Teinte moyenne de l'écran (0-255), pour la lueur sur le bureau
function teinteMoyenne(t) {
    let c = couleurFond(t);
    if (t < T.PAUSE) c = c.map((v) => v * 0.7);
    const pa = alphaPanneaux(t);
    PANNEAUX.forEach((p) => { c = melange(c, R_PANNEAUX[p.c], opacitePanneau(p, t, pa) * AIRE_PANNEAU); });
    return melange(c, R_FLASH, forceFlash(t));
}

// ===== DESSIN DE L'ÉCRAN (repère 1280 × 720 de la maquette) =====
function texteLarge(s, mot, cx, y) {
    const { police, taille, etirement, espace, contour } = GRANDES;
    s.save(); s.translate(cx, y); s.scale(etirement, 1);
    s.font = `${taille}px ${police}`; s.textAlign = 'left';
    s.lineWidth = contour; s.lineJoin = 'round';
    const ecart = taille * espace, largeurs = [...mot].map((ch) => s.measureText(ch).width);
    s.shadowBlur = 3;
    let x = -(largeurs.reduce((a, b) => a + b, 0) + ecart * (largeurs.length - 1)) / 2;
    [...mot].forEach((ch, i) => { s.fillText(ch, x, 0); s.strokeText(ch, x, 0); x += largeurs[i] + ecart; });
    s.restore();
}

function dessinerPanneau(s, p, t, alpha) {
    const a = opacitePanneau(p, t, alpha);
    if (a <= 0) return;
    const lt = t - p.t, x = p.x, y = p.y, cx = x + P / 2, cy = y + P / 2;
    s.save(); s.globalAlpha = a;
    rectangleArrondi(s, x, y, P, P, 16); s.fillStyle = COULEURS.panneaux[p.c]; s.fill(); s.clip();
    const reflet = s.createRadialGradient(cx, cy, 10, cx, cy, P * 0.75);
    reflet.addColorStop(0, 'rgba(255,255,255,0.10)'); reflet.addColorStop(1, 'rgba(0,0,0,0.28)');
    s.fillStyle = reflet; s.fillRect(x, y, P, P);
    s.strokeStyle = s.fillStyle = COULEURS.trait; s.shadowColor = COULEURS.trait; s.shadowBlur = 6; s.lineWidth = 2;
    s.font = mono(15); s.textBaseline = 'alphabetic'; s.textAlign = 'left';

    if (p.type === 'etiquette') {
        s.font = mono(17);
        s.fillText(p.code, x + 30, y + 108);
        texteLarge(s, p.mot, cx, y + 164);
    }
    if (p.type === 'courbe') {
        s.save(); s.globalAlpha = a * 0.35; s.lineWidth = 1;
        for (let i = 0; i <= 8; i++) { s.beginPath(); s.moveTo(x + 30 + i * 24, y + 40); s.lineTo(x + 30 + i * 24, y + 210); s.stroke(); }
        for (let j = 0; j <= 6; j++) { s.beginPath(); s.moveTo(x + 30, y + 40 + j * 28); s.lineTo(x + 222, y + 40 + j * 28); s.stroke(); }
        s.restore();
        const f = clamp(lt / 1.4);
        [[0, 1], [1.7, 0.45]].forEach(([dec, al]) => {
            s.save(); s.globalAlpha = a * al; s.beginPath();
            for (let k = 0; k <= 120 * f; k++) {
                const u = k / 120, px = x + 30 + u * 192;
                const py = y + 40 + 170 * (0.3 + 0.06 * Math.sin(u * 14 + lt * 0.6 + dec) + 0.45 * Math.exp(-(((u - 0.55 - dec * 0.05) / 0.06) ** 2)));
                if (k) s.lineTo(px, py); else s.moveTo(px, py);
            }
            s.stroke(); s.restore();
        });
        const xc = x + 30 + ((lt * 0.25) % 1) * 192;
        s.save(); s.globalAlpha = a * 0.5; s.beginPath(); s.moveTo(xc, y + 40); s.lineTo(xc, y + 210); s.stroke(); s.restore();
        s.fillText('VEC(1)4', x + 30, y + 30); s.fillText('10/POS', x + 30, y + 234);
    }
    if (p.type === 'nombres') {
        s.font = mono(16);
        s.fillText('U; .0093/226+784', x + 22, y + 34);
        s.beginPath(); s.moveTo(x + 22, y + 44); s.lineTo(x + 228, y + 44); s.stroke();
        const lh = 22, v = lt * 38, dep = v % lh, r0 = Math.floor(v / lh);
        s.save(); s.beginPath(); s.rect(x, y + 50, P, P - 60); s.clip();
        for (let r = 0; r < 10; r++) {
            const yy = y + 72 + r * lh - dep, n = r + r0;
            for (let col = 0; col < 4; col++) {
                const nb = String(Math.floor(alea(n * 7 + col) * 99999)).padStart(5, '0');
                s.fillText(col === 2 ? nb.slice(0, 2) : nb, x + 22 + col * 54, yy);
            }
        }
        s.restore();
    }
    if (p.type === 'orbites') {
        const f = clamp(lt / 1.6), oy = cy + 6;
        const ellipses = [[95, 40, -0.35], [80, 70, 0.4], [105, 85, 0.1], [50, 22, 1.1]];
        ellipses.forEach(([rx, ry, rot]) => { s.beginPath(); s.ellipse(cx, oy, rx, ry, rot, 0, Math.PI * 2 * f); s.stroke(); });
        s.beginPath(); s.arc(cx, oy, 15, 0, Math.PI * 2); s.stroke();
        s.beginPath(); s.moveTo(cx - 40, oy); s.lineTo(cx + 40, oy); s.moveTo(cx, oy - 40); s.lineTo(cx, oy + 40); s.stroke();
        const [rx, ry, rot] = ellipses[2], an = lt * 0.9;
        const px = cx + rx * Math.cos(an) * Math.cos(rot) - ry * Math.sin(an) * Math.sin(rot);
        const py = oy + rx * Math.cos(an) * Math.sin(rot) + ry * Math.sin(an) * Math.cos(rot);
        s.save(); s.fillStyle = COULEURS.vif; s.shadowColor = COULEURS.vif; s.shadowBlur = 14;
        s.beginPath(); s.arc(px, py, 4.5, 0, Math.PI * 2); s.fill(); s.restore();
        s.font = mono(13);
        s.fillText('198.37', x + 22, oy - 22); s.fillText('SYNPOS', cx + 30, y + 214);
        s.font = mono(17); s.fillText('DTE 26', x + 168, y + 236);
    }
    if (p.type === 'radar') {
        const R = 108, ry0 = cy + 8;
        s.save(); s.globalAlpha = a * 0.55; s.lineWidth = 1.4;
        for (let k = 1; k <= 5; k++) { s.beginPath(); s.arc(cx, ry0, R * k / 5, 0, Math.PI * 2); s.stroke(); }
        for (let k = 0; k < 12; k++) { const an = k * Math.PI / 6; s.beginPath(); s.moveTo(cx, ry0); s.lineTo(cx + R * Math.cos(an), ry0 + R * Math.sin(an)); s.stroke(); }
        s.restore();
        const A = lt * 1.6;
        for (let i = 0; i < 18; i++) {
            s.save(); s.globalAlpha = a * (1 - i / 18) * 0.8; s.beginPath(); s.moveTo(cx, ry0);
            s.lineTo(cx + R * Math.cos(A - i * 0.045), ry0 + R * Math.sin(A - i * 0.045)); s.stroke(); s.restore();
        }
        [[0.6, 0.5], [1.9, 0.8], [2.7, 0.35], [3.8, 0.65], [4.6, 0.9], [5.5, 0.25]].forEach(([an, r]) => {
            const d = ((A - an) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2), k = clamp(1 - d / 2.5);
            if (k <= 0) return;
            s.save(); s.globalAlpha = a * k; s.fillStyle = COULEURS.vif; s.shadowColor = COULEURS.vif; s.shadowBlur = 10;
            s.beginPath(); s.arc(cx + R * r * Math.cos(an), ry0 + R * r * Math.sin(an), 3.5, 0, Math.PI * 2); s.fill(); s.restore();
        });
        s.font = mono(12);
        ['00000', '38993', '75351', '31490'].forEach((n, i) => s.fillText(n, x + 196, y + 22 + i * 14));
        s.fillText('C 7', x + 12, y + 22);
    }
    if (p.type === 'grille') {
        const yh = y + P * 0.3, bas = y + P, vy = yh - 40;
        s.save(); s.lineWidth = 1.5;
        for (let i = -10; i <= 10; i++) {
            const xb = cx + i * 38, xh = cx + (xb - cx) * ((yh - vy) / (bas - vy));
            s.beginPath(); s.moveTo(xh, yh); s.lineTo(xb, bas); s.stroke();
        }
        for (let k = 0; k < 14; k++) {
            const q = (k + (lt * 0.9) % 1) / 14, yy = yh + (bas - yh) * q * q;
            s.globalAlpha = a * (0.25 + 0.75 * q); s.beginPath(); s.moveTo(x, yy); s.lineTo(x + P, yy); s.stroke();
        }
        s.restore();
        s.fillText('Δπ60', x + 22, y + 34); s.fillText('10/POS', x + 22, y + 60);
    }
    if (p.type === 'viseur') {
        s.save(); s.strokeStyle = COULEURS.grille; s.shadowColor = COULEURS.halo; s.shadowBlur = 10; s.lineWidth = 3; s.globalAlpha = a * 0.8;
        [0.12, 0.2, 0.24, 0.62, 0.66, 0.86, 0.9].forEach((u) => { s.beginPath(); s.moveTo(x + u * P, y); s.lineTo(x + u * P, y + P); s.stroke(); });
        [0.08, 0.15, 0.48, 0.63, 0.67, 0.72, 0.78].forEach((u) => { s.beginPath(); s.moveTo(x, y + u * P); s.lineTo(x + P, y + u * P); s.stroke(); });
        s.restore();
        s.save(); s.strokeStyle = COULEURS.jaune; s.shadowColor = COULEURS.jaune; s.lineWidth = 2;
        [0.42, 0.3, 0.18, 0.08].forEach((k) => { s.beginPath(); s.arc(cx, cy, P * k, 0, Math.PI * 2); s.stroke(); });
        s.beginPath(); s.moveTo(x, cy); s.lineTo(x + P, cy); s.moveTo(cx, y); s.lineTo(cx, y + P); s.stroke();
        for (let k = 0; k < 16; k++) {
            const an = k * Math.PI / 8 + lt * 0.2;
            [[0.24, 0.27], [0.36, 0.39]].forEach(([r1, r2]) => {
                s.beginPath(); s.moveTo(cx + P * r1 * Math.cos(an), cy + P * r1 * Math.sin(an));
                s.lineTo(cx + P * r2 * Math.cos(an), cy + P * r2 * Math.sin(an)); s.stroke();
            });
        }
        s.restore();
        s.save(); s.fillStyle = COULEURS.vif; s.shadowColor = COULEURS.vif; s.shadowBlur = 25;
        s.beginPath(); s.arc(cx, cy, 9 + 2 * Math.sin(lt * 5), 0, Math.PI * 2); s.fill(); s.restore();
    }
    s.restore();
}

function dessinerEcran(s, t, vignette, trame, cadre) {
    // Fond : clignotements bleus, glissement vers le fond sombre du film, puis fondu dans le bleu final
    s.fillStyle = css(couleurFond(t)); s.fillRect(0, 0, LARGEUR, HAUTEUR);
    if (t < T.PAUSE) { s.fillStyle = 'rgba(0,0,0,0.3)'; s.fillRect(0, 0, LARGEUR, HAUTEUR); }

    // Lignes d'initialisation, avec un léger décalage rouge et cyan
    const fondu = 1 - clamp((t - (T.PANNEAUX - 0.05)) / 0.4);
    if (t >= T.GLISSEMENT && fondu > 0) {
        s.save(); s.font = mono(26); s.textAlign = 'left';
        TEXTES.initialisation.forEach((ligne, i) => {
            const lt = t - (T.GLISSEMENT + i * ECART_LIGNES);
            if (lt < 0) return;
            const txt = ligne.slice(0, Math.floor(lt * FRAPPE)), yy = 92 + i * 40;
            s.globalAlpha = fondu * 0.35; s.fillStyle = '#ff4a6a'; s.fillText(txt, 58.5, yy);
            s.fillStyle = '#4af0ff'; s.fillText(txt, 61.5, yy);
            s.globalAlpha = fondu; s.fillStyle = COULEURS.trait; s.shadowColor = COULEURS.trait; s.shadowBlur = 8;
            s.fillText(txt, 60, yy);
            s.shadowBlur = 0;
        });
        s.restore();
    }

    // Panneaux, flash, puis curseur au centre du bleu final
    const pa = alphaPanneaux(t);
    if (pa > 0) PANNEAUX.forEach((p) => dessinerPanneau(s, p, t, pa));
    const flash = forceFlash(t);
    if (flash > 0) { s.fillStyle = `rgba(${R_FLASH.join(',')},${flash})`; s.fillRect(0, 0, LARGEUR, HAUTEUR); }
    if (t >= T.TRAVELLING && Math.floor(t * 2) % 2 === 0) {
        s.fillStyle = COULEURS.curseur; s.fillRect(LARGEUR / 2 - 9, HAUTEUR / 2 - 18, 18, 34);
    }

    // Filtre cathodique : trame, bande qui défile, vignettage, scintillement
    s.fillStyle = trame; s.fillRect(0, 0, LARGEUR, HAUTEUR);
    const by = (t * 160) % (HAUTEUR + 240) - 120, bande = s.createLinearGradient(0, by, 0, by + 120);
    bande.addColorStop(0, 'rgba(255,255,255,0)'); bande.addColorStop(0.5, 'rgba(255,255,255,0.05)'); bande.addColorStop(1, 'rgba(255,255,255,0)');
    s.fillStyle = bande; s.fillRect(0, by, LARGEUR, 120);
    if (vignette > 0) {
        const vg = s.createRadialGradient(LARGEUR / 2, HAUTEUR / 2, HAUTEUR * 0.35, LARGEUR / 2, HAUTEUR / 2, LARGEUR * 0.62);
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${0.5 * vignette})`);
        s.fillStyle = vg; s.fillRect(0, 0, LARGEUR, HAUTEUR);
    }
    s.fillStyle = `rgba(0,0,0,${0.035 * alea(Math.floor(t * 30))})`; s.fillRect(0, 0, LARGEUR, HAUTEUR);

    // Liseré noir tout autour, par-dessus le filtre : l'image s'arrête avant le cadre, comme sur un vrai écran
    s.fillStyle = '#000';
    s.fillRect(0, 0, LARGEUR, cadre.haut); s.fillRect(0, HAUTEUR - cadre.bas, LARGEUR, cadre.bas);
    s.fillRect(0, 0, cadre.cote, HAUTEUR); s.fillRect(LARGEUR - cadre.cote, 0, cadre.cote, HAUTEUR);
}

// ===== SON =====
class Bips {
    constructor() {
        this.actif = true;
        this.contexte = null;
        this.sons = new Set();
    }

    // À appeler pendant un geste du visiteur : les navigateurs refusent le son sans geste
    reveiller() {
        if (!this.actif) return;
        if (!this.contexte) {
            const Contexte = window.AudioContext || window.webkitAudioContext;
            if (!Contexte) return;
            this.contexte = new Contexte();
        }
        if (this.contexte.state === 'suspended') this.contexte.resume();
    }

    bip(frequence, duree = 0.06, forme = 'square', volume = 0.02, frequenceFin = null, retard = 0) {
        const c = this.contexte;
        if (!this.actif || !c || c.state !== 'running') return;
        const n = c.currentTime + retard, o = c.createOscillator(), g = c.createGain();
        o.type = forme; o.frequency.setValueAtTime(frequence, n);
        if (frequenceFin) o.frequency.exponentialRampToValueAtTime(frequenceFin, n + duree);
        g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(volume, n + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, n + duree);
        o.connect(g).connect(c.destination);
        o.onended = () => { o.disconnect(); g.disconnect(); this.sons.delete(o); };
        this.sons.add(o);
        o.start(n); o.stop(n + duree + 0.03);
    }

    // Coupe net les sons en cours
    taire() {
        this.sons.forEach((o) => o.stop());
    }

    endormir() {
        this.taire();
        if (this.contexte && this.contexte.state === 'running') this.contexte.suspend();
    }
}

// ===== L'ORDINATEUR =====
export class Ordinateur2001 {
    /**
     * @param {object} o
     * @param {THREE.Mesh} o.dalle             surface de l'écran Acer
     * @param {THREE.Object3D} o.menton        bas du cadre de l'écran, qui cache le bas de la dalle
     * @param {THREE.Object3D[]} o.zones       objets qui allument l'ordinateur quand on clique dessus
     * @param {HTMLElement} o.voileCalme       voile noir de la version « moins d'animations »
     * @param {HTMLElement} o.voileFinal       voile bleu qui passe le relais à la galerie
     * @param {HTMLButtonElement} o.boutonSon  bouton qui coupe et rétablit les bips
     * @param {HTMLElement[]} o.aEffacer       boutons effacés pendant le travelling
     * @param {Function} o.quandEteint         appelé quand l'ordinateur est rééteint (Échap)
     */
    constructor({ dalle, menton, zones, voileCalme, voileFinal, boutonSon, aEffacer, quandEteint }) {
        this.dalle = dalle;
        this.materiauEteint = dalle.material;
        this.voileCalme = voileCalme;
        this.voileFinal = voileFinal;
        this.aEffacer = aEffacer;
        this.quandEteint = quandEteint;
        this.sequence = null;
        this.pret = false;
        this.regard = new THREE.Vector3();
        this.arrivee = new THREE.Vector3();

        // Contenu de l'écran : canvas hors page, servi à la 3D comme texture
        this.canvas = document.createElement('canvas');
        this.canvas.width = LARGEUR; this.canvas.height = HAUTEUR;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        const motif = document.createElement('canvas');
        motif.width = 1; motif.height = 4;
        const m = motif.getContext('2d');
        m.fillStyle = 'rgba(0,0,0,0.16)'; m.fillRect(0, 2, 1, 2);
        this.trame = this.ctx.createPattern(motif, 'repeat');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.materiau = new THREE.MeshBasicMaterial({ map: this.texture, side: THREE.DoubleSide, fog: false, toneMapped: false });

        this.mesurerDalle(menton);

        // Lueur de l'écran sur le bureau : une lumière rectangulaire de la taille de l'image, posée
        // dessus, qui éclaire vers l'avant comme un vrai écran (une lumière ponctuelle laissait un
        // petit point brillant sur le marbre). Présente dès le chargement, à intensité 0, pour ne pas
        // recompiler les matériaux de la scène au premier clignotement.
        RectAreaLightUniformsLib.init();
        this.lumiere = new THREE.RectAreaLight(0xffffff, 0, 2 * this.demiLargeur, 2 * this.demiHauteur);
        this.lumiere.position.copy(this.centre);
        this.lumiere.lookAt(this.regard.copy(this.centre).add(this.normale));

        // Zones cliquables : boîtes englobantes, élargies sur écran tactile
        this.zones = zones.map((o) => new THREE.Box3().setFromObject(o));
        this.zonesDoigt = this.zones.map((b) => b.clone().expandByScalar(MARGE_DOIGT));

        // Lignes de la version calme : le texte entier est posé d'avance, la partie pas encore
        // tapée reste invisible, pour que chaque ligne garde sa place et le curseur la suive
        this.lignesCalmes = TEXTES.calme.map((texte) => {
            const ligne = document.createElement('span'), tape = document.createElement('span'), reste = document.createElement('span');
            ligne.className = 'voile__ligne'; tape.className = 'voile__tape'; reste.className = 'voile__reste';
            ligne.append(tape, reste);
            voileCalme.append(ligne);
            return { ligne, tape, reste, texte };
        });
        this.viderLignesCalmes();

        // Son : actif par défaut, choix du visiteur mémorisé
        this.bips = new Bips();
        this.boutonSon = boutonSon;
        let actif = true;
        try { actif = localStorage.getItem(CLE_SON) !== 'coupe'; } catch { /* stockage indisponible : son actif */ }
        this.reglerSon(actif);
        boutonSon.addEventListener('click', () => {
            this.reglerSon(!this.bips.actif);
            try { localStorage.setItem(CLE_SON, this.bips.actif ? 'actif' : 'coupe'); } catch { /* choix non mémorisé */ }
        });
        window.addEventListener('pagehide', () => this.bips.endormir());
    }

    // Image allumée de la dalle incurvée : la dalle moins le bas caché par le menton, moins le liseré.
    // Centre, normale et demi-dimensions en coordonnées du monde (cadrage du travelling, lueur ; la
    // scène est droite : le haut de l'écran est l'axe y du monde) ; liseré en pixels du dessin.
    mesurerDalle(menton) {
        const d = this.dalle;
        d.updateWorldMatrix(true, false);
        menton.updateWorldMatrix(true, false);
        const { radiusTop: r, height: h, thetaStart, thetaLength } = d.geometry.parameters;
        const surDalle = (theta, y) => d.localToWorld(new THREE.Vector3(r * Math.sin(theta), y, r * Math.cos(theta)));
        const milieu = thetaStart + thetaLength / 2;
        this.centre = surDalle(milieu, 0);
        this.normale = d.localToWorld(new THREE.Vector3()).sub(this.centre).normalize(); // vers le visiteur

        // Bords de l'image, en hauteur dans le repère de la dalle
        const hautMenton = d.worldToLocal(this.centre.clone().setY(new THREE.Box3().setFromObject(menton).max.y)).y;
        const bas = Math.max(hautMenton, -h / 2) + LISERE, haut = h / 2 - LISERE;

        const versBord = surDalle(thetaStart + LISERE / r, 0).sub(this.centre);
        this.fleche = versBord.dot(this.normale); // les bords de l'écran incurvé avancent vers le visiteur
        this.demiLargeur = versBord.addScaledVector(this.normale, -this.fleche).length();
        this.demiHauteur = Math.min(surDalle(milieu, haut).y - this.centre.y, this.centre.y - surDalle(milieu, bas).y);

        // Le dessin couvre toute la dalle : la texture épouse l'arc sur toute sa hauteur
        this.cadre = {
            cote: (LISERE / (r * thetaLength)) * LARGEUR,
            haut: (LISERE / h) * HAUTEUR,
            bas: ((bas + h / 2) / h) * HAUTEUR
        };
    }

    // Polices chargées, texture envoyée à la carte graphique et matériau compilé dès le chargement,
    // pour que rien ne saccade au moment où l'écran s'allume
    async preparer(renderer, camera, scene) {
        try {
            await Promise.all([document.fonts.load(mono(26), 'A/Δπ'), document.fonts.load(`${GRANDES.taille}px ${GRANDES.police}`, 'GDE')]);
        } catch { /* police indisponible : celle de secours prend le relais, la séquence reste jouable */ }
        dessinerEcran(this.ctx, T.FLASH - 0.5, 1, this.trame, this.cadre);
        renderer.initTexture(this.texture);
        renderer.compile(new THREE.Scene().add(new THREE.Mesh(this.dalle.geometry, this.materiau)), camera, scene);
        this.pret = true;
    }

    // Un rayon partant du pointeur touche-t-il l'écran, le clavier ou la souris ?
    vise(rayon, auDoigt) {
        return (auDoigt ? this.zonesDoigt : this.zones).some((boite) => rayon.intersectsBox(boite));
    }

    // À appeler pendant le geste du visiteur (clic, Entrée, Espace)
    allumer() {
        if (this.sequence) return;
        const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.bips.reveiller();
        this.sequence = { t: 0, calme, declenches: new Set(), depart: null, retour: null, fondus: [], partie: false };
        if (calme) {
            this.effacerBoutons(true);
            this.fondu(this.voileCalme, FONDU_NOIR);
        }
    }

    // Échap : l'écran se rééteint ; si la caméra avait commencé à avancer, elle recule d'abord
    interrompre() {
        const s = this.sequence;
        if (!s || s.partie || s.retour) return;
        this.eteindre();
        if (s.depart) s.retour = { z: progresTravelling(s.t), z0: progresTravelling(s.t), t: 0 };
        else this.terminer();
    }

    // Retour arrière du navigateur depuis la galerie : tout remettre comme avant le clic
    reinitialiser() {
        if (!this.sequence) return;
        this.eteindre();
        this.sequence = null;
    }

    mettreAJour(dt) {
        const s = this.sequence;
        if (!s || !this.pret) return;
        if (s.retour) {
            s.retour.t += dt;
            const u = clamp(s.retour.t / DUREE_RETOUR);
            s.retour.z = s.retour.z0 * (1 - lisse(u));
            if (u >= 1) this.terminer();
            return;
        }
        s.t += dt;
        this.jouerSons();
        if (s.calme) this.taperLignesCalmes();
        else {
            this.afficherEcran();
            this.une('travelling', T.TRAVELLING, () => this.effacerBoutons(true));
        }
        this.une('relais', s.calme ? T.FIN_CALME : T.FIN, () => {
            this.fondu(this.voileFinal, FONDU_BLEU).finished.then(() => {
                s.partie = true;
                window.location.assign(DESTINATION);
            }, () => { /* fondu annulé par Échap */ });
        });
    }

    // Pendant le travelling, l'ordinateur pilote la caméra ; renvoie false sinon
    piloterCamera(camera, regardInitial) {
        const s = this.sequence;
        if (!s || s.calme || (s.t < T.TRAVELLING && !s.retour)) return false;
        if (!s.depart) s.depart = { position: camera.position.clone(), regard: regardInitial.clone() };
        const z = s.retour ? s.retour.z : progresTravelling(s.t);
        this.poseFinale(camera);
        camera.position.lerpVectors(s.depart.position, this.arrivee, z);
        camera.lookAt(this.regard.lerpVectors(s.depart.regard, this.centre, z));
        return true;
    }

    // Bord à bord : la caméra, sur l'axe de la dalle, recule juste assez pour que l'image allumée
    // remplisse la fenêtre dans les deux sens, puis avance encore de 4,5 % : le liseré noir sort du
    // champ juste avant le relais. Recalculée à chaque image, elle suit un redimensionnement de la fenêtre.
    poseFinale(camera) {
        const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanH = tanV * camera.aspect;
        const d = Math.min(this.demiHauteur / (tanV * DEBORD), this.fleche + this.demiLargeur / (tanH * DEBORD));
        this.arrivee.copy(this.centre).addScaledVector(this.normale, d);
    }

    // ----- Rouages internes -----

    une(cle, quand, action) {
        const s = this.sequence;
        if (s.t >= quand && !s.declenches.has(cle)) { s.declenches.add(cle); action(); }
    }

    jouerSons() {
        const b = this.bips;
        if (this.sequence.calme) {
            TEXTES.calme.forEach((_, i) => this.une('c' + i, DEBUT_CALME + i * ECART_CALME, () => b.bip(1200, 0.04)));
            return;
        }
        this.une('ronron', T.CLIGNOTEMENT, () => b.bip(70, 1.2, 'sine', 0.03));
        this.une('rallumage', T.RALLUMAGE, () => b.bip(180, 0.12));
        TEXTES.initialisation.forEach((_, i) => this.une('l' + i, T.GLISSEMENT + i * ECART_LIGNES, () => b.bip(1400, 0.04)));
        PANNEAUX.forEach((p, i) => this.une('p' + i, p.t, () => b.bip(p.bip, 0.07)));
        this.une('flash', T.FLASH, () => b.bip(1200, 0.5, 'sine', 0.025, 300));
        this.une('elan', T.TRAVELLING, () => b.bip(200, 1.5, 'sine', 0.012, 520));
        this.une('fin', T.FIN, () => { b.bip(880, 0.12, 'sine', 0.025); b.bip(1320, 0.18, 'sine', 0.02, null, 0.11); });
    }

    afficherEcran() {
        const t = this.sequence.t, allume = estAllume(t);
        this.dalle.material = allume ? this.materiau : this.materiauEteint;
        if (!allume) { this.lumiere.intensity = 0; return; }
        dessinerEcran(this.ctx, t, 1 - progresTravelling(t), this.trame, this.cadre);
        this.texture.needsUpdate = true;
        const [r, v, b] = teinteMoyenne(t);
        this.lumiere.color.setRGB(r / 255, v / 255, b / 255, THREE.SRGBColorSpace);
        this.lumiere.intensity = LUMINANCE_LUEUR;
    }

    taperLignesCalmes() {
        const t = this.sequence.t;
        let derniere = null;
        this.lignesCalmes.forEach((l, i) => {
            const lt = t - (DEBUT_CALME + i * ECART_CALME);
            if (lt < 0) return;
            const n = Math.min(l.texte.length, Math.floor(lt * FRAPPE_CALME));
            if (l.tape.textContent.length !== n) { l.tape.textContent = l.texte.slice(0, n); l.reste.textContent = l.texte.slice(n); }
            derniere = l;
        });
        this.lignesCalmes.forEach((l) => l.ligne.classList.toggle('est-active', l === derniere));
    }

    viderLignesCalmes() {
        this.lignesCalmes.forEach((l) => {
            l.tape.textContent = ''; l.reste.textContent = l.texte;
            l.ligne.classList.remove('est-active');
        });
    }

    // Voile HTML en fondu ; l'animation est gardée pour pouvoir l'annuler
    fondu(voile, duree) {
        voile.hidden = false;
        const animation = voile.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duree, easing: 'ease', fill: 'forwards' });
        this.sequence.fondus.push(animation);
        return animation;
    }

    effacerBoutons(effaces) {
        this.aEffacer.forEach((b) => b.classList.toggle('hidden', effaces));
    }

    reglerSon(actif) {
        this.bips.actif = actif;
        this.boutonSon.setAttribute('aria-pressed', String(actif));
        if (!actif) this.bips.taire();
        else if (this.sequence) this.bips.reveiller();
    }

    // Écran éteint comme avant le clic, sons coupés, voiles retirés, boutons revenus
    eteindre() {
        this.sequence.fondus.forEach((a) => a.cancel());
        this.voileCalme.hidden = true;
        this.voileFinal.hidden = true;
        this.viderLignesCalmes();
        this.dalle.material = this.materiauEteint;
        this.lumiere.intensity = 0;
        this.bips.endormir();
        this.effacerBoutons(false);
    }

    terminer() {
        this.sequence = null;
        this.quandEteint();
    }
}

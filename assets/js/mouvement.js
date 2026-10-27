/**
 * MOUVEMENT.JS
 * Animations allumées ou éteintes : une seule source de vérité pour les pages perso, le musée et la galerie.
 * - Le choix du visiteur (interrupteur « Animations » des pages perso) l'emporte. Il est retenu de page en page sous la
 *   clé « perso-animations » (« on » ou « off ») ; un choix identique au réglage du système n'est pas gardé : on suit
 *   alors le système, y compris s'il change plus tard.
 * - Sans choix : le réglage « réduire les animations » du système, suivi en direct.
 * - Stockage refusé par le navigateur : on suit le système, et l'interrupteur vaut pour la page en cours.
 * Script classique chargé dans le <head>, avant le premier affichage : il pose data-mouvement="reduit" ou "normal" sur
 * <html>, sur lequel se règlent les feuilles de style (l'interrupteur montre le bon état dès la première image), et
 * donne aux autres scripts Mouvement.reduit, Mouvement.basculer() et l'événement « mouvementchange » de document.
 * Ils le lisent par window.Mouvement?.reduit : si ce fichier manque (échec du réseau, page encore en cache d'avant
 * son ajout), les animations restent allumées au lieu d'une page cassée.
 */
(() => {
    const CLE = 'perso-animations';
    const systeme = window.matchMedia('(prefers-reduced-motion: reduce)');
    const racine = document.documentElement;
    let choix = null; // 'on', 'off' ou null (aucun choix : le système décide)

    function lireChoix() {
        try {
            const valeur = localStorage.getItem(CLE);
            choix = valeur === 'on' || valeur === 'off' ? valeur : null;
        } catch {
            // Stockage refusé : le choix fait sur cette page, s'il y en a un, reste
        }
    }

    const calculer = () => (choix ? choix === 'off' : systeme.matches);

    lireChoix();
    let reduit = calculer();
    racine.dataset.mouvement = reduit ? 'reduit' : 'normal';

    // État recalculé et posé sur <html> ; les scripts sont prévenus s'il a changé
    function appliquer() {
        const avant = reduit;
        reduit = calculer();
        racine.dataset.mouvement = reduit ? 'reduit' : 'normal';
        if (reduit !== avant) document.dispatchEvent(new CustomEvent('mouvementchange', { detail: { reduit } }));
    }

    function basculer() {
        const allumees = reduit; // éteintes : on les rallume, et inversement
        choix = allumees === !systeme.matches ? null : (allumees ? 'on' : 'off');
        try {
            if (choix) localStorage.setItem(CLE, choix);
            else localStorage.removeItem(CLE);
        } catch {
            // Stockage refusé : le choix vaut pour cette page
        }
        appliquer();
    }

    // Réglage du système changé pendant la visite (sans effet si le visiteur a fait son choix)
    systeme.addEventListener('change', appliquer);

    // Choix fait dans un autre onglet du site, ou page retrouvée par le bouton Retour du navigateur
    window.addEventListener('storage', (e) => {
        if (e.key === CLE || e.key === null) {
            lireChoix();
            appliquer();
        }
    });
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            lireChoix();
            appliquer();
        }
    });

    window.Mouvement = Object.freeze({
        get reduit() {
            return reduit;
        },
        basculer
    });
})();

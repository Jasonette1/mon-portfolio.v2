/**
 * POLICE.JS
 * Police du menu « Font » : une seule source pour les pages perso, la Rétrospective et le musée.
 * - Le choix du visiteur (menu « Font », portal.js) est retenu de page en page sous la clé « perso-font ».
 * - Clé inconnue, ou stockage refusé par le navigateur : la police par défaut, PxPlus, sans erreur ; un choix fait
 *   pendant la visite vaut alors pour la page en cours.
 * Script classique chargé dans le <head>, juste après polices.css et avant le premier affichage : il pose la police
 * choisie sur <html> (--ki-font, que lisent les feuilles de style) et son nom dans le bouton du menu, pour que le
 * texte apparaisse d'emblée dans la bonne police et sous le bon nom, sans passer par une autre.
 * Donne à portal.js Police.cle (la police choisie), Police.noms et Police.choisir(cle), et prévient par l'événement
 * « policechange » de document quand la police affichée a changé. portal.js les lit par window.Police?. : si ce
 * fichier manque (échec du réseau, page encore en cache d'avant son ajout), la page reste en PxPlus au lieu de se
 * casser.
 */
(() => {
    const CLE = 'perso-font';
    const DEFAUT = 'PXVGA8';
    // Clé de chaque police (data-font du menu ; variable --font-<clé> de polices.css) et nom affiché
    const noms = Object.freeze({
        PXVGA8: 'PxPlus_IBM_VGA8',
        CascadiaMono: 'Cascadia Mono',
        Tenebris: 'Tenebris',
        TerminalGothic: 'Terminal Gothic'
    });
    const racine = document.documentElement;

    let cle = DEFAUT;
    try {
        const valeur = localStorage.getItem(CLE);
        if (Object.hasOwn(noms, valeur)) cle = valeur;
    } catch {
        // Stockage refusé : la police par défaut
    }

    const poser = () => racine.style.setProperty('--ki-font', `var(--font-${cle})`);
    poser();

    // Nom de la police dans le bouton du menu (pages perso, Rétrospective). La page l'écrit « PxPlus_IBM_VGA8 », la
    // police par défaut ; pour un autre choix, il est corrigé juste avant chaque image affichée tant que la page se
    // construit (son texte peut arriver en plusieurs morceaux). Ensuite, portal.js le tient à jour.
    if (cle !== DEFAUT) {
        const nommer = () => {
            const nom = document.getElementById('current-font-name');
            if (nom && nom.textContent !== noms[cle]) nom.textContent = noms[cle];
            if (document.readyState === 'loading') requestAnimationFrame(nommer);
        };
        requestAnimationFrame(nommer);
    }

    // Choix dans le menu
    function choisir(nouvelle) {
        if (!Object.hasOwn(noms, nouvelle) || nouvelle === cle) return;
        cle = nouvelle;
        try {
            localStorage.setItem(CLE, cle);
        } catch {
            // Stockage refusé : le choix vaut pour cette page
        }
        poser();
        document.dispatchEvent(new CustomEvent('policechange', { detail: { cle } }));
    }

    window.Police = Object.freeze({
        get cle() {
            return cle;
        },
        noms,
        choisir
    });
})();

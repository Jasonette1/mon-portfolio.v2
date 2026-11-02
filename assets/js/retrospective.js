/**
 * RETROSPECTIVE.JS
 * La frise des versions de l'accueil (retrospective/index.html). Le cran choisi affiche sa version dans le cadre et
 * son étiquette à droite, et s'écrit dans l'adresse (#janv-2026, #aujourd-hui…) : un lien partagé ou le bouton
 * Précédent du navigateur y ramènent. Sans ancre, la page s'ouvre sur la dernière version, « Aujourd'hui ».
 * Tout le contenu est dans le HTML, un <li> de frise et un <article> par version (même id que l'ancre du cran) : sans
 * ce script, la page montre toutes les étiquettes, chacune avec le lien vers sa version.
 * Chargé en fin de page : il règle l'affichage avant que la page ait fini de se construire.
 */
(() => {
    const frise = document.querySelector('.retro-frise ol');
    const crans = [...frise.querySelectorAll('a[href^="#"]')];
    const idDe = (lien) => decodeURIComponent(lien.hash.slice(1));
    const versions = new Map(crans.map((lien) => [lien, document.getElementById(idDe(lien))]));
    const parDefaut = crans[crans.length - 1];

    // Avec ce script, l'ancre désigne un cran et non un endroit de la page : l'id quitte l'article, sinon le
    // navigateur descendrait jusqu'à son étiquette en ouvrant une adresse à ancre (sur téléphone, sous la version)
    versions.forEach((article) => article.removeAttribute('id'));

    const precedente = document.querySelector('.retro-precedente');
    const suivante = document.querySelector('.retro-suivante');
    const nomFenetre = document.getElementById('retro-fenetre-nom');
    const periodeFenetre = document.getElementById('retro-fenetre-periode');
    const sourceFenetre = document.getElementById('retro-fenetre-source');
    const annonce = document.getElementById('retro-annonce');
    let cadre = document.querySelector('.retro-cadre');
    let courant = null;

    const texte = (element) => element.textContent.replace(/\s+/g, ' ').trim();
    const nomDe = (lien) => texte(lien.querySelector('.retro-nom'));

    // --- COMPTEUR « N version(s) » : le chiffre écrit dans le HTML n'est qu'une valeur de secours ---
    const compteur = document.querySelector('[data-count="versions"]');
    if (compteur) compteur.textContent = `${String(crans.length).padStart(3, '0')} version(s)`;

    // Lien « version d'avant » ou « d'après » : vers le cran voisin, ou caché au bout de la frise
    function relier(lien, cible) {
        lien.hidden = !cible;
        if (cible) {
            lien.href = cible.hash;
            lien.querySelector('.retro-lu').textContent = `, ${nomDe(cible)}`;
        } else {
            lien.removeAttribute('href');
        }
    }

    // Toute la page suit le cran : frise, étiquette, cadre, titre du cadre, versions voisines
    function poser(lien) {
        courant = lien;
        const article = versions.get(lien);
        const rang = crans.indexOf(lien);

        crans.forEach((cran) => {
            if (cran === lien) cran.setAttribute('aria-current', 'true');
            else cran.removeAttribute('aria-current');
        });
        versions.forEach((version) => {
            version.hidden = version !== article;
        });

        // Un cadre neuf plutôt qu'une nouvelle adresse dans l'ancien : changer de version n'ajoute pas d'étape à
        // l'historique du navigateur (Précédent ramène au cran d'avant, pas à la page qu'affichait le cadre)
        const adresse = new URL(article.dataset.cadre, document.baseURI).href;
        if (cadre.src !== adresse) {
            const neuf = cadre.cloneNode(false);
            neuf.src = adresse;
            neuf.title = article.dataset.titreCadre;
            cadre.replaceWith(neuf);
            cadre = neuf;
        }

        nomFenetre.textContent = texte(article.querySelector('h2'));
        periodeFenetre.textContent = texte(article.querySelector('[data-champ="periode"]'));
        sourceFenetre.textContent = texte(article.querySelector('[data-champ="source"]'));

        relier(precedente, crans[rang - 1]);
        relier(suivante, crans[rang + 1]);
    }

    // Annonce aux lecteurs d'écran, quand le focus ne bouge pas (sinon le cran qui reçoit le focus se lit lui-même)
    const dire = (lien) => {
        annonce.textContent = `Affichée\u00a0: ${versions.get(lien).dataset.titreCadre}`;
    };

    // Cran choisi par le visiteur : affiché, et écrit dans l'adresse
    function choisir(lien, { annoncer }) {
        if (lien === courant) return;
        poser(lien);
        history.pushState(null, '', lien.hash);
        if (annoncer) dire(lien);
    }

    // Cran désigné par l'adresse : l'ancre d'un cran, rien (la dernière version), ou une autre ancre (null : rien ne
    // change)
    function cranDeLAdresse() {
        const id = decodeURIComponent(location.hash.slice(1));
        if (!id) return parDefaut;
        return crans.find((lien) => idDe(lien) === id) ?? null;
    }

    // --- CLIC OU ENTRÉE sur un cran, ou sur « version d'avant / d'après » ---
    // Ctrl, Maj, la molette… : le navigateur ouvre le cran dans un nouvel onglet, comme un lien ordinaire
    document.querySelector('.retro-frise').addEventListener('click', (e) => {
        const lien = e.target.closest('a[href^="#"]');
        if (!lien || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        const cible = crans.find((cran) => cran.hash === lien.hash);
        if (!cible) return;
        e.preventDefault();
        choisir(cible, { annoncer: true });
    });

    // --- FLÈCHES DANS LA FRISE : ← et → passent au cran voisin, Début et Fin aux deux bouts ---
    // Seulement quand le focus est sur un cran : dans la version affichée, les flèches font défiler sa page.
    frise.addEventListener('keydown', (e) => {
        const lien = e.target.closest('a');
        if (!crans.includes(lien) || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        const rang = crans.indexOf(lien);
        const vers = { ArrowLeft: rang - 1, ArrowRight: rang + 1, Home: 0, End: crans.length - 1 }[e.key];
        if (vers === undefined) return;
        e.preventDefault();
        const cible = crans[Math.min(Math.max(vers, 0), crans.length - 1)];
        choisir(cible, { annoncer: false });
        cible.focus();
    });

    // --- BOUTON PRÉCÉDENT OU SUIVANT DU NAVIGATEUR, ancre changée à la main ---
    function suivreLAdresse() {
        const lien = cranDeLAdresse();
        if (!lien || lien === courant) return;
        poser(lien);
        dire(lien);
    }

    window.addEventListener('popstate', suivreLAdresse);
    window.addEventListener('hashchange', suivreLAdresse);

    // --- RACCOURCI « Passer la version » : au titre de l'étiquette, sans toucher à l'adresse ---
    document.querySelector('.retro-passer').addEventListener('click', (e) => {
        e.preventDefault();
        versions.get(courant).querySelector('h2').focus();
    });

    // --- DÉPART : le cran de l'adresse, sinon « Aujourd'hui » ---
    poser(cranDeLAdresse() ?? parDefaut);
})();

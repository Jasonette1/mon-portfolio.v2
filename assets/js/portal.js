/**
 * PORTAL.JS
 * Shared logic for the V2 "Notebook" theme.
 * Handles Font Switching and Menu UI.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIQUE DE CHANGEMENT DE POLICE ---
    const fontTrigger = document.getElementById('font-trigger');
    const fontMenu = document.getElementById('font-menu');
    const currentFontLabel = document.getElementById('current-font-name');
    const root = document.documentElement;

    // Configuration des polices (Noms d'affichage -> Variables CSS)
    const fonts = {
        'PXVGA8': { label: 'PxPlus_IBM_VGA8', var: '--font-PXVGA8' },
        'CascadiaMono': { label: 'Cascadia Mono', var: '--font-CascadiaMono' },
        'Tenebris': { label: 'Tenebris', var: '--font-Tenebris' },
        'TerminalGothic': { label: 'Terminal Gothic', var: '--font-TerminalGothic' }
    };

    function updateMenuHeight() {
        if (fontMenu && fontMenu.classList.contains('show')) {
            const height = fontMenu.scrollHeight;
            root.style.setProperty('--ki-menu-h', height + 'px');
        } else {
            root.style.setProperty('--ki-menu-h', '0px');
        }
    }

    if (fontTrigger && fontMenu) {
        // Bouton de menu (rôles et états écrits dans le HTML). La police en cours est cachée du menu
        // (.ki-item.selected, portal.css) : le clavier ne parcourt que les autres entrées.
        const items = [...fontMenu.querySelectorAll('.ki-item')];
        const choices = () => items.filter(item => !item.classList.contains('selected'));
        const isOpen = () => fontMenu.classList.contains('show');

        const openMenu = (focusLast = false) => {
            fontMenu.classList.add('show');
            fontTrigger.setAttribute('aria-expanded', 'true');
            updateMenuHeight();
            const list = choices();
            list[focusLast ? list.length - 1 : 0]?.focus();
        };

        // Échap et le choix d'une police ramènent le focus sur le bouton ; Tab et un clic ailleurs le laissent aller
        const closeMenu = (returnFocus = true) => {
            if (!isOpen()) return;
            fontMenu.classList.remove('show');
            fontTrigger.setAttribute('aria-expanded', 'false');
            updateMenuHeight();
            if (returnFocus) fontTrigger.focus();
        };

        const selectItem = (item) => {
            applyFont(item.dataset.font);
            closeMenu();
        };

        // Entrée et Espace passent par le clic du bouton
        fontTrigger.addEventListener('click', () => (isOpen() ? closeMenu() : openMenu()));

        fontTrigger.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                openMenu(e.key === 'ArrowUp');
            } else if (e.key === 'Escape') {
                closeMenu();
            }
        });

        fontMenu.addEventListener('click', (e) => {
            const item = e.target.closest('.ki-item');
            if (item) selectItem(item);
        });

        fontMenu.addEventListener('keydown', (e) => {
            const list = choices();
            const index = list.indexOf(document.activeElement);
            switch (e.key) {
                case 'ArrowDown': list[(index + 1) % list.length].focus(); break;
                case 'ArrowUp': list[(index - 1 + list.length) % list.length].focus(); break;
                case 'Home': list[0].focus(); break;
                case 'End': list[list.length - 1].focus(); break;
                case 'Enter':
                case ' ': if (index >= 0) selectItem(list[index]); break;
                case 'Escape': closeMenu(); break;
                case 'Tab': closeMenu(false); return; // le focus continue son chemin
                default: return;
            }
            e.preventDefault();
        });

        // Clic hors du menu et de son bouton : le menu se ferme
        document.addEventListener('click', (e) => {
            if (!fontTrigger.contains(e.target) && !fontMenu.contains(e.target)) closeMenu(false);
        });
    }

    function applyFont(key) {
        const fontData = fonts[key];
        if (!fontData) return;

        // Mise à jour de la variable CSS globale
        root.style.setProperty('--ki-font', `var(${fontData.var})`);

        // Mise à jour du label
        if (currentFontLabel) {
            currentFontLabel.textContent = fontData.label;
        }

        // La police choisie est cachée du menu (.ki-item.selected, portal.css)
        document.querySelectorAll('.ki-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.font === key);
        });

        // Sauvegarde préférence (localStorage)
        localStorage.setItem('perso-font', key);
    }

    // Chargement préférence au démarrage
    const savedFont = localStorage.getItem('perso-font');
    if (savedFont && fonts[savedFont]) {
        applyFont(savedFont);
    } else {
        // Défaut
        applyFont('PXVGA8');
    }
    // --- EFFET DE FRAPPE GENÉRIQUE (TYPING EFFECT) ---
    const typingElement = document.getElementById('typing-effect');
    if (typingElement) {
        // Liste des scripts possibles
        const scripts = [
            typingElement.getAttribute('data-text') || "dir *.asc", // garder l'original
            "sys info --verbose",
            "grep -r 'archive' ./logs",
            "ping 192.168.1.1",
            "chmod +x run_protocol.sh"
        ];

        // Base speeds
        const typeSpeedBase = 50;
        const deleteSpeedBase = 30;
        const pauseTime = 1000;

        let scriptIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let currentText = scripts[0];

        function type() {
            if (isDeleting) {
                charIndex--;
            } else {
                charIndex++;
            }

            // Gestion des bornes
            if (charIndex < 0) charIndex = 0;
            if (charIndex > currentText.length) charIndex = currentText.length;

            typingElement.textContent = currentText.substring(0, charIndex);

            // Add Randomness to speed
            let randomVar = Math.random() * 50;
            let delta = (isDeleting ? deleteSpeedBase : typeSpeedBase) + randomVar;

            if (!isDeleting && charIndex === currentText.length) {
                // Fin du texte : Pause aléatoire avant effacement
                delta = pauseTime + (Math.random() * 1000);
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                // Fin de l'effacement : Passer au texte suivant
                isDeleting = false;
                scriptIndex = (scriptIndex + 1) % scripts.length;
                currentText = scripts[scriptIndex];
                delta = 500; // Pause avant de recommencer
            }

            setTimeout(type, delta);
        }

        setTimeout(type, 500);
    }

    // --- RELIURE SPIRALE DYNAMIQUE (DYNAMIC SPIRAL) ---
    function initSpiral() {
        const spiralContainer = document.querySelector('.ki-spiral');
        const grid = document.querySelector('.ki-grid');

        if (!spiralContainer || !grid) return;

        // Vider le contenu existant
        spiralContainer.innerHTML = '';

        // Calculer la hauteur disponible
        const gridHeight = grid.clientHeight;

        // Estimation : hauteur d'une spirale (font-size:32px, line-height:24px, margin-bottom:-8px)
        // La hauteur visuelle effective est d'environ 24px.
        const spiralEffectiveHeight = 24;

        // Calcul du nombre de spirales nécessaires
        const count = Math.ceil(gridHeight / spiralEffectiveHeight);

        for (let i = 0; i < count; i++) {
            const span = document.createElement('span');
            span.textContent = ')';
            spiralContainer.appendChild(span);
        }
    }

    // --- CATALOGUE DYNAMIQUE (DYNAMIC CATALOGUE) ---
    function initCatalogue() {
        const gamesDivs = document.querySelectorAll('.ki-games');
        let catalogueList = null;

        gamesDivs.forEach(div => {
            const title = div.querySelector('.ki-section-title');
            if (title && title.textContent.trim().toUpperCase() === 'CATALOGUE') {
                catalogueList = div.querySelector('.ki-list');
            }
        });

        if (!catalogueList) return;

        // Vider la liste actuelle
        catalogueList.innerHTML = '';

        // Trouve toutes les sections dans la colonne de droite
        const rightCol = document.querySelector('.ki-col-right');
        if (!rightCol) return;

        const sections = rightCol.querySelectorAll('.ki-section-title');

        sections.forEach(sec => {
            const titleText = sec.textContent;
            let targetId = sec.id;

            if (!targetId) {
                targetId = titleText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                sec.id = targetId;
            }

            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#' + targetId;
            a.textContent = titleText;

            li.appendChild(a);
            catalogueList.appendChild(li);
        });

        // Mise à jour du compteur ARCHIVE 00X
        const countSpan = document.querySelector('.ki-count');
        if (countSpan) {
            const count = sections.length;
            // Formatage "00X"
            countSpan.textContent = count.toString().padStart(3, '0');
        }
    }

    // Initialisation
    initCatalogue();

    // --- COMPTEUR « N item(s) » (perso.html, sites.html) ---
    // Le compteur à remplir est désigné par data-count="items" ; le chiffre écrit
    // dans le HTML n'est qu'une valeur de secours, recalculée ici.
    function initItemCount() {
        const countSpan = document.querySelector('[data-count="items"]');
        if (!countSpan) return;

        let totalCount = 0;

        document.querySelectorAll('.ki-games').forEach(div => {
            const title = div.querySelector('.ki-section-title');
            // On compte tout sauf la navigation
            if (title && !title.textContent.toUpperCase().includes('NAVIGATION')) {
                const list = div.querySelector('.ki-list');
                if (list) {
                    totalCount += list.querySelectorAll('li').length;
                }
            }
        });

        countSpan.textContent = totalCount.toString().padStart(3, '0') + " item(s)";
    }

    // Initialisation
    initItemCount();

    // Initialisation et écoute du redimensionnement (Spirale)
    initSpiral();
    window.addEventListener('resize', initSpiral);

    // Recalcul après un court délai pour gérer le chargement des polices/images
    setTimeout(initSpiral, 100);
    setTimeout(initSpiral, 500);
});

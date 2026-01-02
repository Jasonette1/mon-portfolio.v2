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
        // Accessibility: ARIA setup
        fontTrigger.setAttribute('aria-haspopup', 'listbox');
        fontTrigger.setAttribute('aria-expanded', 'false');
        fontTrigger.setAttribute('role', 'button');
        fontTrigger.setAttribute('tabindex', '0');

        fontMenu.setAttribute('role', 'listbox');

        document.querySelectorAll('.ki-item').forEach(item => {
            item.setAttribute('role', 'option');
            item.setAttribute('tabindex', '-1'); // Manage focus manually
        });

        const toggleMenu = (show) => {
            const isShown = show !== undefined ? show : !fontMenu.classList.contains('show');
            if (isShown) {
                fontMenu.classList.add('show');
                fontTrigger.setAttribute('aria-expanded', 'true');
                // Focus first item
                const firstItem = fontMenu.querySelector('.ki-item');
                if (firstItem) firstItem.focus();
            } else {
                fontMenu.classList.remove('show');
                fontTrigger.setAttribute('aria-expanded', 'false');
                fontTrigger.focus();
            }
            updateMenuHeight();
        };

        // Click Logic
        fontTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Keyboard Logic for Trigger
        fontTrigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // Close on click outside
        document.addEventListener('click', () => {
            if (fontMenu.classList.contains('show')) {
                toggleMenu(false);
            }
        });

        // Selection Logic
        const items = document.querySelectorAll('.ki-item');
        items.forEach((item, index) => {
            // Click
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selectItem(item);
            });

            // Keyboard Navigation within Menu
            item.addEventListener('keydown', (e) => {
                e.stopPropagation(); // Prevent page scroll
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectItem(item);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = items[index + 1];
                    if (next) next.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = items[index - 1];
                    if (prev) prev.focus();
                } else if (e.key === 'Escape') {
                    toggleMenu(false);
                }
            });
        });

        function selectItem(item) {
            const fontKey = item.getAttribute('data-font');
            applyFont(fontKey);
            toggleMenu(false);
        }
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

        // Mise à jour de la classe .selected dans le menu
        document.querySelectorAll('.ki-item').forEach(item => {
            const isSelected = item.getAttribute('data-font') === key;
            if (isSelected) {
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.classList.remove('selected');
                item.setAttribute('aria-selected', 'false');
            }
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

    // --- COMPTEUR INDEX PERSO & SITES (DYNAMIC COUNT) ---
    function initPersoCount() {
        const gamesDivs = document.querySelectorAll('.ki-games');
        let totalCount = 0;

        gamesDivs.forEach(div => {
            const title = div.querySelector('.ki-section-title');
            // On compte tout sauf la navigation
            if (title && !title.textContent.toUpperCase().includes('NAVIGATION')) {
                const list = div.querySelector('.ki-list');
                if (list) {
                    totalCount += list.querySelectorAll('li').length;
                }
            }
        });

        const countSpan = document.querySelector('.ki-count');
        const titleBar = document.querySelector('.ki-titlebar span');

        // On vérifie qu'on est sur une page de type INDEX (INDEX :: PERSO, INDEX :: SITES...)
        // ascii.html a pour titre "ARCHIVE", donc il est exclu.
        if (titleBar && titleBar.textContent.includes('INDEX')) {
            if (countSpan) {
                countSpan.textContent = totalCount.toString().padStart(3, '0') + " item(s)";
            }
        }
    }

    // Initialisation
    initPersoCount();

    // Initialisation et écoute du redimensionnement (Spirale)
    initSpiral();
    window.addEventListener('resize', initSpiral);

    // Recalcul après un court délai pour gérer le chargement des polices/images
    setTimeout(initSpiral, 100);
    setTimeout(initSpiral, 500);
});

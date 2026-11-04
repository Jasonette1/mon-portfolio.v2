document.addEventListener('DOMContentLoaded', () => {
    // Défilement doux, ou saut direct quand les animations sont éteintes (mouvement.js, lu à chaque geste : suit
    // l'interrupteur en direct ; si ce fichier manque, le défilement reste doux)
    const defilement = () => (window.Mouvement?.reduit ? 'auto' : 'smooth');

    // ---------- Gestion du Thème (Dark/Light) ----------
    const themeSwitch = document.getElementById('theme-switch');
    const rootElement = document.documentElement;
    const themeIcon = themeSwitch ? themeSwitch.querySelector('i') : null;

    if (themeSwitch && themeIcon) {
        function setTheme(isDark) {
            rootElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            themeSwitch.setAttribute('aria-pressed', String(isDark));
            try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) { }
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }

        let savedTheme = null;
        try { savedTheme = localStorage.getItem('theme'); } catch (e) { }
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) { setTheme(savedTheme === 'dark'); } else { setTheme(systemPrefersDark); }

        themeSwitch.addEventListener('click', () => {
            const isDark = rootElement.getAttribute('data-theme') === 'dark';
            setTheme(!isDark);
        });
    }

    // ---------- Contour des cases du livre d'or : net au clavier seulement ----------
    // :focus-visible ne suffit pas : les navigateurs l'appliquent aussi au clic dans une case de texte. On retient
    // donc le dernier geste : une touche (sauf avec Ctrl, Alt ou Cmd, pour qu'un Alt+Tab vers une autre fenêtre ne
    // compte pas) ou un appui de souris, de doigt ou de stylet. Avant tout geste, on compte le clavier.
    let auClavier = true;
    document.addEventListener('keydown', (e) => {
        if (!e.altKey && !e.ctrlKey && !e.metaKey) auClavier = true;
    }, true);
    document.addEventListener('pointerdown', () => { auClavier = false; }, true);
    document.querySelectorAll('.guestbook-input, .guestbook-textarea').forEach((champ) => {
        champ.addEventListener('focus', () => champ.classList.toggle('focus-clavier', auClavier));
    });

    // ---------- Smart Scroll Navigation ----------
    const nav = document.querySelector('nav');
    let lastScrollTop = 0;
    const scrollThreshold = 10;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling DOWN & past header
            nav.classList.add('nav-hidden');
        } else {
            // Scrolling UP
            nav.classList.remove('nav-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    }, { passive: true });

    // ---------- Toggle "En savoir plus" ----------
    const toggleAbout = document.getElementById('toggle-about');
    if (toggleAbout) {
        toggleAbout.addEventListener('click', function () {
            const extraContent = document.getElementById('extra-about');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                extraContent.classList.remove('visible');
                this.setAttribute('aria-expanded', 'false');
                this.textContent = 'En savoir plus';
            } else {
                extraContent.classList.add('visible');
                this.setAttribute('aria-expanded', 'true');
                this.textContent = 'Réduire';
                extraContent.scrollIntoView({ behavior: defilement(), block: 'nearest' });
            }
        });
    }

    // ---------- Bouton "Retour en haut" ----------
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { backToTopButton.classList.add('show'); } else { backToTopButton.classList.remove('show'); }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: defilement() });
        });
    }

    // ---------- Mode Lite ----------
    const liteModeToggle = document.getElementById('lite-mode-toggle');
    if (liteModeToggle) {
        if (localStorage.getItem('liteMode') === 'enabled') {
            rootElement.classList.add('lite-mode');
            liteModeToggle.textContent = "Mode complet";
        }
        liteModeToggle.addEventListener('click', () => {
            if (rootElement.classList.contains('lite-mode')) {
                rootElement.classList.remove('lite-mode');
                localStorage.setItem('liteMode', 'disabled');
                liteModeToggle.textContent = "Mode Lite";
            } else {
                rootElement.classList.add('lite-mode');
                localStorage.setItem('liteMode', 'enabled');
                liteModeToggle.textContent = "Mode complet";
            }
        });

        // Footer Layout Logic (overlapping check)
        const footerParagraph = document.querySelector('footer p');
        if (footerParagraph) {
            function updateLayout() {
                const footerRect = footerParagraph.getBoundingClientRect();
                const buttonRect = liteModeToggle.getBoundingClientRect();
                const isOverlapping = buttonRect.top < footerRect.bottom - 10;
                if (isOverlapping || window.innerWidth < 768) {
                    liteModeToggle.classList.add('force-mobile');
                } else {
                    liteModeToggle.classList.remove('force-mobile');
                }
            }
            new ResizeObserver(updateLayout).observe(footerParagraph);
            window.addEventListener('resize', updateLayout);
            updateLayout();
        }
    }
});

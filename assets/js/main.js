document.addEventListener('DOMContentLoaded', () => {
    // ---------- Gestion du Thème (Dark/Light) ----------
    const themeSwitch = document.getElementById('theme-switch');
    const rootElement = document.documentElement;
    const themeIcon = themeSwitch ? themeSwitch.querySelector('i') : null;

    if (themeSwitch && themeIcon) {
        function setTheme(isDark) {
            rootElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
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
                extraContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------- Gestion du clic sur le logo ----------
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        // Prevent hash updates if needed, or simply reload
        const currentUrlWithoutHash = window.location.href.split('#')[0];
        // Optional: logoLink.setAttribute('href', currentUrlWithoutHash);
        logoLink.addEventListener('click', (e) => {
            // If internal anchor logic isn't desired
            // here we perform a hard reload on click
            if (e.button === 0) {
                // e.preventDefault(); // Uncomment if href is "#"
                // window.location.reload();
            }
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

    // --- EASTER EGG 1: LE MOT DE PASSE ---
    // Tapez "jaspe" n'importe où sur la page pour accéder à la section secrète
    const secretCode = 'jaspe';
    let inputSequence = '';

    document.addEventListener('keydown', (e) => {
        // Ajoute la touche à la séquence
        inputSequence += e.key.toLowerCase();

        // Si la séquence devient trop longue, on garde juste la fin
        if (inputSequence.length > secretCode.length) {
            inputSequence = inputSequence.slice(-secretCode.length);
        }

        // Vérification
        if (inputSequence === secretCode) {
            window.location.href = 'perso.html';
        }
    });
});

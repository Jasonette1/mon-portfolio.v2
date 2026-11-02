// Copie de la Rétrospective, version de janvier 2026 : une archive. Son livre d'or montre les messages publics qu'on y
// lisait à l'époque et n'écrit jamais rien, ni en public ni en privé (on écrit dans la version « Aujourd'hui »).

// Importation des fonctions Firebase (lecture seule)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    onSnapshot,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ======================================================
// CONFIGURATION FIREBASE
// ======================================================
const firebaseConfig = {
    apiKey: "AIzaSyBZHFrdjA1mITh3uWPnkC6gYrrb32Ar7wI",
    authDomain: "yl-page-perso.firebaseapp.com",
    projectId: "yl-page-perso",
    storageBucket: "yl-page-perso.firebasestorage.app",
    messagingSenderId: "734651413356",
    appId: "1:734651413356:web:79bb9f58931b819bee7949",
    measurementId: "G-4HLXR2FHN7"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    // Références DOM
    const form = document.getElementById('guestbook-form');
    const messagesContainer = document.getElementById('messages-list');
    const privateExplanation = document.getElementById('private-explanation');
    const submitBtn = document.getElementById('submitBtn');
    const statut = document.getElementById('guestbook-status'); // annonces pour les lecteurs d'écran

    // Toggle Buttons
    const btnPublic = document.getElementById('mode-public');
    const btnPrivate = document.getElementById('mode-private');

    // Private Mode Inputs
    const anonymousWrapper = document.getElementById('anonymous-wrapper');
    const isAnonymousCb = document.getElementById('isAnonymous');

    if (!form || !messagesContainer) return;

    // État actuel
    let isPrivateMode = false;

    // Liste des pseudonymes célèbres
    const anonymousNames = [
        "LouiseMichel82",
        "X_JulesFerry_X",
        "Condorcet12",
        "MariaMontessori_Off",
        "CelestinF",
        "Rousseau_JJ",
        "Pestalozzi_1746",
        "KJanuszツ",
        "Comenius™"
    ];

    let previousName = ""; // Pour restaurer si on décoche

    // --- GESTION DU CHECKBOX ANONYME ---
    if (isAnonymousCb) {
        isAnonymousCb.addEventListener('change', (e) => {
            const nameInput = document.getElementById('authorName');
            if (e.target.checked) {
                // Sauvegarder le nom actuel
                previousName = nameInput.value;
                // Choisir un pseudo aléatoire
                const randomName = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
                nameInput.value = randomName;
                // Optionnel : empêcher l'édition pour forcer le pseudo ? 
                // nameInput.readOnly = true; 
            } else {
                // Restaurer l'ancien nom ou vider
                nameInput.value = previousName;
                // nameInput.readOnly = false;
            }
        });
    }

    // --- GESTION DU TOGGLE MODE ---
    function switchMode(toPrivate) {
        if (toPrivate === isPrivateMode) return;
        isPrivateMode = toPrivate;

        if (isPrivateMode) {
            // Activer Mode Privé
            btnPrivate.classList.add('active');
            btnPrivate.setAttribute('aria-pressed', 'true');
            btnPublic.classList.remove('active');
            btnPublic.setAttribute('aria-pressed', 'false');

            messagesContainer.style.display = 'none';
            privateExplanation.style.display = 'block';
            anonymousWrapper.style.display = 'block';
            submitBtn.textContent = 'Envoyer le message privé';
        } else {
            // Activer Mode Public
            btnPublic.classList.add('active');
            btnPublic.setAttribute('aria-pressed', 'true');
            btnPrivate.classList.remove('active');
            btnPrivate.setAttribute('aria-pressed', 'false');

            messagesContainer.style.display = 'block';
            privateExplanation.style.display = 'none';
            anonymousWrapper.style.display = 'none';
            submitBtn.textContent = 'Publier le message';
        }
    }

    if (btnPublic && btnPrivate) {
        btnPublic.addEventListener('click', () => switchMode(false));
        btnPrivate.addEventListener('click', () => switchMode(true));
    }


    // --- 1. AFFICHAGE DES MESSAGES (TEMPS RÉEL - PUBLIC ) ---
    // Archive : les messages publics datés d'avant le 21 octobre 2026 à 0 h, heure de Paris (UTC+2 ce jour-là), ceux
    // qu'on lisait sur l'accueil à l'époque ; le filtre et le tri portent sur le même champ (aucun index composé)
    const finDeLaVersion = Date.UTC(2026, 9, 20, 22);
    const q = query(collection(db, "guestbook"), where("timestamp", "<", finDeLaVersion), orderBy("timestamp", "desc"),
        limit(50));

    onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = ''; // Nettoyer l'affichage

        if (snapshot.empty) {
            messagesContainer.innerHTML = '<div style="text-align:center; opacity:0.6;">Soyez le premier à laisser un message !</div>';
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';

            // Formatage de la date en français
            const date = new Date(data.timestamp);
            const dateStr = new Intl.DateTimeFormat('fr-FR', {
                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
            }).format(date);

            // Protection XSS : On utilise textContent pour le contenu utilisateur
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = data.content;

            // Construction HTML sécurisée
            messageCard.innerHTML = `
                    <div class="message-header">
                        <span class="message-author">${sanitize(data.author_name)}</span>
                        <span class="message-date">${dateStr}</span>
                    </div>
                `;
            messageCard.appendChild(contentDiv);
            messagesContainer.appendChild(messageCard);
        });
    }, (error) => {
        console.error("Erreur de lecture :", error);
        messagesContainer.innerHTML = '<div style="color:var(--secondary-color);">Impossible de charger les messages pour le moment.</div>';
    });

    // Fonction simple de nettoyage (Sanitization)
    function sanitize(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // --- 2. ENVOI DE MESSAGE : RIEN NE PART (ARCHIVE) ---
    // Le bouton le dit, à la place où l'accueil affichait « Envoi en cours... », et les lecteurs d'écran l'entendent ;
    // le texte écrit reste dans les cases, pour qui veut le reprendre dans « Aujourd'hui ». Le bouton retrouve son nom
    // dès qu'on retouche le formulaire (changer de mode le renomme aussi, switchMode).
    // (\u00a0 : espaces insécables devant « : » et dans les guillemets)
    const nomDuBouton = () => (isPrivateMode ? "Envoyer le message privé" : "Publier le message");
    let annonce = 0;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBtn.textContent = "Archive\u00a0: écrivez dans «\u00a0Aujourd'hui\u00a0»";
        // Vidée puis remplie un instant après : la même annonce est redite à chaque essai
        statut.textContent = '';
        clearTimeout(annonce);
        annonce = setTimeout(() => {
            statut.textContent = "Rien n'est parti\u00a0: cette version de janvier 2026 est une archive, son livre d'or "
                + "se lit sans s'écrire. Pour laisser un message, choisissez «\u00a0Aujourd'hui\u00a0» sur la frise de "
                + "la Rétrospective.";
        }, 100);
    });

    form.addEventListener('input', () => {
        clearTimeout(annonce);
        submitBtn.textContent = nomDuBouton();
        statut.textContent = '';
    });

});

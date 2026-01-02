// Importation des fonctions Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
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
    const q = query(collection(db, "guestbook"), orderBy("timestamp", "desc"), limit(50));

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

    // --- 2. ENVOI DE MESSAGE ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('authorName');
        const contentInput = document.getElementById('messageContent');
        let name = nameInput.value.trim();
        const content = contentInput.value.trim();

        if (!name || !content) return;

        // Gestion Anonymat (Mode Privé uniquement)
        // Note: Le nom est déjà rempli par le checkbox, mais on s'assure qu'il n'est pas vide
        if (isPrivateMode && isAnonymousCb.checked && (!name || name === "")) {
            name = "Anonyme"; // Fallback au cas où
        }

        // UI : Désactiver le bouton pendant l'envoi
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours...";

        try {
            // Choix de la collection en fonction du mode
            const collectionName = isPrivateMode ? "guestbook_private" : "guestbook";

            await addDoc(collection(db, collectionName), {
                author_name: name,
                content: content,
                timestamp: Date.now(),
                is_private: isPrivateMode // Flag utile
            });

            // Reset du formulaire
            nameInput.value = '';
            contentInput.value = '';
            if (isAnonymousCb) isAnonymousCb.checked = false;

            const successMsg = isPrivateMode ? "Message privé envoyé !" : "Message publié !";
            submitBtn.textContent = successMsg;

            // Remettre le bouton normal après 2 secondes
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = isPrivateMode ? "Envoyer le message privé" : "Publier le message";
            }, 2000);

        } catch (error) {
            console.error("Erreur d'envoi :", error);
            submitBtn.textContent = "Erreur, réessayez.";
            submitBtn.disabled = false;
        }
    });

});

// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1RnfF5eEeAx3mFrTagLq_C2LSB1DjeA20UOANh9wE7uk/gviz/tq?tqx=out:json'; 
// =====================================================================

let proData = []; 
// Nouvelle variable pour stocker la position de l'utilisateur
let userLocation = null;

// Éléments DOM
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const homePage = document.getElementById('home-page');
const chatPage = document.getElementById('chat-page');
const startChatBtn = document.getElementById('start-chat-btn');
const accueilBtnNav = document.getElementById('accueil-btn-nav');
const proCountDisplay = document.getElementById('pro-count-display'); // NOUVEAU


// =====================================================================
// LISTES DE RÉFÉRENCE (INCHANGÉES)
// =====================================================================

// NOUVEAU: Mots-clés pour détecter une recherche de proximité
const GEO_KEYWORDS_PROXIMITY = ['près de moi', 'autour de moi', 'proche', 'voisinage'];
// LISTE ÉTENDUE des lieux à chercher à proximité
const GEO_KEYWORDS_PLACES = [
    'banque', 'hôpital', 'pharmacie', 'commissariat', 'poste', 'urgence', 'distributeur', 
    'supermarché', 'restaurant', 'marché', 'école', 'université', 'stade', 'mosquée', 
    'église', 'hôtel', 'aéroport', 'bus', 'station-service', 'garage' 
];

const ALL_CITIES = [
    'Banikoara', 'Gogounou', 'Kandi', 'Karimama', 'Malanville', 'Segbana', 'Boukoumbé', 'Cobly', 'Kérou', 'Kouandé', 
    'Matéri', 'Natitingou', 'Péhunco', 'Tanguiéta', 'Toucountouna', 'Abomey-Calavi', 'Allada', 'Kpomassè', 'Ouidah', 
    'Sô-Ava', 'Toffo', 'Tori-Bossito', 'Zè', 'Bembéréké', 'Kalalé', 'N\'Dali', 'Nikki', 'Parakou', 'Pèrèrè', 'Sinendé', 
    'Tchaourou', 'Bantè', 'Dassa-Zoumé', 'Glazoué', 'Ouèssè', 'Savalou', 'Savè', 'Aplahoué', 'Djakotomey', 'Dogbo', 
    'Klouékanmè', 'Lalo', 'Toviklin', 'Bassila', 'Copargo', 'Djougou', 'Ouaké', 'Cotonou', 'Athiémè', 'Bopa', 'Comè', 
    'Grand-Popo', 'Houéyogbé', 'Lokossa', 'Adjarra', 'Adjohoun', 'Aguégués', 'Akpro-Missérété', 'Avrankou', 'Bonou', 
    'Dangbo', 'Porto-Novo', 'Sèmè-Kpodji', 'Ifangni', 'Kétou', 'Pobè', 'Sakété', 'Abomey', 'Agbangnizoun', 'Bohicon', 
    'Covè', 'Djidja', 'Ouinhi', 'Za-Kpota', 'Zogbodomey'
].map(city => city.toLowerCase()); 

// =====================================================================
// FONCTIONS DE BASE
// =====================================================================

function showPage(pageId) {
    if (pageId === 'home') {
        homePage.style.opacity = 1;
        chatPage.style.opacity = 0;
        homePage.style.transform = 'translateX(0)';
        chatPage.style.transform = 'translateX(100%)';
        setTimeout(() => {
            homePage.classList.remove('d-none');
            chatPage.classList.add('d-none');
        }, 500); 

    } else if (pageId === 'chat') {
        chatPage.style.opacity = 0;
        chatPage.style.transform = 'translateX(100%)';
        chatPage.classList.remove('d-none');
        
        setTimeout(() => {
            homePage.style.opacity = 0;
            chatPage.style.opacity = 1;
            chatPage.style.transform = 'translateX(0)';
            userInput.focus();
        }, 50); 
        
        setTimeout(() => {
            homePage.classList.add('d-none');
        }, 500);
    }
}
// FIX: L'élément accueilBtnNav n'existe pas dans le HTML fourni, donc on le désactive si vous ne l'avez pas ajouté.
// startChatBtn.addEventListener('click', () => showPage('chat'));
// accueilBtnNav.addEventListener('click', () => showPage('home')); 


function appendMessage(sender, text, isHtml = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    if (isHtml) {
        messageElement.innerHTML = text;
    } else {
        messageElement.textContent = text;
    }
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// =====================================================================
// FONCTIONS DE GESTION DES DONNÉES (MISE À JOUR CRITIQUE DU MAPPING)
// =====================================================================

/**
 * Cartographie simplifiée des colonnes GVIZ (B à O dans la feuille)
 * @param {object} row - Ligne de données GVIZ
 */
function processRow(row) {
    const cells = row.c;
    
    // --- NOUVEAU MAPPING SIMPLIFIÉ BASÉ SUR LES INDICES CELL[0] à CELL[13] ---
    // Les indices des cellules (cells[i]) correspondent aux colonnes B, C, D... de la feuille.
    
    // Extraction et nettoyage des données critiques
    const noteAvis = cells[11] ? (cells[11].v || 3.0) : 3.0; // Col M
    const prixMin = cells[9] ? (cells[9].v || 0) : 0;        // Col K
    const prixMax = cells[10] ? (cells[10].v || 0) : 0;      // Col L
    const visible = cells[12] && normalizeKeyword(cells[12].v) === 'oui'; // Col N

    // Note: Dans ce mapping, on ignore la longitude/latitude qui n'étaient pas extraites dans le code précédent, 
    // mais on conserve l'Indication GPS (Col G/cells[5]) pour le lien Google Maps.
    
    return {
        nom: cells[0] ? cells[0].v : 'N/A',
        entreprise: cells[1] ? cells[1].v : 'N/A',
        contact: cells[2] ? cells[2].v : 'N/A',
        ville: cells[3] ? cells[3].v : 'N/A',
        quartier: cells[4] ? cells[4].v : 'N/A',
        indication_gps: cells[5] ? cells[5].v : null, // G: Indication GPS
        secteur: cells[6] ? cells[6].v : 'N/A',       // H: Secteur Général
        activite: cells[7] ? cells[7].v : 'N/A',      // I: Activité Détaillée
        experience: cells[8] ? parseInt(cells[8].v) || 0 : 0, // J: Expérience
        prix_min: parseFloat(prixMin) || 0,
        prix_max: parseFloat(prixMax) || 0,
        note_avis: parseFloat(noteAvis) || 3.0,
        visible: visible
    };
}


// Fonction de chargement des données
async function loadProData() {
    try {
        appendMessage('bot', "Démarrage de l'assistant... Chargement des données d'annuaire...");
        
        // Requête GVIZ pour sélectionner les 14 colonnes de données B à O
        const tq = '&tq=SELECT B, C, D, E, F, G, H, I, J, K, L, M, N, O'; 
        const url = SHEET_API_URL + tq;

        const response = await fetch(url);
        const text = await response.text();
        
        // Nettoyage de la réponse GVIZ
        const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
        const data = JSON.parse(jsonText);
        
        const allRows = data.table.rows || [];
        // Filtrer ici les lignes visibles (Colonne N/cells[12] = 'Oui')
        const visibleRows = allRows.filter(row => row.c[12] && normalizeKeyword(row.c[12].v) === 'oui');
        
        proData = visibleRows.map(processRow);
        
        // NOUVEAU : Afficher le nombre total de professionnels après le chargement
        if (proCountDisplay) {
            proCountDisplay.textContent = `Total de ${proData.length} professionnels enregistrés.`;
        }
        
        appendMessage('bot', `Annuaire chargé avec succès (${proData.length} pros visibles). Bonjour ! Je suis ProFinder. Que recherchez-vous ?`);
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        if (proCountDisplay) proCountDisplay.textContent = "Erreur de chargement des données.";
        appendMessage('bot', "⚠️ Erreur: Impossible de charger l'annuaire. Vérifiez la connexion ou les autorisations de partage de la Google Sheet.");
    }
}


// =====================================================================
// FONCTIONS DE RENDU (INCHANGÉES)
// =====================================================================

function getStarRating(note) {
    const normalizedNote = Math.max(0, Math.min(5, parseFloat(note)));
    const roundedNote = Math.round(normalizedNote * 2) / 2; 
    let stars = '';
    const fullStars = Math.floor(roundedNote);
    for (let i = 0; i < fullStars; i++) {
        stars += '★'; 
    }
    const hasHalfStar = (roundedNote - fullStars) === 0.5;
    if (hasHalfStar) {
        stars += '½'; 
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 0.5 : 0);
    for (let i = 0; i < Math.floor(emptyStars); i++) {
        stars += '☆'; 
    }
    return `<span class="star-rating">${stars}</span>`;
}

function formatFCFA(number) {
    if (number === null || isNaN(number) || number === 0) return 'Prix non précisé';
    return new Intl.NumberFormat('fr-FR').format(number) + ' FCFA';
}

function renderProCard(pro) {
    const card = document.createElement('div');
    card.classList.add('pro-card', 'animated-pop');
    
    const whatsappNumber = pro.contact ? pro.contact.replace(/\s/g, '').replace(/^\+/, '') : '';
    const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
    
    const ratingBadge = `<div class="rating-badge">${getStarRating(pro.note_avis)} (${pro.note_avis.toFixed(1)})</div>`;
    
    let priceRangeHtml = `<div class="price-range">Prix : ${formatFCFA(pro.prix_min)} - ${formatFCFA(pro.prix_max)}</div>`;

    // Utilisation de Indication GPS (Col G) pour le lien de localisation
    const locationLink = pro.indication_gps 
        ? `<a href="${pro.indication_gps}" target="_blank" class="location-link"><i class="bi bi-geo-alt-fill"></i> Voir la Localisation</a>` 
        : `<span class="location-link text-secondary">Localisation non fournie</span>`;

    card.innerHTML = `
        <div class="card-header-content">
            <div class="badge-verified">PRO VÉRIFIÉ</div>
            ${ratingBadge}
        </div>
        <h3>${pro.entreprise}</h3>
        <h4>${pro.activite} (${pro.secteur}) - Exp. ${pro.experience} ans</h4>
        <p class="location-text"><i class="bi bi-pin-map-fill"></i> ${pro.quartier}, ${pro.ville}</p>
        ${priceRangeHtml}
        
        <div class="card-actions">
            ${locationLink}
            <a href="${whatsappLink}" target="_blank" class="whatsapp-link">
                <i class="bi bi-whatsapp"></i> Contacter sur WhatsApp
            </a>
        </div>
    `;
    
    return card;
}


// =====================================================================
// FONCTIONS UTILITAIRES ET LOGIQUE DE RECHERCHE (INCHANGÉES)
// =====================================================================

function normalizeKeyword(keyword) {
    return keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function sortProfessionals(a, b) {
    if (b.note_avis !== a.note_avis) {
        return b.note_avis - a.note_avis; 
    }
    return b.experience - a.experience;
}


// FIX / NOUVEAU: Logique de géolocalisation et du compteur.
// Ce bloc est conservé et adapté pour fonctionner avec la nouvelle fonction processRow
// qui utilise cells[5] pour l'Indication GPS.

let lastProximityQuery = ''; 

function promptForLocation(originalQuery) {
    const promptHtml = `
        <div class="location-prompt message bot">
            <p>Pour trouver les professionnels les plus proches de vous, nous avons besoin d'accéder à votre position actuelle.</p>
            <button class="accept-btn">Partager ma position</button>
            <button class="decline-btn">Non, merci</button>
        </div>
    `;
    
    appendMessage('bot', promptHtml, true);

    document.querySelector('.location-prompt .accept-btn').onclick = () => {
        document.querySelector('.location-prompt').remove(); 
        appendMessage('user', 'Oui, je partage ma position.');
        requestUserLocation(originalQuery);
    };

    document.querySelector('.location-prompt .decline-btn').onclick = () => {
        document.querySelector('.location-prompt').remove(); 
        appendMessage('user', 'Non, merci.');
        appendMessage('bot', "D'accord, je vais effectuer une recherche classique sans votre localisation.");
        filterAndDisplayResults(originalQuery);
    };
}

function requestUserLocation(originalQuery) {
    appendMessage('bot', "Localisation en cours...");
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Retirer les mots-clés de proximité de la requête pour la recherche Maps
                const searchKeyword = originalQuery.toLowerCase().replace(new RegExp(GEO_KEYWORDS_PROXIMITY.join('|'), 'g'), '').trim();
                
                // Générer le lien Google Maps
                // La requête maps sera : [profession] @ [lat, lng]
                // ENCODAGE ESSENTIEL pour l'URL
                const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchKeyword)}/@${userLocation.lat},${userLocation.lng},14z`;

                const successMessage = `
                    Position obtenue. Pour voir les **${searchKeyword || 'professionnels'}** classés par distance par Google Maps, cliquez sur le lien ci-dessous.
                    <p><a href="${mapsUrl}" target="_blank" class="location-link" style="color:#25D366; text-decoration:underline;">▶️ Lancer la recherche sur Google Maps</a></p>
                `;
                appendMessage('bot', successMessage, true);
                
                // Mener une recherche classique dans l'annuaire en plus, triée par note.
                filterAndDisplayResults(originalQuery);
            },
            (error) => {
                let errorMessage = "Je n'ai pas pu obtenir votre position. Raisons possibles : ";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Accès refusé. Veuillez autoriser le partage de position.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Position indisponible.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Délai de réponse dépassé.";
                        break;
                    default:
                        errorMessage += "Erreur inconnue.";
                        break;
                }
                appendMessage('bot', `⚠️ ${errorMessage} Je vais lancer une recherche classique.`);
                filterAndDisplayResults(originalQuery);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        appendMessage('bot', "Votre navigateur ne supporte pas la géolocalisation. Je vais lancer une recherche classique.");
        filterAndDisplayResults(originalQuery);
    }
}


function filterData(query) {
    if (!query) {
        return proData.sort(sortProfessionals);
    }
    
    const lowerQuery = normalizeKeyword(query);
    const queryWords = query ? lowerQuery.split(/[\\s,;']+/).filter(w => w.length > 2) : [];
    
    let activite = '';
    let ville = '';
    
    // Détermination de la ville ou localisation
    for (const city of ALL_CITIES) {
        if (lowerQuery.includes(city)) {
            ville = city;
            break;
        }
    }
    
    // Détermination de l'activité
    const parts = lowerQuery.split(/à |près de |autour de |en |dans /);
    if (parts.length > 0 && parts[0].trim().length > 2) {
        activite = parts[0].trim();
    } else if (!ville) {
        activite = lowerQuery;
    }
    
    // Logique de filtrage
    let filteredList = proData.filter(pro => {
        let matchActivite = false;
        let matchVille = false;
        
        const proActivite = normalizeKeyword(pro.activite);
        const proSecteur = normalizeKeyword(pro.secteur);
        const proVille = normalizeKeyword(pro.ville);
        const proQuartier = normalizeKeyword(pro.quartier);

        // 1. Logique d'Activité
        if (activite) {
            matchActivite = proActivite.includes(activite) || proSecteur.includes(activite) || 
                            queryWords.some(word => proActivite.includes(word) || proSecteur.includes(word));
        } else {
            matchActivite = true; 
        }
        
        // 2. Logique de Ville/Quartier
        if (ville) {
            const fullLocation = proVille + ' ' + proQuartier;
            matchVille = fullLocation.includes(lowerQuery) || proVille.includes(ville);
        } else {
            matchVille = true;
        }
        
        return matchActivite && matchVille;
    });
    
    return filteredList.sort(sortProfessionals);
}

function filterAndDisplayResults(query) {
    const filteredPros = filterData(query);
    
    const existingMessages = Array.from(chatBox.children).filter(child => child.classList.contains('message') || child.classList.contains('location-prompt'));
    chatBox.innerHTML = '';
    existingMessages.forEach(msg => chatBox.appendChild(msg));

    if (proCountDisplay) {
        proCountDisplay.textContent = `${filteredPros.length} professionnel(s) trouvé(s) pour votre recherche sur ${proData.length} pros enregistrés.`;
    }

    if (filteredPros.length === 0) {
        appendMessage('bot', `Désolé, je n'ai trouvé aucun professionnel correspondant à votre recherche "${query}". Essayez des mots-clés différents ou une autre ville.`);
    } else {
        appendMessage('bot', `J'ai trouvé ${filteredPros.length} professionnel(s) correspondant(s) à votre recherche. Voici les meilleurs (triés par Note/Avis) :`);
        filteredPros.slice(0, 5).forEach(pro => { 
            chatBox.appendChild(renderProCard(pro));
        });
         if (filteredPros.length > 5) {
             appendMessage('bot', `... ${filteredPros.length - 5} autres experts trouvés. Soyez plus précis pour affiner.`, false);
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}


function handleChat() {
    const query = userInput.value.trim();
    if (query === '' || proData.length === 0) return;

    appendMessage('user', query);
    userInput.value = '';
    
    // Détecter si la requête est du type "près de moi" pour un lieu (Banque, Hôpital, etc.)
    const isProximityQuery = GEO_KEYWORDS_PROXIMITY.some(keyword => query.toLowerCase().includes(keyword));
    const isPlaceQuery = GEO_KEYWORDS_PLACES.some(keyword => query.toLowerCase().includes(keyword));
    
    if (isProximityQuery) {
        // Pour les requêtes de proximité, on ne fait le prompt que si c'est une nouvelle requête
        if (lastProximityQuery !== query) {
            lastProximityQuery = query; 
            promptForLocation(query);
        } else {
            // Si l'utilisateur relance juste la même requête, on fait une recherche normale.
            filterAndDisplayResults(query);
            lastProximityQuery = ''; 
        }
    } else {
        // Recherche normale
        filterAndDisplayResults(query);
        lastProximityQuery = ''; 
    }
}


// GESTION DES ÉVÉNEMENTS
startChatBtn.addEventListener('click', () => {
    homePage.classList.add('d-none');
    chatPage.classList.remove('d-none');
    userInput.focus();
});

sendBtn.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleChat();
    }
});


// Démarrage : chargement initial des données
document.addEventListener('DOMContentLoaded', loadProData);


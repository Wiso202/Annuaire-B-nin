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
// LISTES DE RÉFÉRENCE (CORRIGÉES POUR LA PROXIMITÉ)
// =====================================================================

// NOUVEAU: Mots-clés pour détecter une recherche de proximité
const GEO_KEYWORDS_PROXIMITY = ['près de moi', 'autour de moi', 'proche', 'voisinage', 'à côté'];
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
// FONCTIONS DE BASE ET MESSAGE (UNIFIÉES)
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

// L'ancienne fonction 'appendMessage' est conservée et simplifiée
function appendMessage(sender, text, isHtml = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message', 'animated-message');
    
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

// La fonction processRow (mapping des colonnes) est conservée telle quelle car elle était la dernière bonne version.
function processRow(row) {
    const cells = row.c;
    
    // NOUVEAU MAPPING SIMPLIFIÉ BASÉ SUR LES INDICES CELL[0] à CELL[13] (Colonnes B à O)
    
    const noteAvis = cells[11] ? (cells[11].v || 3.0) : 3.0; // Col M
    const prixMin = cells[9] ? (cells[9].v || 0) : 0;        // Col K
    const prixMax = cells[10] ? (cells[10].v || 0) : 0;      // Col L
    const visible = cells[12] && normalizeKeyword(cells[12].v) === 'oui'; // Col N

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


// Fonction de chargement des données (inchangée)
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
// FONCTIONS DE RENDU (CORRECTION MINEURE)
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

/**
 * Rendu de la carte du professionnel (Retourne un élément DIV .pro-card)
 */
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
// FONCTIONS UTILITAIRES ET LOGIQUE DE RECHERCHE (CORRIGÉES)
// =====================================================================

/**
 * Normalise les mots-clés (retire accents, passe en minuscule, retire espace)
 */
function normalizeKeyword(keyword) {
    if (!keyword) return '';
    return keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function sortProfessionals(a, b) {
    if (b.note_avis !== a.note_avis) {
        return b.note_avis - a.note_avis;
    }
    return b.experience - a.experience;
}

/**
 * Parse la requête utilisateur pour extraire activité et ville.
 */
function parseQuery(query) {
    const lowerQuery = normalizeKeyword(query);
    let activite = '';
    let ville = '';

    // 1. Détection de la Ville (la plus longue en premier pour éviter les faux positifs)
    const sortedCities = ALL_CITIES.sort((a, b) => b.length - a.length);
    for (const city of sortedCities) {
        if (lowerQuery.includes(city)) {
            ville = city;
            // Retirer la ville et les prépositions de la requête pour isoler l'activité
            let tempQuery = lowerQuery.replace(city, '').trim();
            activite = tempQuery.replace(/à|près de|autour de|en|dans|de/g, '').trim();
            break;
        }
    }
    
    // 2. Si aucune ville n'est trouvée, l'activité est l'ensemble de la requête nettoyée.
    if (!ville) {
        // Tente de décomposer la requête simple 'activité à ville' ou juste l'activité
        const parts = lowerQuery.split(/à |près de |autour de |en |dans |de /);
        if (parts.length > 0) {
            activite = parts[0].trim();
        } else {
            activite = lowerQuery;
        }
    }

    // Si l'activité est trop courte, ignorer l'activité (pour forcer la recherche par ville/mots-clés seulement)
    if (activite.length < 3) activite = '';
    
    return { activite, ville, lowerQuery };
}

/**
 * CORRECTION CRITIQUE: Logique de filtrage des données
 */
function filterData(query) {
    if (!query) {
        return proData.sort(sortProfessionals);
    }
    
    const { activite, ville, lowerQuery } = parseQuery(query);
    // Créer une liste de mots-clés normalisés pour une recherche plus flexible
    const queryWords = lowerQuery.split(/[\\s,;']+/).filter(w => w.length > 2).map(normalizeKeyword); 
    
    let filteredList = proData.filter(pro => {
        let matchActivite = false;
        let matchVille = false;
        
        // Normaliser les données du professionnel pour la comparaison
        const proActivite = normalizeKeyword(pro.activite);
        const proSecteur = normalizeKeyword(pro.secteur);
        const proVille = normalizeKeyword(pro.ville);
        // const proQuartier = normalizeKeyword(pro.quartier); // Quartier est moins fiable

        // 1. Logique d'Activité
        if (activite) {
            // Correspondance sur l'activité principale OU le secteur général OU les mots-clés de la requête
            matchActivite = proActivite.includes(activite) || proSecteur.includes(activite) || 
                            queryWords.some(word => proActivite.includes(word) || proSecteur.includes(word));
        } else {
            matchActivite = true; // Si pas d'activité spécifique demandée, on ne filtre pas sur l'activité
        }
        
        // 2. Logique de Ville/Localisation
        if (ville) {
            matchVille = proVille.includes(ville);
        } else {
            matchVille = true; // Si pas de ville demandée, on ne filtre pas sur la ville
        }
        
        return matchActivite && matchVille;
    });
    
    return filteredList.sort(sortProfessionals);
}


let lastProximityQuery = ''; 

function promptForLocation(originalQuery) {
    // ... (inchangée)
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

/**
 * CORRECTION CRITIQUE: Fixe l'URL Google Maps.
 */
function requestUserLocation(originalQuery) {
    appendMessage('bot', "Localisation en cours...");
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Retirer les mots-clés de proximité de la requête pour isoler l'activité (ex: 'banque' dans 'banque près de moi')
                const proximityRegex = new RegExp(GEO_KEYWORDS_PROXIMITY.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'), 'gi');
                const searchKeyword = originalQuery.replace(proximityRegex, '').trim();
                
                // Générer le lien Google Maps
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchKeyword)}&query_place_id=&center=${userLocation.lat},${userLocation.lng}&zoom=14`;

                const successMessage = `
                    Position obtenue. Pour voir les **${searchKeyword || 'professionnels'}** classés par distance par Google Maps, cliquez sur le lien ci-dessous.
                    <p><a href="${mapsUrl}" target="_blank" class="location-link custom-btn-link">▶️ Lancer la recherche sur Google Maps</a></p>
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

/**
 * CORRECTION CRITIQUE: S'assure que les cartes sont des éléments de chat corrects.
 */
function filterAndDisplayResults(query) {
    const filteredPros = filterData(query);
    
    // Vider les anciens messages de résultats, mais garder les messages de chat (pour l'historique)
    // On conserve uniquement les messages de la conversation, et on retire les cartes précédentes
    const existingMessages = Array.from(chatBox.children).filter(child => 
        !child.classList.contains('pro-card-wrapper') // Retirer les anciens wrappers de cartes
    );
    chatBox.innerHTML = '';
    existingMessages.forEach(msg => chatBox.appendChild(msg));

    if (proCountDisplay) {
        proCountDisplay.textContent = `${filteredPros.length} professionnel(s) trouvé(s) pour votre recherche sur ${proData.length} pros enregistrés.`;
    }

    if (filteredPros.length === 0) {
        appendMessage('bot', `Désolé, je n'ai trouvé aucun professionnel correspondant à votre recherche "${query}". Essayez des mots-clés différents ou une autre ville.`);
    } else {
        appendMessage('bot', `J'ai trouvé ${filteredPros.length} professionnel(s) correspondant(s) à votre recherche. Voici les meilleurs (triés par Note/Avis) :`);
        
        // CORRECTION D'AFFICHAGE: Créer un wrapper de message pour chaque carte
        filteredPros.slice(0, 5).forEach(pro => { 
            // 1. Obtenir la carte DIV (.pro-card)
            const proCardElement = renderProCard(pro); 
            
            // 2. Créer un wrapper de message pour le style de bulle de chat
            const wrapper = document.createElement('div');
            wrapper.classList.add('message', 'bot-message', 'animated-message', 'pro-card-wrapper');
            
            // 3. Ajouter la carte à l'intérieur du wrapper
            wrapper.appendChild(proCardElement);
            
            // 4. Ajouter le wrapper au chat
            chatBox.appendChild(wrapper);
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
    
    const lowerQuery = query.toLowerCase();
    
    // Détecter si la requête est du type "près de moi" pour un lieu (Banque, Hôpital, etc.)
    const isProximityQuery = GEO_KEYWORDS_PROXIMITY.some(keyword => lowerQuery.includes(keyword));
    const isPlaceQuery = GEO_KEYWORDS_PLACES.some(keyword => lowerQuery.includes(keyword));
    
    if (isProximityQuery || isPlaceQuery) {
        // Pour les requêtes de proximité/lieu, on demande la position
        promptForLocation(query);
    } else {
        // Recherche normale
        filterAndDisplayResults(query);
    }
}


// GESTION DES ÉVÉNEMENTS
startChatBtn.addEventListener('click', () => {
    showPage('chat');
});

accueilBtnNav.addEventListener('click', () => {
    showPage('home');
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

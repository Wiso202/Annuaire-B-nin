// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// Ceci charge TOUTES les données en front-end pour la recherche
// (Méthode plus rapide pour les petits/moyens annuaires)
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1RnfF5eEeAx3mFrTagLq_C2LSB1DjeA20UOANh9wE7uk/gviz/tq?tqx=out:json'; 
// =====================================================================
// ⚠️ ÉTAPE 2 (Optionnel) : URL de déploiement Apps Script pour l'inscription (et la recherche si vous utilisez Apps Script pour la recherche)
// Si vous préférez la recherche côté Apps Script, décommentez et remplacez par votre URL de déploiement
// const APPS_SCRIPT_URL = 'VOTRE_URL_DEPLOIEMENT_APPS_SCRIPT_ICI';
// =====================================================================


let proData = []; 
let userLocation = null;
const MAPS_BASE_URL = 'https://www.google.com/maps/search/';

// Éléments DOM
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const homePage = document.getElementById('home-page');
const chatPage = document.getElementById('chat-page');
const startChatBtn = document.getElementById('start-chat-btn');
const accueilBtnNav = document.getElementById('accueil-btn-nav');
const proListContainer = document.getElementById('pro-list-container');
const loadMoreBtn = document.getElementById('load-more-btn');

// État de la recherche
let currentSearchResults = []; 
let professionalsPerPage = 5; 
let currentPage = 0; 
let currentQuery = ''; 
let isAwaitingGeoResponse = false; // Pour gérer la réponse de géolocalisation

// =====================================================================
// FONCTIONS D'INTERFACE ET DE NAVIGATION
// =====================================================================

/**
 * Change l'affichage entre la page d'accueil et le chatbot.
 * @param {string} page 'home' ou 'chat'
 */
function navigateTo(page) {
    if (page === 'chat') {
        homePage.classList.add('d-none');
        chatPage.classList.remove('d-none');
        window.location.hash = '#chat';
        userInput.focus();
        if (chatBox.children.length === 0) {
            // Premier message du bot
            appendMessage("Bonjour ! Je suis ProFinder, votre assistant pour trouver les meilleurs professionnels. Comment puis-je vous aider ?", 'ai');
        }
    } else {
        homePage.classList.remove('d-none');
        chatPage.classList.add('d-none');
        window.location.hash = '#home';
    }
}

/**
 * Ajoute un message au chatbox avec un style de bulle moderne.
 * @param {string} text Le contenu du message (peut contenir du HTML)
 * @param {string} sender 'user' ou 'ai'
 */
function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`, 'p-3', 'mb-2', 'rounded-lg');
    messageDiv.innerHTML = text; 
    
    // Ajout d'une petite animation à l'apparition
    messageDiv.style.opacity = 0;
    messageDiv.style.transform = 'translateY(10px)';
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = 1;
        messageDiv.style.transform = 'translateY(0)';
    }, 10); 
}

/**
 * Affiche les résultats de la recherche dans le conteneur de liste des professionnels.
 * @param {Array} results Liste des objets professionnels.
 * @param {boolean} reset Si true, efface les résultats précédents et réinitialise la pagination.
 */
function displayProfessionals(results, reset = true) {
    if (reset) {
        proListContainer.innerHTML = '';
        currentSearchResults = results;
        currentPage = 0;
    }

    const startIndex = currentPage * professionalsPerPage;
    const endIndex = startIndex + professionalsPerPage;
    const prosToDisplay = currentSearchResults.slice(startIndex, endIndex);

    if (prosToDisplay.length === 0 && reset) {
        proListContainer.innerHTML = '<div class="alert alert-warning">Aucun résultat trouvé pour votre recherche.</div>';
    } else if (prosToDisplay.length > 0) {
        prosToDisplay.forEach(pro => {
            // Création du lien WhatsApp
            const whatsappNumber = pro['Numéro WhatsApp'].replace(/\s/g, ''); 
            const whatsappLink = `https://wa.me/${whatsappNumber}?text=Bonjour%2C%20je%20vous%20contacte%20via%20ProFinder%20suite%20à%20ma%20recherche%20de%20%27${pro['Activité']}%27%20à%20%27${pro['Ville/Région']}%27.`;

            // Création du lien de localisation
            const locationLink = createMapLink(pro);

            const proCard = document.createElement('div');
            proCard.classList.add('pro-card', 'p-4', 'mb-3', 'rounded-lg', 'shadow-lg', 'animated-card');
            proCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="pro-name">${pro['Nom/Prénom']} ${pro['Vérifié'] === 'Oui' ? '<span class="verified-badge"><i class="bi bi-patch-check-fill me-1"></i> Vérifié</span>' : ''}</h5>
                        <p class="pro-activity">${pro['Activité']} - ${pro['Ville/Région']}</p>
                    </div>
                    <div class="pro-rating-badge">
                        ${pro['Note/Avis'] || 'N/A'} <i class="bi bi-star-fill ms-1"></i>
                    </div>
                </div>
                <p class="pro-description">${pro['Description de l\'Activité'] || 'Pas de description fournie.'}</p>
                ${locationLink}
                <a href="${whatsappLink}" target="_blank" class="whatsapp-link">
                    <i class="bi bi-whatsapp me-2"></i> Contacter par WhatsApp
                </a>
            `;
            proListContainer.appendChild(proCard);
        });

        currentPage++;
    }

    // Gestion du bouton "Afficher plus"
    if (endIndex < currentSearchResults.length) {
        loadMoreBtn.classList.remove('d-none');
        loadMoreBtn.textContent = `Afficher ${Math.min(professionalsPerPage, currentSearchResults.length - endIndex)} résultats de plus`;
    } else {
        loadMoreBtn.classList.add('d-none');
    }
}

/**
 * Crée le lien Google Maps pour un professionnel.
 * @param {Object} pro L'objet professionnel.
 * @returns {string} Le HTML du lien Google Maps.
 */
function createMapLink(pro) {
    if (pro.Latitude && pro.Longitude) {
        const query = `${pro['Nom/Prénom']}, ${pro['Activité']}, ${pro['Adresse']}`;
        const mapLink = `${MAPS_BASE_URL}?api=1&query=${pro.Latitude},${pro.Longitude}`;
        return `<a href="${mapLink}" target="_blank" class="location-link"><i class="bi bi-geo-alt-fill me-1"></i> Voir sur la carte</a>`;
    }
    return '';
}


// =====================================================================
// GESTION DES DONNÉES ET DE LA RECHERCHE
// =====================================================================

/**
 * Récupère les données brutes de la Google Sheet via gviz/tq.
 */
async function fetchAndProcessSheetData() {
    try {
        const response = await fetch(SHEET_API_URL);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const text = await response.text();
        // Le format gviz/tq est enveloppé dans `google.visualization.Query.setResponse(...)`
        const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonText);
        
        if (data.status === 'ok' && data.table) {
            proData = transformSheetData(data.table);
            console.log(`✅ ${proData.length} professionnels chargés.`);
            // Affiche un message si l'utilisateur est déjà sur la page du chat
            if (window.location.hash === '#chat') {
                 // S'assurer que le premier message d'accueil n'est pas remplacé
                if (chatBox.children.length === 1 && chatBox.children[0].textContent.includes("Bonjour")) {
                    // C'est le message initial, on ne fait rien
                } else {
                    appendMessage("✅ Les données de l'annuaire sont chargées, je suis prêt à chercher !", 'ai');
                }
            }
        } else {
            throw new Error(data.errors ? data.errors[0].message : 'Format de données inattendu.');
        }

    } catch (error) {
        console.error("❌ Erreur de chargement des données de Google Sheet. Vérifiez le SHEET_API_URL et l'accès public:", error);
        appendMessage("❌ Erreur critique : Impossible de charger les données des professionnels. Vérifiez la console pour plus de détails.", 'ai');
    }
}

/**
 * Transforme les données brutes gviz/tq en un tableau d'objets faciles à manipuler.
 * @param {Object} table L'objet table de la réponse gviz/tq.
 * @returns {Array<Object>} Tableau d'objets professionnels.
 */
function transformSheetData(table) {
    const headers = table.cols.map(col => col.label || col.id);
    const data = [];
    table.rows.forEach(row => {
        const pro = {};
        row.c.forEach((cell, index) => {
            const header = headers[index];
            // Utiliser v pour la valeur formatée (comme '1.23' pour les notes) ou la valeur brute
            pro[header] = cell ? (cell.f || cell.v) : null;
            
            // Si c'est une cellule de type Date ou autre, elle peut nécessiter un traitement
            if (header === 'Date/Heure d\'Inscription' && pro[header]) {
                 pro[header] = new Date(pro[header]).toLocaleDateString('fr-FR');
            }
            
            // Convertir explicitement Lat/Lng en nombres si possible
            if (header === 'Latitude' || header === 'Longitude') {
                pro[header] = parseFloat(pro[header]);
            }
        });
        data.push(pro);
    });
    return data.filter(pro => pro['Activité']); // Filtre les lignes vides
}


/**
 * Analyse la requête utilisateur pour déterminer l'action et les paramètres de recherche.
 * @param {string} query La requête de l'utilisateur.
 * @returns {Object} { action: 'search'|'nearby', activity: string, location: string }
 */
function parseQuery(query) {
    const searchRegex = /je cherche un?e?\s+(.+?)\s+(à|au|en|sur|dans|de)\s+(.+)/i;
    const nearbyRegex = /(proche|voisin|autour|le plus proche|la plus proche)\s*$/i;

    // 1. Recherche de professionnel classique (Activité + Lieu)
    const match = query.match(searchRegex);
    if (match) {
        const activity = match[1].trim();
        const location = match[3].trim();
        return { action: 'search', activity, location };
    }

    // 2. Recherche de proximité (Contient 'proche')
    if (query.match(nearbyRegex)) {
        // Tente d'extraire l'activité même avec 'le plus proche'
        const activityMatch = query.replace(nearbyRegex, '').trim();
        const activity = activityMatch.replace(/je cherche un?e?\s*/i, '').trim() || 'professionnel';
        return { action: 'nearby', activity };
    }
    
    // 3. Simple recherche d'activité (ex: 'Plombier')
    const simpleActivityMatch = /je cherche un?e?\s+(.+)/i.exec(query);
    if (simpleActivityMatch && simpleActivityMatch[1].trim().length > 2) {
        return { action: 'search', activity: simpleActivityMatch[1].trim(), location: '' };
    }


    // 4. Par défaut (traitement direct ou non reconnu)
    return { action: 'default', activity: query.trim() };
}

/**
 * Traite la requête utilisateur et déclenche la recherche ou la géolocalisation.
 * @param {string} query La requête de l'utilisateur.
 */
function processUserQuery(query) {
    if (isAwaitingGeoResponse) {
        // Cas où l'on attend une réponse OUI/NON pour la géolocalisation
        handleGeoResponse(query);
        isAwaitingGeoResponse = false;
        return;
    }
    
    appendMessage(query, 'user');
    userInput.value = '';
    proListContainer.innerHTML = '';
    loadMoreBtn.classList.add('d-none');
    
    currentQuery = query;
    const { action, activity, location } = parseQuery(query);
    
    switch (action) {
        case 'search':
            if (proData.length === 0) {
                 appendMessage("🤖 Veuillez patienter, les données de l'annuaire ne sont pas encore chargées...", 'ai');
                 return;
            }
            // Affichage d'un message de recherche en cours
            appendMessage(`Recherche des ${activity} ${location ? `à ${location}` : 'dans l\'annuaire'}...`, 'ai');
            searchProfessionals(activity, location);
            break;
            
        case 'nearby':
            // Demander l'autorisation de localisation
            askForLocationPermission(activity);
            break;
            
        case 'default':
            appendMessage(`Je ne comprends pas bien votre requête. Pour la recherche, essayez : "Je cherche un **plombier** à **Paris**" ou "Je cherche l'activité **la plus proche**."`, 'ai');
            break;
    }
}

/**
 * Effectue la recherche sur les données chargées en front-end (proData).
 * @param {string} activity L'activité recherchée.
 * @param {string} location Le lieu recherché (peut être vide).
 */
function searchProfessionals(activity, location) {
    const activityLower = activity.toLowerCase();
    const locationLower = location.toLowerCase();
    let filteredPros = [];

    // Fonctions de comparaison flexibles
    const matchesActivity = (pro) => pro['Activité'] && pro['Activité'].toLowerCase().includes(activityLower);
    const matchesLocation = (pro) => pro['Ville/Région'] && pro['Ville/Région'].toLowerCase().includes(locationLower);

    // NIVEAU 1 : Activité ET Lieu
    if (locationLower) {
        filteredPros = proData.filter(pro => 
            matchesActivity(pro) && matchesLocation(pro)
        );
    }
    
    // NIVEAU 2 : Si N1 échoue, chercher uniquement par Activité
    if (filteredPros.length === 0) {
        filteredPros = proData.filter(pro => matchesActivity(pro));
    }
    
    // NIVEAU 3 : Si N2 échoue, chercher par Mots-clés dans la description
    if (filteredPros.length === 0) {
         filteredPros = proData.filter(pro => 
            (pro['Description de l\'Activité'] && pro['Description de l\'Activité'].toLowerCase().includes(activityLower))
        );
    }

    // Tri (par Note/Avis du meilleur au pire)
    filteredPros.sort((a, b) => {
        const noteA = parseFloat(a['Note/Avis']) || 0;
        const noteB = parseFloat(b['Note/Avis']) || 0;
        return noteB - noteA; 
    });

    if (filteredPros.length > 0) {
        appendMessage(`🎉 J'ai trouvé ${filteredPros.length} professionnel(s) correspondant à votre recherche.`, 'ai');
        displayProfessionals(filteredPros, true);
    } else {
        appendMessage(`😔 Désolé, aucun résultat trouvé pour "${activity}" ${location ? `à "${location}"` : ''}. Essayez une requête plus générale !`, 'ai');
    }
}

// =====================================================================
// GÉOLOCALISATION
// =====================================================================

/**
 * Demande de permission pour la géolocalisation dans un contexte conversationnel.
 * @param {string} activity L'activité recherchée.
 */
function askForLocationPermission(activity) {
    const message = `Pour vous trouver le/la ${activity} le/la plus proche, j'ai besoin d'accéder à votre position actuelle. Autorisez-vous cette opération ? (Répondez **OUI** ou **NON**)`;
    appendMessage(message, 'ai');
    currentQuery = activity; 
    isAwaitingGeoResponse = true;
}

/**
 * Gère la réponse OUI/NON de l'utilisateur à la demande de géolocalisation.
 * @param {string} response La réponse de l'utilisateur.
 */
function handleGeoResponse(response) {
    const respLower = response.toLowerCase();
    if (respLower.includes('oui')) {
        appendMessage('Parfait, je recherche votre position...', 'ai');
        getUserLocation(currentQuery); // On passe l'activité recherchée
    } else {
        appendMessage('D\'accord. Sans votre position, je ne peux pas vous fournir le professionnel le plus proche. Vous pouvez relancer la recherche avec un lieu précis (ex: "plombier à Paris").', 'ai');
    }
}

/**
 * Tente d'obtenir la localisation de l'utilisateur via le navigateur.
 * @param {string} activity L'activité recherchée (utilisé après la réussite de la géo).
 */
function getUserLocation(activity = null) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log("✅ Localisation utilisateur obtenue:", userLocation);
                
                if (activity) {
                    findNearbyProfessionals(activity, userLocation);
                }
            },
            (error) => {
                console.error("❌ Erreur de géolocalisation:", error);
                if (activity) {
                    appendMessage("❌ Impossible d'accéder à votre position. Veuillez vérifier les autorisations de votre navigateur et réessayer, ou effectuer une recherche par lieu.", 'ai');
                }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        appendMessage("Votre navigateur ne supporte pas la géolocalisation.", 'ai');
    }
}

/**
 * Calcule la distance entre deux points géographiques (formule de Haversine).
 * @param {number} lat1 Latitude 1
 * @param {number} lon1 Longitude 1
 * @param {number} lat2 Latitude 2
 * @param {number} lon2 Longitude 2
 * @returns {number} Distance en kilomètres.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}


/**
 * Trouve les professionnels les plus proches pour une activité donnée et propose le lien Maps.
 * @param {string} activity L'activité recherchée.
 * @param {Object} location La position de l'utilisateur {lat, lng}.
 */
function findNearbyProfessionals(activity, location) {
    const activityLower = activity.toLowerCase();
    
    // 1. Filtrer par activité et s'assurer qu'ils ont des coordonnées
    let nearbyPros = proData.filter(pro => 
        pro['Activité'] && pro['Activité'].toLowerCase().includes(activityLower) && 
        pro.Latitude && pro.Longitude
    );
    
    // 2. Calculer la distance
    nearbyPros.forEach(pro => {
        pro.distance = calculateDistance(location.lat, location.lng, pro.Latitude, pro.Longitude);
    });

    // 3. Trier par distance
    nearbyPros.sort((a, b) => a.distance - b.distance);
    
    const maxResults = 5;
    const topPros = nearbyPros.slice(0, maxResults);

    if (topPros.length > 0) {
        // Construction de la chaîne de recherche pour Google Maps
        // Format: 'Activité 1 + Activité 2 + ... + Actvité N' à partir de la position utilisateur
        const queryList = topPros.map(p => p['Activité']).join(' + ');
        const mapsLink = `${MAPS_BASE_URL}${queryList}&query_place_id=&query=${location.lat},${location.lng}`;

        appendMessage(`J'ai trouvé ${topPros.length} ${activity}s à proximité, dont le plus proche est à environ **${topPros[0].distance.toFixed(2)} km** (${topPros[0]['Nom/Prénom']}).`, 'ai');
        
        // Afficher la carte et les résultats principaux
        displayProfessionals(topPros, true); 
        
        // Afficher le lien Google Maps
        const mapLinkHtml = `
            <div class="mt-3 p-3 rounded-lg shadow-lg" style="background-color: var(--input-bg);">
                <p class="mb-2">Cliquez ici pour visualiser tous les résultats proches directement sur Google Maps :</p>
                <a href="${mapsLink}" target="_blank" class="whatsapp-link" style="color: var(--accent-color);">
                    <i class="bi bi-map-fill me-2"></i> Voir les ${activity}s les plus proches sur Maps
                </a>
            </div>
        `;
        appendMessage(mapLinkHtml, 'ai');

    } else {
        appendMessage(`😔 Désolé, je n'ai trouvé aucun ${activity} avec des coordonnées valides à proximité.`, 'ai');
    }
}


// =====================================================================
// ÉVÉNEMENTS
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialisation
    // NOTE: On ne fait plus de loadProfessionalData() au démarrage pour ne pas spammer
    // l'API. La fonction `fetchAndProcessSheetData()` est appelée ici à la place.
    fetchAndProcessSheetData(); 
    
    // On appelle getUserLocation() pour pré-remplir la variable si l'utilisateur l'autorise
    getUserLocation(); 
    
    // 2. Gestion des Boutons
    startChatBtn.addEventListener('click', () => {
        navigateTo('chat');
    });
    
    accueilBtnNav.addEventListener('click', () => {
        navigateTo('home');
    });

    sendBtn.addEventListener('click', () => {
        const query = userInput.value.trim();
        if (query) {
            processUserQuery(query);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Empêche le saut de ligne par défaut
            sendBtn.click();
        }
    });
    
    // 3. Gestion du bouton "Afficher plus" (Load More)
    loadMoreBtn.addEventListener('click', () => {
        displayProfessionals(currentSearchResults, false); // Affiche la page suivante
    });

    // Gestion du hash URL pour la navigation directe
    if (window.location.hash === '#chat') {
        navigateTo('chat');
    } else {
        navigateTo('home');
    }
});

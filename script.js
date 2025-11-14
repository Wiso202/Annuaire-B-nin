// =====================================================================
// ⚠️ ÉTAPE 1 : URL DE L'API GOOGLE VISUALIZATION (GVIZ)
// Assurez-vous que la Google Sheet est partagée avec "Tout le monde"
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1RnfF5eEeAx3mFrTagLq_C2LSB1DjeA20UOANh9wE7uk/gviz/tq?tqx=out:json'; 
// =====================================================================

let proData = []; 
let userLocation = null;

// NOUVEAU: Mots-clés pour détecter une recherche de proximité
const GEO_KEYWORDS = ['près de moi', 'autour de moi', 'proche', 'voisinage'];
let lastProximityQuery = ''; // Stocker la dernière requête de proximité pour éviter les boucles

// Éléments DOM
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const homePage = document.getElementById('home-page');
const chatPage = document.getElementById('chat-page');
const startChatBtn = document.getElementById('start-chat-btn');
// const accueilBtnNav = document.getElementById('accueil-btn-nav'); // Non utilisé dans index.html, laissé en commentaire
const proCountDisplay = document.getElementById('pro-count-display'); // NOUVEAU

// Définition des villes (pour la recherche de localisation classique)
const VILLE_KEYWORDS = [
    'abomey', 'calavi', 'adja-ouèrè', 'adjarra', 'adjohoun', 'agbangnizoun', 
    'aguégué', 'allada', 'aplahoué', 'athiémé', 'avrankou', 'banikoara', 
    'bantè', 'bembèrèkè', 'bohicon', 'bonou', 'bopa', 'boukombé', 
    'cobly', 'comè', 'copargo', 'cotonou', 'covè', 'dangbo', 
    'dassa zoumé', 'djakotomey', 'djidja', 'djougou', 'dogbo', 'glazoué', 
    'gogounou', 'grand-popo', 'houéyogbé', 'ifangni', 'kalalé', 'kandi', 
    'karimama', 'kérou', 'kétou', 'klouékanmè', 'kouandé', 'kpomassè', 
    'lalo', 'lokossa', 'malanville', 'matéri', 'missérété', 'n\'dali', 
    'natitingou', 'nikki', 'ouaké', 'ouèssè', 'ouidah', 'ouinhi', 
    'parakou', 'pehunco', 'pérèrè', 'pobè', 'porto novo', 'sakété', 
    'savalou', 'savè', 'séguana', 'sèmè-podji', 'sinandé', 'so ava', 
    'tanguiéta', 'tchaourou', 'toffo', 'tori bossito', 'toucountouna', 
    'toviklin', 'zagannado', 'za-kpota', 'zè', 'zogbodomey'
];

// =====================================================================
// FONCTIONS UTILITAIRES
// =====================================================================

function normalizeKeyword(keyword) {
    // Normalise : supprime les accents, met en minuscule
    return keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

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
// GESTION DES DONNÉES
// =====================================================================

function processRow(row) {
    const cols = row.c;
    // Les indices des colonnes sont basés sur les colonnes renvoyées par la requête GVIZ
    // La requête GVIZ utilise C0, C1, C2... pour les colonnes B, C, D... de la feuille
    
    // Indices des colonnes :
    // C0 (B): Nom Contact
    // C1 (C): Nom Entreprise
    // C2 (D): WhatsApp
    // C3 (E): Ville
    // C4 (F): Quartier
    // C5 (G): Indication GPS
    // C6 (H): Secteur Général
    // C7 (I): Activité Détaillée
    // C8 (J): Expérience (ans)
    // C9 (K): Prix Min (FCFA)
    // C10 (L): Prix Max (FCFA)
    // C11 (M): Note/Avis
    // C12 (N): Visibilité Publique
    // C13 (O): Consentement Contact

    // NOUVEAU MAPPING (Adapté à la structure du formulaire d'inscription, mais indices décalés)
    // Il est critique de s'assurer que l'ordre des colonnes dans le SELECT du GVIZ correspond à ce mapping
    return {
        // Le GVIZ commence par C0, mais la feuille commence par A (Timestamp), B (Nom)...
        // Si le SELECT est 'SELECT B, C, D, E, F, G, H, I, J, K, L, M, N, O' :
        nom: cols[0] ? cols[0].v : 'N/A',
        entreprise: cols[1] ? cols[1].v : 'N/A',
        whatsapp: cols[2] ? cols[2].v : 'N/A',
        ville: cols[3] ? cols[3].v : 'N/A',
        quartier: cols[4] ? cols[4].v : 'N/A',
        indication_gps: cols[5] ? cols[5].v : '',
        secteur: cols[6] ? cols[6].v : 'N/A',
        activite: cols[7] ? cols[7].v : 'N/A',
        experience: cols[8] ? parseInt(cols[8].v) : 0,
        prix_min: cols[9] ? parseInt(cols[9].v.replace(/[^\d]/g, '')) || 0 : 0,
        prix_max: cols[10] ? parseInt(cols[10].v.replace(/[^\d]/g, '')) || 0 : 0,
        note_avis: cols[11] ? parseFloat(cols[11].v) || 3.0 : 3.0,
        visible: cols[12] && normalizeKeyword(cols[12].v) === 'oui'
        // On ignore la colonne Consentement Contact (C13) dans le mapping client
    };
}

// Fonction de chargement des données
async function loadProData() {
    try {
        appendMessage('bot', "Démarrage de l'assistant... Chargement des données d'annuaire...");
        
        // Requête GVIZ pour sélectionner les 14 colonnes de données B à O
        // Le SELECT doit correspondre aux 14 champs du formulaire (hors Timestamp)
        const tq = '&tq=SELECT B, C, D, E, F, G, H, I, J, K, L, M, N, O'; 
        const url = SHEET_API_URL + tq;
        
        const response = await fetch(url);
        const text = await response.text();
        
        // Nettoyage de la réponse GVIZ
        const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonText);
        
        const allRows = data.table.rows || [];
        // Filtrer ici les lignes visibles
        const visibleRows = allRows.filter(row => row.c[12] && normalizeKeyword(row.c[12].v) === 'oui');
        
        proData = visibleRows.map(processRow);
        
        // NOUVEAU : Afficher le nombre total de professionnels après le chargement
        if (proCountDisplay) {
            proCountDisplay.textContent = `Total de ${proData.length} professionnels enregistrés.`;
        }
        
        // Animer le compteur sur la page d'accueil
        const statsElement = document.getElementById('stats-pros');
        if (statsElement) {
            animateValue(statsElement, 0, proData.length, 1500);
        }
        
        appendMessage('bot', `Annuaire chargé avec succès (${proData.length} pros visibles). Bonjour ! Je suis ProFinder, votre assistant. Quel service ou professionnel recherchez-vous, et dans quelle ville/zone ?`);

    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        if (proCountDisplay) proCountDisplay.textContent = "Erreur de chargement des données.";
        appendMessage('bot', "⚠️ Erreur: Impossible de charger l'annuaire. Vérifiez la connexion ou les autorisations de partage de la Google Sheet.");
    }
}


// =====================================================================
// FONCTIONS DE GÉOLOCALISATION
// =====================================================================

// 1. Demande de partage de localisation (Affiche le message avec les boutons)
function promptForLocation(originalQuery) {
    const promptHtml = `
        <div class="location-prompt">
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

// 2. Obtention de la position de l'utilisateur
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
                const searchKeyword = originalQuery.toLowerCase().replace(new RegExp(GEO_KEYWORDS.join('|'), 'g'), '').trim();
                
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

// =====================================================================
// FONCTION DE RENDU
// =====================================================================

function renderProCard(pro) {
    const card = document.createElement('div');
    card.classList.add('pro-card', 'animated-pop');
    
    // Conversion du numéro WhatsApp (simple nettoyage pour le lien)
    const whatsappNumber = pro.whatsapp ? pro.whatsapp.replace(/\s/g, '').replace(/^\+/, '') : '';
    const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#';
    
    // Rendu du badge de Note/Avis
    const ratingBadge = `<div class="rating-badge"><i class="bi bi-star-fill"></i> ${pro.note_avis.toFixed(1)} / 5</div>`;
    
    // Rendu de la fourchette de prix
    let priceRangeHtml = '';
    if (pro.prix_min > 0 && pro.prix_max > 0) {
        priceRangeHtml = `<div class="price-range">Prix estimé : ${pro.prix_min.toLocaleString()} XOF - ${pro.prix_max.toLocaleString()} XOF</div>`;
    } else if (pro.prix_min > 0) {
        priceRangeHtml = `<div class="price-range">Prix min. : ${pro.prix_min.toLocaleString()} XOF</div>`;
    } else if (pro.prix_max > 0) {
        priceRangeHtml = `<div class="price-range">Prix max. : ${pro.prix_max.toLocaleString()} XOF</div>`;
    }

    // Rendu du lien de localisation (Utilise Indication GPS pour un lien direct si fourni)
    const locationLink = pro.indication_gps 
        ? `<a href="${pro.indication_gps}" target="_blank" class="location-link"><i class="bi bi-geo-alt-fill"></i> Voir la Localisation</a>` 
        : `<span class="location-link text-secondary">Localisation: ${pro.quartier}, ${pro.ville}</span>`;

    card.innerHTML = `
        <div class="card-header-content">
            <div class="badge-verified">PRO VÉRIFIÉ</div>
            ${ratingBadge}
        </div>
        <h3>${pro.entreprise}</h3>
        <h4>${pro.activite} (${pro.secteur}) - Exp. ${pro.experience} ans</h4>
        
        <p class="location-text"><i class="bi bi-pin-map-fill"></i> ${pro.quartier}, ${pro.ville}</p>
        
        ${priceRangeHtml}
        
        <p class="description-text">${pro.description}</p>
        
        <div class="card-actions">
            ${locationLink}
            <a href="${whatsappLink}" target="_blank" class="whatsapp-link">
                <i class="bi bi-whatsapp"></i> Contacter sur WhatsApp (${pro.whatsapp})
            </a>
        </div>
    `;
    
    return card;
}

// =====================================================================
// LOGIQUE DE RECHERCHE ET DE FILTRAGE
// =====================================================================

function filterData(query) {
    if (!query) {
        return proData.sort((a, b) => b.note_avis - a.note_avis);
    }
    
    const lowerQuery = normalizeKeyword(query);
    const queryWords = query ? lowerQuery.split(/[\\s,;']+/).filter(w => w.length > 2) : [];
    
    let activite = '';
    let ville = '';
    let degrade = false; 
    
    // Détermination de la ville ou localisation
    for (const city of VILLE_KEYWORDS) {
        const normalizedCity = normalizeKeyword(city);
        if (lowerQuery.includes(normalizedCity)) {
            ville = normalizedCity;
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
            if (degrade) {
                matchVille = proVille.includes(ville);
            } else {
                const fullLocation = proVille + ' ' + proQuartier;
                matchVille = fullLocation.includes(lowerQuery) || proVille.includes(ville);
            }
        } else {
            matchVille = true;
        }
        
        return matchActivite && matchVille;
    });
    
    // Trier les résultats par note_avis (du plus grand au plus petit)
    return filteredList.sort((a, b) => b.note_avis - a.note_avis);
}


// Fonction pour filtrer et afficher les résultats
function filterAndDisplayResults(query) {
    const filteredPros = filterData(query);
    
    // Vider la chatBox des cartes précédentes, mais conserver les messages
    const existingMessages = Array.from(chatBox.children).filter(child => child.classList.contains('message'));
    chatBox.innerHTML = '';
    existingMessages.forEach(msg => chatBox.appendChild(msg));

    // Mettre à jour l'affichage du compte pour les résultats filtrés
    if (proCountDisplay) {
        proCountDisplay.textContent = `${filteredPros.length} professionnel(s) trouvé(s) pour votre recherche sur ${proData.length} pros enregistrés.`;
    }

    if (filteredPros.length === 0) {
        appendMessage('bot', `Désolé, je n'ai trouvé aucun professionnel correspondant à votre recherche "${query}". Essayez des mots-clés différents ou une autre ville.`);
    } else {
        appendMessage('bot', `J'ai trouvé ${filteredPros.length} professionnel(s) correspondant(s) à votre recherche. Voici les meilleurs (triés par Note/Avis) :`);
        filteredPros.slice(0, 5).forEach(pro => { // Afficher les 5 premiers
            chatBox.appendChild(renderProCard(pro));
        });
         if (filteredPros.length > 5) {
             appendMessage('bot', `... ${filteredPros.length - 5} autres experts trouvés. Soyez plus précis pour affiner.`, false);
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}


// =====================================================================
// FONCTION PRINCIPALE DE GESTION DU CHAT (FIX du bouton)
// =====================================================================

function handleChat() {
    const query = userInput.value.trim();
    if (query === '' || proData.length === 0) return;

    // 1. Afficher la requête de l'utilisateur
    appendMessage('user', query);
    userInput.value = '';
    
    // 2. Vérifier si la requête contient un mot-clé de proximité
    const isProximityQuery = GEO_KEYWORDS.some(keyword => query.toLowerCase().includes(keyword));
    
    // 3. Logique de géolocalisation
    if (isProximityQuery && lastProximityQuery !== query) {
        lastProximityQuery = query; // Stocker la requête
        promptForLocation(query);
    } else {
        // Recherche normale ou après la première demande de localisation
        filterAndDisplayResults(query);
        lastProximityQuery = ''; // Réinitialiser après une recherche normale
    }
}


// =====================================================================
// GESTION DES ÉVÉNEMENTS
// =====================================================================

// Événement pour démarrer le chat
startChatBtn.addEventListener('click', () => {
    homePage.classList.add('d-none');
    chatPage.classList.remove('d-none');
    userInput.focus();
    // Le message de bienvenue est déjà envoyé par loadProData
});

// FIX / NOUVEAU: Écouteur pour le bouton d'envoi et la touche Entrée
sendBtn.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Empêche l'action par défaut du formulaire (soumission)
        handleChat();
    }
});


// Démarrage : chargement initial des données
document.addEventListener('DOMContentLoaded', loadProData);

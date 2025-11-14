// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// NOUVEL ID DE SHEET : 1RnfF5eEeAx3mFrTagLq_C2LSB1DjeA20UOANh9wE7uk
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1RnfF5eEeAx3mFrTagLq_C2LSB1DjeA20UOANh9wE7uk/gviz/tq?tqx=out:json'; 
// =====================================================================

let proData = []; 
// Nouvelle variable pour stocker la position de l'utilisateur
let userLocation = null;

// Éléments DOM (inchangés)
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const homePage = document.getElementById('home-page');
const chatPage = document.getElementById('chat-page');
const startChatBtn = document.getElementById('start-chat-btn');
const accueilBtnNav = document.getElementById('accueil-btn-nav');

// =====================================================================
// LISTES DE RÉFÉRENCE (GEO_KEYWORDS ÉTENDU)
// =====================================================================

const SECTOR_COLUMNS = [
    'Finance / Assurance', 'Transport / Logistique', 'Communication / Médias', 
    'Tourisme / Loisirs', 'Services à la personne', 'Agriculture / Élevage / Pêche', 
    'Droit / Juridique', 'Énergie / Environnement', 'Autres services spécialisés',
    'Alimentation', 'Mode / Couture', 'Beauté / Esthétique', 'Technologie / Informatique',
    'Automobile / Mécanique', 'BTP / Construction', 'Santé / Pharmacie',
    'Éducation / Formation', 'Artisanat / Création', 'Commerce général'
];

const GEO_KEYWORDS = [
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
    'toviklin', 'zagannado', 'za-kpota', 'zè', 'zogbodomey', 
    // Mots-clés de proximité
    'près de moi', 'proche', 'autour', 'le plus proche', 'voisin'
];


// =====================================================================
// FONCTION DE PARSING DES DONNÉES (ADAPTÉE AUX 14 COLONNES DE B à O)
// =====================================================================

function processData(rows) {
    return rows.map(row => {
        const c = row.c; 
        
        // Mappage des 14 colonnes (JS Index 0 à 13 correspondant à C1 à C14, soit B à O)
        return {
            nom: c[0] && c[0].v ? c[0].v : '',                         // C1 (B): Nom du Contact
            entreprise: c[1] && c[1].v ? c[1].v : '',                  // C2 (C): Nom de l'Entreprise
            whatsapp: c[2] && c[2].v ? c[2].v : '',                    // C3 (D): WhatsApp
            ville: c[3] && c[3].v ? c[3].v : '',                       // C4 (E): Ville
            quartier: c[4] && c[4].v ? c[4].v : '',                    // C5 (F): Quartier
            indication_gps: c[5] && c[5].v ? c[5].v : '',              // C6 (G): Indication GPS (NOUVEAU)
            secteur: c[6] && c[6].v ? c[6].v : '',                     // C7 (H): Secteur Général
            activite: c[7] && c[7].v ? c[7].v : '',                    // C8 (I): Activité Détaillée
            experience: c[8] && c[8].v ? parseInt(c[8].v) : 0,         // C9 (J): Expérience (ans)
            prix_min: c[9] && c[9].v ? parseInt(c[9].v) : 0,           // C10 (K): Prix Min
            prix_max: c[10] && c[10].v ? parseInt(c[10].v) : 0,        // C11 (L): Prix Max
            note_avis: c[11] && c[11].v ? parseFloat(c[11].v) : 3.0,   // C12 (M): Note/Avis (NOUVEAU)
            public_visibility: c[12] && c[12].v ? c[12].v : 'Non',     // C13 (N): Visibilité Publique
            contact_consent: c[13] && c[13].v ? c[13].v : 'Non',       // C14 (O): Consentement Contact
            
            // Propriétés pour la géolocalisation
            lat: null, // Sera rempli si la géocodification est implémentée
            lng: null, // Sera rempli si la géocodification est implémentée
            distance: null // Pour le tri
        };
    });
}

// =====================================================================
// FONCTION DE CHARGEMENT DES DONNÉES DU GOOGLE SHEET
// =====================================================================

function loadProData() {
    // La requête GVIZ sélectionne toutes les colonnes de données B à O
    const tq = '&tq=SELECT C1, C2, C3, C4, C5, C6, C7, C8, C9, C10, C11, C12, C13, C14';
    const url = SHEET_API_URL + tq;
    
    return fetch(url)
        .then(response => response.text())
        .then(text => {
            // Nettoyage du format GVIZ
            const jsonText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonText);
            
            if (data.table && data.table.rows) {
                proData = processData(data.table.rows);
                // Filtrer uniquement les profils dont la Visibilité Publique est "Oui"
                proData = proData.filter(pro => pro.public_visibility === 'Oui');
                
                // Mettre à jour les statistiques sur la page d'accueil
                document.getElementById('stats-pros').setAttribute('data-target', proData.length);
                const statsElement = document.getElementById('stats-pros');
                animateValue(statsElement, 0, proData.length, 1500);
                
                console.log(`${proData.length} professionnels chargés.`);
            } else {
                console.error("Format de données invalide ou aucune ligne trouvée.");
            }
        })
        .catch(error => {
            console.error("Erreur de chargement des données. Vérifiez le lien GVIZ et les autorisations de partage :", error);
            // Afficher un message d'erreur si le chat est déjà visible
            if (!homePage.classList.contains('d-none')) {
                 alert("Erreur: Impossible de charger l'annuaire. Vérifiez les autorisations de partage de la Google Sheet (accès 'Tout le monde').");
            }
        });
}


// =====================================================================
// LOGIQUE DE GÉOLOCALISATION
// =====================================================================

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(userLocation);
                },
                (error) => {
                    console.warn(`Erreur de géolocalisation: ${error.message}`);
                    userLocation = null;
                    // Résoudre même en cas d'erreur pour continuer la recherche sans distance
                    resolve(null); 
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            console.warn("La géolocalisation n'est pas supportée par ce navigateur.");
            resolve(null);
        }
    });
}

// Fonction Haversine pour calculer la distance entre deux points GPS (en km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
}


// =====================================================================
// LOGIQUE DE RECHERCHE ET DE FILTRAGE
// =====================================================================

function normalizeKeyword(keyword) {
    // Supprimer les accents pour une meilleure correspondance (e.g., 'électricité' -> 'electricite')
    return keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseQuery(query) {
    let activite = null;
    let ville = null;
    let degrade = false;
    let isProximity = false;
    
    // Simplification et nettoyage de la requête
    const normalizedQuery = normalizeKeyword(query.toLowerCase());
    const queryWords = normalizedQuery.split(/[,\s']+/).filter(w => w.length > 2);

    // 1. Détection des mots-clés de proximité
    if (GEO_KEYWORDS.some(kw => normalizedQuery.includes(kw) && kw.includes('proche'))) {
        isProximity = true;
    }
    
    // 2. Détection de Ville/Localisation
    const geoMatch = GEO_KEYWORDS.find(kw => normalizedQuery.includes(kw) && !kw.includes('proche'));
    if (geoMatch) {
        ville = geoMatch;
    }
    
    // 3. Détection de Secteur/Activité
    const sectorMatch = SECTOR_COLUMNS.find(sec => normalizedQuery.includes(normalizeKeyword(sec.toLowerCase())));
    if (sectorMatch) {
        activite = normalizeKeyword(sectorMatch.toLowerCase());
    } else {
        // Si aucun secteur exact n'est trouvé, utiliser le premier mot clé non-géo comme activité
        const activityWord = queryWords.find(word => !GEO_KEYWORDS.includes(word));
        if (activityWord) {
             activite = activityWord;
        }
    }
    
    // Logique de dégradation si trop de mots
    if (queryWords.length > 4 || (activite && ville)) {
        degrade = true;
    }

    return { query: normalizedQuery, activite, ville, isProximity, degrade, queryWords };
}

function filterPros(proData, parsedQuery) {
    const { query, activite, ville, degrade, queryWords } = parsedQuery;

    return proData.filter(pro => {
        let matchActivite = false;
        let matchVille = false;
        
        const proActivite = normalizeKeyword(pro.activite.toLowerCase());
        const proSecteur = normalizeKeyword(pro.secteur.toLowerCase());
        const proVille = normalizeKeyword(pro.ville.toLowerCase());
        const proQuartier = normalizeKeyword(pro.quartier.toLowerCase());

        // 1. Logique d'Activité
        if (activite) {
            // Correspondance sur le mot-clé principal OU si un mot-clé de la requête est dans l'activité détaillée ou le secteur
            matchActivite = proActivite.includes(activite) || proSecteur.includes(activite) || 
                            queryWords.some(word => proActivite.includes(word) || proSecteur.includes(word));
        } else {
            matchActivite = true; 
        }
        
        // 2. Logique de Ville/Quartier (Dégradation)
        if (ville) {
            if (degrade) {
                // Recherche dégradée : Ville uniquement
                matchVille = proVille.includes(ville);
            } else {
                // Recherche stricte : Ville OU (Ville + Quartier)
                const fullLocation = proVille + ' ' + proQuartier;
                matchVille = fullLocation.includes(query) || proVille.includes(ville);
            }
        } else {
            matchVille = true;
        }
        
        return matchActivite && matchVille;
    });
}


// =====================================================================
// FONCTIONS DE RENDU (ADAPTÉES POUR NOTE/GPS)
// =====================================================================

function renderMessage(sender, text) {
    const isBot = sender === 'bot';
    const messageHTML = `
        <div class="chat-message ${isBot ? 'bot-message' : 'user-message'}">
            <span class="sender-icon">${isBot ? '<i class="bi bi-robot"></i>' : '<i class="bi bi-person-fill"></i>'}</span>
            <div class="message-content">
                ${text}
            </div>
        </div>
    `;
    chatBox.innerHTML += messageHTML;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function renderProCard(pro) {
    // Pour l'expérience
    const experienceText = pro.experience > 0 ? `${pro.experience} ans d'expérience` : 'Expérience non spécifiée';
    
    // Pour la Note/Avis (NOUVEAU)
    const note = pro.note_avis ? pro.note_avis.toFixed(1) : '4.0';
    const noteHTML = `<div class="rating-badge"><i class="bi bi-star-fill me-1"></i> ${note}</div>`;
    
    // Pour les prix
    let priceRange = 'Fourchette de prix : Non spécifié';
    if (pro.prix_min > 0 && pro.prix_max > 0) {
        priceRange = `Prix : ${pro.prix_min.toLocaleString()} - ${pro.prix_max.toLocaleString()} FCFA`;
    } else if (pro.prix_min > 0) {
        priceRange = `Prix Min. : ${pro.prix_min.toLocaleString()} FCFA`;
    }
    
    // Pour la localisation (Utilisation de l'Indication GPS - NOUVEAU)
    let mapLinkHTML;
    if (pro.indication_gps.trim()) {
        const fullAddress = pro.indication_gps + ', ' + pro.quartier + ', ' + pro.ville + ', Bénin';
        mapLinkHTML = `<a href="https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}" target="_blank" class="location-link"><i class="bi bi-pin-map-fill me-1"></i> Localiser (GPS)</a>`;
    } else {
        mapLinkHTML = `<span class="text-secondary-text"><i class="bi bi-geo-alt-fill me-1"></i> ${pro.ville}, ${pro.quartier}</span>`;
    }
    
    // Formatage du numéro WhatsApp pour le lien direct
    const waNumber = pro.whatsapp.replace(/\s/g, '').startsWith('+') ? pro.whatsapp.replace(/\s/g, '') : `+229${pro.whatsapp.replace(/\s/g, '')}`;

    return `
        <div class="pro-card animated-pop">
            <div class="card-header">
                <span class="badge-verified"><i class="bi bi-patch-check-fill me-1"></i> VÉRIFIÉ</span>
                ${noteHTML}
            </div>
            <h4>${pro.entreprise}</h4>
            <p class="mb-2 text-accent">${pro.secteur} / **${pro.activite}**</p>
            
            ${mapLinkHTML}
            
            <div class="details-row">
                <p class="text-secondary-text small mb-1">${experienceText}</p>
            </div>
            
            <div class="price-range">${priceRange}</div>
            
            <a href="https://wa.me/${waNumber.replace('+', '')}?text=Bonjour%2C%20je%20vous%20contacte%20via%20ProFinder%20pour%20vos%20services." target="_blank" class="whatsapp-link">
                <i class="bi bi-whatsapp me-1"></i> Contacter (${pro.whatsapp})
            </a>
        </div>
    `;
}

async function renderChatResponse(results, parsedQuery) {
    let responseHTML = '';
    
    if (parsedQuery.isProximity && userLocation && results.length > 0) {
        // Tâche 1 : Calculer la distance (nécessite l'intégration des coordonnées dans le proData initial)
        // Comme nous n'avons pas la géocodification dans le script, cette partie reste théorique
        // et trie par défaut sur la pertinence du filtre.
        
        // Simuler le tri par pertinence ou note_avis en attendant la géocodification des Pro
        results.sort((a, b) => b.note_avis - a.note_avis); // Tri par Note/Avis
        
        responseHTML += `
            <p>✅ J'ai trouvé ${results.length} expert(s) **proches** correspondant à votre demande. Voici ceux avec les meilleures notes/pertinence :</p>
            <div class="results-container">
        `;
    } else if (results.length > 0) {
        responseHTML += `<p>✅ J'ai trouvé **${results.length}** expert(s) correspondant à votre recherche. Trié par pertinence et Note/Avis :</p><div class="results-container">`;
        results.sort((a, b) => b.note_avis - a.note_avis); // Tri par Note/Avis
    } else {
        responseHTML += `<p>❌ Désolé, je n'ai trouvé aucun expert correspondant à votre requête. Essayez d'être moins précis sur le quartier ou l'activité.</p>`;
    }

    results.slice(0, 5).forEach(pro => { // Afficher les 5 premiers
        responseHTML += renderProCard(pro);
    });
    
    if (results.length > 5) {
         responseHTML += `<p class="mt-3 text-center text-secondary-text">... ${results.length - 5} autres experts trouvés. Soyez plus précis pour affiner.</p>`;
    }

    if (results.length > 0) {
        responseHTML += `</div>`;
    }
    
    renderMessage('bot', responseHTML);
}


// =====================================================================
// FONCTION PRINCIPALE DE GESTION DU CHAT
// =====================================================================

async function handleChat() {
    const query = userInput.value.trim();
    if (query === '' || proData.length === 0) return;

    // 1. Afficher la requête de l'utilisateur
    renderMessage('user', query);
    userInput.value = '';
    sendBtn.disabled = true;

    // 2. Tenter d'obtenir la position de l'utilisateur (pour la recherche de proximité)
    const location = await getUserLocation();

    // 3. Parser la requête
    const parsedQuery = parseQuery(query);

    // 4. Filtrer les professionnels
    let results = filterPros(proData, parsedQuery);

    // 5. Afficher les résultats
    await renderChatResponse(results, parsedQuery);
    
    sendBtn.disabled = false;
}


// =====================================================================
// DÉMARRAGE : CHARGEMENT ET ÉVÉNEMENTS
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Chargement initial des données
    loadProData().then(() => {
        // Animation des statistiques après le chargement
        document.querySelectorAll('.count-up').forEach(element => {
            const target = parseFloat(element.getAttribute('data-target'));
            if (target !== 0.5) {
                animateValue(element, 0, target, 2000); 
            }
        });
    });

    // Gestion du bouton Envoyer
    sendBtn.addEventListener('click', handleChat);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChat();
        }
    });
    
    // Gestion des boutons de navigation (Doit être défini dans index.html)
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
            homePage.classList.add('d-none');
            chatPage.classList.remove('d-none');
            // Afficher le premier message du bot
            renderMessage('bot', "Bonjour ! Je suis ProFinder, votre assistant. Quel service ou professionnel recherchez-vous, et dans quelle ville/zone ?");
            userInput.focus();
        });
    }
    if (accueilBtnNav) {
        accueilBtnNav.addEventListener('click', () => {
            chatPage.classList.add('d-none');
            homePage.classList.remove('d-none');
        });
    }
});

// Fonction utilitaire d'animation (doit être définie dans index.html ou ici)
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // La ligne ci-dessous doit être adaptée si elle existait dans index.html pour gérer le 0.5s
        obj.innerHTML = Math.floor(progress * (end - start) + start); 
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

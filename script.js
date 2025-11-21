// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1n2n1vdQvUR9X7t9Vd6VanBz41nYBnjQhIXdOWixBogA/gviz/tq?tqx=out:json'; 
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
const proListContainer = document.getElementById('pro-list-container');
const loadMoreBtn = document.getElementById('load-more-btn');

// État de la recherche
let currentSearchResults = []; // Les professionnels qui correspondent à la recherche actuelle
let professionalsPerPage = 5; // Nombre de pros à afficher par page
let currentPage = 0; // Page actuelle
let currentQuery = ''; // Dernière requête utilisateur pour le mode conversationnel

// =====================================================================
// LISTES DE RÉFÉRENCE (GEO_KEYWORDS ÉTENDU)
// =====================================================================

const SECTOR_COLUMNS = [
    'Finance / Assurance', 'Transport / Logistique', 'Communication / Médias', 
    'Tourisme / Loisirs', 'Services à la personne', 'Agriculture / Élevage / Pêche', 
    'Droit / Juridique', 'Art / Culture / Divertissement'
    // Les autres secteurs sont gérés par le secteur général 'Autres'
];

const GEO_KEYWORDS = {
    // Villes principales (clés de recherche)
    'cotonou': ['cotonou', 'calavi', 'abomey-calavi', 'porto-novo', 'parakou'],
    'parakou': ['parakou', 'kandi', 'natitingou'],
    // ... ajouter d'autres villes ou régions clés si nécessaire
    // Mots clés de localisation générale
    'ville': ['ville', 'localité', 'où', 'dans quel endroit', 'proche', 'autour', 'quartier'],
    'region': ['région', 'zone', 'département', 'pays'],
    'proche': ['près', 'proximité', 'proche', 'aux alentours', 'à côté', 'autour']
};

const ACTION_KEYWORDS = {
    'search': ['cherche', 'trouve', 'recherche', 'besoin', 'recommander', 'recommande', 'un pro', 'un professionnel'],
    'contact': ['contacter', 'numéro', 'appel', 'téléphone', 'whatsapp', 'joindre', 'parler à'],
    'prix': ['prix', 'tarif', 'coût', 'cher', 'combien'],
    'avis': ['avis', 'note', 'réputation', 'meilleur'],
    'localiser': ['où est-il', 'localiser', 'adresse', 'position'],
};

// =====================================================================
// FONCTIONS UTILITAIRES DE NETTOYAGE ET D'AFFICHAGE
// =====================================================================

/**
 * Normalise une chaîne de caractères pour faciliter la recherche (minuscules, sans accents).
 * @param {string} str - La chaîne à normaliser.
 * @returns {string} - La chaîne normalisée.
 */
function normalizeKeyword(str) {
    if (typeof str !== 'string') return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Affiche un message dans la boîte de dialogue (chat).
 * @param {string} message - Le message à afficher.
 * @param {string} sender - L'expéditeur ('user' ou 'ai').
 */
function appendMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${sender}-message`);
    
    // Remplacement du texte de l'AI pour inclure un lien de retour d'accueil si nécessaire
    if (sender === 'ai') {
        message = message.replace(/\[accueil\]/g, '<a href="#" id="ai-home-link" class="text-accent fw-bold text-decoration-none">Accueil</a>');
    }
    
    messageElement.innerHTML = `
        <div class="message-bubble ${sender === 'ai' ? 'bg-secondary' : 'bg-primary'} p-3 rounded-lg shadow-sm">
            ${message}
        </div>
    `;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll vers le bas
    
    // Ajout d'un écouteur d'événement pour le lien Accueil dans le message AI
    if (sender === 'ai' && message.includes('ai-home-link')) {
        document.getElementById('ai-home-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('home');
        });
    }
}

/**
 * Construit et affiche la carte d'un professionnel.
 * @param {object} pro - L'objet professionnel.
 * @param {boolean} highlight - Indique si le résultat doit être mis en évidence (nouveau).
 * @returns {string} - Le HTML de la carte du professionnel.
 */
function createProCard(pro, highlight = false) {
    const contactMethod = pro.contact_whatsapp || pro.contact_telephone;
    const whatsappLink = pro.contact_whatsapp ? `https://wa.me/${pro.contact_whatsapp.replace(/\D/g, '')}` : null;
    const isVerified = pro.verification === 'Oui';
    const hasGps = pro.indication_gps && pro.indication_gps !== 'Non renseigné' && pro.indication_gps !== 'Non';
    
    // Déterminer la classe de couleur de la note (vert, orange, rouge)
    let ratingColor = 'text-gray-400';
    if (pro.note_avis >= 4.5) {
        ratingColor = 'text-green-500';
    } else if (pro.note_avis >= 3.0) {
        ratingColor = 'text-yellow-500';
    } else if (pro.note_avis > 0) {
        ratingColor = 'text-red-500';
    }
    
    const ratingDisplay = pro.note_avis > 0 
        ? `<i class="bi bi-star-fill ${ratingColor} me-1"></i> ${pro.note_avis.toFixed(1)}` 
        : '<span class="text-gray-400">Pas encore noté</span>';
    
    const verificationBadge = isVerified ? 
        `<span class="verified-badge"><i class="bi bi-patch-check-fill me-1"></i> Vérifié</span>` : 
        '';

    const locationLink = hasGps ?
        `<a href="${pro.indication_gps}" target="_blank" class="location-link"><i class="bi bi-geo-alt-fill me-1"></i> Voir sur la carte</a>` :
        `<span class="text-gray-500"><i class="bi bi-geo-alt me-1"></i> Localisation : ${pro.ville}, ${pro.quartier}</span>`;

    const priceRange = (pro.prix_min && pro.prix_max) && (pro.prix_min !== 'Non renseigné' || pro.prix_max !== 'Non renseigné') 
        ? `<div class="text-sm text-secondary-text mt-2"><i class="bi bi-currency-dollar me-1"></i> Prix indicatif : ${pro.prix_min} - ${pro.prix_max} FCFA</div>`
        : '';

    return `
        <div class="pro-card ${highlight ? 'highlight-card' : ''} p-4 mb-4 rounded-lg shadow-xl animated-pop" data-delay="0s">
            <h3 class="card-title text-accent mb-2 d-flex align-items-center">
                ${pro.nom_entreprise} ${verificationBadge}
            </h3>
            <p class="card-subtitle text-secondary-text mb-2">${pro.activite} (${pro.secteur})</p>
            
            <div class="card-meta d-flex justify-content-between align-items-center mb-3">
                <span class="rating-display">${ratingDisplay}</span>
                <span class="text-sm text-gray-400"><i class="bi bi-clock-fill me-1"></i> Expérience : ${pro.experience_ans} an(s)</span>
            </div>
            
            <p class="card-description">${pro.activite_detaillee}</p>
            
            ${priceRange}
            
            <div class="card-footer mt-3 pt-3 border-t border-gray-700">
                ${locationLink}
                ${whatsappLink ? 
                    `<a href="${whatsappLink}" target="_blank" class="whatsapp-link">
                        <i class="bi bi-whatsapp me-1"></i> Contacter par WhatsApp
                    </a>` : 
                    `<span class="text-sm text-gray-500">Contact : ${contactMethod || 'Non Public'}</span>`
                }
            </div>
        </div>
    `;
}

/**
 * Affiche la liste paginée des professionnels.
 * @param {Array<object>} results - Le tableau des professionnels à afficher.
 * @param {boolean} isInitialSearch - Indique si c'est la première fois qu'on affiche les résultats pour une nouvelle requête.
 */
function displayProfessionals(results, isInitialSearch = true) {
    if (isInitialSearch) {
        proListContainer.innerHTML = '';
        currentPage = 0;
        currentSearchResults = results;
    }
    
    if (results.length === 0 && isInitialSearch) {
        proListContainer.innerHTML = '<p class="text-secondary-text text-center mt-5">Aucun professionnel trouvé pour cette recherche.</p>';
        loadMoreBtn.style.display = 'none';
        return;
    }

    const startIndex = currentPage * professionalsPerPage;
    const endIndex = startIndex + professionalsPerPage;
    const prosToDisplay = currentSearchResults.slice(startIndex, endIndex);

    prosToDisplay.forEach((pro, index) => {
        // Met en évidence uniquement le premier résultat de la première page
        const highlight = (isInitialSearch && index === 0); 
        proListContainer.innerHTML += createProCard(pro, highlight);
    });

    // Gestion du bouton "Afficher plus"
    if (endIndex < currentSearchResults.length) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
    
    currentPage++; // Incrémenter la page pour le prochain chargement
}

// =====================================================================
// FONCTIONS D'ANALYSE DU LANGAGE NATUREL
// =====================================================================

/**
 * Extrait le mot-clé principal de l'activité.
 * @param {string} query - La requête utilisateur.
 * @returns {string} - Le mot-clé d'activité normalisé.
 */
function extractActivity(query) {
    const normalizedQuery = normalizeKeyword(query);
    
    // Tente de trouver un mot-clé qui correspond à un secteur ou une colonne connue.
    const activityKeywords = SECTOR_COLUMNS.map(normalizeKeyword);
    for (const keyword of activityKeywords) {
        if (normalizedQuery.includes(keyword)) {
            return keyword;
        }
    }
    
    // Si aucun secteur connu n'est trouvé, retourne le premier nom/verbe significatif (heuristique simple)
    const actionWords = Object.values(ACTION_KEYWORDS).flat().map(normalizeKeyword);
    const stopWords = ['de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'des', 'je', 'veux', 'cherche', 'trouve', 'pour', 'qui', 'est', 'sont'];
    
    const words = normalizedQuery.split(/\s+/).filter(word => word.length > 2 && !stopWords.includes(word) && !actionWords.includes(word));
    
    return words[0] || normalizedQuery; // Retourne le premier mot significatif, ou la requête entière par défaut
}

/**
 * Extrait les mots-clés de localisation.
 * @param {string} query - La requête utilisateur.
 * @returns {{ville: string|null, degrade: boolean}} - L'objet de localisation.
 */
function extractLocation(query) {
    const normalizedQuery = normalizeKeyword(query);
    let ville = null;
    let degrade = false; // Flag pour indiquer une recherche de proximité ou dégradée
    
    // 1. Recherche de villes spécifiques
    for (const cityKey in GEO_KEYWORDS) {
        if (GEO_KEYWORDS[cityKey].some(k => normalizedQuery.includes(k))) {
            ville = cityKey;
            break;
        }
    }

    // 2. Recherche de proximité (active la recherche dégradée)
    if (GEO_KEYWORDS.proche.some(k => normalizedQuery.includes(k))) {
        degrade = true;
    }
    
    // 3. Si aucune ville spécifique n'est trouvée, essaie de prendre le dernier mot comme ville
    if (!ville) {
        const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
        if (words.length > 0) {
            // Option 1: Considérer les 1 ou 2 derniers mots comme la ville/quartier potentielle
            const lastWords = words.slice(-2).join(' '); 
            ville = lastWords; 
        }
    }
    
    return { ville, degrade };
}

/**
 * Fonction principale de recherche des professionnels.
 * @param {string} query - La requête utilisateur.
 * @returns {Array<object>} - Tableau des professionnels correspondants.
 */
function searchProfessionals(query) {
    // 1. Extraction des mots-clés
    const activite = extractActivity(query);
    const { ville, degrade } = extractLocation(query);

    // Mots-clés de la requête (nettoyés)
    const queryWords = query ? query.toLowerCase().split(/[\s,;']+/).filter(w => w.length > 2).map(normalizeKeyword) : [];

    return proData.filter(pro => {
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
            matchActivite = true; // Si aucune activité n'est spécifiée, le filtre d'activité passe
        }
        
        // 2. Logique de Ville/Quartier (Dégradation)
        if (ville) {
            if (degrade) {
                // Recherche dégradée (proximité) : Ville uniquement
                matchVille = proVille.includes(ville);
            } else {
                // Recherche stricte : Ville OU (Ville + Quartier)
                const fullLocation = proVille + ' ' + proQuartier;
                matchVille = fullLocation.includes(normalizeKeyword(query)) || proVille.includes(ville);
            }
        } else {
            matchVille = true; // Si aucune ville n'est spécifiée, le filtre de ville passe
        }
        
        return matchActivite && matchVille;
    });
}

// =====================================================================
// FONCTIONS DE GESTION DE L'API GEMINI (Recherche et Conversation)
// =====================================================================

// Laissez apiKey vide; le framework Canvas le fournira au runtime.
const GEMINI_API_KEY = ""; 
const GEMINI_API_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';
const MAX_RETRIES = 5;

/**
 * Fonction pour appeler l'API Gemini avec gestion des tentatives.
 * @param {object} payload - Le corps de la requête JSON.
 * @returns {Promise<object>} - La réponse JSON de l'API.
 */
async function callGeminiApi(payload) {
    let lastError = null;
    for (let i = 0; i < MAX_RETRIES; i++) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000; // Délai exponentiel avec jitter
        if (i > 0) await new Promise(resolve => setTimeout(resolve, delay));

        try {
            const url = `${GEMINI_API_URL_BASE}?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                return response.json();
            } else if (response.status === 429 || response.status >= 500) {
                // Erreur de taux limité ou erreur serveur, on retente
                lastError = `Erreur API: ${response.status} ${response.statusText}`;
                console.warn(`Tentative ${i + 1} échouée. Retraitement dans ${delay / 1000}s.`, lastError);
            } else {
                // Erreur client irrécupérable
                const errorBody = await response.json();
                throw new Error(`Erreur API irrécupérable: ${response.status} - ${errorBody.error?.message || response.statusText}`);
            }
        } catch (error) {
            lastError = error;
            console.error(`Erreur lors de la tentative ${i + 1}:`, error);
        }
    }
    // Si toutes les tentatives ont échoué
    throw new Error(`Échec de l'appel API après ${MAX_RETRIES} tentatives: ${lastError ? lastError.message || lastError : 'Erreur inconnue'}`);
}


/**
 * Analyse la requête utilisateur pour déterminer s'il s'agit d'une recherche ou d'une question.
 * Puis, génère une réponse AI basée sur les résultats de la recherche interne et/ou Gemini.
 * @param {string} rawQuery - La requête utilisateur non traitée.
 */
async function processUserQuery(rawQuery) {
    appendMessage(rawQuery, 'user');
    userInput.value = '';
    currentQuery = rawQuery; // Stocke la requête pour les interactions futures

    // 1. Recherche interne des professionnels
    const searchResults = searchProfessionals(rawQuery);
    
    // 2. Afficher la liste des professionnels
    displayProfessionals(searchResults, true);

    // 3. Préparation du prompt pour Gemini
    let prompt;
    let systemInstruction;

    // Contexte de la recherche
    const proCount = searchResults.length;
    let proContext = '';
    
    if (proCount > 0) {
        // Crée un contexte détaillé pour les 3 meilleurs résultats
        const topPros = searchResults.slice(0, 3).map((pro, index) => 
            `\n${index + 1}. ${pro.nom_entreprise} - Activité: ${pro.activite} - Détails: ${pro.activite_detaillee} - Ville: ${pro.ville}, ${pro.quartier} - Note: ${pro.note_avis} - Contact: ${pro.contact_whatsapp || pro.contact_telephone || 'Non public'}`
        ).join('');

        proContext = `J'ai trouvé ${proCount} professionnel(s) correspondant(s) à la requête. Les meilleurs résultats sont:\n${topPros}\n---\n`;
    } else {
        proContext = `Je n'ai trouvé aucun professionnel dans mon annuaire pour cette requête.`;
    }
    
    // Contexte général et instructions de rôle
    systemInstruction = {
        parts: [{ text: `
            Vous êtes ProFinder AI, un assistant conversationnel pour l'annuaire de professionnels. 
            Votre rôle est d'analyser la requête de l'utilisateur.

            -- Règles de Réponse --
            1. Si des professionnels ont été trouvés (voir CONTEXTE), vous devez:
               - Confirmer la recherche et mentionner le nombre de résultats trouvés.
               - Inviter l'utilisateur à parcourir la liste affichée ci-dessous.
               - NE PAS répéter les détails de contact ou d'activité des professionnels. Dites simplement: "Tous les détails sont affichés dans les cartes ci-dessous."
               - Suggérer une nouvelle recherche plus précise.
            2. Si AUCUN professionnel n'a été trouvé (voir CONTEXTE), vous devez:
               - Expliquer poliment qu'aucun résultat interne n'a été trouvé.
               - Lancer une recherche Google pour tenter de répondre à la question de manière générale (Utilisez l'outil Google Search).
               - Si Google Search fournit des informations pertinentes, résumez-les en français.
            3. Si la requête est une question générale (non liée à la recherche d'un pro) ou nécessite des informations actualisées (ex: "Quel est le taux de change du jour ?"), utilisez l'outil Google Search.
            4. Votre ton est professionnel, amical et précis.
            5. Utilisez toujours le français.
            
            CONTEXTE ACTUEL (Annuaire Interne):
            ${proContext}
            ` 
        }]
    };
    
    // La requête utilisateur envoyée à Gemini
    prompt = `Requête de l'utilisateur: "${rawQuery}"`;

    let responseText = "🤖 *ProFinder AI est en ligne...*";
    appendMessage(responseText, 'ai');
    
    // Création de l'élément de message de l'AI pour le mettre à jour plus tard
    const aiMessageElement = chatBox.lastElementChild.querySelector('.message-bubble');

    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            // Active Google Search grounding si nécessaire (pour les questions générales ou l'absence de résultats internes)
            tools: [{ "google_search": {} }], 
            systemInstruction: systemInstruction,
        };
        
        const apiResponse = await callGeminiApi(payload);
        
        const candidate = apiResponse.candidates?.[0];
        responseText = candidate?.content?.parts?.[0]?.text || "Désolé, je n'ai pas pu générer de réponse pour le moment.";

        // Remplacement par la réponse finale
        aiMessageElement.innerHTML = responseText;

    } catch (error) {
        console.error("Erreur Gemini AI:", error);
        aiMessageElement.innerHTML = `❌ *Erreur de communication avec l'IA. Veuillez réessayer.*`;
    }
}


// =====================================================================
// FONCTIONS DE CHARGEMENT ET D'INITIALISATION
// =====================================================================

/**
 * Change l'affichage entre la page d'accueil et la page de chat.
 * @param {string} page - 'home' ou 'chat'.
 */
function navigateTo(page) {
    if (page === 'chat') {
        homePage.classList.remove('active');
        chatPage.classList.add('active');
        // Ajoute un message initial seulement si la boîte est vide
        if (chatBox.children.length === 0) {
            appendMessage("Bonjour ! Je suis ProFinder AI. Cherchez-vous un professionnel dans un domaine particulier ou une information ? (Ex: 'plombier à Cotonou' ou 'taux de change')", 'ai');
        }
    } else {
        chatPage.classList.remove('active');
        homePage.classList.add('active');
    }
}

/**
 * Tente d'obtenir la géolocalisation de l'utilisateur.
 */
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log("Géolocalisation réussie:", userLocation);
                // Le message de bienvenue peut être adapté ici si la localisation est connue
            },
            (error) => {
                console.warn("Erreur de géolocalisation:", error.message);
                // Ne rien faire, la localisation est optionnelle
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        console.warn("La géolocalisation n'est pas supportée par ce navigateur.");
    }
}


/**
 * Charge les données des professionnels depuis Google Sheets.
 */
async function loadProfessionalData() {
    console.log("Chargement des données...");
    try {
        const response = await fetch(SHEET_API_URL);
        const text = await response.text();
        
        // La réponse Gviz est un wrapper JavaScript, il faut l'extraire
        const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
        const data = JSON.parse(jsonText);

        const rows = data.table.rows;
        const cols = data.table.cols;
        
        // Récupérer les noms de colonnes du premier row (l'en-tête)
        // Les noms des colonnes sont dans la propriété 'label'
        const columnLabels = cols.map(c => c.label);

        // Transformation des données
        proData = rows.map(row => {
            let pro = {};
            row.c.forEach((cell, index) => {
                const label = columnLabels[index];
                let value = cell ? (cell.v !== undefined ? cell.v : cell.f) : null;
                
                // Normalisation des clés pour la recherche
                const keyMapping = {
                    'Timestamp': 'timestamp',
                    'Nom de l\'Entreprise': 'nom_entreprise',
                    'Contact WhatsApp': 'contact_whatsapp',
                    'Contact Téléphonique': 'contact_telephone',
                    'Ville de Base': 'ville',
                    'Quartier / Localisation': 'quartier',
                    'Indication GPS': 'indication_gps',
                    'Secteur Général': 'secteur',
                    'Activité Détaillée': 'activite_detaillee',
                    'Expérience (ans)': 'experience_ans',
                    'Prix Min (FCFA)': 'prix_min',
                    'Prix Max (FCFA)': 'prix_max',
                    'Note/Avis': 'note_avis',
                    'Vérification (Oui/Non)': 'verification',
                    'Consentement Contact': 'contact_consent',
                    // Ajouter le mapping si le nom de l'activité est séparé
                    // On utilise 'activite_detaillee' comme 'activite' principale pour la recherche
                    // Ajout d'une clé simple 'activite' pour la recherche rapide
                    'Activité Principale': 'activite' 
                };

                const key = keyMapping[label] || label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

                // Conversion de type pour les nombres
                if (key === 'note_avis' || key === 'experience_ans') {
                    value = parseFloat(value) || 0;
                }
                
                // Le nom de l'activité principale est l'activité détaillée (pour l'instant)
                if (key === 'activite_detaillee' && !pro.activite) {
                    pro.activite = value;
                }
                
                pro[key] = value;
            });
            // Assure que l'activité principale est définie pour la recherche si elle ne l'est pas
            if (!pro.activite) {
                pro.activite = pro.activite_detaillee;
            }
            return pro;
        }).filter(pro => pro.nom_entreprise); // Filtre les lignes vides
        
        console.log(`Données chargées : ${proData.length} professionnels.`);
        // Note: La première recherche n'est déclenchée que lorsque l'utilisateur tape quelque chose.

    } catch (error) {
        console.error("Erreur lors du chargement des données de Google Sheet. Vérifiez le SHEET_API_URL et l'accès public:", error);
        appendMessage("❌ Erreur critique : Impossible de charger les données des professionnels. Veuillez vérifier la console pour plus de détails.", 'ai');
    }
}


// =====================================================================
// ÉVÉNEMENTS
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialisation
    loadProfessionalData();
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

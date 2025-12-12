// =====================================================================
// ⚠️ ÉTAPE 1 : URL DU FICHIER GOOGLE SHEET (NE DOIT PAS CHANGER)
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1RnfF5eEeAx3mFrTagLq_C2LSB1DjeA20UOANh9wE7uk/gviz/tq?tqx=out:json'; 
// =====================================================================
// L'URL APPS SCRIPT n'est plus nécessaire pour la recherche de professionnels
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
// LISTES DE RÉFÉRENCE (INCHANGÉES)
// =====================================================================

const SECTOR_COLUMNS = [
    'Finance / Assurance', 'Transport / Logistique', 'Communication / Médias', 
    'Tourisme / Loisirs', 'Services à la personne', 'Agriculture / Élevage / Pêche', 
    'Droit / Juridique', 'Énergie / Environnement', 'Autres services spécialisés', 
    'Alimentation', 'Mode / Couture', 'Beauté / Esthétique', 
    'Technologie / Informatique', 'Automobile / Mécanique', 'BTP / Construction', 
    'Santé / Pharmacie', 'Éducation / Formation', 'Artisanat / Création', 
    'Commerce général'
];

const ALL_SPECIALTIES = [
    'Restauration', 'Traiteur', 'Vente de produits locaux', 'Transformation alimentaire', 'Boulangerie / Pâtisserie', 'Livraison de repas',
    'Styliste / Créateur', 'Couturier / Couturière', 'Retouche / Réparation', 'Vente de vêtements', 'Accessoires de mode',
    'Coiffure', 'Maquillage', 'Manucure / Pédicure', 'Soins corporels / Massage', 'Spa / Institut',
    'Dépannage / Réparation', 'Vente de matériel', 'Développement web / mobile', 'Graphisme / Design', 'Formation / Cybersécurité',
    'Mécanicien', 'Lavage auto', 'Vente de pièces', 'Peinture auto', 'Diagnostic électronique',
    'Maçonnerie', 'Plomberie', 'Électricité', 'Peinture', 'Menuiserie (bois, alu)', 'Architecture / Dessin technique',
    'Pharmacien', 'Infirmier / Soins à domicile', 'Médecin', 'Laboratoire', 'Produits pharmaceutiques / parapharmacie',
    'Enseignant / Cours particuliers', 'Centre de formation', 'École privée', 'Formateur professionnel', 'Soutien scolaire',
    'Menuiserie', 'Sculpture', 'Tissage / Bijoux', 'Décoration / Objets artistiques', 'DAO / Modélisation',
    'Boutique / Vente', 'Supermarché', 'Import / Export', 'Vente en ligne (e-commerce)', 'Grossiste / Détail',
    'Microfinance', 'Agent mobile money', 'Courtier / Assurance', 'Comptabilité / Gestion', 'Fintech / Paiement numérique',
    'Taxi / Zemidjan', 'Livraison', 'Location de véhicules', 'Transit / Fret', 'Déménagement',
    'Création de contenu', 'Photographe / Vidéaste', 'Publicité / Marketing digital', 'Agence de communication', 'Imprimerie / Graphisme',
    'Guide touristique', 'Hôtel / Auberge', 'Restaurant / Bar', 'Organisation d’événements', 'Location de salle / espace',
    'Garde d’enfants', 'Femme de ménage', 'Assistance à domicile', 'Agent de sécurité', 'Jardinage',
    'Production vivrière', 'Élevage', 'Pisciculture', 'Vente de produits agricoles', 'Transformation agroalimentaire',
    'Avocat', 'Conseiller juridique', 'Notaire', 'Cabinet d’expertise', 'Médiation',
    'Installation solaire', 'Recyclage', 'Gestion des déchets', 'Fourniture d’équipements électriques', 'Énergies renouvelables',
    'Consultant indépendant', 'Traducteur', 'Développeur freelance', 'Coach / Formateur personnel', 'Service sur mesure'
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

// LISTE ÉTENDUE des lieux à chercher à proximité
const GEO_KEYWORDS = [
    'banque', 'hôpital', 'pharmacie', 'commissariat', 'poste', 'urgence', 'distributeur', 
    'supermarché', 'restaurant', 'marché', 'école', 'université', 'stade', 'mosquée', 
    'église', 'hôtel', 'aéroport', 'bus', 'station-service', 'garage' 
];


// =====================================================================
// FONCTIONS DE BASE (NAVIGATION/AFFICHAGE)
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
startChatBtn.addEventListener('click', () => showPage('chat'));
accueilBtnNav.addEventListener('click', () => showPage('home'));

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message', 'animated-message');
    
    if (sender === 'bot') {
        messageDiv.innerHTML = text;
    } else {
        messageDiv.textContent = text;
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
function handleUserQuery() {
    const query = userInput.value.trim();
    if (query === '') return;

    addMessage(query, 'user');
    userInput.value = '';

    // Changement : ProcessBotResponse est maintenant asynchrone pour la phase de chargement si nécessaire
    processBotResponse(query);
}
sendBtn.addEventListener('click', handleUserQuery);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserQuery();
    }
});


// =====================================================================
// FONCTIONS UTILITAIRES D'AFFICHAGE (INCHANGÉES)
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
    if (number === null || isNaN(number)) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR').format(number) + ' FCFA';
}


// =====================================================================
// MISE À JOUR MAJEURE : GESTION DES DONNÉES EN LOCAL
// =====================================================================

/**
 * Charge les données complètes du Google Sheet via l'API Visualization (GViz)
 */
async function loadSheetData() {
    addMessage("Chargement des données de l'annuaire...", 'bot');
    
    try {
        const response = await fetch(SHEET_API_URL);
        const text = await response.text();
        
        // Nettoyage de la réponse GViz
        const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
        const data = JSON.parse(jsonText);
        
        const rows = data.table.rows;
        
        // Mapping des colonnes (basé sur l'ordre de votre feuille)
        proData = rows.map(row => {
            const c = row.c;
            return {
                nomContact: c[0] ? c[0].v : '',
                nomEntreprise: c[1] ? c[1].v : '',
                whatsapp: c[2] ? String(c[2].v) : '',
                secteur: c[3] ? String(c[3].v).toLowerCase() : '',
                // c[4] : Date/Timestamp
                experience: c[5] ? parseInt(c[5].v) : 0,
                latitude: c[6] ? c[6].v : null,
                longitude: c[7] ? c[7].v : null,
                activite: c[8] ? String(c[8].v).toLowerCase() : '', // Activité détaillée
                ville: c[9] ? String(c[9].v).toLowerCase() : '',
                quartier: c[10] ? String(c[10].v).toLowerCase() : '',
                prixMin: c[11] ? parseFloat(c[11].v) : null,
                prixMax: c[12] ? parseFloat(c[12].v) : null,
                note: c[13] ? parseFloat(c[13].v) : 0,
                // c[14] : Visibilité
                // c[15] : Consentement
            };
        }).filter(pro => pro.activite !== ''); // Filtrer les lignes vides ou incomplètes

        addMessage(`Données chargées ! **${proData.length}** professionnels sont disponibles.`, 'bot');

    } catch (error) {
        addMessage("❌ Erreur de connexion aux données de l'annuaire. Vérifiez l'URL de la feuille.", 'bot');
        console.error("Erreur de chargement des données :", error);
    }
}

/**
 * Recherche locale dans le tableau proData (Remplace Apps Script)
 */
function localSearch(activite, ville, quartier) {
    const activiteLower = activite ? activite.toLowerCase() : null;
    const villeLower = ville ? ville.toLowerCase() : null;
    const quartierLower = quartier ? quartier.toLowerCase() : null;

    let results = [];
    let searchLevel = 0;

    // Fonction de vérification de l'activité
    const matchesActivity = (pro) => 
        !activiteLower || pro.activite.includes(activiteLower) || pro.secteur.includes(activiteLower);

    // --- TENTATIVE 1: Activité + Ville + Quartier ---
    results = proData.filter(pro => {
        const matchAct = matchesActivity(pro);
        const matchVille = !villeLower || pro.ville === villeLower;
        const matchQuartier = !quartierLower || pro.quartier.includes(quartierLower);
        return matchAct && matchVille && matchQuartier;
    });
    if (results.length > 0) searchLevel = 1;

    // --- TENTATIVE 2: Activité + Ville (si T1 échoue et ville est présente) ---
    if (results.length === 0 && villeLower) {
        results = proData.filter(pro => {
            const matchAct = matchesActivity(pro);
            const matchVille = pro.ville === villeLower;
            return matchAct && matchVille;
        });
        if (results.length > 0) searchLevel = 2;
    }
    
    // --- TENTATIVE 3: Activité seule (si T2 échoue et activité est présente) ---
    if (results.length === 0 && activiteLower) {
        results = proData.filter(matchesActivity);
        if (results.length > 0) searchLevel = 3;
    }
    
    // Tri (par Note/Avis du meilleur au pire, puis par expérience)
    results.sort((a, b) => {
        const noteA = parseFloat(a.note) || 0;
        const noteB = parseFloat(b.note) || 0;
        if (noteB !== noteA) return noteB - noteA;
        
        const expA = parseInt(a.experience) || 0;
        const expB = parseInt(b.experience) || 0;
        return expB - expA; 
    });

    return results;
}


// MISE À JOUR : Affichage des résultats (utilise maintenant les clés du tableau local)
function displayResults(results, activite, ville) {
    let responseHTML = '';
    const recherche = `**${activite || 'Professionnel'}** ${ville ? 'à **' + ville + '**' : ''}`;

    if (results.length > 0) {
        
        responseHTML += `<p>✅ J'ai trouvé **${results.length}** résultat(s) pour ${recherche}.</p>
                         <p class="small fst-italic">Trié par **Note** et **Expérience**.</p>`;

        results.forEach(pro => {
            // Utilisation des clés du tableau proData (camelCase)
            const nomAffichage = pro.nomEntreprise.trim() ? `${pro.nomEntreprise} (par ${pro.nomContact})` : pro.nomContact;
            const quartierInfo = pro.quartier.trim() ? ` à ${pro.quartier}` : '';
            
            // Badges et Infos Qualité
            const noteValue = parseFloat(pro.note) || 0;
            const noteEtoiles = noteValue > 0 ? getStarRating(noteValue) : '';
            
            const badgeVerif = (pro.latitude && pro.longitude) ? `<span class="badge-verified ms-2">VÉRIFIÉ GPS</span>` : '';
            
            // AFFICHAGE EXPÉRIENCE 
            const experienceValue = parseInt(pro.experience) || 0;
            const experience = experienceValue > 0 ? `${experienceValue} an(s)` : 'Nouvelle adhésion';
            
            let prixInfo = 'Non spécifié';
            const prixMin = pro.prixMin;
            const prixMax = pro.prixMax;

            if (prixMin !== null && prixMax !== null && prixMin < prixMax) {
                 prixInfo = `${formatFCFA(prixMin)} - ${formatFCFA(prixMax)}`;
            } else if (prixMin !== null) {
                prixInfo = `À partir de : ${formatFCFA(prixMin)}`;
            } else if (prixMax !== null) {
                prixInfo = `Jusqu'à : ${formatFCFA(prixMax)}`;
            }

            // NOUVEAU: Lien de localisation 
            const mapLink = (pro.latitude && pro.longitude) ? 
                `<a href="https://maps.google.com/?q=${pro.latitude},${pro.longitude}" target="_blank" class="location-link mt-2"><i class="bi bi-geo-alt-fill"></i> Voir l'adresse</a>` : '';


            responseHTML += `
                <div class="result-card animated-result-card">
                    <p class="mb-0 text-white fw-bold d-flex align-items-center">${nomAffichage} ${badgeVerif}</p>
                    <p class="mb-1 text-accent small">${pro.activite.toUpperCase()} - ${pro.ville}${quartierInfo}</p>
                    <div class="note-line">
                        <div>${noteEtoiles}</div>
                        <div class="experience-text">Expérience : <span>${experience}</span></div>
                    </div>
                    <p class="price-range">${prixInfo}</p>
                    ${mapLink} <a href="https://wa.me/${pro.whatsapp.replace(/\s/g, '')}" target="_blank" class="whatsapp-link">
                        <i class="bi bi-whatsapp"></i> Contacter via WhatsApp
                    </a>
                </div>
            `;
        });
    } else {
        responseHTML = `<p>😔 Désolé, aucun pro n'a été trouvé pour ${recherche}.</p>
                        <p>👉 **Conseil :** Essayez d'utiliser uniquement un métier générique (ex: 'Plombier') ou le nom de la ville (ex: 'Cotonou').</p>`;
    }

    addMessage(responseHTML, 'bot');
}


// =====================================================================
// FONCTIONS DE DÉTECTION DES MOTS-CLÉS (INCHANGÉES)
// =====================================================================

function getQuartierFromQuery(query) {
    const words = query.toLowerCase().split(/[\s,;']+/).filter(w => w.length > 2);
    const citiesAndKeywords = ALL_CITIES.concat(GEO_KEYWORDS).map(normalizeKeyword);

    for (const word of words) {
        const normalizedWord = normalizeKeyword(word);
        
        // Exclure les villes, les mots-clés de géolocalisation et les mots-clés d'activité
        if (!ALL_CITIES.includes(word) && !GEO_KEYWORDS.includes(normalizedWord)) {
            const isSectorOrSpecialty = SECTOR_COLUMNS.map(s => s.toLowerCase().split(' / ')[0]).includes(normalizedWord) ||
                                        ALL_SPECIALTIES.map(s => s.toLowerCase().split(' / ')[0]).includes(normalizedWord) ||
                                        ALL_SPECIALTIES.map(s => s.toLowerCase()).some(s => s.includes(normalizedWord));
            
            if (!isSectorOrSpecialty) {
                // On suppose que le premier mot non-identifié pourrait être un quartier
                return word;
            }
        }
    }
    return ''; 
}

function normalizeKeyword(word) {
    if (word.endsWith('s') && word.length > 3) {
        return word.slice(0, -1);
    }
    if (word.includes('informaticien')) {
        return 'informatique';
    }
    return word;
}


function getKeywords(query) {
    const words = query.toLowerCase().split(/[\s,;']+/).filter(w => w.length > 2);
    let keywordActivite = null;
    let keywordVille = null;
    let keywordGeo = null; 

    for (const word of words) {
        const normalizedWord = normalizeKeyword(word);

        // 1. Détection de la Ville
        if (ALL_CITIES.includes(word)) { 
            keywordVille = word;
        }
        
        // 2. Détection de Mot-Clé GÉOLOCALISATION
        if (GEO_KEYWORDS.includes(normalizedWord)) {
            keywordGeo = normalizedWord;
        }

        // 3. Détection de l'Activité (Profinder)
        const isSectorOrSpecialty = SECTOR_COLUMNS.map(s => s.toLowerCase().split(' / ')[0]).includes(normalizedWord) ||
                                    ALL_SPECIALTIES.map(s => s.toLowerCase().split(' / ')[0]).includes(normalizedWord) ||
                                    ALL_SPECIALTIES.map(s => s.toLowerCase()).some(s => s.includes(normalizedWord));

        if (isSectorOrSpecialty) {
            keywordActivite = normalizedWord; 
        }
    }
    
    // Logique de secours pour l'activité si pas de GEO
    if (!keywordActivite && !keywordGeo) {
        const excludedWords = ['cherche', 'trouve', 'besoin', 'recherche', 'un', 'une', 'à', 'de', 'le', 'la', 'les', 'en', 'sur', 'plus', 'proche', 'moi'];
        const firstRelevantWord = words.find(w => w.length > 2 && !excludedWords.includes(w) && !ALL_CITIES.includes(w) && !GEO_KEYWORDS.includes(w));
        if (firstRelevantWord) {
            keywordActivite = normalizeKeyword(firstRelevantWord);
        }
    }

    return { activite: keywordActivite, ville: keywordVille, geo: keywordGeo };
}

async function processBotResponse(query) {
    const lowerQuery = query.toLowerCase();
    const { activite: activiteKeyword, ville: villeKeyword, geo: geoKeyword } = getKeywords(query);
    
    // Vérification de la demande de proximité (Hôpital/Banque le plus proche de moi)
    const isNearbyQuery = lowerQuery.includes('plus proche') && geoKeyword;
    
    if (isNearbyQuery) {
        askForGeolocation(geoKeyword);
        return;
    }

    // Logique de recherche dans l'annuaire (Profinder)
    if (lowerQuery.includes('cherche') || lowerQuery.includes('trouve') || lowerQuery.includes('besoin') || lowerQuery.includes('recherche') || lowerQuery.includes('un') || lowerQuery.includes('une') || activiteKeyword) {

        if (!activiteKeyword && !villeKeyword) {
            addMessage("Veuillez être plus précis. Quelle **Activité** et dans quelle **Ville** ? **Exemple : Plombier à Cotonou.**", 'bot');
            return;
        }

        // --- MISE À JOUR MAJEURE : RECHERCHE LOCALE (SYNCHRONE) ---
        if (proData.length === 0) {
            addMessage("Veuillez patienter, les données de l'annuaire ne sont pas encore chargées. Réessayez dans un instant.", 'bot');
            return;
        }
        
        const quartierKeyword = getQuartierFromQuery(query); 
        
        // Exécute la recherche et le tri en local
        const results = localSearch(activiteKeyword, villeKeyword, quartierKeyword);

        displayResults(results, activiteKeyword, villeKeyword);

    } else if (lowerQuery.includes('bonjour') || lowerQuery.includes('salut') || lowerQuery.includes('hello')) {
        addMessage("Salut ! Je suis ProFinder. La règle pour la recherche est simple : **[Activité] à [Ville]**. Pour les lieux, essayez : **[Banque] le plus proche de moi**.", 'bot');
    } else {
        addMessage("Je n'ai pas compris. Veuillez utiliser le format simple : **[Activité] à [Ville]** ou **[Lieu] le plus proche de moi**.", 'bot');
    }
}


// =====================================================================
// LOGIQUE DE GÉOLOCALISATION (INCHANGÉE)
// =====================================================================

function askForGeolocation(keyword) {
    const message = `
        <p>Pour trouver le(la) **${keyword}** le plus proche, j'ai besoin d'accéder à votre position actuelle.</p>
        <p>Acceptez-vous de partager votre localisation ?</p>
        <button id="geo-yes" class="custom-btn btn-sm me-2">✅ Oui, Partager</button>
        <button id="geo-no" class="btn btn-sm btn-danger">❌ Non, Annuler</button>
    `;
    addMessage(message, 'bot');

    setTimeout(() => {
        const geoYesBtn = document.getElementById('geo-yes');
        const geoNoBtn = document.getElementById('geo-no');

        if (geoYesBtn) {
            geoYesBtn.addEventListener('click', () => {
                addMessage('... Acquisition de votre position en cours ...', 'bot');
                getGeolocation(keyword);
            }, { once: true });
        }
        if (geoNoBtn) {
            geoNoBtn.addEventListener('click', () => {
                addMessage(`Recherche de **${keyword}** annulée.`, 'bot');
            }, { once: true });
        }
    }, 100);
}

function getGeolocation(keyword) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                addMessage(`Position obtenue : Latitude ${userLocation.lat.toFixed(4)}, Longitude ${userLocation.lng.toFixed(4)}`, 'bot');
                searchNearby(keyword, userLocation);
            },
            (error) => {
                let errorMessage = "Impossible d'obtenir votre position. Assurez-vous que la localisation est activée et autorisée pour ce site.";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = "Vous avez refusé l'accès à la localisation. Impossible de trouver le lieu le plus proche. (Rappel : Nécessite HTTPS)";
                }
                addMessage(`❌ Erreur de géolocalisation : ${errorMessage}`, 'bot');
            }
        );
    } else {
        addMessage("❌ Votre navigateur ne supporte pas la géolocalisation.", 'bot');
    }
}

function searchNearby(keyword, location) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}&query_place_id=&center=${location.lat},${location.lng}&zoom=15`;

    const responseHTML = `
        <p>🌍 Voici le résultat de la recherche **"${keyword}"** près de votre position :</p>
        <a href="${mapsUrl}" target="_blank" class="custom-btn mt-2">
            <i class="bi bi-geo-alt-fill"></i> Afficher sur Google Maps
        </a>
    `;
    addMessage(responseHTML, 'bot');
}


// Démarrage : chargement des données au lancement
loadSheetData();
showPage('home');

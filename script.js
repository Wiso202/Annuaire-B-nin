// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// =====================================================================
// ID DE FICHE GOOGLE : 1RnfF5eEeAx3mFrTagLq_C2LSB1DjeA20UOANh9wE7uk
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
// LISTES DE RÉFÉRENCE (GEO_KEYWORDS ÉTENDU) (Inchangées)
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
// FONCTIONS DE BASE (Inchangées)
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

    processBotResponse(query);
}
sendBtn.addEventListener('click', handleUserQuery);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserQuery();
    }
});


// =====================================================================
// FONCTIONS D'AFFICHAGE ET DE GESTION DES DONNÉES (Logique conservée)
// =====================================================================

function getStarRating(note) {
    // S'assurer que la note est un nombre et entre 0 et 5
    const normalizedNote = Math.max(0, Math.min(5, parseFloat(note)));
    
    // Arrondir au demi-point le plus proche (ex: 4.3 -> 4.5, 3.2 -> 3.0)
    const roundedNote = Math.round(normalizedNote * 2) / 2; 

    let stars = '';
    
    // Étoiles pleines (★)
    const fullStars = Math.floor(roundedNote);
    for (let i = 0; i < fullStars; i++) {
        stars += '★'; 
    }
    
    // Gérer la demi-étoile (½)
    const hasHalfStar = (roundedNote - fullStars) === 0.5;
    if (hasHalfStar) {
        stars += '½'; 
    }

    // Étoiles vides (☆)
    const emptyStars = 5 - fullStars - (hasHalfStar ? 0.5 : 0);
    for (let i = 0; i < Math.floor(emptyStars); i++) {
        stars += '☆'; 
    }
    
    return `<span class="star-rating">${stars}</span>`;
}

function formatFCFA(number) {
    if (number === null || isNaN(number)) return '';
    // Utilisation de fr-FR pour le formatage monétaire ou de nombre avec espaces
    return new Intl.NumberFormat('fr-FR').format(number) + ' FCFA';
}

function sortProfessionals(a, b) {
    // 1. Priorité à la Note
    if (b.note !== a.note) {
        return b.note - a.note; // Tri décroissant (meilleure note d'abord)
    }
    // 2. Si les notes sont égales, prioriser l'Expérience
    return b.experience - a.experience; // Tri décroissant (plus d'expérience d'abord)
}

// =====================================================================
// MISE À JOUR CRITIQUE : Lecture des nouvelles colonnes
// =====================================================================
async function loadSheetData() {
    addMessage("Chargement des données de l'annuaire...", 'bot');
    
    try {
        const response = await fetch(SHEET_API_URL);
        const text = await response.text();
        
        const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
        const data = JSON.parse(jsonText);
        
        const rows = data.table.rows;
        const headers = data.table.cols.map(col => col.label);
        
        // --- CORRECTION : Mappage des indices de colonnes à partir des EN-TÊTES EXACTS ---
        // Utilisation de .includes() pour une meilleure robustesse face aux espaces/capitales invisibles
        const mapHeader = (headerName) => headers.findIndex(h => h.includes(headerName));

        const NOM_PRENOM_INDEX = mapHeader('Nom et Prénom');
        const ENTREPRISE_INDEX = mapHeader('Nom de l\'entreprise');
        const CONTACT_INDEX = mapHeader('WhatsApp'); // CORRECTION ICI : Utilisation de 'WhatsApp'
        const VILLE_INDEX = mapHeader('Ville');
        const QUARTIER_INDEX = mapHeader('Votre quartier');
        const SECTEUR_INDEX = mapHeader('Secteur Général');
        const ACTIVITE_INDEX = mapHeader('Activité Détaillée'); 
        const EXPERIENCE_INDEX = mapHeader('Expérience (ans)');
        const PRIX_MIN_INDEX = mapHeader('Prix Min (FCFA)');
        const PRIX_MAX_INDEX = mapHeader('Prix Max (FCFA)');
        const NOTE_INDEX = mapHeader('Note/Avis');
        const VISIBILITE_INDEX = mapHeader('Visibilité Publique'); 
        const GPS_INDICATION_INDEX = mapHeader('Indication GPS'); 
        
        const formattedData = rows.slice(1).map(row => {
            const cells = row.c;
            
            // Fonction pour obtenir la valeur de la cellule ou null si non définie
            const getCellValue = (index) => (index !== -1 && cells[index] && cells[index].v !== undefined) ? cells[index].v : null;
            
            const nomPrenom = getCellValue(NOM_PRENOM_INDEX) || '';
            const entreprise = getCellValue(ENTREPRISE_INDEX) || '';
            const contact = getCellValue(CONTACT_INDEX) || '';
            const quartier = getCellValue(QUARTIER_INDEX) || '';
            const ville = getCellValue(VILLE_INDEX) || '';
            const secteur = getCellValue(SECTEUR_INDEX) || 'Inconnu';
            const activite = getCellValue(ACTIVITE_INDEX) || ''; // La spécialité exacte
            
            // NOUVEAUX CHAMPS DE QUALITÉ ET LOCALISATION
            const noteValue = getCellValue(NOTE_INDEX);
            const experienceValue = getCellValue(EXPERIENCE_INDEX);
            const prixMinValue = getCellValue(PRIX_MIN_INDEX);
            const prixMaxValue = getCellValue(PRIX_MAX_INDEX);
            const visibilitePublique = getCellValue(VISIBILITE_INDEX); // Ex: 'OUI'
            const indicationGps = getCellValue(GPS_INDICATION_INDEX); // Le lien ou l'adresse complète

            // L'ancienne logique `verifie_gps` (affichage de l'icône) est basée sur 'Visibilité Publique' = OUI
            const isVerified = typeof visibilitePublique === 'string' && visibilitePublique.toUpperCase() === 'OUI';

            return {
                nom: nomPrenom,
                entreprise: entreprise,
                contact: contact,
                quartier: quartier,
                ville: ville,
                secteur: secteur,
                activite: activite, 
                
                // NOUVEAUX CHAMPS DE QUALITÉ ET LOCALISATION
                note: noteValue !== null ? parseFloat(noteValue) : 0, // 0 par défaut
                experience: experienceValue !== null ? parseInt(experienceValue) : 0, // 0 par défaut
                verifie_gps: isVerified,
                prix_min: prixMinValue !== null ? parseFloat(prixMinValue) : null,
                prix_max: prixMaxValue !== null ? parseFloat(prixMaxValue) : null,
                
                // Champs GPS désactivés car non dans la feuille brute, mais stock du lien
                latitude: null,
                longitude: null,
                gps_link: isVerified ? indicationGps : null,
            };
        }).filter(item => item.activite.trim() !== ''); // N'inclut que les lignes ayant une activité réelle

        proData = formattedData;
        addMessage(`Données chargées ! **${proData.length}** professionnels sont disponibles.`, 'bot');

    } catch (error) {
        addMessage("❌ Erreur de connexion aux données. Assurez-vous que le Sheet est public et que l'ID est correct.", 'bot');
        console.error("Erreur de chargement des données :", error);
    }
}


// MISE À JOUR : Affichage des nouvelles informations (Inchangée)
function displayResults(results, activite, ville) {
    let responseHTML = '';
    const recherche = `**${activite || 'Professionnel'}** ${ville ? 'à **' + ville + '**' : ''}`;

    if (results.length > 0) {
        // Tri des résultats avant l'affichage
        results.sort(sortProfessionals);
        
        responseHTML += `<p>✅ J'ai trouvé **${results.length}** résultat(s) pour ${recherche}.</p>
                         <p class="small fst-italic">Trié par **Note** et **Expérience**.</p>`;

        results.forEach(pro => {
            const nomAffichage = pro.entreprise.trim() ? `${pro.entreprise} (par ${pro.nom})` : pro.nom;
            const quartierInfo = pro.quartier.trim() ? ` à ${pro.quartier}` : '';
            
            // Badges et Infos Qualité
            const noteEtoiles = pro.note > 0 ? getStarRating(pro.note) : '';
            const badgeVerif = pro.verifie_gps ? `<span class="badge-verified ms-2">VÉRIFIÉ GPS</span>` : '';
            
            // AFFICHAGE EXPÉRIENCE CORRIGÉ
            const experience = pro.experience > 0 ? `${pro.experience} an(s)` : 'Nouvelle adhésion';
            
            let prixInfo = 'Non spécifié';
            if (pro.prix_min !== null && pro.prix_max !== null) {
                 prixInfo = `${formatFCFA(pro.prix_min)} - ${formatFCFA(pro.prix_max)}`;
            } else if (pro.prix_min !== null) {
                prixInfo = `À partir de : ${formatFCFA(pro.prix_min)}`;
            }

            // Utiliser la colonne gps_link (Indication GPS) pour le lien si 'verifie_gps' est VRAI
            const mapLink = (pro.gps_link && pro.verifie_gps) ? 
                `<a href="${pro.gps_link}" target="_blank" class="location-link mt-2"><i class="bi bi-geo-alt-fill"></i> Voir l'adresse</a>` : '';


            responseHTML += `
                <div class="result-card animated-result-card">
                    <p class="mb-0 text-white fw-bold d-flex align-items-center">${nomAffichage} ${badgeVerif}</p>
                    <p class="mb-1 text-accent small">${pro.activite} - ${pro.ville}${quartierInfo}</p>
                    <div class="note-line">
                        <div>${noteEtoiles}</div>
                        <div class="experience-text">Expérience : <span>${experience}</span></div>
                    </div>
                    <p class="price-range">${prixInfo}</p>
                    ${mapLink} <a href="https://wa.me/${pro.contact.replace(/\s/g, '')}" target="_blank" class="whatsapp-link">
                        <i class="bi bi-whatsapp"></i> Contacter via WhatsApp
                    </a>
                </div>
            `;
        });
    } else {
        responseHTML = `<p>😔 Désolé, aucun pro n'a été trouvé pour ${recherche}.</p>
                        <p>👉 **Conseil :** Essayez d'utiliser uniquement un métier générique (ex: 'Mécanicien') ou le nom de la ville (ex: 'Cotonou').</p>`;
    }

    addMessage(responseHTML, 'bot');
}


// =====================================================================
// LOGIQUE DE GÉOLOCALISATION
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
    // Correction de l'URL pour une recherche Google Maps
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(keyword)}/@${location.lat},${location.lng},15z`;

    const responseHTML = `
        <p>🌍 Voici le résultat de la recherche **"${keyword}"** près de votre position :</p>
        <a href="${mapsUrl}" target="_blank" class="custom-btn mt-2">
            <i class="bi bi-geo-alt-fill"></i> Afficher sur Google Maps
        </a>
    `;
    addMessage(responseHTML, 'bot');
}


// FONCTIONS DE LOGIQUE DE RECHERCHE (Inchangées)
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

function processBotResponse(query) {
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

        // 1. Recherche stricte
        let results = searchProfessionals(query, activiteKeyword, villeKeyword, false);

        // 2. Dégradation de la recherche (Ignorer le quartier)
        if (results.length === 0 && villeKeyword) {
             results = searchProfessionals(query, activiteKeyword, villeKeyword, true);
        }

        displayResults(results, activiteKeyword, villeKeyword);

    } else if (lowerQuery.includes('bonjour') || lowerQuery.includes('salut') || lowerQuery.includes('hello')) {
        addMessage("Salut ! Je suis ProFinder. La règle pour la recherche est simple : **[Activité] à [Ville]**. Pour les lieux, essayez : **[Banque] le plus proche de moi**.", 'bot');
    } else {
        addMessage("Je n'ai pas compris. Veuillez utiliser le format simple : **[Activité] à [Ville]** ou **[Lieu] le plus proche de moi**.", 'bot');
    }
}

function searchProfessionals(query, activite, ville, degrade = false) {
    if (proData.length === 0) return [];

    const queryWords = query ? query.toLowerCase().split(/[\s,;']+/).filter(w => w.length > 2).map(normalizeKeyword) : [];

    return proData.filter(pro => {
        let matchActivite = false;
        let matchVille = false;
        
        const proActivite = pro.activite.toLowerCase();
        const proSecteur = pro.secteur.toLowerCase();
        const proVille = pro.ville.toLowerCase();
        const proQuartier = pro.quartier.toLowerCase();

        // 1. Logique d'Activité
        if (activite) {
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
                matchVille = fullLocation.includes(query.toLowerCase()) || proVille.includes(ville);
            }
        } else {
            matchVille = true;
        }
        
        return matchActivite && matchVille;
    });
}

// Démarrage : chargement des données au lancement
loadSheetData();
showPage('home');

// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1n2n1vdQvUR9X7t9Vd6VanBz41nYBnjQhIXdOWixBogA/gviz/tq?tqx=out:json'; 
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
// NOUVELLES FONCTIONS D'AFFICHAGE ET DE GESTION DES DONNÉES
// =====================================================================

// CORRECTION: Conversion de la note numérique en étoiles HTML (pleines ★ et vides ☆)
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

// Fonction utilitaire pour formater les nombres en FCFA
function formatFCFA(number) {
    if (number === null || isNaN(number)) return '';
    // Utilisation de fr-FR pour le formatage monétaire ou de nombre avec espaces
    return new Intl.NumberFormat('fr-FR').format(number) + ' FCFA';
}

// Fonction de tri (La meilleure note ET la meilleure expérience en premier)
function sortProfessionals(a, b) {
    // 1. Priorité à la Note
    if (b.note !== a.note) {
        return b.note - a.note; // Tri décroissant (meilleure note d'abord)
    }
    // 2. Si les notes sont égales, prioriser l'Expérience
    return b.experience - a.experience; // Tri décroissant (plus d'expérience d'abord)
}

// MISE À JOUR : Lecture des nouvelles colonnes, y compris Latitude et Longitude
async function loadSheetData() {
    addMessage("Chargement des données de l'annuaire...", 'bot');
    
    try {
        const response = await fetch(SHEET_API_URL);
        const text = await response.text();
        
        const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
        const data = JSON.parse(jsonText);
        
        const rows = data.table.rows;
        const headers = data.table.cols.map(col => col.label);
        
        // Détermination de l'index de départ des colonnes d'activité réelle
        const ACTIVITY_START_INDEX = headers.findIndex(h => h.includes('Finance / Assurance')); 

        // Index pour les colonnes de qualité et localisation
        const NOTE_INDEX = headers.findIndex(h => h.includes('Note'));
        const EXPERIENCE_INDEX = headers.findIndex(h => h.includes('Expérience_Ans'));
        const VERIFIE_GPS_INDEX = headers.findIndex(h => h.includes('Verifie_GPS'));
        const PRIX_MIN_INDEX = headers.findIndex(h => h.includes('Prix_Min'));
        const PRIX_MAX_INDEX = headers.findIndex(h => h.includes('Prix_Max'));
        const LATITUDE_INDEX = headers.findIndex(h => h.includes('Latitude'));
        const LONGITUDE_INDEX = headers.findIndex(h => h.includes('Longitude'));


        const formattedData = rows.slice(1).map(row => {
            const cells = row.c;

            // Reconstruction du VRAI métier/activité
            let activiteDetaillee = '';
            let secteurGeneral = cells[6] ? cells[6].v : 'Inconnu'; 

            for (let i = ACTIVITY_START_INDEX; i < ACTIVITY_START_INDEX + SECTOR_COLUMNS.length; i++) {
                if (cells[i] && cells[i].v) {
                    activiteDetaillee = cells[i].v; 
                    break;
                }
            }
            
            // Extraction des nouvelles données 
            const noteCell = cells[NOTE_INDEX];
            const experienceCell = cells[EXPERIENCE_INDEX];
            const prixMinCell = cells[PRIX_MIN_INDEX];
            const prixMaxCell = cells[PRIX_MAX_INDEX];
            const verifieGpsCell = cells[VERIFIE_GPS_INDEX];


            // Indices: [1]=Nom, [2]=Entreprise, [3]=Contact WhatsApp, [4]=Quartier, [5]=Ville
            return {
                nom: cells[1] ? cells[1].v : '',
                entreprise: cells[2] ? cells[2].v : '',
                contact: cells[3] ? cells[3].v : '',
                quartier: cells[4] ? cells[4].v : '',
                ville: cells[5] ? cells[5].v : '',
                secteur: secteurGeneral,
                activite: activiteDetaillee, // La spécialité exacte
                
                // NOUVEAUX CHAMPS DE QUALITÉ ET LOCALISATION
                note: noteCell && noteCell.v !== null ? parseFloat(noteCell.v) : 0, // 0 par défaut
                experience: experienceCell && experienceCell.v !== null ? parseInt(experienceCell.v) : 0, // 0 par défaut
                verifie_gps: verifieGpsCell && verifieGpsCell.v ? verifieGpsCell.v.toUpperCase() === 'OUI' : false,
                prix_min: prixMinCell && prixMinCell.v !== null ? parseFloat(prixMinCell.v) : null,
                prix_max: prixMaxCell && prixMaxCell.v !== null ? parseFloat(prixMaxCell.v) : null,
                latitude: cells[LATITUDE_INDEX] && cells[LATITUDE_INDEX].v !== null ? parseFloat(cells[LATITUDE_INDEX].v) : null,
                longitude: cells[LONGITUDE_INDEX] && cells[LONGITUDE_INDEX].v !== null ? parseFloat(cells[LONGITUDE_INDEX].v) : null,
            };
        }).filter(item => item.activite.trim() !== ''); // N'inclut que les lignes ayant une activité réelle

        proData = formattedData;
        addMessage(`Données chargées ! **${proData.length}** professionnels sont disponibles.`, 'bot');

    } catch (error) {
        addMessage("❌ Erreur de connexion aux données. Assurez-vous que le Sheet est public et que l'ID est correct.", 'bot');
        console.error("Erreur de chargement des données :", error);
    }
}


// MISE À JOUR : Affichage des nouvelles informations
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

            // NOUVEAU: Lien de localisation (Visible si coordonnées et vérification OUI)
            const mapLink = (pro.latitude && pro.longitude && pro.verifie_gps) ? 
                `<a href="https://maps.google.com/?q=${pro.latitude},${pro.longitude}" target="_blank" class="location-link mt-2"><i class="bi bi-geo-alt-fill"></i> Voir l'adresse</a>` : '';


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
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}&query_place_id=&center=${location.lat},${location.lng}&zoom=15`;

    const responseHTML = `
        <p>🌍 Voici le résultat de la recherche **"${keyword}"** près de votre position :</p>
        <a href="${mapsUrl}" target="_blank" class="custom-btn mt-2">
            <i class="bi bi-geo-alt-fill"></i> Afficher sur Google Maps
        </a>
    `;
    addMessage(responseHTML, 'bot');
}


// Normalisation du mot et détection (Geo et Profinder)
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

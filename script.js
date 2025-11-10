// =====================================================================
// ⚠️ ÉTAPE 1 : CORRECTION DE L'URL API AVEC LE GID DU BON ONGLET
// Sans le gid=968871846, le script affiche 0 pro.
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1n2n1vdQvUR9X7t9Vd6VanBz41nYBnjQhIXdOWixBogA/gviz/tq?tqx=out:json&gid=968871846'; 
// =====================================================================

let proData = []; 
let consecutiveBadQueries = 0; 

// Éléments DOM (inchangés)
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const homePage = document.getElementById('home-page');
const chatPage = document.getElementById('chat-page');
const startChatBtn = document.getElementById('start-chat-btn');
const accueilBtnNav = document.getElementById('accueil-btn-nav');


// =====================================================================
// LISTES DE RÉFÉRENCE ET MAPPAGE (INCHANGÉES)
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

const PLACES_OF_INTEREST = {
    'banque': 'finance / assurance',
    'assurance': 'finance / assurance',
    'hopital': 'santé / pharmacie',
    'pharmacie': 'santé / pharmacie',
    'medecin': 'santé / pharmacie',
    'restaurant': 'alimentation',
    'boutique': 'commerce général',
    'livraison': 'transport / logistique',
    'garage': 'automobile / mécanique',
    'avocat': 'droit / juridique'
};

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

// MISE À JOUR : Ajout des mots liés au prix, à la proximité (faute) et autres.
const STOP_WORDS = ['cherche', 'trouve', 'besoin', 'recherche', 'un', 'une', 'à', 'de', 'le', 'la', 'les', 'en', 'sur', 'pour', 'dans', 'au', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'suis', 'est', 'y', 'plus', 'proche', 'où', 'quelle', 'fourchette', 'prix', 'd', 'ce', 'ci', 'mon', 'ma', 'moi', 'mme', 'oruche', 'baque'];


// =====================================================================
// FONCTIONS DE L'INTERFACE (inchangées)
// =====================================================================

function showPage(pageId) { 
    if (pageId === 'chat') {
        homePage.classList.add('d-none');
        chatPage.classList.remove('d-none');
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        chatPage.classList.add('d-none');
        homePage.classList.remove('d-none');
    }
}
startChatBtn.addEventListener('click', () => showPage('chat'));
accueilBtnNav.addEventListener('click', () => showPage('home'));

function addMessage(text, sender) { 
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message', 'animated-message');
    messageDiv.innerHTML = text;
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
// FONCTION DE CHARGEMENT DES DONNÉES (mise à jour pour un mapping plus sûr)
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
        
        // Trouver les index des colonnes basées sur leurs libellés dans le Google Sheet
        const HEADER_MAP = {
            'Nom_Pro': headers.findIndex(h => h.includes('Nom_Pro')), 
            'Entreprise': headers.findIndex(h => h.includes('Entreprise')), 
            'Telephone': headers.findIndex(h => h.includes('Telephone')), 
            'Quartier': headers.findIndex(h => h.includes('Quartier')), 
            'Ville': headers.findIndex(h => h.includes('Ville')), 
            'Secteur_General': headers.findIndex(h => h.includes('Secteur_General')),
            'Note': headers.findIndex(h => h === 'Note'),
            'Expérience_Ans': headers.findIndex(h => h === 'Expérience_Ans'),
            'Verifie_GPS': headers.findIndex(h => h === 'Verifie_GPS'),
            'Prix_Min': headers.findIndex(h => h === 'Prix_Min'),
            'Prix_Max': headers.findIndex(h => h === 'Prix_Max')
        };
        const ACTIVITY_START_INDEX = headers.findIndex(h => h.includes('Finance / Assurance')); 

        const formattedData = rows.map(row => {
            const cells = row.c;
            
            // Vérification des index trouvés
            if (HEADER_MAP.Nom_Pro === -1 || HEADER_MAP.Telephone === -1 || HEADER_MAP.Ville === -1 || 
                !cells[HEADER_MAP.Nom_Pro] || !cells[HEADER_MAP.Telephone] || !cells[HEADER_MAP.Ville]) return null; 

            let activiteDetaillee = '';
            let secteurGeneral = cells[HEADER_MAP.Secteur_General] && cells[HEADER_MAP.Secteur_General].v ? cells[HEADER_MAP.Secteur_General].v : 'Inconnu'; 

            for (let i = ACTIVITY_START_INDEX; i < ACTIVITY_START_INDEX + SECTOR_COLUMNS.length; i++) {
                if (cells[i] && cells[i].v) {
                    activiteDetaillee = cells[i].v; 
                    break;
                }
            }

            return {
                nom: cells[HEADER_MAP.Nom_Pro] && cells[HEADER_MAP.Nom_Pro].v ? cells[HEADER_MAP.Nom_Pro].v : '',
                entreprise: cells[HEADER_MAP.Entreprise] && cells[HEADER_MAP.Entreprise].v ? cells[HEADER_MAP.Entreprise].v : '',
                telephone: cells[HEADER_MAP.Telephone] && cells[HEADER_MAP.Telephone].v ? cells[HEADER_MAP.Telephone].v : '',
                quartier: cells[HEADER_MAP.Quartier] && cells[HEADER_MAP.Quartier].v ? cells[HEADER_MAP.Quartier].v : '',
                ville: cells[HEADER_MAP.Ville] && cells[HEADER_MAP.Ville].v ? cells[HEADER_MAP.Ville].v : '',
                secteur: secteurGeneral,
                activite: activiteDetaillee,
                note: cells[HEADER_MAP.Note] && cells[HEADER_MAP.Note].v ? parseFloat(cells[HEADER_MAP.Note].v) : 0,
                experience: cells[HEADER_MAP.Expérience_Ans] && cells[HEADER_MAP.Expérience_Ans].v ? parseInt(cells[HEADER_MAP.Expérience_Ans].v) : 0,
                verifieGPS: cells[HEADER_MAP.Verifie_GPS] && cells[HEADER_MAP.Verifie_GPS].v ? cells[HEADER_MAP.Verifie_GPS].v : 'NON',
                prixMin: cells[HEADER_MAP.Prix_Min] && cells[HEADER_MAP.Prix_Min].v ? parseFloat(cells[HEADER_MAP.Prix_Min].v) : 0,
                prixMax: cells[HEADER_MAP.Prix_Max] && cells[HEADER_MAP.Prix_Max].v ? parseFloat(cells[HEADER_MAP.Prix_Max].v) : 0
            };
        }).filter(item => item && item.activite.trim() !== '');

        proData = formattedData.map(item => {
            return {
                ...item,
                nom: item.nom.toLowerCase(),
                entreprise: item.entreprise.toLowerCase(),
                quartier: item.quartier.toLowerCase(),
                ville: item.ville.toLowerCase(),
                secteur: item.secteur.toLowerCase(),
                activite: item.activite.toLowerCase()
            }
        });

        addMessage(`Données chargées ! **${proData.length}** professionnels sont disponibles.`, 'bot'); 

    } catch (error) {
        addMessage("❌ Erreur de connexion aux données. Assurez-vous que le Sheet est public et que l'ID est correct.", 'bot');
        console.error("Erreur de chargement des données :", error);
    }
}


// =====================================================================
// FONCTION D'AFFICHAGE DES RÉSULTATS (inchangée)
// =====================================================================

function displayResults(results, activite, ville, autresMots, typeRecherche) {
    const chatBoxElement = document.getElementById('chat-box');
    let delay = 0.0; 

    results.sort((a, b) => {
        if (b.note !== a.note) {
            return b.note - a.note; 
        }
        return b.experience - a.experience; 
    });
    
    let recherche = activite ? `**${activite}**` : '';
    recherche += ville ? ` à **${ville}**` : '';
    const noteMoyenne = (results.reduce((sum, pro) => sum + pro.note, 0) / results.length) || 0;
    const triInfo = results.length > 0 ? `Trié par **Note ${noteMoyenne.toFixed(1)}⭐**.` : '';

    if (results.length > 0 && typeRecherche === 'lieu') {
        addMessage(`<p>💡 L'IA a trouvé des professionnels dans le secteur **${activite.toUpperCase()}** près de ${ville || 'votre zone'} :</p>`, 'bot');
    } else if (results.length > 0) {
        addMessage(`<p>✅ J'ai trouvé **${results.length}** résultat(s) pour ${recherche}. ${triInfo}</p>`, 'bot');
    }

    results.forEach(pro => {
        const note = pro.note || 0;
        const experience = pro.experience || 0;
        const prixMin = pro.prixMin || 0;
        const prixMax = pro.prixMax || 0;
        const verifieGPS = pro.verifieGPS.toUpperCase() === 'OUI';
        
        const fullStars = '⭐'.repeat(Math.round(note));
        const emptyStars = '☆'.repeat(5 - Math.round(note));
        const starsHtml = `<span class="text-warning me-3" title="Note moyenne">${fullStars}${emptyStars} (${note.toFixed(1)})</span>`;

        const verifieBadge = verifieGPS ? `<span class="badge-verified"><i class="bi bi-patch-check-fill"></i> VÉRIFIÉ GPS</span>` : '';
        
        const prixRange = (prixMin > 0 && prixMax > 0) ? 
                            `<p class="price-range mb-2">Estimation Prix : ${prixMin.toLocaleString('fr-FR')} - ${prixMax.toLocaleString('fr-FR')} FCFA</p>` : 
                            '<p class="price-range mb-2 text-secondary-text">Prix non estimé, contactez pour devis.</p>';
        
        const nomAffichage = pro.entreprise.trim() ? `${pro.entreprise.toUpperCase()} (par ${pro.nom.toUpperCase()})` : pro.nom.toUpperCase();
        const quartierInfo = pro.quartier.trim() ? `, ${pro.quartier.toUpperCase()}` : '';

        const html = `
            <div class="result-card animated-result-card" style="animation-delay: ${delay}s;">
                <p class="mb-1 text-white fw-bold">${nomAffichage} - ${pro.activite.toUpperCase()}</p>
                <p class="mb-1 text-accent small"><i class="bi bi-geo-alt-fill me-1"></i> ${pro.ville.toUpperCase()}${quartierInfo}</p>
                
                <div class="d-flex align-items-center mb-2 flex-wrap">
                    ${starsHtml}
                    <span class="text-light me-3 small"><i class="bi bi-person-workspace me-1"></i> ${experience} ans exp.</span>
                    ${verifieBadge}
                </div>
                
                ${prixRange}

                <a href="https://wa.me/${pro.telephone}?text=Bonjour, je vous contacte via ProFinder pour un service de ${pro.activite} à ${pro.ville}." 
                   target="_blank" 
                   class="contact-link whatsapp-link">
                    <i class="bi bi-whatsapp me-2"></i> Contacter par WhatsApp
                </a>
            </div>
        `;
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        messageDiv.innerHTML = html;
        chatBoxElement.appendChild(messageDiv);
        
        delay += 0.15; 
    });

    chatBoxElement.scrollTop = chatBoxElement.scrollHeight;
    
    if (results.length === 0) {
        let responseHTML = `<p>😔 Désolé, aucun pro n'a été trouvé pour ${recherche}.</p>
                        <p>👉 **Conseil :** Essayez d'utiliser un terme plus général (ex: 'Électricien') ou vérifiez l'orthographe de la ville.</p>`;
        addMessage(responseHTML, 'bot');
    }
}


// =====================================================================
// LOGIQUE DE DÉTECTION DES MOTS-CLÉS (CORRIGÉE)
// =====================================================================

function normalizeKeyword(word) {
    // Suppression du pluriel
    if (word.endsWith('s') && word.length > 3) {
        word = word.slice(0, -1);
    }
    // Gère les variations d'informaticien (Renforcé)
    if (word.includes('informaticien') || word.includes('dev') || word.includes('programm') || word.includes('informatique')) {
        return 'informatique'; 
    }
    // Gère les variations de "plombier"
    if (word.includes('plomb')) {
        return 'plomberie';
    }
    // Gère le typo "baque" pour "banque" (Nouveau)
    if (word.includes('baque')) {
        return 'banque';
    }
    return word;
}


function getKeywords(query) {
    const words = query.toLowerCase().split(/[\s,;']+/).filter(w => w.length > 1);
    let keywordActivite = null;
    let keywordVille = null;
    let usedWords = [];
    let motsFiltre = [];
    let typeRecherche = 'pro'; 

    // 1. Détection de l'Activité ou du Lieu d'Intérêt (Priorité : le cœur de la recherche)
    for (const word of words) {
        if (STOP_WORDS.includes(word)) continue;
        
        const normalizedWord = normalizeKeyword(word); 
        
        // A. Vérifie si c'est une activité professionnelle ou secteur
        const isSectorOrSpecialty = SECTOR_COLUMNS.map(s => s.toLowerCase()).some(s => s.includes(normalizedWord)) || 
                                    ALL_SPECIALTIES.map(s => s.toLowerCase()).some(s => s.includes(normalizedWord));
                                    
        if (isSectorOrSpecialty) {
            keywordActivite = normalizedWord; 
            usedWords.push(word);
            break;
        }

        // B. Vérifie si c'est un Lieu d'Intérêt (Banque, Hôpital...)
        if (PLACES_OF_INTEREST[normalizedWord]) {
            keywordActivite = PLACES_OF_INTEREST[normalizedWord]; 
            usedWords.push(word);
            typeRecherche = 'lieu';
            break;
        }
    }

    // 2. Détection de la Ville (Seconde priorité)
    for (const word of words) {
        if (usedWords.includes(word) || STOP_WORDS.includes(word)) continue;
        if (ALL_CITIES.includes(word)) { 
            keywordVille = word;
            usedWords.push(word);
            break; 
        } 
    }

    // 3. Le reste des mots non utilisés est le filtre libre (Nom, Entreprise, Quartier)
    for (const word of words) {
        if (!usedWords.includes(word) && !STOP_WORDS.includes(word)) {
             motsFiltre.push(word);
        }
    }

    return { 
        activite: keywordActivite, 
        ville: keywordVille, 
        autresMots: motsFiltre.join(' '),
        typeRecherche: typeRecherche
    };
}


function processBotResponse(query) {
    const lowerQuery = query.toLowerCase();
    
    let { activite, ville, autresMots, typeRecherche } = getKeywords(query);

    // DÉCLENCHEUR DE RECHERCHE SIMPLIFIÉ : On cherche dès qu'un élément significatif est trouvé.
    if (activite || ville || autresMots.length > 0) {
        
        // Si la requête est trop vague (seulement un mot libre)
        if (!activite && !ville && autresMots.length > 0) {
            consecutiveBadQueries++;
            if (consecutiveBadQueries >= 2) { 
                 addMessage("🚨 **ATASSA !** Votre recherche est trop vague. Veuillez inclure l'**Activité** (ex: Plombier) ou la **Ville** (ex: Cotonou).", 'bot');
                 consecutiveBadQueries = 0;
                 return;
            }
             addMessage("Veuillez être plus précis. Je dois connaître l'**Activité** ou la **Ville** en plus de ce mot-clé libre.", 'bot');
             return;
        }

        consecutiveBadQueries = 0; 
        let results = searchProfessionals(activite, ville, autresMots);
        
        displayResults(results, activite, ville, autresMots, typeRecherche);
        
    } else if (lowerQuery.includes('bonjour') || lowerQuery.includes('salut') || lowerQuery.includes('hello')) {
        consecutiveBadQueries = 0;
        addMessage("Salut ! Je suis ProFinder. La règle pour la recherche est simple : **[Activité] à [Ville]** ou demandez un **[Lieu d'Intérêt]** !", 'bot');
    } else {
        consecutiveBadQueries++;
        if (consecutiveBadQueries >= 2) {
             addMessage("🚨 **ATASSA !** Utilise le format simple : **[Activité] à [Ville]**.", 'bot');
             consecutiveBadQueries = 0;
             return;
        }
        addMessage("Je n'ai pas compris. Veuillez utiliser le format simple : **[Activité] à [Ville]**.", 'bot');
    }
}


function searchProfessionals(activite, ville, autresMots) {
    if (proData.length === 0) return [];
    
    const motsFiltre = autresMots.toLowerCase().split(' ').filter(w => w.length > 2);

    return proData.filter(pro => {
        let matchActivite = false;
        let matchVille = false;
        let matchAutres = false;
        
        const proActivite = pro.activite; 
        const proSecteur = pro.secteur; 
        const proVille = pro.ville; 
        const proQuartier = pro.quartier; 
        const proNom = pro.nom; 
        const proEntreprise = pro.entreprise; 

        // 1. FILTRE PAR VILLE 
        if (ville) {
            matchVille = proVille.includes(ville);
        } else {
            matchVille = true; 
        }

        // 2. FILTRE PAR ACTIVITÉ (ou Secteur mappé)
        if (activite) {
            matchActivite = proActivite.includes(activite) || proSecteur.includes(activite);
        } else {
            matchActivite = true; 
        }
        
        // 3. FILTRE PAR AUTRES MOTS
        if (motsFiltre.length > 0) {
            matchAutres = motsFiltre.some(mot => 
                proNom.includes(mot) || 
                proEntreprise.includes(mot) || 
                proQuartier.includes(mot)
            );
        } else {
            matchAutres = true; 
        }
        
        return matchActivite && matchVille && matchAutres;
    });
}

// Démarrage : chargement des données au lancement
loadSheetData();
showPage('home');

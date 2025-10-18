// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1n2n1vdQvUR9X7t9Vd6VanBz41nYBnjQhIXdOWixBogA/gviz/tq?tqx=out:json'; 
// =====================================================================

let proData = []; 
let consecutiveBadQueries = 0; // NOUVEAU : Compteur d'erreurs pour l'avertissement

// Éléments DOM (répétés pour la clarté, mais non modifiés)
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

const STOP_WORDS = ['cherche', 'trouve', 'besoin', 'recherche', 'un', 'une', 'à', 'de', 'le', 'la', 'les', 'en', 'sur', 'pour', 'dans', 'au', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'suis', 'est'];

// =====================================================================
// FONCTIONS DE BASE (INCHANGÉES)
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

async function loadSheetData() {
    addMessage("Chargement des données de l'annuaire...", 'bot');
    
    try {
        const response = await fetch(SHEET_API_URL);
        const text = await response.text();
        
        const jsonText = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
        const data = JSON.parse(jsonText);
        
        const rows = data.table.rows;
        const headers = data.table.cols.map(col => col.label);
        
        const ACTIVITY_START_INDEX = headers.findIndex(h => h.includes('Finance / Assurance')); 

        const formattedData = rows.slice(1).map(row => {
            const cells = row.c;

            let activiteDetaillee = '';
            let secteurGeneral = cells[6] ? cells[6].v : 'Inconnu'; 

            for (let i = ACTIVITY_START_INDEX; i < ACTIVITY_START_INDEX + SECTOR_COLUMNS.length; i++) {
                if (cells[i] && cells[i].v) {
                    activiteDetaillee = cells[i].v; 
                    break;
                }
            }

            return {
                nom: cells[1] ? cells[1].v : '',
                entreprise: cells[2] ? cells[2].v : '',
                contact: cells[3] ? cells[3].v : '',
                quartier: cells[4] ? cells[4].v : '',
                ville: cells[5] ? cells[5].v : '',
                secteur: secteurGeneral,
                activite: activiteDetaillee 
            };
        }).filter(item => item.activite.trim() !== ''); 

        proData = formattedData;
        addMessage(`Données chargées ! **${proData.length}** professionnels sont disponibles.`, 'bot');

    } catch (error) {
        addMessage("❌ Erreur de connexion aux données. Assurez-vous que le Sheet est public et que l'ID est correct.", 'bot');
        console.error("Erreur de chargement des données :", error);
    }
}


// =====================================================================
// LOGIQUE DE RECHERCHE MISE À JOUR (GESTION QUARTIER ET AVERTISSEMENT)
// =====================================================================

function normalizeKeyword(word) {
    if (word.endsWith('s') && word.length > 3) {
        word = word.slice(0, -1);
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
    let keywordQuartier = []; 
    let usedWords = [];

    // 1. Trouver la Ville (Priorité absolue)
    for (const word of words) {
        if (ALL_CITIES.includes(word)) {
            keywordVille = word;
            usedWords.push(word);
            break; 
        } 
    }

    // 2. Trouver l'Activité
    for (const word of words) {
        if (usedWords.includes(word) || STOP_WORDS.includes(word)) continue;
        
        const normalizedWord = normalizeKeyword(word); 
        
        const isSectorOrSpecialty = SECTOR_COLUMNS.map(s => s.toLowerCase().split(' / ')[0]).includes(normalizedWord) || 
                                    ALL_SPECIALTIES.map(s => s.toLowerCase().split(' / ')[0]).includes(normalizedWord) ||
                                    ALL_SPECIALTIES.map(s => s.toLowerCase()).some(s => s.includes(normalizedWord));
                                    
        if (isSectorOrSpecialty) {
            keywordActivite = normalizedWord;
            usedWords.push(word);
            break;
        }
    }
    
    // 3. Le reste des mots non utilisés est le potentiel Quartier
    for (const word of words) {
        if (!usedWords.includes(word) && !STOP_WORDS.includes(word)) {
             keywordQuartier.push(word);
        }
    }

    return { 
        activite: keywordActivite, 
        ville: keywordVille, 
        quartier: keywordQuartier.join(' ') 
    };
}


function processBotResponse(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('cherche') || lowerQuery.includes('trouve') || lowerQuery.includes('besoin') || lowerQuery.includes('recherche') || lowerQuery.includes('un') || lowerQuery.includes('une')) {
        
        let { activite: activiteKeyword, ville: villeKeyword, quartier: quartierKeyword } = getKeywords(query);
        
        // VÉRIFICATION STRICTE : L'Activité ET la Ville sont obligatoires
        if (!activiteKeyword || !villeKeyword) {
            consecutiveBadQueries++;
            
            if (consecutiveBadQueries >= 2) { 
                addMessage("🚨 **ATASSA respecte la logique frère !** Utilise le format : **[Activité] à [Ville] (Quartier)**.", 'bot');
                consecutiveBadQueries = 0; // Réinitialise après l'avertissement strict
                return;
            }
            
            addMessage("Veuillez être plus précis. Je dois connaître l'**Activité** ET la **Ville** pour commencer. **Exemple : Plombier à Cotonou.**", 'bot');
            return;
        }

        // Réinitialise le compteur sur une requête valide
        consecutiveBadQueries = 0; 

        // Recherche des professionnels
        let results = searchProfessionals(activiteKeyword, villeKeyword, quartierKeyword);
        
        displayResults(results, activiteKeyword, villeKeyword, quartierKeyword);
        
    } else if (lowerQuery.includes('bonjour') || lowerQuery.includes('salut') || lowerQuery.includes('hello')) {
        consecutiveBadQueries = 0; // Réinitialise sur les salutations
        addMessage("Salut ! Je suis ProFinder. La règle pour la recherche est simple : **[Activité] à [Ville]**.", 'bot');
    } else {
        consecutiveBadQueries++;
        if (consecutiveBadQueries >= 2) {
             addMessage("🚨 **ATASSA respecte la logique frère !** Utilise le format : **[Activité] à [Ville] (Quartier)**.", 'bot');
             consecutiveBadQueries = 0;
             return;
        }
        addMessage("Je n'ai pas compris. Veuillez utiliser le format simple : **[Activité] à [Ville]**.", 'bot');
    }
}


function searchProfessionals(activite, ville, quartier) {
    if (proData.length === 0) return [];
    
    const quartierMatch = quartier.toLowerCase().trim();

    return proData.filter(pro => {
        
        // 1. FILTRE PAR VILLE (Obligatoire)
        const proVille = pro.ville.toLowerCase();
        let matchVille = proVille.includes(ville);

        if (!matchVille) return false; 

        // 2. FILTRE PAR ACTIVITÉ (Obligatoire)
        const proActivite = pro.activite.toLowerCase();
        const proSecteur = pro.secteur.toLowerCase();
        let matchActivite = proActivite.includes(activite) || proSecteur.includes(activite);

        if (!matchActivite) return false; 

        // 3. FILTRE PAR QUARTIER (Si le mot-clé quartier est fourni)
        if (quartierMatch.length > 0) {
            const proQuartier = pro.quartier.toLowerCase();
            // Le quartier du pro doit contenir le(s) mot(s)-clé(s) de quartier de la requête
            let matchQuartier = proQuartier.includes(quartierMatch);
            
            return matchQuartier; 
        }
        
        // Si seul la ville et l'activité ont été trouvées, on affiche
        return true; 
    });
}

function displayResults(results, activite, ville, quartier) {
    let responseHTML = '';
    
    // Construction de la phrase de recherche complète
    let recherche = `**${activite}** à **${ville}**`;
    if (quartier && quartier.trim().length > 0) {
        recherche += ` (${quartier})`;
    }

    if (results.length > 0) {
        responseHTML += `<p>✅ J'ai trouvé **${results.length}** résultat(s) pour ${recherche}.</p>`;
        
        results.forEach(pro => {
            const nomAffichage = pro.entreprise.trim() ? `${pro.entreprise} (par ${pro.nom})` : pro.nom;
            const quartierInfo = pro.quartier.trim() ? ` à ${pro.quartier}` : '';
            
            responseHTML += `
                <div class="result-card animated-message">
                    <p class="mb-0 text-white fw-bold">${nomAffichage}</p>
                    <p class="mb-1 text-accent small">${pro.activite} - ${pro.ville}${quartierInfo}</p>
                    <a href="https://wa.me/${pro.contact.replace(/\s/g, '')}" target="_blank" class="contact-link">
                        <i class="bi bi-whatsapp"></i> Contacter via WhatsApp
                    </a>
                </div>
            `;
        });
    } else {
        responseHTML = `<p>😔 Désolé, aucun pro n'a été trouvé pour ${recherche}.</p>
                        <p>👉 **Conseil :** Essayez de retirer le quartier (si vous en avez mis un) ou utilisez un métier plus générique (ex: 'Technologie' au lieu de 'développeur').</p>`;
    }
    
    addMessage(responseHTML, 'bot');
}


// Démarrage : chargement des données au lancement
loadSheetData();
showPage('home');


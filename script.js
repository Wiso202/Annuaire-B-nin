// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1n2n1vdQvUR9X7t9Vd6VanBz41nYBnjQhIXdOWixBogA/gviz/tq?tqx=out:json'; 
// =====================================================================

let proData = []; 

// Éléments DOM (répétés pour la clarté, mais non modifiés)
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const homePage = document.getElementById('home-page');
const chatPage = document.getElementById('chat-page');
const startChatBtn = document.getElementById('start-chat-btn');
const accueilBtnNav = document.getElementById('accueil-btn-nav');


// =====================================================================
// NOUVELLES LISTES DE RÉFÉRENCE POUR LA RECHERCHE ROBUSTE
// =====================================================================

// NOMS DES COLONNES DE SECTEUR D'ACTIVITÉ (Index 7 à 21 de votre Google Sheet)
const SECTOR_COLUMNS = [
    'Finance / Assurance', 'Transport / Logistique', 'Communication / Médias', 
    'Tourisme / Loisirs', 'Services à la personne', 'Agriculture / Élevage / Pêche', 
    'Droit / Juridique', 'Énergie / Environnement', 'Autres services spécialisés', 
    'Alimentation', 'Mode / Couture', 'Beauté / Esthétique', 
    'Technologie / Informatique', 'Automobile / Mécanique', 'BTP / Construction', 
    'Santé / Pharmacie', 'Éducation / Formation', 'Artisanat / Création', 
    'Commerce général'
];

// LISTE COMPLÈTE DE TOUTES LES SPÉCIALITÉS (pour la détection des mots-clés faibles)
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

// LISTE COMPLÈTE DES VILLES (pour la détection de la ville)
const ALL_CITIES = [
    'Banikoara', 'Gogounou', 'Kandi', 'Karimama', 'Malanville', 'Segbana', 'Boukoumbé', 'Cobly', 'Kérou', 'Kouandé', 
    'Matéri', 'Natitingou', 'Péhunco', 'Tanguiéta', 'Toucountouna', 'Abomey-Calavi', 'Allada', 'Kpomassè', 'Ouidah', 
    'Sô-Ava', 'Toffo', 'Tori-Bossito', 'Zè', 'Bembéréké', 'Kalalé', 'N\'Dali', 'Nikki', 'Parakou', 'Pèrèrè', 'Sinendé', 
    'Tchaourou', 'Bantè', 'Dassa-Zoumé', 'Glazoué', 'Ouèssè', 'Savalou', 'Savè', 'Aplahoué', 'Djakotomey', 'Dogbo', 
    'Klouékanmè', 'Lalo', 'Toviklin', 'Bassila', 'Copargo', 'Djougou', 'Ouaké', 'Cotonou', 'Athiémè', 'Bopa', 'Comè', 
    'Grand-Popo', 'Houéyogbé', 'Lokossa', 'Adjarra', 'Adjohoun', 'Aguégués', 'Akpro-Missérété', 'Avrankou', 'Bonou', 
    'Dangbo', 'Porto-Novo', 'Sèmè-Kpodji', 'Ifangni', 'Kétou', 'Pobè', 'Sakété', 'Abomey', 'Agbangnizoun', 'Bohicon', 
    'Covè', 'Djidja', 'Ouinhi', 'Za-Kpota', 'Zogbodomey'
].map(city => city.toLowerCase()); // Toutes en minuscules pour la comparaison

// =====================================================================
// FONCTIONS DE BASE (NON MODIFIÉES)
// =====================================================================

// [Fonctions showPage, addMessage, handleUserQuery, sendBtn.addEventListener, etc. restent inchangées]

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
// FONCTION DE LECTURE DU GOOGLE SHEET (Adaptée à votre structure de colonnes)
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
        
        // Détermination de l'index de départ des colonnes d'activité réelle (Finance / Assurance)
        const ACTIVITY_START_INDEX = headers.findIndex(h => h.includes('Finance / Assurance')); 

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

            // Indices: [1]=Nom, [2]=Entreprise, [3]=Contact WhatsApp, [4]=Quartier, [5]=Ville
            return {
                nom: cells[1] ? cells[1].v : '',
                entreprise: cells[2] ? cells[2].v : '',
                contact: cells[3] ? cells[3].v : '',
                quartier: cells[4] ? cells[4].v : '',
                ville: cells[5] ? cells[5].v : '',
                secteur: secteurGeneral,
                activite: activiteDetaillee // La spécialité exacte
            };
        }).filter(item => item.activite.trim() !== ''); // N'inclut que les lignes ayant une activité réelle

        proData = formattedData;
        addMessage(`Données chargées ! **${proData.length}** professionnels sont disponibles.`, 'bot');

    } catch (error) {
        addMessage("❌ Erreur de connexion aux données. Assurez-vous que le Sheet est public et que l'ID est correct.", 'bot');
        console.error("Erreur de chargement des données :", error);
    }
}

// =====================================================================
// LOGIQUE DU CHATBOT (Recherche Intelligente et Tolérante)
// =====================================================================

function getKeywords(query) {
    const words = query.toLowerCase().split(/[\s,;']+/).filter(w => w.length > 2); // Nettoyage plus strict
    let keywordActivite = null;
    let keywordVille = null;

    for (const word of words) {
        // 1. Détection de la Ville (mots-clés forts)
        if (ALL_CITIES.includes(word)) {
            keywordVille = word;
        } 
        
        // 2. Détection de l'Activité (mots-clés forts: Secteur principal ou Spécialité)
        const isSectorOrSpecialty = SECTOR_COLUMNS.map(s => s.toLowerCase().split(' / ')[0]).includes(word) || 
                                    ALL_SPECIALTIES.map(s => s.toLowerCase().split(' / ')[0]).includes(word) ||
                                    ALL_SPECIALTIES.map(s => s.toLowerCase()).some(s => s.includes(word));
                                    
        if (isSectorOrSpecialty) {
            keywordActivite = word;
        }
    }
    
    // 3. Logique de secours pour l'activité : si rien de fort n'est trouvé, le premier mot pertinent est l'activité potentielle
    if (!keywordActivite) {
        const firstRelevantWord = words.find(w => w.length > 2 && !['cherche', 'trouve', 'besoin', 'recherche', 'un', 'une', 'à', 'de', 'le', 'la', 'les', 'en', 'sur'].includes(w) && !ALL_CITIES.includes(w));
        if (firstRelevantWord) {
            keywordActivite = firstRelevantWord;
        }
    }

    return { activite: keywordActivite, ville: keywordVille };
}

function processBotResponse(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('cherche') || lowerQuery.includes('trouve') || lowerQuery.includes('besoin') || lowerQuery.includes('recherche') || lowerQuery.includes('un') || lowerQuery.includes('une')) {
        
        let { activite: activiteKeyword, ville: villeKeyword } = getKeywords(query);
        
        if (!activiteKeyword && !villeKeyword) {
            addMessage("Veuillez être plus précis. Quelle **Activité** et dans quelle **Ville** ? **Exemple : Plombier à Cotonou.**", 'bot');
            return;
        }

        // 1. Recherche stricte (Ville + Quartier/Mots-clés)
        let results = searchProfessionals(query, activiteKeyword, villeKeyword, false);

        // 2. Dégradation de la recherche (Ignorer le quartier) si les résultats sont nuls
        if (results.length === 0 && villeKeyword) {
             results = searchProfessionals(query, activiteKeyword, villeKeyword, true); 
        }
        
        displayResults(results, activiteKeyword, villeKeyword);
        
    } else if (lowerQuery.includes('bonjour') || lowerQuery.includes('salut') || lowerQuery.includes('hello')) {
        addMessage("Salut ! Je suis ProFinder. La règle pour la recherche est simple : **[Activité] à [Ville]**.", 'bot');
    } else {
        addMessage("Je n'ai pas compris. Veuillez utiliser le format simple : **[Activité] à [Ville]**.", 'bot');
    }
}

function searchProfessionals(query, activite, ville, degrade = false) {
    if (proData.length === 0) return [];
    
    const queryWords = query ? query.toLowerCase().split(/[\s,;']+/).filter(w => w.length > 2) : [];

    return proData.filter(pro => {
        let matchActivite = false;
        let matchVille = false;
        
        const proActivite = pro.activite.toLowerCase();
        const proSecteur = pro.secteur.toLowerCase();
        const proVille = pro.ville.toLowerCase();
        const proQuartier = pro.quartier.toLowerCase();

        // 1. Logique d'Activité (Recherche tolérante)
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
                
                // Si la requête contient une ville et le quartier/mot-clé, on cherche dans la ville ET le quartier
                matchVille = fullLocation.includes(query.toLowerCase()) || proVille.includes(ville);
            }
        } else {
            matchVille = true;
        }
        
        return matchActivite && matchVille;
    });
}

// [La fonction displayResults reste inchangée]
function displayResults(results, activite, ville) {
    let responseHTML = '';
    const recherche = `**${activite || 'Professionnel'}** ${ville ? 'à **' + ville + '**' : ''}`;

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
                        <p>👉 **Conseil :** Essayez d'utiliser uniquement un métier générique (ex: 'Mécanicien') ou le nom de la ville (ex: 'Cotonou').</p>`;
    }
    
    addMessage(responseHTML, 'bot');
}


// Démarrage : chargement des données au lancement
loadSheetData();
showPage('home'); // Affiche la page d'accueil imposante au démarrage
// =====================================================================
// ⚠️ ÉTAPE 1 : REMPLACEZ CETTE URL PAR L'URL OBTENUE DE VOTRE GOOGLE SHEET
// =====================================================================
const SHEET_API_URL = 'https://docs.google.com/spreadsheets/d/1n2n1vdQvUR9X7t9Vd6VanBz41nYBnjQhIXdOWixBogA/gviz/tq?tqx=out:json'; 
// =====================================================================

let proData = []; 
let consecutiveBadQueries = 0; // Compteur d'erreurs pour l'avertissement ATASSA

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

const STOP_WORDS = ['cherche', 'trouve', 'besoin', 'recherche', 'un', 'une', 'à', 'de', 'le', 'la', 'les', 'en', 'sur', 'pour', 'dans', 'au', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'suis', 'est'];


// =====================================================================
// FONCTIONS DE BASE & DATA LOADING (Inchagées)
// =====================================================================
function showPage(pageId) { /* ... inchangé ... */ }
startChatBtn.addEventListener('click', () => showPage('chat'));
accueilBtnNav.addEventListener('click', () => showPage('home'));

function addMessage(text, sender) { /* ... inchangé ... */ }
function handleUserQuery() { /* ... inchangé ... */ }
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
            let secteurGeneral = cells[6] && cells[6].v ? cells[6].v : 'Inconnu'; 

            for (let i = ACTIVITY_START_INDEX; i < ACTIVITY_START_INDEX + SECTOR_COLUMNS.length; i++) {
                if (cells[i] && cells[i].v) {
                    activiteDetaillee = cells[i].v; 
                    break;
                }
            }

            return {
                nom: cells[1] && cells[1].v ? cells[1].v.toLowerCase() : '',
                entreprise: cells[2] && cells[2].v ? cells[2].v.toLowerCase() : '',
                contact: cells[3] && cells[3].v ? cells[3].v : '',
                quartier: cells[4] && cells[4].v ? cells[4].v.toLowerCase() : '',
                ville: cells[5] && cells[5].v ? cells[5].v.toLowerCase() : '',
                secteur: secteurGeneral.toLowerCase(),
                activite: activiteDetaillee.toLowerCase()
            };
        }).filter(item => item.activite.trim() !== '');

        proData = formattedData;
        addMessage(`Données chargées ! **${proData.length}** professionnels sont disponibles.`, 'bot');

    } catch (error) {
        addMessage("❌ Erreur de connexion aux données. Assurez-vous que le Sheet est public et que l'ID est correct.", 'bot');
        console.error("Erreur de chargement des données :", error);
    }
}
function displayResults(results, activite, ville, autresMots) {
    let responseHTML = '';
    
    let recherche = activite ? `**${activite}**` : '';
    recherche += ville ? ` à **${ville}**` : '';
    if (autresMots && autresMots.trim().length > 0) {
        recherche += ` (Filtre : ${autresMots})`;
    }

    if (results.length > 0) {
        responseHTML += `<p>✅ J'ai trouvé **${results.length}** résultat(s) pour ${recherche}.</p>`;
        
        results.forEach(pro => {
            const nomAffichage = pro.entreprise.trim() ? `${pro.entreprise.toUpperCase()} (par ${pro.nom})` : pro.nom.toUpperCase();
            const quartierInfo = pro.quartier.trim() ? ` à ${pro.quartier}` : '';
            
            responseHTML += `
                <div class="result-card animated-message">
                    <p class="mb-0 text-white fw-bold">${nomAffichage}</p>
                    <p class="mb-1 text-accent small">${pro.activite.toUpperCase()} - ${pro.ville.toUpperCase()}${quartierInfo.toUpperCase()}</p>
                    <a href="https://wa.me/${pro.contact.replace(/\s/g, '')}" target="_blank" class="contact-link">
                        <i class="bi bi-whatsapp"></i> Contacter via WhatsApp
                    </a>
                </div>
            `;
        });
    } else {
        responseHTML = `<p>😔 Désolé, aucun pro n'a été trouvé pour ${recherche}.</p>
                        <p>👉 **Conseil :** Essayez d'utiliser un métier plus générique (ex: 'Technologie' au lieu de 'développeur') ou vérifiez l'orthographe de la ville.</p>`;
    }
    
    addMessage(responseHTML, 'bot');
}


// =====================================================================
// LOGIQUE DE RECHERCHE MISE À JOUR (PLUS TOLÉRANTE ET PRÉCISE)
// =====================================================================

function normalizeKeyword(word) {
    if (word.endsWith('s') && word.length > 3) {
        word = word.slice(0, -1);
    }
    // Gère les variations d'informaticien
    if (word.includes('informaticien') || word.includes('dev') || word.includes('programm')) {
        return 'informatique'; 
    }
    // Gère les variations de "plombier"
    if (word.includes('plomb')) {
        return 'plomberie';
    }
    return word;
}


function getKeywords(query) {
    const words = query.toLowerCase().split(/[\s,;']+/).filter(w => w.length > 2);
    let keywordActivite = null;
    let keywordVille = null;
    let nonUsedWords = [];
    let usedWords = [];

    // 1. Détection de la Ville (Priorité : elle est la plus simple à identifier)
    for (const word of words) {
        if (ALL_CITIES.includes(word)) { 
            keywordVille = word;
            usedWords.push(word);
            break; 
        } 
    }

    // 2. Détection de l'Activité (Secteur ou Spécialité)
    for (const word of words) {
        if (usedWords.includes(word) || STOP_WORDS.includes(word)) continue;
        
        const normalizedWord = normalizeKeyword(word); 
        
        // Vérifie si le mot (normalisé) correspond à un secteur ou une spécialité
        const isSectorOrSpecialty = SECTOR_COLUMNS.map(s => s.toLowerCase().split(' / ')[0]).includes(normalizedWord) || 
                                    ALL_SPECIALTIES.map(s => s.toLowerCase().split(' / ')[0]).includes(normalizedWord) ||
                                    ALL_SPECIALTIES.map(s => s.toLowerCase()).some(s => s.includes(normalizedWord));
                                    
        if (isSectorOrSpecialty) {
            keywordActivite = normalizedWord; 
            usedWords.push(word);
            break;
        }
    }
    
    // 3. Le reste des mots non utilisés est le filtre libre (Nom, Entreprise, Quartier, Mots-clés divers)
    for (const word of words) {
        if (!usedWords.includes(word) && !STOP_WORDS.includes(word)) {
             nonUsedWords.push(word);
        }
    }

    return { 
        activite: keywordActivite, 
        ville: keywordVille, 
        autresMots: nonUsedWords.join(' ')
    };
}


function processBotResponse(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('cherche') || lowerQuery.includes('trouve') || lowerQuery.includes('besoin') || lowerQuery.includes('recherche') || lowerQuery.includes('un') || lowerQuery.includes('une')) {
        
        let { activite, ville, autresMots } = getKeywords(query);
        
        // Vérification du minimum : Au moins une activité OU une ville doit être fournie.
        if (!activite && !ville && autresMots.length === 0) {
            consecutiveBadQueries++;
            
            if (consecutiveBadQueries >= 2) { 
                addMessage("🚨 **ATASSA respecte la logique frère !** Utilise le format : **[Activité] à [Ville]** ou **[Nom] à [Ville]**.", 'bot');
                consecutiveBadQueries = 0;
                return;
            }
            
            addMessage("Veuillez être plus précis. Je dois connaître l'**Activité**, la **Ville**, ou un **Nom**. **Exemple : Plombier à Cotonou.**", 'bot');
            return;
        }

        // Réinitialise le compteur sur une requête valide (même si les mots-clés sont partiels)
        consecutiveBadQueries = 0; 

        // Recherche des professionnels avec la nouvelle logique
        let results = searchProfessionals(activite, ville, autresMots);
        
        displayResults(results, activite, ville, autresMots);
        
    } else if (lowerQuery.includes('bonjour') || lowerQuery.includes('salut') || lowerQuery.includes('hello')) {
        consecutiveBadQueries = 0;
        addMessage("Salut ! Je suis ProFinder. La règle pour la recherche est simple : **[Activité] à [Ville]**.", 'bot');
    } else {
        consecutiveBadQueries++;
        if (consecutiveBadQueries >= 2) {
             addMessage("🚨 **ATASSA respecte la logique frère !** Utilise le format : **[Activité] à [Ville]** ou **[Nom] à [Ville]**.", 'bot');
             consecutiveBadQueries = 0;
             return;
        }
        addMessage("Je n'ai pas compris. Veuillez utiliser le format simple : **[Activité] à [Ville]**.", 'bot');
    }
}


function searchProfessionals(activite, ville, autresMots) {
    if (proData.length === 0) return [];
    
    // Convertir la chaîne "autresMots" en tableau de mots pour filtrage (Nom/Entreprise/Quartier)
    const motsFiltre = autresMots.toLowerCase().split(' ').filter(w => w.length > 2);

    return proData.filter(pro => {
        let matchActivite = false;
        let matchVille = false;
        let matchAutres = false;
        
        const proActivite = pro.activite; // Déjà en minuscules
        const proSecteur = pro.secteur; // Déjà en minuscules
        const proVille = pro.ville; // Déjà en minuscules
        const proQuartier = pro.quartier; // Déjà en minuscules
        const proNom = pro.nom; // Déjà en minuscules
        const proEntreprise = pro.entreprise; // Déjà en minuscules

        // 1. FILTRE PAR VILLE (Obligatoire si la ville est fournie)
        if (ville) {
            matchVille = proVille.includes(ville);
        } else {
            matchVille = true; // Si pas de ville dans la requête, on ne filtre pas sur ce critère
        }

        // 2. FILTRE PAR ACTIVITÉ (Obligatoire si l'activité est fournie)
        if (activite) {
            matchActivite = proActivite.includes(activite) || proSecteur.includes(activite);
        } else {
            matchActivite = true; // Si pas d'activité, on ne filtre pas sur ce critère
        }
        
        // 3. FILTRE PAR AUTRES MOTS (Nom, Entreprise, Quartier)
        if (motsFiltre.length > 0) {
            // Un des mots non utilisés dans la requête doit correspondre au Nom, Entreprise ou Quartier
            matchAutres = motsFiltre.some(mot => 
                proNom.includes(mot) || 
                proEntreprise.includes(mot) || 
                proQuartier.includes(mot)
            );
        } else {
            matchAutres = true; // Si pas de mots supplémentaires, on ne filtre pas
        }
        
        // Formule de filtre claire :
        // Le professionnel est inclus si :
        // 1. Il y a correspondance sur la Ville (SI la ville a été fournie) ET
        // 2. Il y a correspondance sur l'Activité (SI l'activité a été fournie) ET
        // 3. Il y a correspondance sur le Nom/Quartier (SI des mots-clés ont été trouvés pour cela)
        
        // CAS 1 (Activité ET Ville) : matchActivite && matchVille && true (on ignore matchAutres pour la combinaison principale)
        // CAS 2 (Nom/Quartier ET Ville) : matchVille && matchAutres && !matchActivite (si activite=null)

        // Logique finale : Il doit y avoir un match sur tous les critères fournis.
        return matchActivite && matchVille && matchAutres;
    });
}

// Démarrage : chargement des données au lancement
loadSheetData();
showPage('home'); // Affiche la page d'accueil imposante au démarrage

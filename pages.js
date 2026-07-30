/**
 * CineChroma — pages.js (Upgraded Lightweight Script for Sub-pages)
 * Handles theme toggles, detailed translation updates, user profile status,
 * Formspree submissions, and 4-tab routing logic.
 */

'use strict';

const I18N = {
  fr: {
    nav_gallery:         'Explorer',
    favorites:           'Favoris',
    nav_collections:     'Collections',
    nav_profile:         'Mon Profil',
    nav_contact:         'Contact',
    nav_about:           'En savoir plus',
    nav_game:            'Le Jeu',
    logout:              'Déconnexion',
    tab_likes:           'Mes Favoris',
    tab_collections:     'Mes Collections',
    
    // Contact translations
    contact_badge_text:  'Canaux Officiels CineChroma',
    contact_title:       'Contactez-nous',
    contact_hero_title:  'Restons connectés.',
    contact_subtitle:    'Une question, un retour ou une suggestion pour CineChroma ? Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.',
    contact_name:        'Nom / Pseudo',
    contact_email:       'Adresse Email',
    contact_message:     'Message',
    contact_send:        'Envoyer le message',
    contact_success:     'Message envoyé avec succès ! Merci de votre intérêt pour CineChroma.',
    contact_error:       'Une erreur est survenue lors de la soumission du message. Veuillez réessayer.',
    
    // About headers and badge
    about_badge_text:    'Version 1.0 — Atlas Colorimétrique',
    about_hero_title:    "Révéler l'âme chromatique du 7e art.",
    about_hero_subtitle: 'CineChroma est une expérience interactive de Data Science et de Design Web qui décompose les affiches du cinéma mondial sous le spectre de la couleur.',
    
    // Metrics
    stat_posters_val:    '20 000+',
    stat_posters_lbl:    'Affiches HD',
    stat_space_val:      'LAB',
    stat_space_lbl:      'Espace Perceptuel',
    stat_kmeans_val:     'K-Means',
    stat_kmeans_lbl:     'Extraction Locale',
    stat_clientside_val: '100%',
    stat_clientside_lbl: 'Gratuit & Libre',
    
    back_gallery:        "Retourner à la galerie d'affiches",
    
    // Tabs
    about_project_tab:   'Le Projet',
    about_tech_tab:      'Science & Algorithme',
    about_features_tab:  'Fonctionnalités',
    about_legal_tab:     'Mentions Légales',
    
    // Tab 1: Project
    project_heading:     "Une Nouvelle Façon d'Explorer le Cinéma",
    project_intro:       "Chaque œuvre cinématographique possède une empreinte visuelle unique. Avant même que le premier plan ne s'affiche à l'écran, l'affiche de film transmet l'émotion, le genre et la tension psychologique à travers sa palette de couleurs. Les teintes dominantes choisies par les graphistes et directeurs artistiques ne sont jamais le fruit du hasard. CineChroma a été créé pour offrir aux cinéphiles, aux designers et aux curieux un moteur de recherche visuel fondé sur cette signature chromatique, permettant de redécouvrir l'histoire du cinéma sous l'angle de la couleur. En naviguant à travers notre catalogue, vous constaterez des correspondances fascinantes : les rouges vibrants des films de tension psychologique, les bleus froids et désaturés des drames mélancoliques, ou encore les palettes saturées et contrastées caractéristiques de réalisateurs à l'identité visuelle forte comme Wes Anderson, Stanley Kubrick ou Denis Villeneuve.",
    project_feat1_title: 'Curation Cinématographique',
    project_feat1_desc:  "Une sélection rigoureuse et constamment enrichie de plus de 20 000 affiches issues du patrimoine cinématographique mondial. Des classiques en noir et blanc aux blockbusters contemporains, chaque film est minutieusement indexé avec ses métadonnées officielles de TMDb, permettant d'associer la palette visuelle à des critères comme le genre, l'année ou le réalisateur.",
    project_feat2_title: 'Analyse LAB Haute Fidélité',
    project_feat2_desc:  "Les palettes de couleurs dominantes ne sont pas estimées de manière approximative : elles sont calculées pixel par pixel en analysant la densité et la répartition chromatique de l'affiche originale. Les teintes extraites sont triées par importance relative pour restituer fidèlement la structure esthétique voulue par les créateurs visuels du film.",
    visualizer_title:    'Exemple de Palette Extraite (Blade Runner 2049)',
    visualizer_sub:      '5 Clusters K-Means',
    
    // Tab 2: Science & Algorithm
    tech_heading:        'Sous le Capot : Traitement Colorimétrique',
    tech_intro:          "Pour comparer des couleurs de manière humaine et réaliste, l'espace RVB (Red, Green, Blue) traditionnel ne suffit pas. CineChroma utilise la conversion dans l'espace colorimétrique tridimensionnel CIELAB (LAB) et l'algorithme de partitionnement K-Means. Cette combinaison mathématique garantit que les proximités de teintes affichées à l'écran correspondent de manière optimale à la façon dont l'œil humain perçoit réellement la couleur dans le monde réel.",
    tech_feat1_title:    "1. L'Espace Perceptuel CIELAB",
    tech_feat1_desc:     "Contrairement au format de stockage RVB (qui dépend directement de l'affichage technique de chaque écran), l'espace CIELAB sépare la clarté (L) des axes de couleurs chromatiques a (axe vert-rouge) et b (axe bleu-jaune). En calculant la distance euclidienne delta E (CIE76) entre deux couleurs dans cet espace tridimensionnel, nous mesurons l'écart perceptuel réel. Cela permet de trouver des affiches partageant une même ambiance colorée même si les codes hexadécimaux stricts diffèrent légèrement.",
    tech_feat2_title:    '2. Clustering K-Means In-Browser',
    tech_feat2_desc:     "Lorsque vous importez votre propre image, un script de calcul local extrait sa palette instantanément. K-Means est un algorithme non supervisé qui regroupe les pixels en 5 clusters distincts en réajustant itérativement les coordonnées des centroïdes colorés. Ce processus s'exécute à 100% sur le client via l'API Canvas HTML5 de votre navigateur, garantissant qu'aucun fichier n'est envoyé sur nos serveurs.",
    code_comment:        '// Calcul de distance Delta E dans l\'espace CIELAB',
    
    // Tab 3: Features
    features_heading:    'Fonctionnalités Clés de CineChroma',
    features_intro:      "Pensé pour une utilisation fluide sur mobile comme sur grand écran, le site regorge d'attentions UX pour rendre l'exploration visuelle agréable. Vous disposez d'un ensemble complet d'outils professionnels pour mener à bien vos recherches d'inspiration graphique.",
    features_feat1_title:'Sélecteur 2D Style Cosmos.so',
    features_feat1_desc: "Choisissez précisément votre teinte cible via notre nuanceur bidimensionnel (Saturation x Clarté) et combinez jusqu'à 5 teintes simultanées. Ce sélecteur vous permet de filtrer finement la base de données de films selon des accords de couleurs complexes.",
    features_feat2_title:'Recherche par Image (Dropzone)',
    features_feat2_desc: "Glissez-déposez n'importe quel visuel, capture d'écran ou photo dans le module d'importation. L'algorithme K-Means intégré extrait sa palette en quelques millisecondes et identifie instantanément les affiches possédant la même signature esthétique.",
    features_feat3_title:'Deep Linking par URL',
    features_feat3_desc: "Partagez vos explorations en un clic. Chaque combinaison de filtres, choix de tri ou tolérance chromatique est encodée en temps réel dans les paramètres de la barre d'adresse. Le destinataire du lien verra exactement la même sélection d'affiches.",
    features_feat4_title:'Favoris & Collections Locales',
    features_feat4_desc: "Aucune inscription obligatoire pour commencer ! Organisez vos inspirations en créant des collections thématiques personnalisées ou en ajoutant vos coups de cœur. Vos listes de sélection sont enregistrées localement dans votre navigateur via localStorage.",
    features_coming_soon:'Prochainement',
    features_feat5_title:'Nuage Chromatique 3D',
    features_feat5_desc: "Plongez dans un espace tridimensionnel où chaque affiche est représentée comme un point coloré dans l'espace CIELAB. Ce nuage interactif, rendu en temps réel via WebGL (Three.js), vous permet de naviguer physiquement dans la carte colorimétrique du cinéma mondial.",
    features_feat6_title:'Le Jeu — Quiz Chromatique',
    features_feat6_desc: "Identifiez un film rien qu'à partir de sa palette de couleurs. Ce mini-jeu vous met au défi en 5 manches progressives. Trois indices sont disponibles si vous bloquez, et votre score tient compte de la vitesse et du nombre d'aides demandées.",
    features_feat7_title:'Catalogue Universel d\'Affiches',
    features_feat7_desc: "Le dataset s'enrichira prochainement d'affiches textless (sans typographie), d'affiches par pays d'origine et d'un catalogue mondial couvrant les cinémas asiatique, africain, latino-américain et européen.",
    features_feat8_title:'Système de Compte & Profil',
    features_feat8_desc: "Créez un compte CineChroma pour personnaliser votre expérience. Choisissez votre avatar, organisez vos favoris en collections nommées et consultez vos statistiques de jeu. Tout reste stocké localement — votre confidentialité est totale.",
    
    // Tab 4: Legal (Amplified)
    about_legal_title:   'Mentions Légales & Crédits',
    legal_section_editor:'Édition du site',
    legal_editor_desc:   'Le site internet CineChroma est édité et géré par un collectif indépendant d\'artistes numériques et de concepteurs logiciels. Ce projet constitue une vitrine d\'expérimentation technique à but non lucratif visant à explorer les liens étroits entre la colorimétrie historique et le cinéma mondial. Pour toute question relative à l\'édition ou pour contacter le responsable de publication, vous pouvez soumettre un formulaire via notre page de contact dédiée. Nous nous efforçons d\'assurer une disponibilité optimale et une mise à jour régulière des données pour tous les passionnés de design et de septième art.',
    legal_section_host:  'Hébergement',
    legal_host_desc:     'Le site CineChroma est hébergé de manière statique et sécurisée sur les serveurs d\'infrastructure cloud mondialisés, garantissant une haute disponibilité et un temps de chargement optimal. L\'hébergement respecte les protocoles de sécurité standard de chiffrement de bout en bout (SSL/TLS). Aucun serveur d\'application dynamique tiers n\'est sollicité lors du rendu des informations sur votre navigateur, minimisant les risques de sécurité et protégeant l\'intégrité des données affichées.',
    legal_section_data:  'Données et API',
    legal_data_desc:     'CineChroma utilise l\'API publique de TMDb (The Movie Database) pour récupérer les métadonnées (titres, réalisateurs, dates de sortie, genres) et les chemins des affiches de films. Ce site n\'est ni affilié, ni certifié par TMDb. Les affiches de films et les visuels originaux restent la propriété intellectuelle exclusive des studios de production, distributeurs et titulaires de droits respectifs. Leur affichage est réalisé uniquement à des fins d\'illustration, de critique artistique et d\'analyse colorimétrique non commerciale, conformément aux dispositions du droit de citation et de l\'usage loyal (Fair Use). Si vous êtes titulaire de droits sur une œuvre et souhaitez son retrait, contactez-nous.',
    legal_section_cookies:'Données Personnelles, Cookies et RGPD',
    legal_cookies_desc:  'Conformément au Règlement Général sur la Protection des Données (RGPD), CineChroma adopte une politique stricte de respect de la vie privée. Aucun cookie de pistage, traceur publicitaire ou outil d\'analyse comportementale tiers n\'est déposé sur votre terminal. Les fonctionnalités interactives (sauvegarde de vos affiches favorites, création et renommage de collections thématiques personnalisées) reposent exclusivement sur l\'utilisation du stockage local de votre propre navigateur (localStorage). Aucune donnée nominative ou de navigation n\'est transmise ou collectée à l\'extérieur de votre machine. Vous disposez du contrôle total sur vos données.',
    
    // Game translations
    game_start_title:    'CINECHROMA QUIZ',
    game_start_desc:     'Testez votre culture cinématographique à travers la couleur.',
    game_rule_1:         'Identifiez l\'œuvre par sa signature chromatique',
    game_rule_2:         '5 manches de difficulté progressive',
    game_rule_3:         '3 indices disponibles en cas de doute',
    game_btn_start:      'Jouer',
    game_round:          'Manche',
    game_score:          'Score :',
    game_end_title:      'Partie Terminée',
    game_end_score:      'Score final :',
    game_btn_replay:     'Rejouer'
  },
  en: {
    nav_gallery:         'Explore',
    favorites:           'Favorites',
    nav_collections:     'Collections',
    nav_profile:         'My Profile',
    nav_contact:         'Contact',
    nav_about:           'Learn more',
    nav_game:            'The Game',
    logout:              'Log out',
    tab_likes:           'My Favorites',
    tab_collections:     'My Collections',
    
    // Contact translations
    contact_badge_text:  'CineChroma Official Channels',
    contact_title:       'Contact Us',
    contact_hero_title:  'Let\'s stay connected.',
    contact_subtitle:    'Any question, feedback or suggestion for CineChroma? Send us a message and we will get back to you as soon as possible.',
    contact_name:        'Name / Username',
    contact_email:       'Email Address',
    contact_message:     'Message',
    contact_send:        'Send Message',
    contact_success:     'Message sent successfully! Thank you for your interest in CineChroma.',
    contact_error:       'An error occurred while submitting the message. Please try again.',
    
    // About headers and badge
    about_badge_text:    'Version 1.0 — Chromatic Atlas',
    about_hero_title:    'Revealing the chromatic soul of the 7th art.',
    about_hero_subtitle: 'CineChroma is an interactive Web Design and Data Science experience that decomposes movie posters through the spectrum of color.',
    
    // Metrics
    stat_posters_val:    '20,000+',
    stat_posters_lbl:    'HD Posters',
    stat_space_val:      'LAB',
    stat_space_lbl:      'Perceptual Space',
    stat_kmeans_val:     'K-Means',
    stat_kmeans_lbl:     'Local Extraction',
    stat_clientside_val: '100%',
    stat_clientside_lbl: 'Free & Open',
    
    back_gallery:        'Back to the poster gallery',
    
    // Tabs
    about_project_tab:   'The Project',
    about_tech_tab:      'Science & Algorithm',
    about_features_tab:  'Features',
    about_legal_tab:     'Legal Notice',
    
    // Tab 1: Project
    project_heading:     'A New Way to Explore Cinema',
    project_intro:       'Every cinematic work has a unique visual print. Even before the first shot is displayed on the screen, the movie poster conveys emotion, genre, and psychological tension through its color palette. The dominant colors chosen by graphic designers and art directors are never accidental. CineChroma was created to offer movie lovers, designers, and curious minds a visual search engine based on this chromatic signature, allowing them to rediscover the history of cinema through the angle of color. Browsing our catalog, you will notice fascinating correlations: vibrant reds in psychological thrillers, cold, desaturated blues in melancholic dramas, or the saturated, high-contrast palettes characteristic of directors with strong visual identities like Wes Anderson, Stanley Kubrick, or Denis Villeneuve.',
    project_feat1_title: 'Cinematic Curation',
    project_feat1_desc:  'A rigorous and constantly enriched selection of over 20,000 posters from the world\'s film heritage. From black-and-white classics to contemporary blockbusters, each film is carefully indexed with its official TMDb metadata, allowing the visual palette to be instantly linked to criteria such as genre, release year, or director.',
    project_feat2_title: 'High-Fidelity LAB Analysis',
    project_feat2_desc:  'Dominant color palettes are not estimated roughly: they are calculated pixel by pixel by analyzing the density and chromatic distribution of the original poster. Extracted shades are sorted by relative importance to faithfully reproduce the aesthetic structure intended by the film\'s visual creators.',
    visualizer_title:    'Extracted Palette Example (Blade Runner 2049)',
    visualizer_sub:      '5 K-Means Clusters',
    
    // Tab 2: Science & Algorithm
    tech_heading:        'Under the Hood: Color Processing',
    tech_intro:          'To compare colors in a realistic and human way, the traditional RGB (Red, Green, Blue) space is not enough. CineChroma uses CIELAB (LAB) space conversion and the K-Means clustering algorithm. This mathematical combination ensures that color proximities displayed on screen closely match how the human eye actually perceives color in the physical world.',
    tech_feat1_title:    '1. The CIELAB Perceptual Space',
    tech_feat1_desc:     'Unlike the RGB storage format (which directly depends on the technical attributes of each screen), the CIELAB space separates lightness (L) from the chromatic color axes a (green-red axis) and b (blue-yellow axis). By calculating the delta E Euclidean distance (CIE76) between two colors in this three-dimensional space, we measure the actual perceptual distance. This makes it possible to find posters sharing the same colored atmosphere even if their strict hex codes differ slightly.',
    tech_feat2_title:    '2. In-Browser K-Means Clustering',
    tech_feat2_desc:     'When you import your own image, a local calculation script extracts its palette instantly. K-Means is an unsupervised clustering algorithm that groups pixels into 5 distinct clusters by iteratively adjusting the coordinates of colored centroids. This process runs 100% on the client side using your browser\'s native HTML5 Canvas API, ensuring that no file is ever sent to our servers.',
    code_comment:        '// Delta E distance calculation in CIELAB space',
    
    // Tab 3: Features
    features_heading:    'Key Features of CineChroma',
    features_intro:      'Designed for smooth navigation on both mobile and desktop screens, the site is packed with UX refinements to make visual exploration delightful. You have a complete set of professional tools at your disposal to carry out your graphic design research and organize your inspirations.',
    features_feat1_title:'Cosmos.so Style 2D Picker',
    features_feat1_desc: 'Precisely choose your target shade via our two-dimensional shader (Saturation x Lightness) and combine up to 5 simultaneous colors. This picker allows you to finely filter the movie database according to complex color harmonies.',
    features_feat2_title:'Image Search (Dropzone)',
    features_feat2_desc: 'Drag and drop any visual, screenshot, or photo into the dropzone. The built-in K-Means algorithm extracts its palette in milliseconds and instantly identifies posters sharing the same aesthetic signature.',
    features_feat3_title:'URL Deep Linking',
    features_feat3_desc: 'Share your explorations in one click. Every filter combination, sorting option, or color tolerance threshold is encoded in real time in address bar parameters (deep linking). Anyone opening the link will see the exact same poster selection.',
    features_feat4_title:'Favorites & Local Collections',
    features_feat4_desc: 'No registration required to start! Organize your inspirations by creating custom themed collections or adding films to your favorites. Your lists are stored locally in your browser via localStorage.',
    features_coming_soon:'Coming Soon',
    features_feat5_title:'3D Chromatic Cloud',
    features_feat5_desc: 'Dive into a three-dimensional space where each poster is represented as a colored point in CIELAB space. This interactive cloud, rendered in real time via WebGL (Three.js), lets you physically navigate through the colorimetric map of world cinema.',
    features_feat6_title:'The Game — Chromatic Quiz',
    features_feat6_desc: 'Can you identify a film just from its color palette? This cinematic mini-game challenges you across 5 rounds of progressive difficulty. Three hints are available if you get stuck, and your score factors in speed and hints used.',
    features_feat7_title:'Universal Poster Catalog',
    features_feat7_desc: 'The dataset will soon expand with textless posters (typography-free, for pure chromatic reading), posters by country of origin, and a worldwide catalog covering Asian, African, Latin American, and European cinema.',
    features_feat8_title:'Account System & Profile',
    features_feat8_desc: 'Create a CineChroma account to personalize your experience. Choose your avatar, organize your favorites into named collections, and track your game statistics. Everything stays stored locally — your privacy is total.',
    
    // Tab 4: Legal (Amplified)
    about_legal_title:   'Legal Notice & Credits',
    legal_section_editor:'Website Publication',
    legal_editor_desc:   'The CineChroma website is published and managed by an independent collective of digital artists and software designers. This project constitutes a non-profit technical experimental showcase aimed at exploring the close links between historical color science and world cinema. For any question regarding publication or to contact the editor, you can submit a form via our dedicated contact page. We strive to ensure optimal availability and regular updates of data for all design and film enthusiasts.',
    legal_section_host:  'Hosting',
    legal_host_desc:     'The CineChroma website is statically and securely hosted on global cloud infrastructure servers, ensuring high availability and optimal loading times. Hosting complies with standard end-to-end encryption security protocols (SSL/TLS). No third-party dynamic application servers are requested when rendering information in your browser, minimizing security risks and protecting data integrity.',
    legal_section_data:  'Data & API Sources',
    legal_data_desc:     'CineChroma uses the public API of TMDb (The Movie Database) to retrieve movie metadata (titles, directors, release dates, genres) and paths of film posters. This site is neither affiliated with nor certified by TMDb. Film posters and original visuals remain the exclusive intellectual property of their respective production studios, distributors, and copyright holders. Their display is carried out solely for illustration, artistic review, and non-commercial color analysis, in accordance with the provisions of fair use and citation rights. If you hold rights to an artwork and wish for its removal, please contact us.',
    legal_section_cookies:'Personal Data, Cookies & GDPR',
    legal_cookies_desc:  'In compliance with the General Data Protection Regulation (GDPR), CineChroma adopts a strict privacy policy. No tracking cookies, advertising trackers, or third-party behavioral analysis tools are placed on your device. Interactive features (saving favorite posters, creating local collections) rely entirely on your browser\'s local storage (localStorage). No personal or browsing data is transmitted or collected outside your machine. You have total control over your data.',

    // Game translations
    game_start_title:    'CINECHROMA QUIZ',
    game_start_desc:     'Test your movie knowledge through color.',
    game_rule_1:         'Identify the movie by its chromatic signature',
    game_rule_2:         '5 rounds of progressive difficulty',
    game_rule_3:         '3 hints available if you are stuck',
    game_btn_start:      'Play',
    game_round:          'Round',
    game_score:          'Score:',
    game_end_title:      'Game Over',
    game_end_score:      'Final score:',
    game_btn_replay:     'Play Again'
  }
};

const state = {
  lang: localStorage.getItem('cinechroma_lang') || 'fr',
  theme: localStorage.getItem('cinechroma_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function t(key) {
  return (I18N[state.lang] || I18N.fr)[key] || key;
}

// Splits titles into interactive colored letters
function initTitleLetters() {
  const titles = $$('.about-hero-title, .contact-hero-title');
  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#00D2FF', '#FF0055'];

  titles.forEach(titleEl => {
    const text = titleEl.textContent.trim();
    if (!text) return;

    const words = text.split(/\s+/);
    titleEl.innerHTML = words.map(word => {
      const lettersHtml = word.split('').map(char => `<span class="hero-letter">${char}</span>`).join('');
      return `<span class="hero-word">${lettersHtml}</span>`;
    }).join(' ');

    titleEl.querySelectorAll('.hero-letter').forEach(letter => {
      letter.addEventListener('mouseenter', () => {
        const randColor = colors[Math.floor(Math.random() * colors.length)];
        letter.classList.add('letter-hovered');
        letter.style.color = randColor;
        letter.style.textShadow = `0 0 14px ${hexToRgba(randColor, 0.45)}`;

        setTimeout(() => {
          letter.classList.remove('letter-hovered');
          letter.style.color = '';
          letter.style.textShadow = '';
        }, 1500);
      });
    });
  });
}

function hexToRgba(hex, alpha = 0.2) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Check user local storage user state & sync avatar button
function initUserSession() {
  const userTrigger = $('#user-profile-trigger');
  const avatarImg = $('#header-avatar-img');
  const placeholder = $('#header-avatar-placeholder');
  const profileLink = $('#nav-link-profile');
  const logoutLink = $('#nav-link-logout');
  
  if (!userTrigger) return;

  const rawUser = localStorage.getItem('cinechroma_user');
  if (rawUser) {
    try {
      const userObj = JSON.parse(rawUser);
      if (userObj && userObj.avatar) {
        if (avatarImg) {
          avatarImg.src = userObj.avatar;
          avatarImg.removeAttribute('hidden');
        }
        if (placeholder) {
          placeholder.style.display = 'none';
        }
      }
      // Update drawer menu profile label and logout link
      if (profileLink) {
        const span = profileLink.querySelector('span');
        if (span) span.textContent = state.lang === 'en' ? 'My Profile' : 'Mon Profil';
      }
      if (logoutLink) {
        logoutLink.removeAttribute('hidden');
      }
    } catch (e) {
      console.error('Failed to parse user session in pages.js:', e);
    }
  } else {
    // Update drawer menu profile label to Log in and hide logout link
    if (profileLink) {
      const span = profileLink.querySelector('span');
      if (span) span.textContent = state.lang === 'en' ? 'Log in' : 'Se connecter';
    }
    if (logoutLink) {
      logoutLink.setAttribute('hidden', '');
    }
  }

  // Redirect click to standalone profile page
  userTrigger.addEventListener('click', () => {
    window.location.href = './profile.html';
  });

  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('cinechroma_user');
      window.location.href = './index.html';
    });
  }
}

// Apply language updates
function applyLang(lang) {
  state.lang = lang;
  localStorage.setItem('cinechroma_lang', lang);
  document.documentElement.lang = lang;

  const drawerLangLabel = $('#drawer-lang-label');
  if (drawerLangLabel) {
    drawerLangLabel.textContent = lang === 'fr' ? 'Langue : Français (FR)' : 'Language: English (EN)';
  }

  $$('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  const contactName = $('#contact-name');
  const contactEmail = $('#contact-email');
  const contactMessage = $('#contact-message');
  if (contactName) contactName.placeholder = lang === 'en' ? 'Your name' : 'Votre nom';
  if (contactEmail) contactEmail.placeholder = lang === 'en' ? 'name@example.com' : 'nom@exemple.com';
  if (contactMessage) contactMessage.placeholder = lang === 'en' ? 'Your message...' : 'Votre message...';

  // Initialize/rebuild letters hover effects on current translated titles
  initTitleLetters();
}

// Apply theme updates
function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('cinechroma_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const next = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
}

// Navigation Menu Handlers
function openNavMenu() {
  const menu = $('#nav-menu');
  const trigger = $('#burger-trigger');
  if (menu) menu.removeAttribute('hidden');
  if (trigger) trigger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// 4-Tab switcher logic for About page (natural body flow)
const ABOUT_TABS = [
  { btn: 'about-tab-project', view: 'about-project-view' },
  { btn: 'about-tab-tech', view: 'about-tech-view' },
  { btn: 'about-tab-features', view: 'about-features-view' },
  { btn: 'about-tab-legal', view: 'about-legal-view' }
];

let _isScrollingToTab = false;
let _scrollTimeout = null;

function switchAboutTab(activeBtnId) {
  const tab = ABOUT_TABS.find(t => t.btn === activeBtnId);
  if (!tab) return;
  const view = document.getElementById(tab.view);
  if (view) {
    _isScrollingToTab = true;
    clearTimeout(_scrollTimeout);

    // Highlight button immediately on click
    ABOUT_TABS.forEach(t => {
      const btn = document.getElementById(t.btn);
      if (btn) btn.classList.toggle('active', t.btn === activeBtnId);
    });

    // Offset: header (80px) + sticky tab bar (~54px) + small gap
    const yOffset = -148;
    const y = view.getBoundingClientRect().top + window.pageYOffset + yOffset;
    
    window.scrollTo({ top: y, behavior: 'smooth' });

    // Allow scroll tracking to resume after smooth scroll ends
    _scrollTimeout = setTimeout(() => {
      _isScrollingToTab = false;
    }, 800);
  }
}

// Track page scroll to highlight current active section button
function handleAboutScroll() {
  if (_isScrollingToTab) return;

  let activeTab = ABOUT_TABS[0].btn;
  ABOUT_TABS.forEach(tab => {
    const view = document.getElementById(tab.view);
    if (!view) return;
    const rect = view.getBoundingClientRect();
    // Check if the top of the section has reached near sticky bar height (header + tab bar)
    if (rect.top <= 160) {
      activeTab = tab.btn;
    }
  });

  ABOUT_TABS.forEach(tab => {
    const btn = document.getElementById(tab.btn);
    if (btn) {
      btn.classList.toggle('active', tab.btn === activeTab);
    }
  });
}

function closeNavMenu() {
  const menu = $('#nav-menu');
  const trigger = $('#burger-trigger');
  if (menu) menu.setAttribute('hidden', '');
  if (trigger) trigger.classList.remove('open');
  document.body.style.overflow = '';
}

// Custom simple toast alert
let _toastTimer = null;
function showToast(msg) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// Formspree Submissions Handler via Fetch API
async function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const action = form.action;

  if (action.includes('YOUR_FORMSPREE_ID_HERE')) {
    // Show user feedback explaining config requirements
    showToast(t('contact_success') + ' (Mode démo - configurer votre ID Formspree dans contact.html)');
    form.reset();
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = state.lang === 'en' ? 'Sending...' : 'Envoi en cours...';

  try {
    const data = new FormData(form);
    const response = await fetch(action, {
      method: 'POST',
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      showToast(t('contact_success'));
      form.reset();
    } else {
      showToast(t('contact_error'));
    }
  } catch (error) {
    showToast(state.lang === 'en' ? 'Network error, please check connection.' : 'Erreur réseau, veuillez vérifier votre connexion.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function bindEvents() {
  const themeToggle = $('#theme-toggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

  const burgerTrigger = $('#burger-trigger');
  if (burgerTrigger) burgerTrigger.addEventListener('click', openNavMenu);

  const menuClose = $('#nav-menu-close');
  if (menuClose) menuClose.addEventListener('click', closeNavMenu);

  const backdrop = $('#nav-menu-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeNavMenu);

  const langDrawer = $('#lang-switch-drawer');
  if (langDrawer) {
    langDrawer.addEventListener('click', () => {
      applyLang(state.lang === 'fr' ? 'en' : 'fr');
    });
  }

  // Bind 4-tab click events
  ABOUT_TABS.forEach(tab => {
    const btn = document.getElementById(tab.btn);
    if (btn) {
      btn.addEventListener('click', () => switchAboutTab(tab.btn));
    }
  });

  // Bind about scroll listener if on about page
  if (document.getElementById('about-tab-project')) {
    window.addEventListener('scroll', handleAboutScroll);
    handleAboutScroll();
  }

  const contactForm = $('#contact-form');
  if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

  // Close with Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const menu = $('#nav-menu');
      if (menu && !menu.hasAttribute('hidden')) closeNavMenu();
    }
  });
}

function setupPageTransitions() {
  document.body.classList.add('page-ready');
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    const target = link.getAttribute('target');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || target === '_blank' || href.startsWith('mailto:')) {
      return;
    }
    // Check if staying on the same page
    const pathname = window.location.pathname;
    const isSamePage = href === '#' || href === './index.html#' || 
                       (href.includes('about.html') && pathname.includes('about.html')) ||
                       (href.includes('contact.html') && pathname.includes('contact.html'));
    if (isSamePage) return;
    
    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => {
      window.location.href = href;
    }, 250);
  });
}

(function init() {
  applyTheme(state.theme);
  applyLang(state.lang);
  initUserSession();
  bindEvents();
  setupPageTransitions();
  
  // Listen to system theme updates
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('cinechroma_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

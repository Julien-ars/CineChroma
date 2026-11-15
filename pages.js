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
    stat_posters_val:    '99 252',
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
    features_feat1_desc: "Choisissez précisément votre teinte cible via notre nuanceur bidimensionnel (Saturation × Clarté) et combinez jusqu'à 5 teintes simultanées. Ce sélecteur vous permet de filtrer finement la base de données de films selon des accords de couleurs complexes.",
    features_feat2_title:'Recherche par Image (Dropzone)',
    features_feat2_desc: "Glissez-déposez n'importe quel visuel, capture d'écran ou photo dans le module d'importation. L'algorithme K-Means intégré extrait sa palette en quelques millisecondes et identifie instantanément les affiches possédant la même signature esthétique.",
    features_feat3_title:'Ajout d\'Œuvres & Import TMDb en Direct',
    features_feat3_desc: "Un film, une série télévisée ou un animé n'est pas encore répertorié ? Recherchez-le directement parmi les millions de titres du catalogue mondial TMDb. En un instant, CineChroma télécharge les affiches officielles, calcule ses palettes dominantes K-Means et l'intègre immédiatement à votre galerie.",
    features_feat4_title:'Synchronisation & Actualisation Automatisée',
    features_feat4_desc: "Pour garantir des données toujours fraîches sans intervention manuelle, un pipeline automatisé interroge l'API TMDb chaque semaine et pour les sorties récentes. Les chiffres du box-office, budgets, notes critiques et nouvelles affiches officielles sont automatiquement synchronisés et intégrés à la base.",
    features_feat5_title:'Deep Linking par URL',
    features_feat5_desc: "Partagez vos explorations en un clic. Chaque combinaison de filtres, choix de tri ou tolérance chromatique est encodée en temps réel dans les paramètres de la barre d'adresse. Le destinataire du lien verra exactement la même sélection d'affiches.",
    features_feat6_title:'Favoris & Collections Locales',
    features_feat6_desc: "Aucune inscription obligatoire pour commencer ! Organisez vos inspirations en créant des collections thématiques personnalisées ou en ajoutant vos coups de cœur. Vos listes de sélection sont enregistrées localement dans votre navigateur via localStorage.",
    features_coming_soon:'Prochainement',
    features_feat7_title:'Nuage Chromatique 3D',
    features_feat7_desc: "Plongez dans un espace tridimensionnel où chaque affiche est représentée comme un point coloré dans l'espace CIELAB. Ce nuage interactif, rendu en temps réel via WebGL (Three.js), vous permet de naviguer physiquement dans la carte colorimétrique du cinéma mondial.",
    features_feat8_title:'Le Jeu — Quiz Chromatique',
    features_feat8_desc: "Identifiez un film rien qu'à partir de sa palette de couleurs. Ce mini-jeu vous met au défi en 5 manches progressives. Trois indices sont disponibles si vous bloquez, et votre score tient compte de la vitesse et du nombre d'aides demandées.",
    features_feat9_title:'Catalogue Universel d\'Affiches',
    features_feat9_desc: "Explorez la diversité esthétique du cinéma mondial : filtrez et visualisez les affiches textless (sans texte, pour une lecture chromatique pure), les affiches par pays d'origine et les déclinaisons internationales sur chaque fiche de film.",
    features_feat10_title:'Système de Compte & Profil',
    features_feat10_desc: "Créez un compte CineChroma pour personnaliser votre expérience. Choisissez votre avatar, organisez vos favoris en collections nommées et consultez vos statistiques de jeu. Tout reste stocké localement — votre confidentialité est totale.",
    
    // Tab 4: Legal (Amplified)
    about_legal_title:   'Mentions Légales & Crédits',
    legal_section_editor:'Édition & Responsabilité du site',
    legal_editor_desc:   'Le site internet CineChroma (cinechroma.app) est édité et géré par un collectif indépendant d\'artistes numériques, de cinéphiles et de développeurs de logiciels. Ce projet constitue une vitrine d\'expérimentation technique et artistique à but non lucratif visant à analyser et valoriser la composition chromatique des affiches du cinéma mondial. Pour toute question, suggestion ou signalement, un formulaire de contact officiel est accessible depuis la navigation.',
    legal_section_host:  'Hébergement & Sécurité',
    legal_host_desc:     'Le site CineChroma est déployé de manière statique et sécurisée sur une infrastructure cloud internationale à haute disponibilité. Toutes les communications sont protégées par chiffrement HTTPS de bout en bout (protocole TLS 1.3). Aucun serveur applicatif tiers n\'intercepte vos actions de navigation.',
    legal_section_data:  'Données TMDb, Ajout de Films & Propriété Intellectuelle',
    legal_data_desc:     'CineChroma utilise l\'API publique de TMDb (The Movie Database) pour la récupération des métadonnées (titres, dates, genres, budgets, recettes) et l\'importation à la demande de nouvelles œuvres cinématographiques par les utilisateurs. CineChroma n\'est ni affilié ni certifié par TMDb. Les affiches de films, logos et visuels originaux demeurent la propriété intellectuelle exclusive et inaliénable de leurs producteurs, distributeurs et ayants droit respectifs. Leur affichage et leur décomposition colorimétrique (K-Means / CIELAB) sont effectués à titre d\'illustration culturelle, d\'analyse artistique et de recherche non commerciale (Fair Use / droit de courte citation). Si vous êtes titulaire de droits sur une œuvre et souhaitez son retrait immédiat, contactez-nous via notre formulaire : nous traiterons votre demande dans les plus brefs délais.',
    legal_section_cookies:'Données Personnelles, Cookies & Conformité RGPD',
    legal_cookies_desc:  'Conformément au Règlement Général sur la Protection des Données (RGPD) et aux recommandations de la CNIL, CineChroma applique une politique de confidentialité totale par conception (Privacy by Design). Aucun cookie publicitaire, traceur tiers ni outil d\'analyse intrusive (Google Analytics, pixels publicitaires) n\'est déposé sur votre terminal. Vos préférences de navigation, sélections de favoris, collections personnalisées, scores de jeux et films importés sont stockés exclusivement en local dans la mémoire de votre navigateur (localStorage). Vous conservez la maîtrise absolue de vos données et pouvez les réinitialiser à tout moment.',
    
    // Game translations
    game_start_title:    'CINECHROMA QUIZ',
    game_start_desc:     'Testez votre culture cinématographique à travers la couleur.',
    game_rule_1:         'Identifiez l\'œuvre par sa signature chromatique',
    game_rule_2:         '5 manches de difficulté progressive',
    game_rule_3:         '3 indices disponibles en cas de doute',
    game_btn_start:      'Jouer',
    game_round:          'Manche',
    game_score:          'Score :',
    game_difficulty_easy:'Facile',
    game_difficulty_medium:'Moyen',
    game_difficulty_hard:'Difficile',
    game_hint_prefix:    'Indice',
    game_use_hint:       'Obtenir un indice',
    game_hint_3_text:    'Une silhouette floutée de l\'affiche est maintenant visible en arrière-plan.',
    game_next_round:     'Suivant ➔',
    game_see_results:    'Voir les résultats',
    game_hints_used_label:'Indices utilisés : ',
    game_end_title:      'Partie Terminée',
    game_end_score:      'Score final :',
    game_btn_replay:     'Rejouer',

    // Hub & Config
    game_hub_kicker:     'ARCADE CINÉMA',
    game_hub_badge:      'DÉFIS CHROMATIQUES',
    game_hub_title:      'Mini-Jeux',
    game_hub_subtitle:   'Choisissez votre défi chromatique',
    game_hub_back:       '← Retour',
    game_config_title:   'Configuration',
    game_config_start:   'Lancer la partie',
    game_config_difficulty: 'Difficulté',
    game_config_universe: 'Univers',
    game_config_rounds:  'Manches',
    game_config_time:    'Durée',
    game_diff_easy:      'Facile',
    game_diff_medium:    'Moyen',
    game_diff_hard:      'Expert',
    game_diff_mixed:     'Mixte',
    game_universe_all:   'Tous les films',
    game_universe_popular: '🔥 Populaires',
    game_universe_animation: '🎨 Animation',
    game_universe_disney: '🏰 Disney',
    game_universe_marvel: '⚡ Marvel',
    game_universe_dc:    '🦇 DC Comics',
    game_universe_anime: '🌸 Anime',
    game_universe_horreur: '👻 Horreur',
    game_universe_scifi: '🚀 Sci-Fi',
    game_universe_series: '📺 Séries',
    game_rounds_5:       '5 manches',
    game_rounds_10:      '10 manches',
    game_rounds_20:      '20 manches',
    game_time_30:        '30 secondes',
    game_time_60:        '60 secondes',
    game_time_90:        '90 secondes',

    // Quick Play
    game_quick_name:     'Jeu Rapide',
    game_quick_tag:      '⚡ Express',
    game_quick_desc:     'Lancez instantanément une partie de 5 films cultes sans attendre.',

    // CouleurQuiz
    game_cq_name:        'CouleurQuiz',
    game_cq_desc:        'Identifiez le film depuis sa palette de 5 couleurs.',
    game_cq_tag:         'Classique',

    // PalettePure
    game_pp_name:        'PalettePure',
    game_pp_desc:        'Trouvez la couleur manquante parmi les propositions.',
    game_pp_tag:         'Œil Chromatique',
    game_pp_question:    'Quelle est la couleur manquante ?',
    game_pp_correct:     'Bonne couleur !',
    game_pp_wrong:       'Mauvaise couleur',

    // ChronoChroma
    game_cc_name:        'ChronoChroma',
    game_cc_desc:        'Course contre la montre. Maximum de bonnes réponses avant la fin du temps.',
    game_cc_tag:         'Vitesse',
    game_cc_time_left:   'Temps restant',
    game_cc_films_done:  'Films répondus',
    game_cc_end_title:   'Temps écoulé !',
    game_cc_end_score:   'Films trouvés :',

    // AfficheFlou
    game_af_name:        'AfficheFlou',
    game_af_desc:        'Une affiche floue, un titre à deviner. L\'image se révèle progressivement.',
    game_af_tag:         'Visuel',
    game_af_reveal_more: 'Révéler un peu plus',
    game_af_blur_tip:    'Flou',
    game_af_blur_tip_1:  'Très flou',
    game_af_blur_tip_2:  'Flou',
    game_af_blur_tip_3:  'Moins flou',
    game_af_blur_tip_4:  'Révélé',

    game_best_score:     'Meilleur score',
    game_accuracy:       'Précision',
    game_hints_total:    'Indices utilisés',
    game_play_again:     'Rejouer',
    game_change_game:    'Changer de jeu',

    // Shared Profile & Index missing translations
    download_poster:     'Télécharger l\'affiche',
    watch_trailer:       'Bande-annonce',
    director:            'Réalisateur',
    release:             'Sortie',
    runtime:             'Durée',
    language:            'Langue',
    budget:              'Budget',
    revenue:             'Recettes',
    refresh_data_hint:   'Actualisation recommandée : film récent ou données financières manquantes',
    refresh_data_std:    'Actualiser les données TMDb (budget, recettes, note...)',
    refresh_tmdb_data:   'Actualiser les données TMDb (budget, recettes...)',
    data_updated_success:'Données TMDb actualisées avec succès !',
    recent_release_badge:'Film Récent',
    nav_add_movie:       'Ajouter une œuvre',
    add_movie_title:     'Ajouter une œuvre',
    add_movie_desc:      'Recherchez un film, une série ou un animé sur TMDb pour calculer ses palettes et l\'intégrer instantanément.',
    add_movie_placeholder:'Titre du film, de la série ou de l\'animé...',
    add_movie_from_tmdb: 'Ajouter depuis TMDb',
    film_not_found_prompt:'L\'œuvre que vous cherchez n\'est pas encore sur CineChroma ?',
    film_added_success:  'Œuvre ajoutée avec succès !',
    tmdb_direct_import:  'IMPORTATION TMDB',
    chromatic_palette:   'Palette',
    palette_hint:        'cliquer pour filtrer',
    learn_more:          'Source : TMDb',
    collection_name:     'Nom de la collection',
    collection_desc:     'Description (optionnelle)',
    create_collection_btn:'Créer la collection',
    auth_choose_avatar:  'Choisissez votre avatar',
    auth_username:       'Nom d\'utilisateur',
    auth_email:          'Adresse Email',
    auth_username_email: 'Email ou Pseudo',
    auth_password:       'Mot de passe',
    register_btn:        'Créer mon compte',
    new_collection:      'Nouvelle Collection',
    copied_hex:          'Code copié dans le presse-papier !',
    register_hero_desc:  'Rejoignez la communauté CineChroma et organisez vos collections d\'affiches.',
    register_step1_title: 'Quelle est votre adresse e-mail ?',
    register_step1_desc: 'Nous utiliserons cette adresse pour sécuriser votre compte et synchroniser vos collections.',
    register_step1_placeholder: 'alexandre@exemple.com',
    register_step1_error: 'Veuillez entrer une adresse e-mail valide.',
    register_step2_title: 'Choisissez un mot de passe',
    register_step2_desc: 'Créez un mot de passe sécurisé comportant au moins 6 caractères.',
    register_step2_error: 'Le mot de passe doit contenir au moins 6 caractères.',
    register_step3_title: 'Quel est votre nom ?',
    register_step3_desc: 'Comment devrions-nous vous appeler ? Entrez votre nom complet.',
    register_step3_placeholder: 'Alexandre Dupont',
    register_step3_error: 'Veuillez entrer votre nom.',
    register_step4_title: 'Quel âge avez-vous ?',
    register_step4_desc: 'Cette information nous aide à personnaliser votre expérience (doit être supérieur ou égal à 13 ans).',
    register_step4_error: 'Veuillez entrer un âge valide (minimum 13 ans).',
    register_step5_title: 'Pseudo & Avatar',
    register_step5_desc: 'Choisissez votre pseudonyme unique et votre avatar d\'animal coloré pour finaliser la création.',
    register_step5_error: 'Veuillez entrer un nom d\'utilisateur.',
    suggestions:         'Suggestions :',
    choose_avatar:       'Choisissez votre avatar :',
    already_registered:  'Déjà inscrit ?',
    register_step_x_of_y: 'Étape {current} sur {total}',
    next:                'Suivant',
    back:                'Retour',
    register_toast_success: 'Compte créé avec succès !',
    search_by_image:     'Rechercher par image',
    pick_color_btn_title: 'Choisir une couleur',
    change_language:     'Changer la langue',
    toggle_theme:        'Inverser les couleurs',
    user_profile_title:  'Mon Profil / Connexion',
    navigation:          'Navigation',
    filter_mode_or_desc_short: 'une couleur suffit',
    filter_mode_and_desc_short: 'toutes requises',
    filters_menu_short:  'Filtres',
    pick_color:          'Couleur',

    // Profile page translations
    profile_full_name:   'Nom complet',
    profile_age:         'Âge',
    profile_save_btn:    'Sauvegarder les modifications',
    profile_login_title: 'Connexion à votre espace',
    profile_login_subtitle:'Connectez-vous pour retrouver vos favoris et vos collections d\'affiches.',
    profile_no_account:  'Pas encore de compte ?',
    profile_info_name:   'Nom complet :',
    profile_info_age:    'Âge :',
    profile_info_joined: 'Rejoint le :',
    profile_btn_edit:    'Modifier mon profil',
    profile_empty_likes_title:'Aucun favori pour le moment',
    profile_empty_likes_desc:'Explorez le catalogue et ajoutez des affiches à vos favoris en cliquant sur l\'icône de cœur.',
    profile_btn_explore_gallery:'Explorer la galerie',
    profile_collections_subtitle:'Mes sélections personnalisées',
    profile_btn_create_collection:'+ Nouvelle collection',
    profile_empty_cols_title:'Aucune collection créée',
    profile_empty_cols_desc:'Regroupez vos affiches préférées dans des collections thématiques personnalisées.',
    profile_btn_back_to_cols:'Retour aux collections',
    profile_btn_edit_col:'Modifier',
    profile_btn_delete_col:'Supprimer',
    profile_empty_col_detail_title:'Cette collection est vide',
    profile_empty_col_detail_desc:'Naviguez sur la galerie principale et utilisez l\'icône de marque-page d\'une affiche pour l\'ajouter à cette collection.',
    profile_btn_browse_posters:'Parcourir les affiches',
    profile_toast_saved: 'Profil enregistré !',
    profile_toast_col_updated:'Collection mise à jour.',
    profile_toast_col_created:'Collection créée avec succès !',
    profile_toast_empty_cols:'Aucune collection créée pour le moment.',
    profile_confirm_delete_col:'Voulez-vous vraiment supprimer la collection "{name}" ?',
    profile_toast_col_deleted:'Collection supprimée.',
    profile_toast_fav_removed:'Retiré des favoris.',
    profile_toast_fav_added: 'Ajouté aux favoris !',
    profile_toast_col_removed:'Retiré de la collection.',
    profile_toast_col_added_to:'Ajouté à la collection "{name}"',
    profile_toast_col_removed_from:'Retiré de la collection "{name}"',
    profile_toast_login_success:'Connexion réussie !',
    profile_toast_logout_success:'Déconnecté avec succès.',
    profile_toast_db_error:'Erreur de chargement de la base de données.',
    profile_col_empty_folder:'Dossier vide',
    profile_col_no_desc: 'Sans description',
    profile_col_any_no_desc:'Aucune description',
    profile_summary_no_available:'Résumé non disponible.',
    profile_unknown_title:'Titre inconnu',
    profile_unknown_director:'Inconnu',
    profile_unknown_year: 'Inconnue',
    season_general:      'Général',
    season_special:      'Spécial',
    season_short:        'S',
    season_singular:     'saison',
    seasons_plural:      'saisons',
    episode_singular:    'épisode',
    episodes_plural:     'épisodes'
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
    stat_posters_val:    '99,252',
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
    features_feat1_desc: 'Precisely choose your target shade via our two-dimensional shader (Saturation × Lightness) and combine up to 5 simultaneous colors. This picker allows you to finely filter the movie database according to complex color harmonies.',
    features_feat2_title:'Image Search (Dropzone)',
    features_feat2_desc: 'Drag and drop any visual, screenshot, or photo into the dropzone. The built-in K-Means algorithm extracts its palette in milliseconds and instantly identifies posters sharing the same aesthetic signature.',
    features_feat3_title:'Direct TMDb Import for Movies, Series & Anime',
    features_feat3_desc: 'Can\'t find a recent film, TV show, or anime? Search directly across millions of titles in the global TMDb catalog. In seconds, CineChroma downloads official posters, computes K-Means dominant color palettes, and seamlessly adds the title to your live gallery.',
    features_feat4_title:'Automated Data Synchronization',
    features_feat4_desc: 'To ensure data remains accurate without manual intervention, an automated background pipeline polls the TMDb API weekly and for recent releases. Box office numbers, budgets, ratings, and newly published official posters are automatically refreshed and committed to the database.',
    features_feat5_title:'URL Deep Linking',
    features_feat5_desc: 'Share your explorations in one click. Every filter combination, sorting option, or color tolerance threshold is encoded in real time in address bar parameters (deep linking). Anyone opening the link will see the exact same poster selection.',
    features_feat6_title:'Favorites & Local Collections',
    features_feat6_desc: 'No registration required to start! Organize your inspirations by creating custom themed collections or adding films to your favorites. Your lists are stored locally in your browser via localStorage.',
    features_coming_soon:'Coming Soon',
    features_feat7_title:'3D Chromatic Cloud',
    features_feat7_desc: 'Dive into a three-dimensional space where each poster is represented as a colored point in CIELAB space. This interactive cloud, rendered in real time via WebGL (Three.js), lets you physically navigate through the colorimetric map of world cinema.',
    features_feat8_title:'The Game — Chromatic Quiz',
    features_feat8_desc: 'Can you identify a film just from its color palette? This cinematic mini-game challenges you across 5 rounds of progressive difficulty. Three hints are available if you get stuck, and your score factors in speed and hints used.',
    features_feat9_title:'Universal Poster Catalog',
    features_feat9_desc: 'Explore the aesthetic diversity of world cinema: filter and discover textless posters (typography-free, for pure chromatic reading), posters by country of origin, and international variants on every movie card.',
    features_feat10_title:'Account System & Profile',
    features_feat10_desc: 'Create a CineChroma account to personalize your experience. Choose your avatar, organize your favorites into named collections, and track your game statistics. Everything stays stored locally — your privacy is total.',
    
    // Tab 4: Legal (Amplified)
    about_legal_title:   'Legal Notice & Credits',
    legal_section_editor:'Website Publication & Governance',
    legal_editor_desc:   'The CineChroma website (cinechroma.app) is published and managed by an independent collective of digital artists, film lovers, and software developers. This project constitutes a non-profit technical and artistic showcase aimed at exploring and analyzing the chromatic composition of world cinema posters. For inquiries or feedback, a dedicated contact form is available directly from the navigation menu.',
    legal_section_host:  'Hosting & Security',
    legal_host_desc:     'The CineChroma website is statically and securely deployed on global high-availability cloud infrastructure. All communications are protected by end-to-end HTTPS encryption (TLS 1.3). No third-party dynamic application servers intercept your browsing actions.',
    legal_section_data:  'TMDb Data, Movie Additions & Intellectual Property',
    legal_data_desc:     'CineChroma uses the public API of TMDb (The Movie Database) to retrieve metadata (titles, release dates, genres, budgets, revenues) and support on-demand movie additions by users. CineChroma is neither affiliated with nor certified by TMDb. Original film posters, artwork, and logos remain the exclusive intellectual property of their respective production studios, distributors, and copyright owners. Display and colorimetric decomposition (K-Means / CIELAB) are conducted strictly for cultural illustration, artistic critique, and non-commercial visual analysis under Fair Use and citation rights. If you hold rights to an artwork and request its immediate removal, please contact us through our form.',
    legal_section_cookies:'Personal Data, Cookies & GDPR Compliance',
    legal_cookies_desc:  'In strict compliance with the General Data Protection Regulation (GDPR), CineChroma operates on a Privacy by Design model. No tracking cookies, ad trackers, or invasive analytics pixels (e.g. Google Analytics) are installed on your device. Your browsing preferences, favorites, custom collections, game scores, and newly imported movies are stored solely in your browser\'s local storage (localStorage). You retain full ownership and control over your data and can reset it at any time.',

    // Game translations
    game_start_title:    'CINECHROMA QUIZ',
    game_start_desc:     'Test your movie knowledge through color.',
    game_rule_1:         'Identify the movie by its chromatic signature',
    game_rule_2:         '5 rounds of progressive difficulty',
    game_rule_3:         '3 hints available if you are stuck',
    game_btn_start:      'Play',
    game_round:          'Round',
    game_score:          'Score:',
    game_difficulty_easy:'Easy',
    game_difficulty_medium:'Medium',
    game_difficulty_hard:'Hard',
    game_hint_prefix:    'Hint',
    game_use_hint:       'Get a hint',
    game_hint_3_text:    'A blurry silhouette of the poster is now visible in the background.',
    game_next_round:     'Next ➔',
    game_see_results:    'See Results',
    game_hints_used_label:'Hints used: ',
    game_end_title:      'Game Over',
    game_end_score:      'Final score:',
    game_btn_replay:     'Play Again',

    // Hub & Config
    game_hub_kicker:     'CINEMA ARCADE',
    game_hub_badge:      'CHROMATIC CHALLENGES',
    game_hub_title:      'Mini-Games',
    game_hub_subtitle:   'Choose your chromatic challenge',
    game_hub_back:       '← Back',
    game_config_title:   'Configuration',
    game_config_start:   'Start Game',
    game_config_difficulty: 'Difficulty',
    game_config_universe: 'Universe',
    game_config_rounds:  'Rounds',
    game_config_time:    'Duration',
    game_diff_easy:      'Easy',
    game_diff_medium:    'Medium',
    game_diff_hard:      'Expert',
    game_diff_mixed:     'Mixed',
    game_universe_all:   'All Films',
    game_universe_popular: '🔥 Popular Films',
    game_universe_animation: '🎨 Animation',
    game_universe_disney: '🏰 Disney',
    game_universe_marvel: '⚡ Marvel',
    game_universe_dc:    '🦇 DC Comics',
    game_universe_anime: '🌸 Anime',
    game_universe_horreur: '👻 Horror',
    game_universe_scifi: '🚀 Sci-Fi',
    game_universe_series: '📺 TV Series',
    game_rounds_5:       '5 rounds',
    game_rounds_10:      '10 rounds',
    game_rounds_20:      '20 rounds',
    game_time_30:        '30 seconds',
    game_time_60:        '60 seconds',
    game_time_90:        '90 seconds',

    // Quick Play
    game_quick_name:     'Quick Play',
    game_quick_tag:      '⚡ Express',
    game_quick_desc:     'Instantly start a 5-round classic game with no setup.',

    // CouleurQuiz
    game_cq_name:        'ColorQuiz',
    game_cq_desc:        'Identify the film from its 5-color palette.',
    game_cq_tag:         'Classic',

    // PalettePure
    game_pp_name:        'PalettePure',
    game_pp_desc:        'Find the missing color among the options.',
    game_pp_tag:         'Chromatic Eye',
    game_pp_question:    'Which color is missing?',
    game_pp_correct:     'Correct color!',
    game_pp_wrong:       'Wrong color',

    // ChronoChroma
    game_cc_name:        'ChronoChroma',
    game_cc_desc:        'Race against the clock. Get as many correct answers as possible.',
    game_cc_tag:         'Speed',
    game_cc_time_left:   'Time left',
    game_cc_films_done:  'Films answered',
    game_cc_end_title:   'Time\'s up!',
    game_cc_end_score:   'Films found:',

    // AfficheFlou
    game_af_name:        'BlurryPoster',
    game_af_desc:        'A blurry poster, a title to guess. The image is gradually revealed.',
    game_af_tag:         'Visual',
    game_af_reveal_more: 'Reveal a bit more',
    game_af_blur_tip:    'Blurry',
    game_af_blur_tip_1:  'Very blurry',
    game_af_blur_tip_2:  'Blurry',
    game_af_blur_tip_3:  'Less blurry',
    game_af_blur_tip_4:  'Revealed',

    game_best_score:     'Best score',
    game_accuracy:       'Accuracy',
    game_hints_total:    'Hints used',
    game_play_again:     'Play Again',
    game_change_game:    'Change Game',

    // Shared Profile & Index missing translations
    download_poster:     'Download poster',
    watch_trailer:       'Trailer',
    director:            'Director',
    release:             'Release',
    runtime:             'Runtime',
    language:            'Language',
    budget:              'Budget',
    revenue:             'Revenue',
    refresh_data_hint:   'Recommended refresh: recent release or missing financials',
    refresh_data_std:    'Refresh TMDb data (budget, box office, rating...)',
    refresh_tmdb_data:   'Refresh TMDb data (budget, revenue...)',
    data_updated_success:'TMDb data refreshed successfully!',
    recent_release_badge:'Recent Release',
    nav_add_movie:       'Add Media',
    add_movie_title:     'Add a Title',
    add_movie_desc:      'Search for a movie, TV series, or anime on TMDb to extract palettes and add it instantly.',
    add_movie_placeholder:'Title of movie, series, or anime...',
    add_movie_from_tmdb: 'Add from TMDb',
    film_not_found_prompt:'Can\'t find what you are looking for on CineChroma?',
    film_added_success:  'Title added successfully!',
    tmdb_direct_import:  'TMDB IMPORT',
    chromatic_palette:   'Palette',
    palette_hint:        'click to filter',
    learn_more:          'Source: TMDb',
    collection_name:     'Collection name',
    collection_desc:     'Description (optional)',
    create_collection_btn:'Create collection',
    auth_choose_avatar:  'Choose your avatar',
    auth_username:       'Username',
    auth_email:          'Email address',
    auth_username_email: 'Email or Username',
    auth_password:       'Password',
    register_btn:        'Create my account',
    new_collection:      'New Collection',
    copied_hex:          'Hex code copied to clipboard!',
    register_hero_desc:  'Join the CineChroma community and organize your poster collections.',
    register_step1_title: 'What is your email address?',
    register_step1_desc: 'We will use this address to secure your account and sync your collections.',
    register_step1_placeholder: 'alex@example.com',
    register_step1_error: 'Please enter a valid email address.',
    register_step2_title: 'Choose a password',
    register_step2_desc: 'Create a secure password with at least 6 characters.',
    register_step2_error: 'The password must contain at least 6 characters.',
    register_step3_title: 'What is your name?',
    register_step3_desc: 'How should we call you? Enter your full name.',
    register_step3_placeholder: 'Alex Smith',
    register_step3_error: 'Please enter your name.',
    register_step4_title: 'How old are you?',
    register_step4_desc: 'This information helps us personalize your experience (must be 13 or older).',
    register_step4_error: 'Please enter a valid age (minimum 13 years old).',
    register_step5_title: 'Username & Avatar',
    register_step5_desc: 'Choose your unique username and your colored animal avatar to complete registration.',
    register_step5_error: 'Please enter a username.',
    suggestions:         'Suggestions:',
    choose_avatar:       'Choose your avatar:',
    already_registered:  'Already registered?',
    register_step_x_of_y: 'Step {current} of {total}',
    next:                'Next',
    back:                'Back',
    register_toast_success: 'Account successfully created!',
    search_by_image:     'Search by image',
    pick_color_btn_title: 'Choose a color',
    change_language:     'Change language',
    toggle_theme:        'Toggle theme',
    user_profile_title:  'My Profile / Login',
    navigation:          'Navigation',
    filter_mode_or_desc_short: 'one color is enough',
    filter_mode_and_desc_short: 'all colors required',
    filters_menu_short:  'Filters',
    pick_color:          'Color',

    // Profile page translations
    profile_full_name:   'Full name',
    profile_age:         'Age',
    profile_save_btn:    'Save changes',
    profile_login_title: 'Log in to your space',
    profile_login_subtitle:'Log in to retrieve your favorites and poster collections.',
    profile_no_account:  'No account yet?',
    profile_info_name:   'Full name:',
    profile_info_age:    'Age:',
    profile_info_joined: 'Joined on:',
    profile_btn_edit:    'Edit profile',
    profile_empty_likes_title:'No favorites yet',
    profile_empty_likes_desc:'Explore the catalog and add posters to your favorites by clicking the heart icon.',
    profile_btn_explore_gallery:'Explore gallery',
    profile_collections_subtitle:'My custom selections',
    profile_btn_create_collection:'+ New collection',
    profile_empty_cols_title:'No collections created',
    profile_empty_cols_desc:'Group your favorite posters into custom themed collections.',
    profile_btn_back_to_cols:'Back to collections',
    profile_btn_edit_col:'Edit',
    profile_btn_delete_col:'Delete',
    profile_empty_col_detail_title:'This collection is empty',
    profile_empty_col_detail_desc:'Browse the main gallery and use the bookmark icon of a poster to add it to this collection.',
    profile_btn_browse_posters:'Browse posters',
    profile_toast_saved: 'Profile saved!',
    profile_toast_col_updated:'Collection updated.',
    profile_toast_col_created:'Collection created successfully!',
    profile_toast_empty_cols:'No collections created yet.',
    profile_confirm_delete_col:'Are you sure you want to delete the collection "{name}"?',
    profile_toast_col_deleted:'Collection deleted.',
    profile_toast_fav_removed:'Removed from favorites.',
    profile_toast_fav_added: 'Added to favorites!',
    profile_toast_col_removed:'Removed from collection.',
    profile_toast_col_added_to:'Added to collection "{name}"',
    profile_toast_col_removed_from:'Removed from collection "{name}"',
    profile_toast_login_success:'Log in successful!',
    profile_toast_logout_success:'Logged out successfully.',
    profile_toast_db_error:'Error loading database.',
    profile_col_empty_folder:'Empty folder',
    profile_col_no_desc: 'No description',
    profile_col_any_no_desc:'No description',
    profile_summary_no_available:'Summary not available.',
    profile_unknown_title:'Unknown title',
    profile_unknown_director:'Unknown',
    profile_unknown_year: 'Unknown',
    season_general:      'General',
    season_special:      'Special',
    season_short:        'S',
    season_singular:     'season',
    seasons_plural:      'seasons',
    episode_singular:    'episode',
    episodes_plural:     'episodes'
  },
  ja: {
      nav_gallery:         'ギャラリー',
      favorites:           'お気に入り',
      nav_collections:     'コレクション',
      nav_profile:         'プロフィール',
      login:               'ログイン',
      register:            '登録',
      logout:              'ログアウト',
      nav_contact:         'お問い合わせ',
      nav_about:           '詳細情報',
      nav_game:            'クイズ',
      tab_likes:           'お気に入り',
      tab_collections:     'コレクション',
      
      // Contact translations
      contact_badge_text:  'CineChroma 公式チャンネル',
      contact_title:       'お問い合わせ',
      contact_hero_title:  'つながりを保つ',
      contact_subtitle:    'CineChromaに関するご質問、フィードバック、ご提案がございましたら、メッセージをお送りください。できる限り早く返信いたします。',
      contact_name:        '名前 / ニックネーム',
      contact_email:       'メールアドレス',
      contact_message:     'メッセージ',
      contact_send:        'メッセージを送信',
      contact_success:     'メッセージが正常に送信されました！(デモモード - contact.htmlでFormspree IDを設定してください)',
      contact_error:       'メッセージの送信中にエラーが発生しました。もう一度お試しください。',
      
      // About headers and badge
      about_badge_text:    'バージョン 1.0 — 色彩地図',
      about_hero_title:    '映画の色彩豊かな魂を明らかにする',
      about_hero_subtitle: 'CineChromaは、世界の映画ポスターを色彩スペクトルを通じて分解する、インタラクティブなウェブデザインとデータサイエンスの実験です。',
      
      // Metrics
      stat_posters_val:    '99,252',
      stat_posters_lbl:    'HDポスター',
      stat_space_val:      'LAB',
      stat_space_lbl:      '知覚空間',
      stat_kmeans_val:     'K-Means',
      stat_kmeans_lbl:     'ローカル抽出',
      stat_clientside_val: '100%',
      stat_clientside_lbl: '無料＆オープン',
      
      back_gallery:        'ポスターギャラリーに戻る',
      
      // Tabs
      about_project_tab:   'プロジェクト',
      about_tech_tab:      '科学とアルゴリズム',
      about_features_tab:  '機能',
      about_legal_tab:     '法的通知',
      
      // Tab 1: Project
      project_heading:     '映画を探索する新しい方法',
      project_intro:       'すべての映画作品には、独自の視覚的刻印があります。スクリーンに最初のカットが表示される前から、映画ポスターは色のパレットを通じて感情、ジャンル、心理的緊張感を伝えています。グラフィックデザイナーやアートディレクターが選ぶ主要な色は、決して偶然ではありません。CineChromaは、映画ファン、デザイナー、そして知的好奇心旺盛な人々に、この色彩シグネチャに基づく視覚的な検索エンジンを提供し、色彩という角度から映画の歴史を再発見してもらうために作成されました。カタログを閲覧すると、魅力的な相関関係に気づくでしょう。心理スリラーの鮮やかな赤、メランコリックなドラマの冷たく不飽和な青、あるいはウェス・アンダーソン、スタンリー・キューブリック、デニス・ヴィルヌーヴといった強い視覚的アイデンティティを持つ監督に特徴的な、飽和した高コントラスト of パレットなどです。',
      project_feat1_title: '映画のキュレーション',
      project_feat1_desc:  '世界の映画遺産から厳選され、常に充実している20,000枚以上のポスターセレクション。白黒のクラシックから現代のブロックバスターまで、各映画は公式のTMDbメタデータで詳細に索引付けされており、視覚パレットをジャンル、公開年、監督などの基準に即座に関連付けることができます。',
      project_feat2_title: '高精度LAB分析',
      project_feat2_desc:  '主要なカラーパレットはおおよそで推定されているわけではありません。オリジナルポスターの色彩分布と密度をピクセルごとに分析して計算されています。抽出された色合いは、映画の視覚クリエイターが意図した美的構造を忠実に再現するために、相対的な重要度順にソートされています。',
      visualizer_title:    '抽出パレット例 (ブレードランナー 2049)',
      visualizer_sub:      '5つのK-Meansクラスター',
      
      // Tab 2: Science & Algorithm
      tech_heading:        '仕組み：色彩処理',
      tech_intro:          '人間的で現実的な方法で色を比較するために、従来のRGB（赤、緑、青）空間だけでは不十分です。CineChromaは、CIELAB（LAB）空間変換とK-Meansクラスタリングアルゴリズムを使用しています。この数学的組み合わせにより、画面に表示される色の近接性が、人間の目が物理世界で実際に色を知覚する方法と密接に一致します。',
      tech_feat1_title:    '1. CIELAB知覚空間',
      tech_feat1_desc:     '各画面の技術的特性に直接依存するRGBストレージ形式とは異なり、CIELAB空間は明度（L）を色彩色軸a（緑-赤軸）およびb（青-黄軸）から分離します。この3次元空間における2つの色間のデルタEユークリッド距離（CIE76）を計算することにより、実際の知覚距離を測定します。これにより、厳密な16進コードがわずかに異なる場合でも、同じ色の雰囲気を共有するポスターを見つけることができます。',
      tech_feat2_title:    '2. ブラウザ内K-Meansクラスタリング',
      tech_feat2_desc:     '独自の画像をインポートすると、ローカル計算スクリプトがパレットを即座に抽出します。K-Meansは、カラーセントロイドの座標を反復的に調整することにより、ピクセルを5つの明確なクラスターにグループ化する非監視クラスタリングアルゴリズムです。このプロセスは、ブラウザのネイティブHTML5 Canvas APIを使用してクライアント側で100%実行されるため、ファイルがサーバーに送信されることはありません。',
      code_comment:        '// CIELAB空間でのデルタE距離計算',
      
      // Tab 3: Features
      features_heading:    'CineChromaの主な機能',
      features_intro:      'モバイルとデスクトップ画面の両方でスムーズにナビゲーションできるように設計されており、視覚的な探索を楽しいものにするためのUXの工夫が満載です。グラフィックデザインのインスピレーションを得て、アイデアを整理するためのプロフェッショナルなツールが揃っています。',
      features_feat1_title:'Cosmos.so風2Dピッカー',
      features_feat1_desc: '2次元シェーダー（彩度 × 明度）を介してターゲットの色合いを正確に選択し、最大5色を同時に組み合わせることができます。このピッカーにより、複雑な色彩調和に従って映画データベースを細かくフィルタリングできます。',
      features_feat2_title:'画像検索 (ドロップゾーン)',
      features_feat2_desc: '画像、スクリーンショット、または写真をドロップゾーンにドラッグ＆ドロップします。内蔵のK-Meansアルゴリズムがミリ秒単位でパレットを抽出し、同じ美的シグネチャを持つポスターを即座に特定します。',
      features_feat3_title:'映画・ドラマ・アニメのTMDb直接インポート',
      features_feat3_desc: '見たい映画、ドラマ、アニメがまだ登録されていませんか？TMDbの世界カタログから直接検索できます。ワンクリックで公式ポスターをダウンロードし、K-Meansカラーパレットを計算して、リアルタイムでギャラリーに追加できます。',
      features_feat4_title:'自動データ同期・更新',
      features_feat4_desc: '手動操作なしで常に最新データを維持するため、バックグラウンドの自動パイプラインが毎週および最新公開作についてTMDb APIと連携します。興行収入、予算、評価、最新の公式ポスターが自動的に更新・同期されます。',
      features_feat5_title:'URLディープリンク',
      features_feat5_desc: 'ワンクリックで探索を共有。フィルターの組み合わせ、ソートオプション、または色の許容基準のしきい値はすべて、アドレスバーのパラメータにリアルタイムでエンコードされます（ディープリンク）。リンクを開いた人は、まったく同じポスターの選択を目にすることになります。',
      features_feat6_title:'お気に入りとローカルコレクション',
      features_feat6_desc: '登録なしですぐに開始できます！カスタムテーマ別コレクションを作成したり、お気に入りに映画を追加してアイデアを整理できます。リストはブラウザのlocalStorageにローカルに保存されます。',
      features_coming_soon:'近日公開',
      features_feat7_title:'3D色彩クラウド',
      features_feat7_desc: '各ポスターがCIELAB空間のカラーポイントとして表される3次元空間に飛び込みましょう。WebGL (Three.js)でリアルタイムに描画されるこのインタラクティブなクラウドにより、世界映画の色彩マップを物理的にナビゲートできます。',
      features_feat8_title:'ゲーム — 色彩クイズ',
      features_feat8_desc: '色彩パレットだけで映画を特定できますか？この映画ミニゲームでは、難易度が上がる5つのラウンドで挑戦します。行き詰まった場合は3つのヒントが利用可能で、スコアは速度と使用したヒントによって決まります。',
      features_feat9_title:'ユニバーサルポスターカタログ',
      features_feat9_desc: '世界映画の多彩な美学を探求：テキストなしポスター（純粋な色彩探索のための文字なしポスター）、原産国別ポスター、国際版ポスターを各映画詳細から自由にフィルタリングして鑑賞できます。',
      features_feat10_title:'アカウントシステムとプロフィール',
      features_feat10_desc: 'CineChromaアカウントを作成して体験をパーソナライズ。アバターを選択し、お気に入りを名前付きコレクションに整理し、ゲーム統計を追跡します。すべてローカルに保存され、プライバシーは完全に守られます。',
      
      // Tab 4: Legal (Amplified)
      about_legal_title:   '法的通知とクレジット',
      legal_section_editor:'サイト運営・管理',
      legal_editor_desc:   'CineChromaウェブサイト（cinechroma.app）は、デジタルアーティスト、映画ファン、ソフトウェア開発者の独立したコレクティブによって運営・管理されています。本プロジェクトは、世界映画ポスターの色彩構成を分析・可視化することを目的とした、非営利の技術的・芸術的実験ショーケースです。ご質問やご連絡は、ナビゲーション内のお問い合わせフォームより承っております。',
      legal_section_host:  'ホスティングとセキュリティ',
      legal_host_desc:     'CineChromaウェブサイトは、グローバルなクラウドインフラサーバー上で静的かつ安全にホストされており、高い可用性と最適な読み込み速度を保証します。通信はエンドツーエンドのHTTPS暗号化（TLS 1.3）で保護されています。サードパーティの動的アプリケーションサーバーはお客様の閲覧操作に介入しません。',
      legal_section_data:  'TMDbデータ、映画の追加および知的財産権',
      legal_data_desc:     'CineChromaは、メタデータ（タイトル、公開日、ジャンル、予算、興行収入）の取得およびユーザーによる映画のオンデマンド追加のために、TMDb (The Movie Database)の公開APIを使用しています。本サイトはTMDbと提携しておらず、公式認定も受けていません。映画のポスター、ロゴ、オリジナルビジュアルは、それぞれの制作スタジオ、配給会社、権利所有者の独占的な知的財産です。その表示および色彩分析（K-Means / CIELAB）は、引用権およびフェアユース（公正利用）の規定に基づき、文化的な図解、芸術的批評、非商業的な視覚分析のみを目的として行われています。もし作品の権利所有者であり、掲載の取り消しをご希望される場合は、お問い合わせフォームよりご連絡いただければ速やかに対応いたします。',
      legal_section_cookies:'個人データ、クッキーおよびGDPRコンプライアンス',
      legal_cookies_desc:  '一般データ保護規則（GDPR）に従い、CineChromaはプライバシー・バイ・デザイン（設計段階からのプライバシー保護）を採用しています。トラッキングクッキー、広告追跡、侵入的な行動分析ツール（Google Analytics等）はお使いの端末に一切配置されません。お気に入り、コレクション、ゲーム履歴、追加された映画はすべてお客様のブラウザのローカルストレージ（localStorage）内にのみ保存されます。ご自身のデータを完全に管理でき、いつでも初期化できます。',
      
      // Game translations
      game_start_title:    'CINECHROMA クイズ',
      game_start_desc:     '色彩を通して映画の知識をテストしましょう。',
      game_rule_1:         '色彩の特徴から映画を特定します',
      game_rule_2:         '難易度が上がる全5ラウンド',
      game_rule_3:         '迷ったときに使える3つのヒント',
      game_btn_start:      'プレイ',
      game_round:          'ラウンド',
      game_score:          'スコア:',
      game_difficulty_easy:'初級',
      game_difficulty_medium:'中級',
      game_difficulty_hard:'上級',
      game_hint_prefix:    'ヒント',
      game_use_hint:       'ヒントを使用',
      game_hint_3_text:    'ポスターのぼやけたシルエットが背景に表示されています。',
      game_next_round:     '次へ ➔',
      game_see_results:    '結果を見る',
      game_hints_used_label:'使用したヒント：',
      game_end_title:      'ゲーム終了',
      game_end_score:      '最終スコア：',
      game_btn_replay:     'もう一度プレイ',

      // Hub & Config
      game_hub_kicker:     'シネマアーケード',
      game_hub_badge:      '色彩の挑戦',
      game_hub_title:      'ミニゲーム',
      game_hub_subtitle:   '色彩チャレンジを選んでください',
      game_hub_back:       '← 戻る',
      game_config_title:   '設定',
      game_config_start:   'ゲームを開始',
      game_config_difficulty: '難易度',
      game_config_universe: 'ユニバース',
      game_config_rounds:  'ラウンド',
      game_config_time:    '時間',
      game_diff_easy:      '初級',
      game_diff_medium:    '中級',
      game_diff_hard:      '上級',
      game_diff_mixed:     'ランダム',
      game_universe_all:   'すべての映画',
      game_universe_popular: '🔥 人気作品',
      game_universe_animation: '🎨 アニメーション',
      game_universe_disney: '🏰 ディズニー',
      game_universe_marvel: '⚡ マーベル',
      game_universe_dc:    '🦇 DCコミックス',
      game_universe_anime: '🌸 日本アニメ',
      game_universe_horreur: '👻 ホラー',
      game_universe_scifi: '🚀 SF作品',
      game_universe_series: '📺 ドラマ・シリーズ',
      game_rounds_5:       '5ラウンド',
      game_rounds_10:      '10ラウンド',
      game_rounds_20:      '20ラウンド',
      game_time_30:        '30秒',
      game_time_60:        '60秒',
      game_time_90:        '90秒',

      // Quick Play
      game_quick_name:     'クイックプレイ',
      game_quick_tag:      '⚡ 即時',
      game_quick_desc:     '設定不要で名作5問のゲームを今すぐ開始します。',

      // CouleurQuiz
      game_cq_name:        'カラークイズ',
      game_cq_desc:        '5色のパレットから映画を当ててください。',
      game_cq_tag:         'クラシック',

      // PalettePure
      game_pp_name:        'パレットピュア',
      game_pp_desc:        '提案の中から欠けている色を見つけてください。',
      game_pp_tag:         '色彩眼',
      game_pp_question:    '欠けている色はどれですか？',
      game_pp_correct:     '正解の色！',
      game_pp_wrong:       '色が違います',

      // ChronoChroma
      game_cc_name:        'クロノクロマ',
      game_cc_desc:        '制限時間内に最大数の映画を当ててください。',
      game_cc_tag:         'スピード',
      game_cc_time_left:   '残り時間',
      game_cc_films_done:  '回答済み',
      game_cc_end_title:   '時間切れ！',
      game_cc_end_score:   '正解数：',

      // AfficheFlou
      game_af_name:        'ポスタークイズ',
      game_af_desc:        'ぼかしたポスターから映画を当ててください。段階的に明らかになっていきます。',
      game_af_tag:         'ビジュアル',
      game_af_reveal_more: 'もっと見せる',
      game_af_blur_tip:    'ぼかし',
      game_af_blur_tip_1:  'とてもぼやけている',
      game_af_blur_tip_2:  'ぼやけている',
      game_af_blur_tip_3:  '少しクリア',
      game_af_blur_tip_4:  '公開',

      game_best_score:     'ベストスコア',
      game_accuracy:       '正答率',
      game_hints_total:    'ヒント使用数',
      game_play_again:     'もう一度',
      game_change_game:    'ゲームを変更',

      // Shared Profile & Index missing translations
      download_poster:     'ポスターをダウンロード',
      watch_trailer:       '予告編',
      director:            '監督',
      release:             '公開日',
      runtime:             '上映時間',
      language:            '言語',
      budget:              '予算',
      revenue:             '興行収入',
      refresh_data_hint:   '推奨される更新：最近の公開作品または未完全な財務データ',
      refresh_data_std:    'TMDbデータを更新（予算、興行収入、評価など）',
      refresh_tmdb_data:   'TMDbデータを更新（予算、興行収入など）',
      data_updated_success:'TMDbデータが正常に更新されました！',
      recent_release_badge:'新作映画',
      nav_add_movie:       '作品を追加',
      add_movie_title:     '作品を追加',
      add_movie_desc:      '映画、ドラマ、アニメをTMDbで検索し、パレットを抽出して即座に追加します。',
      add_movie_placeholder:'映画・ドラマ・アニメのタイトル...',
      add_movie_from_tmdb: 'TMDbから追加',
      film_not_found_prompt:'探している作品はまだCineChromaにありませんか？',
      film_added_success:  '作品が正常に追加されました！',
      tmdb_direct_import:  'TMDBインポート',
      chromatic_palette:   'パレット',
      palette_hint:        'クリックしてフィルタリング',
      learn_more:          'ソース: TMDb',
      collection_name:     'コレクション名',
      collection_desc:     '説明（任意）',
      create_collection_btn:'コレクションを作成',
      auth_choose_avatar:  'アバターを選択',
      auth_username:       'ユーザー名',
      auth_email:          'メールアドレス',
      auth_username_email: 'メールまたはユーザー名',
      auth_password:       'パスワード',
      register_btn:        'アカウントを作成',
      new_collection:      '新しいコレクション',
      copied_hex:          '16進数コードがクリップボードにコピーされました！',
      register_hero_desc:  'CineChromaコミュニティに参加して、ポスターコレクションを整理しましょう。',
      register_step1_title: 'メールアドレスを教えてください。',
      register_step1_desc: 'このアドレスは、アカウントの保護とコレクションの同期に使用されます。',
      register_step1_placeholder: 'name@example.com',
      register_step1_error: '有効なメールアドレスを入力してください。',
      register_step2_title: 'パスワードを設定してください。',
      register_step2_desc: '6文字以上の安全なパスワードを作成してください。',
      register_step2_error: 'パスワードは6文字以上にする必要があります。',
      register_step3_title: 'お名前を教えてください。',
      register_step3_desc: 'どのようにお呼びすればよろしいですか？フルネームを入力してください。',
      register_step3_placeholder: '田中 太郎',
      register_step3_error: 'お名前を入力してください。',
      register_step4_title: 'ご年齢を教えてください。',
      register_step4_desc: 'この情報は体験をパーソナライズするのに役立ちます（13歳以上である必要があります）。',
      register_step4_error: '有効な年齢を入力してください（最低13歳）。',
      register_step5_title: 'ユーザー名とアバター',
      register_step5_desc: '固有のユーザー名とカラフルな動物のアバターを選択して、登録を完了します。',
      register_step5_error: 'ユーザー名を入力してください。',
      suggestions:         '候補：',
      choose_avatar:       'アバターを選択してください：',
      already_registered:  '登録済みですか？',
      register_step_x_of_y: 'ステップ {current} / {total}',
      next:                '次へ',
      back:                '戻る',
      register_toast_success: 'アカウントが正常に作成されました！',
      search_by_image:     '画像で検索',
      pick_color_btn_title: '色を選択',
      change_language:     '言語を変更',
      toggle_theme:        'テーマを切り替え',
      user_profile_title:  'プロフィール / ログイン',
      navigation:          'ナビゲーション',
      filter_mode_or_desc_short: 'いずれかの色に一致',
      filter_mode_and_desc_short: 'すべての色に一致',
      filters_menu_short:  'フィルター',
      pick_color:          '色',

      // Profile page translations
      profile_full_name:   'フルネーム',
      profile_age:         '年齢',
      profile_save_btn:    '変更を保存',
      profile_login_title: 'スペースへログイン',
      profile_login_subtitle:'ログインしてお気に入りやコレクションを同期します。',
      profile_no_account:  'アカウントをお持ちでないですか？',
      profile_info_name:   'フルネーム：',
      profile_info_age:    '年齢：',
      profile_info_joined: '登録日：',
      profile_btn_edit:    'プロフィールを編集',
      profile_empty_likes_title:'お気に入りはまだありません',
      profile_empty_likes_desc:'カタログを探索し、ハートアイコンをクリックしてお気に入りにポスターを追加してください。',
      profile_btn_explore_gallery:'ギャラリーを探索',
      profile_collections_subtitle:'カスタムセレクション',
      profile_btn_create_collection:'＋ 新しいコレクション',
      profile_empty_cols_title:'作成されたコレクションはありません',
      profile_empty_cols_desc:'お気に入りのポスターをカスタムテーマ別コレクションにグループ化します。',
      profile_btn_back_to_cols:'コレクションに戻る',
      profile_btn_edit_col:'編集',
      profile_btn_delete_col:'削除',
      profile_empty_col_detail_title:'このコレクションは空です',
      profile_empty_col_detail_desc:'メインギャラリーを探索し、ポスターのブックマークアイコンを使用してお気に入りに追加します。',
      profile_btn_browse_posters:'ポスターをブラウズ',
      profile_toast_saved: 'プロフィールを保存しました！',
      profile_toast_col_updated:'コレクションを更新しました。',
      profile_toast_col_created:'コレクションを作成しました！',
      profile_toast_empty_cols:'コレクションはまだ作成されていません。',
      profile_confirm_delete_col:'コレクション「{name}」を削除してもよろしいですか？',
      profile_toast_col_deleted:'コレクションを削除しました。',
      profile_toast_fav_removed:'お気に入りから削除しました。',
      profile_toast_fav_added: 'お気に入りに追加しました！',
      profile_toast_col_removed:'コレクションから削除しました。',
      profile_toast_col_added_to:'コレクション「{name}」に追加しました',
      profile_toast_col_removed_from:'コレクション「{name}」から削除しました',
      profile_toast_login_success:'ログインに成功しました！',
      profile_toast_logout_success:'ログアウトしました。',
      profile_toast_db_error:'データベースの読み込みエラー。',
      profile_col_empty_folder:'空のフォルダ',
      profile_col_no_desc: '説明なし',
      profile_col_any_no_desc:'説明なし',
      profile_summary_no_available:'概要は利用できません。',
      profile_unknown_title:'不明なタイトル',
      profile_unknown_director:'不明',
      profile_unknown_year: '不明',
      season_general:      '全体',
      season_special:      '特別',
      season_short:        'S',
      season_singular:     'シーズン',
      seasons_plural:      'シーズン',
      episode_singular:    '話',
      episodes_plural:     '話'
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

// --- GENRE DICTIONARY (FR / EN / JA) ---
const GENRE_I18N = {
  'Science-Fiction': { fr: 'Science-Fiction', en: 'Sci-Fi', ja: 'SF' },
  'Action': { fr: 'Action', en: 'Action', ja: 'アクション' },
  'Thriller': { fr: 'Thriller', en: 'Thriller', ja: 'スリラー' },
  'Drame': { fr: 'Drame', en: 'Drama', ja: 'ドラマ' },
  'Aventure': { fr: 'Aventure', en: 'Adventure', ja: 'アドベンチャー' },
  'Crime': { fr: 'Crime', en: 'Crime', ja: '犯罪' },
  'Comédie': { fr: 'Comédie', en: 'Comedy', ja: 'コメディ' },
  'Comédie musicale': { fr: 'Comédie musicale', en: 'Musical', ja: 'ミュージカル' },
  'Biographie': { fr: 'Biographie', en: 'Biography', ja: '伝記' },
  'Histoire': { fr: 'Histoire', en: 'History', ja: '歴史' },
  'Romance': { fr: 'Romance', en: 'Romance', ja: 'ロマンス' },
  'Fantastique': { fr: 'Fantastique', en: 'Fantasy', ja: 'ファンタジー' },
  'Guerre': { fr: 'Guerre', en: 'War', ja: '戦争' },
  'Animation': { fr: 'Animation', en: 'Animation', ja: 'アニメーション' },
  'Horreur': { fr: 'Horreur', en: 'Horror', ja: 'ホラー' },
  'Documentaire': { fr: 'Documentaire', en: 'Documentary', ja: 'ドキュメンタリー' },
  'Mystère': { fr: 'Mystère', en: 'Mystery', ja: 'ミステリー' },
  'Familial': { fr: 'Familial', en: 'Family', ja: 'ファミリー' },
  'Western': { fr: 'Western', en: 'Western', ja: '西部劇' },
  'Musique': { fr: 'Musique', en: 'Music', ja: '音楽' },
  'Téléfilm': { fr: 'Téléfilm', en: 'TV Movie', ja: 'テレビ映画' }
};

function translateGenre(g, lang) {
  if (GENRE_I18N[g]) return GENRE_I18N[g][lang] || g;
  return g;
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
  const current = localStorage.getItem('cinechroma_lang') || 'fr';
  const isInitialLoad = !document.documentElement.lang;
  localStorage.setItem('cinechroma_lang', lang);
  state.lang = lang;
  
  if (lang !== current && !isInitialLoad) {
    location.reload();
    return;
  }

  document.documentElement.lang = lang;

  // Sync drawer pill buttons
  $$('.lang-switch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langVal === lang);
  });

  // Sync header dropdown items + label
  $$('.lang-dropdown-item').forEach(item => {
    item.classList.toggle('active', item.dataset.langVal === lang);
  });
  const headerLangBtn = $('#header-lang-btn');
  if (headerLangBtn) headerLangBtn.textContent = lang.toUpperCase();

  const drawerLangLabel = $('#drawer-lang-label');
  if (drawerLangLabel) {
    drawerLangLabel.textContent = lang === 'fr' ? 'Langue : Français (FR)' : (lang === 'en' ? 'Language: English (EN)' : '言語: 日本語 (JA)');
  }

  // Translate all
  $$('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  $$('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
  $$('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  $$('[data-i18n-aria-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
  });

  const contactName = $('#contact-name');
  const contactEmail = $('#contact-email');
  const contactMessage = $('#contact-message');
  if (contactName) contactName.placeholder = lang === 'en' ? 'Your name' : (lang === 'ja' ? 'お名前' : 'Votre nom');
  if (contactEmail) contactEmail.placeholder = lang === 'en' ? 'name@example.com' : (lang === 'ja' ? 'name@example.com' : 'nom@exemple.com');
  if (contactMessage) contactMessage.placeholder = lang === 'en' ? 'Your message...' : (lang === 'ja' ? 'メッセージ...' : 'Votre message...');

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
    langDrawer.addEventListener('change', (e) => { applyLang(e.target.value); });
  }

  // Drawer pill language buttons
  $$('.lang-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLang(btn.dataset.langVal);
    });
  });

  // Header dropdown language picker
  const headerLangBtn = $('#header-lang-btn');
  const headerLangDropdown = $('#header-lang-dropdown');
  if (headerLangBtn && headerLangDropdown) {
    headerLangBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !headerLangDropdown.hasAttribute('hidden');
      if (isOpen) {
        headerLangDropdown.setAttribute('hidden', '');
        headerLangBtn.setAttribute('aria-expanded', 'false');
      } else {
        headerLangDropdown.removeAttribute('hidden');
        headerLangBtn.setAttribute('aria-expanded', 'true');
      }
    });
    document.addEventListener('click', () => {
      headerLangDropdown.setAttribute('hidden', '');
      headerLangBtn.setAttribute('aria-expanded', 'false');
    });
  }
  $$('.lang-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      applyLang(item.dataset.langVal);
      if (headerLangDropdown) headerLangDropdown.setAttribute('hidden', '');
      if (headerLangBtn) headerLangBtn.setAttribute('aria-expanded', 'false');
    });
  });

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

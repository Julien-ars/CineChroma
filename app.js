/**
 * CineChroma — app.js  v8.0 (Cosmos.so Aesthetic & Flex Multi-Column Engine)
 *
 * 1. Download movie posters directly from modal
 * 2. Cosmos.so style active color list (Dot + #HEX code line + '+' & Trash icon + Plain text 'Effacer la sélection')
 * 3. True Flexbox Multi-Column Masonry Grid (handles large datasets & property aliases smoothly)
 * 4. Minimal '+' button replacing 'Couleur' text in search bar
 */

'use strict';

/* ============================================================
   CONFIGURATION
============================================================ */
const CONFIG = {
  DATA_URL:          './database_films_tmdb_riche.json',
  PAGE_SIZE:         60,
  DEFAULT_SORT:      'popularity',
  DEFAULT_THRESHOLD: 30,
  MAX_COLORS:        5,
  SCROLL_TOP_OFFSET: 350,
};

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
];

/* ============================================================
   GENRE DICTIONARY (FR / EN)
============================================================ */
const GENRE_I18N = {
  'Science-Fiction': { fr: 'Science-Fiction', en: 'Sci-Fi' },
  'Action':           { fr: 'Action',          en: 'Action' },
  'Thriller':         { fr: 'Thriller',        en: 'Thriller' },
  'Drame':            { fr: 'Drame',           en: 'Drama' },
  'Aventure':         { fr: 'Aventure',        en: 'Adventure' },
  'Crime':            { fr: 'Crime',           en: 'Crime' },
  'Comédie':          { fr: 'Comédie',         en: 'Comedy' },
  'Comédie musicale': { fr: 'Comédie musicale',en: 'Musical' },
  'Biographie':       { fr: 'Biographie',      en: 'Biography' },
  'Histoire':         { fr: 'Histoire',        en: 'History' },
  'Romance':          { fr: 'Romance',         en: 'Romance' },
  'Fantastique':      { fr: 'Fantastique',     en: 'Fantasy' },
};

function translateGenre(g, lang) {
  if (GENRE_I18N[g]) return GENRE_I18N[g][lang] || g;
  return g;
}

/* ============================================================
   i18n DICTIONARY
============================================================ */
const I18N = {
  fr: {
    search_placeholder:  'Essayez une couleur…',
    search:              'Rechercher',
    validate:            'Valider',
    pick_color:          'Couleur',
    add_color_btn:       '+ Couleur',
    clear_selection:     'Effacer la sélection',
    tolerance:           'Précision des nuances',
    filter_mode:         'Mode de filtre couleur',
    filter_mode_or_desc: 'OU (au moins 1 couleur)',
    filter_mode_and_desc:'ET (toutes les couleurs)',
    filters_menu:        'Filtres & Navigation',
    filters_menu_short:  'Filtres',
    sort_by:             'Trier par',
    sort_relevance:      'Pertinence colorimétrique',
    sort_popularity:     'Popularité',
    sort_rating:         'Note moyenne',
    sort_date:           'Date de sortie',
    sort_title:          'Ordre alphabétique',
    genres:              'Genres cinématographiques (multi-sélection)',
    reset_all:           'Tout réinitialiser',
    apply:               'Appliquer',
    error_title:         'Impossible de charger la base',
    retry:               'Réessayer',
    no_results:          'Aucune affiche trouvée',
    no_results_hint:     'Essayez de modifier votre recherche ou vos filtres.',
    reset_filters:       'Réinitialiser',
    download_poster:     'Télécharger',
    watch_trailer:       'Bande-annonce',
    chromatic_palette:   'Palette',
    palette_hint:        'cliquer pour filtrer',
    director:            'Réalisateur',
    release:             'Sortie',
    runtime:             'Durée',
    language:            'Langue',
    budget:              'Budget',
    revenue:             'Recettes',
    popularity:          'popularité',
    color_added:         'Couleur ajoutée',
    color_max:           'Maximum 5 couleurs',
    color_removed:       'Couleur retirée',
    favorites:           'Favoris',
    fav_added:           'Ajouté aux favoris',
    fav_removed:         'Retiré des favoris',
    copied_hex:          'Code copié dans le presse-papier !',
    downloading:         'Téléchargement de l\'affiche...',
    download_error:      'Impossible de télécharger directement (clic droit pour enregistrer)',
    nav_gallery:         'Explorer',
    nav_collections:     'Collections',
    collections_title:   'Collections thématiques',
    nav_profile:         'Mon Profil',
    guest_like_prompt:   'Vous pouvez liker sans compte ! Créez un compte gratuit pour synchroniser vos favoris sur tous vos appareils.',
    login:               'Se connecter',
    register:            'Créer un compte',
    logout:              'Se déconnecter',
    tab_likes:           'Mes Favoris',
    tab_collections:     'Mes Collections',
    create_collection:   '+ Créer une collection',
    new_collection:      'Nouvelle Collection',
    collection_name:     'Nom de la collection',
    collection_desc:     'Description (optionnelle)',
    create_collection_btn:'Créer la collection',
    auth_username:       'Nom d\'utilisateur',
    auth_email:          'Adresse Email',
    auth_username_email: 'Email ou Pseudo',
    auth_password:       'Mot de passe',
    auth_choose_avatar:  'Choisissez votre avatar',
    register_btn:        'Créer mon compte',
    login_success:       'Connexion réussie ! Bienvenue',
    register_success:    'Compte créé avec succès !',
    collection_created:  'Collection créée avec succès !',
    collection_deleted:  'Collection supprimée',
    hero_tagline:        'EXPÉRIENCE VISUELLE & CINÉMATOGRAPHIQUE',
    hero_title:          'L\'art du cinéma révélé par la couleur',
    hero_subtitle:       'Explorez plus de 200 affiches sous un nouvel angle. Choisissez une teinte et découvrez instantanément les œuvres qui partagent la même signature esthétique.',
    hero_try_colors:     'Explorez les nuances :',
    hero_btn_explore:    'Explorer la galerie ↓',
    hero_btn_picker:     '🎨 Tester le nuancier',
    hero_btn_signup:     'Créer un compte',
    hero_scroll_hint:    'Découvrir les affiches',
  },
  en: {
    search_placeholder:  'Try a color…',
    search:              'Search',
    validate:            'Confirm',
    pick_color:          'Color',
    add_color_btn:       '+ Color',
    clear_selection:     'Clear selection',
    tolerance:           'Shade Precision',
    filter_mode:         'Color Filter Mode',
    filter_mode_or_desc: 'OR (matches at least 1)',
    filter_mode_and_desc:'AND (matches all colors)',
    filters_menu:        'Filters & Navigation',
    filters_menu_short:  'Filters',
    sort_by:             'Sort by',
    sort_relevance:      'Chromatic Relevance',
    sort_popularity:     'Popularity',
    sort_rating:         'Average Rating',
    sort_date:           'Release Date',
    sort_title:          'Alphabetical',
    genres:              'Movie Genres (multi-select)',
    reset_all:           'Reset All',
    apply:               'Apply',
    error_title:         'Failed to load database',
    retry:               'Retry',
    no_results:          'No posters found',
    no_results_hint:     'Try adjusting your search or filters.',
    reset_filters:       'Reset',
    download_poster:     'Download',
    watch_trailer:       'Trailer',
    chromatic_palette:   'Palette',
    palette_hint:        'click to filter',
    director:            'Director',
    release:             'Release',
    runtime:             'Runtime',
    language:            'Language',
    budget:              'Budget',
    revenue:             'Revenue',
    popularity:          'popularity',
    color_added:         'Color added',
    color_max:           'Maximum 5 colors',
    color_removed:       'Color removed',
    favorites:           'Favorites',
    fav_added:           'Added to favorites',
    fav_removed:         'Removed from favorites',
    copied_hex:          'Hex code copied to clipboard!',
    downloading:         'Downloading poster...',
    download_error:      'Direct download failed (right-click to save)',
    nav_gallery:         'Explore',
    nav_collections:     'Collections',
    collections_title:   'Thematic Collections',
    nav_profile:         'My Profile',
    guest_like_prompt:   'You can like without an account! Create a free account to sync your favorites across devices.',
    login:               'Log in',
    register:            'Sign up',
    logout:              'Log out',
    tab_likes:           'My Favorites',
    tab_collections:     'My Collections',
    create_collection:   '+ Create collection',
    new_collection:      'New Collection',
    collection_name:     'Collection name',
    collection_desc:     'Description (optional)',
    create_collection_btn:'Create collection',
    auth_username:       'Username',
    auth_email:          'Email address',
    auth_username_email: 'Email or Username',
    auth_password:       'Password',
    auth_choose_avatar:  'Choose your avatar',
    register_btn:        'Create my account',
    login_success:       'Log in successful! Welcome',
    register_success:    'Account created successfully!',
    collection_created:  'Collection created successfully!',
    collection_deleted:  'Collection deleted',
    hero_tagline:        'VISUAL & CINEMATIC EXPERIENCE',
    hero_title:          'The art of cinema revealed by color',
    hero_subtitle:       'Explore 200+ movie posters from a new perspective. Pick a shade and instantly discover posters sharing the same aesthetic signature.',
    hero_try_colors:     'Explore shades:',
    hero_btn_explore:    'Explore gallery ↓',
    hero_btn_picker:     '🎨 Try color picker',
    hero_btn_signup:     'Sign up',
    hero_scroll_hint:    'Discover posters',
  },
};

/* ============================================================
   STATE
============================================================ */
const state = {
  allFilms:        [],
  filtered:        [],
  sorted:          [],
  currentPage:     1,
  searchQuery:     '',
  activeGenres:    new Set(),
  activeLanguages: new Set(),
  activeColors:    [],
  filterMode:      'or',
  colorThreshold:  CONFIG.DEFAULT_THRESHOLD,
  sort:            CONFIG.DEFAULT_SORT,
  lang:            localStorage.getItem('cinechroma_lang') || 'fr',
  theme:           localStorage.getItem('cinechroma_theme') || 'light',
  modalFilm:       null,
  modalPosterIndex:0,
  isLoadingMore:   false,
  favorites:       new Set(JSON.parse(localStorage.getItem('cinechroma_favorites') || '[]')),
  user:                    JSON.parse(localStorage.getItem('cinechroma_user') || 'null'),
  collections:             JSON.parse(localStorage.getItem('cinechroma_collections') || '[]'),
  hasSeenGuestLikePrompt:  localStorage.getItem('cinechroma_guest_prompt_seen') === 'true',
  selectedRegisterAvatar:  PRESET_AVATARS[0],
  activeImageSrc:          null,
  
  // Cosmos 2D Picker State
  pickerHue:       0,
  pickerSat:       1,
  pickerVal:       1,
  pickerHex:       '#FF0000',
  editingColorHex: null,
  isDragging2D:    false,
};

/* ============================================================
   DOM REFERENCES
============================================================ */
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const dom = {
  searchInput:          $('#search-input'),
  searchClear:          $('#search-clear'),
  searchColorDot:       $('#search-color-dot'),
  colorPickerTrigger:   $('#color-picker-trigger'),
  themeToggle:          $('#theme-toggle'),
  burgerTrigger:        $('#burger-trigger'),
  langSwitch:           $('#lang-switch'),

  // Sub-navbar
  filterTrigger:        $('#filter-trigger'),
  sortTrigger:          $('#sort-trigger'),
  activeFilterBadge:    $('#active-filter-badge'),
  activeSortLabel:      $('#active-sort-label'),

  // Active Filter Header Bar (Cosmos.so Style)
  activeFilterBar:      $('#active-filter-bar'),
  cosmosColorsRows:     $('#cosmos-colors-rows'),
  activeCountBadge:     $('#active-count-badge'),
  clearAllColorsBtn:    $('#clear-all-colors-btn'),
  
  // Grid / States
  filmGrid:             $('#film-grid'),
  skeletonGrid:         $('#skeleton-grid'),
  errorState:           $('#error-state'),
  errorMessage:         $('#error-message'),
  emptyState:           $('#empty-state'),
  retryBtn:             $('#retry-btn'),
  resetFiltersBtn:      $('#reset-filters-btn'),
  scrollSentinel:       $('#scroll-sentinel'),
  scrollTopBtn:         $('#scroll-top-btn'),

  // Cosmos 2D Color Picker Modal
  cosmosColorModal:     $('#cosmos-color-modal'),
  colorModalBackdrop:   $('#color-modal-backdrop'),
  colorModalClose:      $('#color-modal-close'),
  picker2dBox:          $('#picker-2d-box'),
  picker2dBg:           $('#picker-2d-bg'),
  picker2dCursor:       $('#picker-2d-cursor'),
  pickerHueSlider:      $('#picker-hue-slider'),
  pickerSwatchDot:      $('#picker-swatch-dot'),
  pickerHexInput:       $('#picker-hex-input'),
  pickerAddColorBtn:    $('#picker-add-color-btn'),
  pickerSearchBtn:      $('#picker-search-btn'),
  modalActiveColorsRow: $('#modal-active-colors-row'),
  modalAmbientGlow:     $('#modal-ambient-glow'),

  // Image Search Modal
  imageSearchTrigger:   $('#image-search-trigger'),
  imageSearchModal:     $('#image-search-modal'),
  imageModalBackdrop:   $('#image-modal-backdrop'),
  imageModalClose:      $('#image-modal-close'),
  imageDropzone:        $('#image-dropzone'),
  imageFileInput:       $('#image-file-input'),

  // Burger Drawer
  burgerDrawer:         $('#burger-drawer'),
  drawerBackdrop:       $('#drawer-backdrop'),
  drawerClose:          $('#drawer-close'),
  drawerSortOptions:    $('#drawer-sort-options'),
  drawerToleranceSlider:$('#drawer-tolerance-slider'),
  drawerTolValue:       $('#drawer-tol-value'),
  drawerGenreChips:     $('#drawer-genre-chips'),
  drawerLanguageChips:  $('#drawer-language-chips'),
  drawerResetBtn:       $('#drawer-reset-btn'),
  drawerApplyBtn:       $('#drawer-apply-btn'),

  // Nav Menu
  navMenu:              $('#nav-menu'),
  navMenuBackdrop:      $('#nav-menu-backdrop'),
  navMenuClose:         $('#nav-menu-close'),
  langSwitchDrawer:     $('#lang-switch-drawer'),
  drawerLangLabel:      $('#drawer-lang-label'),
  navLinkGallery:       $('#nav-link-gallery'),
  navLinkFavorites:     $('#nav-link-favorites'),
  navLinkCollections:   $('#nav-link-collections'),
  navLinkProfile:       $('#nav-link-profile'),

  // Header Avatar
  userProfileTrigger:   $('#user-profile-trigger'),
  headerAvatarImg:      $('#header-avatar-img'),
  headerAvatarPlaceholder: $('#header-avatar-placeholder'),

  // Landing Hero
  landingHero:          $('#landing-hero'),
  heroAmbientGlow:      $('#hero-ambient-glow'),
  heroCloseBtn:         $('#hero-close-btn'),
  heroCtaExplore:       $('#hero-cta-explore'),
  heroCtaPicker:        $('#hero-cta-picker'),
  heroCtaSignup:        $('#hero-cta-signup'),
  heroScrollIndicator:  $('#hero-scroll-indicator'),

  // Auth Modal
  authModal:            $('#auth-modal'),
  authModalBackdrop:    $('#auth-modal-backdrop'),
  authModalClose:       $('#auth-modal-close'),
  authTabLogin:         $('#auth-tab-login'),
  authTabRegister:      $('#auth-tab-register'),
  authFormLogin:        $('#auth-form-login'),
  authFormRegister:     $('#auth-form-register'),
  loginEmail:           $('#login-email'),
  loginPassword:        $('#login-password'),
  regUsername:          $('#reg-username'),
  regEmail:             $('#reg-email'),
  regPassword:          $('#reg-password'),
  avatarSelectGrid:     $('#avatar-select-grid'),

  // Profile Modal
  profileModal:         $('#profile-modal'),
  profileModalBackdrop: $('#profile-modal-backdrop'),
  profileModalClose:    $('#profile-modal-close'),
  profileAvatarImg:     $('#profile-avatar-img'),
  profileUsername:      $('#profile-username'),
  profileEmail:         $('#profile-email'),
  profileLikesCount:    $('#profile-likes-count'),
  profileCollectionsCount: $('#profile-collections-count'),
  profileLogoutBtn:     $('#profile-logout-btn'),
  profileTabLikes:      $('#profile-tab-likes'),
  profileTabCollections:$('#profile-tab-collections'),
  profileLikesView:     $('#profile-likes-view'),
  profileLikesGrid:     $('#profile-likes-grid'),
  profileCollectionsView:$('#profile-collections-view'),
  collectionsListGrid:  $('#collections-list-grid'),
  createCollectionBtn:  $('#create-collection-btn'),

  // Collection Modal
  createCollectionModal:$('#create-collection-modal'),
  createCollectionBackdrop:$('#create-collection-backdrop'),
  createCollectionClose:$('#create-collection-close'),
  createCollectionForm: $('#create-collection-form'),
  colTitle:             $('#col-title'),
  colDesc:              $('#col-desc'),

  // Sort Popover
  sortPopover:          $('#sort-popover'),

  // Film Detail Modal
  filmModal:            $('#film-modal'),
  modalBackdrop:        $('#modal-backdrop'),
  modalClose:           $('#modal-close'),
  modalPosterImg:       $('#modal-poster-img'),
  modalPosterSelector:  $('#modal-poster-selector'),
  modalDownloadBtn:     $('#modal-download-btn'),
  modalTrailerBtn:      $('#modal-trailer-btn'),
  modalPalette:         $('#modal-palette'),
  modalCertification:   $('#modal-certification'),
  modalGenres:          $('#modal-genres'),
  modalTitle:           $('#modal-title'),
  modalOriginalTitle:   $('#modal-original-title'),
  modalStars:           $('#modal-stars'),
  modalRating:          $('#modal-rating'),
  modalPopularity:      $('#modal-popularity'),
  modalDirector:        $('#modal-director'),
  modalDate:            $('#modal-date'),
  modalRuntime:         $('#modal-runtime'),
  modalLanguage:        $('#modal-language'),
  modalBudget:          $('#modal-budget'),
  modalRevenue:         $('#modal-revenue'),
  modalSummary:         $('#modal-summary'),
  toast:                $('#toast'),
};

/* ============================================================
   i18n & THEME
============================================================ */
function t(key) { return (I18N[state.lang] || I18N.fr)[key] || key; }

function applyLang(lang) {
  state.lang = lang;
  localStorage.setItem('cinechroma_lang', lang);
  document.documentElement.lang = lang;
  if (dom.langSwitch) dom.langSwitch.textContent = lang.toUpperCase();
  if (dom.drawerLangLabel) dom.drawerLangLabel.textContent = lang === 'fr' ? 'Langue : Français (FR)' : 'Language: English (EN)';

  $$('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  dom.searchInput.placeholder = t('search_placeholder');
  dom.drawerTolValue.textContent = getToleranceLabel(state.colorThreshold, state.lang);

  if (state.modalFilm) {
    dom.modalSummary.textContent = state.lang === 'en'
      ? (state.modalFilm.resume_en || state.modalFilm.resume_fr || '')
      : (state.modalFilm.resume_fr || state.modalFilm.resume_en || '');
    dom.modalGenres.innerHTML = (state.modalFilm.genres || [])
      .map(g => `<span class="genre-tag">${esc(translateGenre(g, state.lang))}</span>`).join('');
  }

  buildDrawerGenreChips();
}

function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('cinechroma_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const next = state.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
}

function getToleranceLabel(val, lang) {
  const precisionPct = Math.round(100 - ((val - 5) / 75) * 60);
  if (lang === 'en') {
    if (val <= 15) return `Exact match (${precisionPct}%)`;
    if (val <= 35) return `High precision (${precisionPct}%)`;
    if (val <= 55) return `Medium nuances (${precisionPct}%)`;
    return `Broad shades (${precisionPct}%)`;
  }
  if (val <= 15) return `Correspondance exacte (${precisionPct}%)`;
  if (val <= 35) return `Haute précision (${precisionPct}%)`;
  if (val <= 55) return `Nuances proches (${precisionPct}%)`;
  return `Large spectre (${precisionPct}%)`;
}

/* ============================================================
   COLOR MATH & PROMINENCE-WEIGHTED RELEVANCE ALGORITHM
============================================================ */
const _distCache = new Map();

function hexToRgb(hex) {
  const c = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return null;
  return { r: parseInt(c.slice(0,2),16), g: parseInt(c.slice(2,4),16), b: parseInt(c.slice(4,6),16) };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
}

function hsvToRgb(h, s, v) {
  h = (h % 360) / 60;
  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));
  let r = 0, g = 0, b = 0;
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0, s = max === 0 ? 0 : d / max, v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s, v };
}

function linearize(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function rgbToLab({ r, g, b }) {
  const rl = linearize(r), gl = linearize(g), bl = linearize(b);
  let x = rl*0.4124 + gl*0.3576 + bl*0.1805;
  let y = rl*0.2126 + gl*0.7152 + bl*0.0722;
  let z = rl*0.0193 + gl*0.1192 + bl*0.9505;
  x /= 0.9505; y /= 1.0000; z /= 1.0890;
  const f = v => v > 0.008856 ? Math.cbrt(v) : (7.787 * v) + (16/116);
  const [fx,fy,fz] = [f(x),f(y),f(z)];
  return { L: 116*fy-16, a: 500*(fx-fy), b: 200*(fy-fz) };
}

function colorDistance(hexA, hexB) {
  const a = hexA.toLowerCase(), b = hexB.toLowerCase();
  const key = a < b ? `${a}|${b}` : `${b}|${a}`;
  if (_distCache.has(key)) return _distCache.get(key);
  const ra = hexToRgb(a), rb = hexToRgb(b);
  if (!ra || !rb) { _distCache.set(key, Infinity); return Infinity; }
  const la = rgbToLab(ra), lb = rgbToLab(rb);
  const d = Math.sqrt((la.L-lb.L)**2 + (la.a-lb.a)**2 + (la.b-lb.b)**2);
  _distCache.set(key, d);
  return d;
}

function getSingleColorScoreForPoster(affiche, targetHex, threshold) {
  let totalScore = 0;
  for (const { hex, weight } of (affiche.palette || [])) {
    const d = colorDistance(hex, targetHex);
    if (d <= threshold) {
      const proximity = Math.pow(1 - d / threshold, 1.5);
      const coverage = (weight || 1.0);
      totalScore += proximity * coverage;
    }
  }
  return totalScore;
}

function getFilmMultiColorScore(film) {
  if (!state.activeColors.length || !film.affiches || !film.affiches.length) return 0;
  
  let bestFilmScore = 0;

  for (const affiche of film.affiches) {
    let posterScore = 0;
    if (state.filterMode === 'and') {
      let product = 1;
      for (const targetHex of state.activeColors) {
        const s = getSingleColorScoreForPoster(affiche, targetHex, state.colorThreshold);
        if (s <= 0) { product = 0; break; }
        product *= s;
      }
      posterScore = product;
    } else {
      for (const targetHex of state.activeColors) {
        posterScore += getSingleColorScoreForPoster(affiche, targetHex, state.colorThreshold);
      }
    }
    if (posterScore > bestFilmScore) bestFilmScore = posterScore;
  }

  return bestFilmScore;
}

function filmMatchesColors(film, colors, mode, threshold) {
  if (!colors.length) return true;
  return getFilmMultiColorScore(film) > 0;
}

function getMatchingPosterUrl(film) {
  if (!film.affiches || !film.affiches.length) return null;

  if (!state.activeColors.length) {
    const defaultPoster = film.affiches[0];
    return defaultPoster.affiche_w500 || defaultPoster.affiche_original || null;
  }

  let bestPoster = film.affiches[0];
  let maxScore = -1;

  for (const affiche of film.affiches) {
    let posterScore = 0;
    for (const targetHex of state.activeColors) {
      posterScore += getSingleColorScoreForPoster(affiche, targetHex, state.colorThreshold);
    }
    if (posterScore > maxScore) {
      maxScore = posterScore;
      bestPoster = affiche;
    }
  }

  return bestPoster.affiche_w500 || bestPoster.affiche_original || null;
}

/* ============================================================
   DATA LOADING
============================================================ */
async function loadData() {
  showState('loading');
  try {
    const res = await fetch(CONFIG.DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    const films = Array.isArray(raw) ? raw : raw.films || raw.data || Object.values(raw);
    if (!films.length) throw new Error('Aucun film trouvé.');
    state.allFilms = films;
    initApp();
  } catch (err) {
    console.error('[CineChroma]', err);
    dom.errorMessage.textContent = err.message;
    showState('error');
  }
}

/* ============================================================
   APP INIT
============================================================ */
function initApp() {
  applyLang(state.lang);
  applyTheme(state.theme);
  buildDrawerGenreChips();
  buildDrawerLanguageChips();
  setupCosmosColorPicker();
  setupImageSearchDragAndDrop();
  renderHeaderUserAvatar();
  initLandingHero();
  syncUIFromState();
  applyFiltersAndRender();
  setupScrollObserver();
  setupScrollTopBtn();
}

function syncUIFromState() {
  renderHeaderUserAvatar();
  dom.searchInput.value = state.searchQuery;
  
  // Point 3: Strictly hide search clear button when empty
  dom.searchClear.hidden = (state.searchQuery.trim().length === 0);

  if (state.activeColors.length > 0) {
    dom.searchColorDot.hidden = false;
    dom.searchColorDot.style.background = state.activeColors[state.activeColors.length - 1];
  } else {
    dom.searchColorDot.hidden = true;
  }

  renderActiveFilterBar();

  dom.drawerToleranceSlider.value = state.colorThreshold;
  dom.drawerTolValue.textContent = getToleranceLabel(state.colorThreshold, state.lang);

  const emptyTolSlider = $('#empty-tolerance-slider');
  const emptyTolValue = $('#empty-tol-value');
  const emptyTolContainer = $('#empty-tolerance-container');
  if (emptyTolSlider) emptyTolSlider.value = state.colorThreshold;
  if (emptyTolValue) emptyTolValue.textContent = getToleranceLabel(state.colorThreshold, state.lang);
  if (emptyTolContainer) emptyTolContainer.hidden = (state.activeColors.length === 0);
  syncDrawerSortButtons();
  syncDrawerModeButtons();
  syncDrawerLanguageChips();
  syncDirectorButtons();

  // Sync Popover Sort Active state
  $$('.sort-popover-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sort') === state.sort);
  });

  // Sync sub-navbar labels and badges
  let sortLabelKey = 'sort_popularity';
  if (state.sort === 'relevance') sortLabelKey = 'sort_relevance';
  else if (state.sort === 'rating') sortLabelKey = 'sort_rating';
  else if (state.sort === 'date') sortLabelKey = 'sort_date';
  else if (state.sort === 'title') sortLabelKey = 'sort_title';
  dom.activeSortLabel.textContent = `: ${t(sortLabelKey)}`;

  // Show active genres & languages count badge on filters button
  const totalActiveFilters = state.activeGenres.size + state.activeLanguages.size;
  if (totalActiveFilters > 0) {
    dom.activeFilterBadge.hidden = false;
    dom.activeFilterBadge.textContent = totalActiveFilters;
  } else {
    dom.activeFilterBadge.hidden = true;
  }

  // Clear selections button inside sub-navbar
  dom.clearAllColorsBtn.hidden = (state.activeColors.length === 0 && state.activeGenres.size === 0 && state.activeLanguages.size === 0 && !state.activeImageSrc);

  dom.pickerSearchBtn.hidden = (state.activeColors.length === 0);
}

/* ============================================================
   STATE DISPLAY TOGGLE
============================================================ */
function showState(s) {
  dom.skeletonGrid.hidden = (s !== 'loading');
  dom.errorState.hidden   = (s !== 'error');
  dom.emptyState.hidden   = (s !== 'empty');
  dom.filmGrid.hidden     = (s !== 'grid');
}

/* ============================================================
   ACTIVE FILTER BAR — COSMOS.SO STYLE (Point 2)
============================================================ */
function renderActiveFilterBar() {
  const hasColors = state.activeColors.length > 0;
  const hasGenres = state.activeGenres.size > 0;
  const hasImage = !!state.activeImageSrc;

  dom.activeCountBadge.textContent = `${state.filtered.length} ${state.lang === 'en' ? 'posters' : 'affiches'}`;

  if (!hasColors && !hasGenres && !state.searchQuery && !hasImage) {
    dom.activeFilterBar.hidden = true;
    return;
  }

  dom.activeFilterBar.hidden = false;
  dom.cosmosColorsRows.innerHTML = '';

  // Render Image Thumbnail Row first if present
  if (hasImage) {
    const imgRow = document.createElement('div');
    imgRow.className = 'cosmos-image-thumbnail-row';
    imgRow.innerHTML = `
      <div class="cosmos-image-thumbnail-left">
        <img src="${state.activeImageSrc}" class="cosmos-image-thumbnail-img" alt="Analyse" />
        <span class="cosmos-image-thumbnail-title">${state.lang === 'en' ? 'Analyzed Image' : 'Image analysée'}</span>
      </div>
      <button class="cosmos-icon-action-btn btn-delete-image" title="${state.lang === 'en' ? 'Remove Image' : 'Supprimer l\'image'}" aria-label="Delete image">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    `;
    imgRow.querySelector('.btn-delete-image').addEventListener('click', () => {
      state.activeImageSrc = null;
      state.activeColors = [];
      applyFiltersAndRender();
      updateURL();
    });
    dom.cosmosColorsRows.appendChild(imgRow);
  }

  // Point 2: Cosmos.so color row matching attached screenshot
  if (hasColors) {
    for (const hex of state.activeColors) {
      const line = document.createElement('div');
      line.className = 'cosmos-color-line-item';
      line.innerHTML = `
        <div class="cosmos-color-left">
          <div class="cosmos-color-dot-lg" style="background:${hex}" title="Modifier cette couleur"></div>
          <span class="cosmos-color-hex-title" title="Cliquer pour copier le code hexadécimal">${hex}</span>
        </div>
        <div class="cosmos-color-actions-right">
          <button class="cosmos-icon-action-btn btn-add-color" title="Ajouter une couleur" aria-label="Ajouter une couleur">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <button class="cosmos-icon-action-btn btn-delete-color" title="Supprimer cette couleur" aria-label="Supprimer ${hex}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;

      // Click dot -> modify/edit color in modal
      line.querySelector('.cosmos-color-dot-lg').addEventListener('click', () => {
        setPickerColorFromHex(hex);
        state.editingColorHex = hex;
        openColorModal();
      });

      // Click #HEX text -> copy to clipboard
      line.querySelector('.cosmos-color-hex-title').addEventListener('click', () => {
        copyToClipboard(hex);
      });

      // Click '+' icon -> open modal to add color
      line.querySelector('.btn-add-color').addEventListener('click', () => {
        openColorModal();
      });

      // Click trash icon -> remove ONLY this specific color
      line.querySelector('.btn-delete-color').addEventListener('click', () => {
        state.activeColors.splice(state.activeColors.indexOf(hex), 1);
        applyFiltersAndRender();
        updateURL();
        showToast(t('color_removed'));
      });

      dom.cosmosColorsRows.appendChild(line);
    }
  }

  dom.activeCountBadge.textContent = `${state.filtered.length} ${state.lang === 'en' ? 'posters' : 'affiches'}`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${t('copied_hex')} (${text})`);
  }).catch(() => {
    showToast(text);
  });
}

/* ============================================================
   COSMOS 2D COLOR PICKER MODAL
============================================================ */
function setupCosmosColorPicker() {
  const box = dom.picker2dBox;

  function update2DPickerFromPos(clientX, clientY) {
    const rect = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    state.pickerSat = x;
    state.pickerVal = 1 - y;

    dom.picker2dCursor.style.left = `${x * 100}%`;
    dom.picker2dCursor.style.top  = `${y * 100}%`;

    updatePickerColorOutputs();
  }

  box.addEventListener('mousedown', e => {
    state.isDragging2D = true;
    update2DPickerFromPos(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', e => {
    if (state.isDragging2D) update2DPickerFromPos(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    state.isDragging2D = false;
  });

  box.addEventListener('touchstart', e => {
    state.isDragging2D = true;
    const t = e.touches[0];
    update2DPickerFromPos(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (state.isDragging2D) {
      const t = e.touches[0];
      update2DPickerFromPos(t.clientX, t.clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => { state.isDragging2D = false; });

  dom.pickerHueSlider.addEventListener('input', e => {
    state.pickerHue = parseInt(e.target.value, 10);
    dom.picker2dBg.style.background = `hsl(${state.pickerHue}, 100%, 50%)`;
    updatePickerColorOutputs();
  });

  dom.pickerHexInput.addEventListener('input', () => {
    let hex = dom.pickerHexInput.value.trim();
    if (!hex.startsWith('#')) hex = `#${hex}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setPickerColorFromHex(hex);
    }
  });

  dom.pickerAddColorBtn.addEventListener('click', () => {
    if (state.activeColors.length >= CONFIG.MAX_COLORS) {
      showToast(t('color_max'));
      return;
    }
    if (state.editingColorHex && state.activeColors.includes(state.editingColorHex)) {
      const idx = state.activeColors.indexOf(state.editingColorHex);
      state.activeColors[idx] = state.pickerHex;
      state.editingColorHex = null;
    } else if (!state.activeColors.includes(state.pickerHex)) {
      state.activeColors.push(state.pickerHex);
    }
    renderModalActiveColorsRow();
    dom.pickerSearchBtn.hidden = false;
    showToast(t('color_added'));
  });

  dom.pickerSearchBtn.addEventListener('click', () => {
    if (state.activeColors.length > 0) {
      closeColorModal();
      if (state.sort !== 'relevance') state.sort = 'relevance';
      applyFiltersAndRender();
      updateURL();
      syncUIFromState();
    }
  });

  dom.colorPickerTrigger.addEventListener('click', openColorModal);
  dom.colorModalClose.addEventListener('click', closeColorModal);
  dom.colorModalBackdrop.addEventListener('click', closeColorModal);
}

function openColorModal() {
  dom.cosmosColorModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  
  const initial = state.activeColors.length > 0
    ? state.activeColors[state.activeColors.length - 1]
    : '#FF0000';
  setPickerColorFromHex(initial);
  renderModalActiveColorsRow();
  dom.pickerSearchBtn.hidden = (state.activeColors.length === 0);
}

function closeColorModal() {
  dom.cosmosColorModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
  state.editingColorHex = null;
}

function setPickerColorFromHex(hex) {
  state.pickerHex = hex.toUpperCase();
  const rgb = hexToRgb(hex);
  if (!rgb) return;
  const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);

  state.pickerHue = h;
  state.pickerSat = s;
  state.pickerVal = v;

  dom.pickerHueSlider.value = h;
  dom.picker2dBg.style.background = `hsl(${h}, 100%, 50%)`;

  dom.picker2dCursor.style.left = `${s * 100}%`;
  dom.picker2dCursor.style.top  = `${(1 - v) * 100}%`;

  dom.pickerSwatchDot.style.background = state.pickerHex;
  dom.pickerHexInput.value = state.pickerHex;
}

function updatePickerColorOutputs() {
  const rgb = hsvToRgb(state.pickerHue, state.pickerSat, state.pickerVal);
  state.pickerHex = rgbToHex(rgb).toUpperCase();

  dom.pickerSwatchDot.style.background = state.pickerHex;
  dom.pickerHexInput.value = state.pickerHex;
}

function renderModalActiveColorsRow() {
  dom.modalActiveColorsRow.innerHTML = '';
  if (!state.activeColors.length) {
    dom.modalActiveColorsRow.hidden = true;
    dom.pickerSearchBtn.hidden = true;
    return;
  }

  dom.modalActiveColorsRow.hidden = false;
  dom.pickerSearchBtn.hidden = false;

  for (const hex of state.activeColors) {
    const chip = document.createElement('div');
    chip.className = 'modal-color-chip';
    chip.innerHTML = `
      <div class="modal-chip-dot" style="background:${hex}"></div>
      <span>${hex}</span>
      <span class="modal-chip-del" aria-label="Supprimer">×</span>
    `;
    chip.querySelector('.modal-chip-del').addEventListener('click', () => {
      state.activeColors.splice(state.activeColors.indexOf(hex), 1);
      renderModalActiveColorsRow();
    });
    dom.modalActiveColorsRow.appendChild(chip);
  }
}

/* ============================================================
   BURGER DRAWER
============================================================ */
function buildDrawerGenreChips() {
  const genres = [...new Set(state.allFilms.flatMap(f => f.genres || []))].sort();
  dom.drawerGenreChips.innerHTML = '';

  const isFavActive = state.activeGenres.has('__favorites__');
  const favChip = document.createElement('button');
  favChip.className = `drawer-chip drawer-chip--fav${isFavActive ? ' active' : ''}`;
  favChip.textContent = t('favorites');
  favChip.addEventListener('click', () => toggleDrawerGenre('__favorites__', favChip));
  dom.drawerGenreChips.appendChild(favChip);

  for (const g of genres) {
    const isActive = state.activeGenres.has(g);
    const chip = document.createElement('button');
    chip.className = `drawer-chip${isActive ? ' active' : ''}`;
    chip.textContent = translateGenre(g, state.lang);
    chip.addEventListener('click', () => toggleDrawerGenre(g, chip));
    dom.drawerGenreChips.appendChild(chip);
  }
}

function toggleDrawerGenre(genre, chipEl) {
  if (state.activeGenres.has(genre)) {
    state.activeGenres.delete(genre);
    chipEl.classList.remove('active');
  } else {
    state.activeGenres.add(genre);
    chipEl.classList.add('active');
  }
}

function buildDrawerLanguageChips() {
  const languages = [...new Set(state.allFilms.map(f => (f.langue_origine || f.langue_originale || '').toLowerCase()).filter(Boolean))].sort();
  dom.drawerLanguageChips.innerHTML = '';

  for (const langCode of languages) {
    const isActive = state.activeLanguages.has(langCode);
    const chip = document.createElement('button');
    chip.className = `drawer-chip${isActive ? ' active' : ''}`;
    chip.setAttribute('data-lang', langCode);
    chip.textContent = langCode.toUpperCase();
    chip.addEventListener('click', () => toggleDrawerLanguage(langCode, chip));
    dom.drawerLanguageChips.appendChild(chip);
  }
}

function toggleDrawerLanguage(langCode, chipEl) {
  if (state.activeLanguages.has(langCode)) {
    state.activeLanguages.delete(langCode);
    chipEl.classList.remove('active');
  } else {
    state.activeLanguages.add(langCode);
    chipEl.classList.add('active');
  }
}

function syncDrawerLanguageChips() {
  const chips = document.querySelectorAll('#drawer-language-chips .drawer-chip');
  chips.forEach(chip => {
    const code = chip.getAttribute('data-lang');
    chip.classList.toggle('active', state.activeLanguages.has(code));
  });
}

function syncDirectorButtons() {
  const btns = document.querySelectorAll('.director-preset-btn');
  btns.forEach(btn => {
    const presetColors = btn.getAttribute('data-colors').split(',').map(c => `#${c}`);
    const isMatching = presetColors.length === state.activeColors.length && 
                       presetColors.every((c, i) => c === state.activeColors[i]);
    btn.classList.toggle('active', isMatching);
  });
}

function syncDrawerSortButtons() {
  $$('#drawer-sort-options .drawer-option-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sort') === state.sort);
  });
}

function syncDrawerModeButtons() {
  $$('.drawer-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === state.filterMode);
  });
}

function openDrawer() {
  dom.burgerDrawer.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  dom.burgerDrawer.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function openNavMenu() {
  dom.navMenu.removeAttribute('hidden');
  dom.burgerTrigger.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeNavMenu() {
  dom.navMenu.setAttribute('hidden', '');
  dom.burgerTrigger.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleSortPopover(e) {
  if (e) e.stopPropagation();
  const isHidden = dom.sortPopover.hasAttribute('hidden');
  if (isHidden) {
    const rect = dom.sortTrigger.getBoundingClientRect();
    dom.sortPopover.style.top = `${rect.bottom + window.scrollY + 6}px`;
    dom.sortPopover.style.left = `${rect.left + window.scrollX}px`;
    dom.sortPopover.removeAttribute('hidden');
  } else {
    dom.sortPopover.setAttribute('hidden', '');
  }
}

function closeSortPopover() {
  dom.sortPopover.setAttribute('hidden', '');
}

/* ============================================================
   FILTERING & SORTING
============================================================ */
function applyFiltersAndRender() {
  let films = state.allFilms;

  if (state.searchQuery) {
    const qNorm = normalizeStr(state.searchQuery);
    const qTokens = qNorm.split(/\s+/).filter(Boolean);

    films = films.filter(f => {
      const titleNorm     = normalizeStr(f.titre || f.title || '');
      const origTitleNorm = normalizeStr(f.titre_original || f.original_title || '');
      const directorNorm  = normalizeStr(f.realisateur || f.director || '');
      const haystack      = `${titleNorm} ${origTitleNorm} ${directorNorm}`;

      return qTokens.every(token => haystack.includes(token));
    });
  }

  if (state.activeGenres.size > 0) {
    if (state.activeGenres.has('__favorites__')) {
      films = films.filter(f => state.favorites.has(getFilmId(f)));
    } else {
      films = films.filter(f =>
        [...state.activeGenres].some(g => (f.genres||[]).includes(g))
      );
    }
  }

  if (state.activeLanguages.size > 0) {
    films = films.filter(f => {
      const flang = (f.langue_origine || f.langue_originale || '').toLowerCase();
      return state.activeLanguages.has(flang);
    });
  }

  if (state.activeColors.length) {
    films = films.filter(f => filmMatchesColors(f, state.activeColors, state.filterMode, state.colorThreshold));
  }

  state.filtered = films;
  state.sorted   = sortFilms(films, state.sort);
  state.currentPage = 1;
  renderGrid(true);
  syncUIFromState();
}

function sortFilms(films, key) {
  if (key === 'relevance' && state.activeColors.length) {
    const scored = films.map(f => ({
      film: f,
      score: getFilmMultiColorScore(f),
    }));
    scored.sort((a,b) => b.score - a.score);
    return scored.map(s => s.film);
  }
  return [...films].sort((a,b) => {
    switch(key) {
      case 'popularity': return (b.popularite||0) - (a.popularite||0);
      case 'rating':     return (b.note_moyenne||0) - (a.note_moyenne||0);
      case 'date':       return new Date(b.date_sortie||0) - new Date(a.date_sortie||0);
      case 'title':      return (a.titre||'').localeCompare(b.titre||'','fr');
      default:           return (b.popularite||0) - (a.popularite||0);
    }
  });
}

/* ============================================================
   TRUE FLEX MULTI-COLUMN MASONRY GRID RENDERING (Point 3)
   Fixes layout reflow for large datasets. Guarantees top row
   left-to-right ordering across 5 flex columns.
============================================================ */
function renderGrid(reset = false) {
  if (reset) dom.filmGrid.innerHTML = '';

  if (!state.sorted.length) {
    showState('empty');
    dom.scrollSentinel.innerHTML = '';
    return;
  }

  showState('grid');

  const numColumns = getResponsiveColumnCount();
  
  // Create or retrieve 5 flex columns
  let colEls = $$('#film-grid .masonry-col');
  if (reset || colEls.length !== numColumns) {
    dom.filmGrid.innerHTML = '';
    colEls = [];
    for (let c = 0; c < numColumns; c++) {
      const colDiv = document.createElement('div');
      colDiv.className = 'masonry-col';
      dom.filmGrid.appendChild(colDiv);
      colEls.push(colDiv);
    }
  }

  const start = (state.currentPage - 1) * CONFIG.PAGE_SIZE;
  const end   = state.currentPage * CONFIG.PAGE_SIZE;
  const page  = state.sorted.slice(start, end);

  const ratioClasses = ['ratio-tall', 'ratio-square', 'ratio-medium', 'ratio-wide'];

  // Distribute items round-robin across columns so row 1 has items #0, #1, #2, #3, #4!
  page.forEach((film, index) => {
    const colIndex = index % numColumns;
    const ratioClass = ratioClasses[(start + index) % ratioClasses.length];
    colEls[colIndex].appendChild(buildCard(film, ratioClass));
  });

  const loaded = Math.min(end, state.sorted.length);
  dom.scrollSentinel.innerHTML = loaded < state.sorted.length
    ? '<div class="scroll-loading"></div>' : '';
}

function getResponsiveColumnCount() {
  const w = window.innerWidth;
  if (w <= 600) return 2;
  if (w <= 900) return 3;
  if (w <= 1200) return 4;
  return 5;
}

/* ============================================================
   CARD BUILDER
============================================================ */
function buildCard(film, ratioClass) {
  const card = document.createElement('article');
  card.className = `film-card ${ratioClass}`;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', film.titre || film.titre_original || 'Film');

  const filmId  = getFilmId(film);
  const src     = getMatchingPosterUrl(film);
  const year    = formatYear(film.date_sortie);
  const isFav   = state.favorites.has(filmId);

  let matchScore = null;
  if (state.activeColors.length) {
    const score = getFilmMultiColorScore(film);
    if (score > 0) {
      matchScore = Math.min(99, Math.round(score));
    }
  }

  card.innerHTML = `
    ${src
      ? `<img class="card-poster" src="${esc(src)}" alt="${esc(film.titre||'Affiche')}" loading="lazy" decoding="async" />`
      : `<div class="card-poster-placeholder">◻</div>`
    }
    ${matchScore !== null ? `<div class="card-match-badge">${matchScore}%</div>` : ''}
    <button class="card-fav-btn${isFav ? ' active' : ''}" aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}" tabindex="-1">
      <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="13" height="13">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
    <div class="card-overlay" aria-hidden="true">
      <div class="card-title">${esc(film.titre || film.titre_original || '')}</div>
      <div class="card-meta">${[film.realisateur, year].filter(Boolean).join(' · ')}</div>
    </div>
  `;

  card.addEventListener('click', () => openModal(film));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(film); }
  });
  card.querySelector('.card-fav-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(filmId, e.currentTarget);
  });
  return card;
}

/* ============================================================
   INFINITE SCROLL & SCROLL TO TOP
============================================================ */
let _obs = null;
function setupScrollObserver() {
  if (_obs) _obs.disconnect();
  _obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !state.isLoadingMore) loadNextPage();
  }, { rootMargin: '400px' });
  _obs.observe(dom.scrollSentinel);
}

function loadNextPage() {
  const end = state.currentPage * CONFIG.PAGE_SIZE;
  if (end >= state.sorted.length || state.isLoadingMore) return;
  state.isLoadingMore = true;
  state.currentPage++;
  requestAnimationFrame(() => {
    renderGrid(false);
    state.isLoadingMore = false;
  });
}

function setupScrollTopBtn() {
  window.addEventListener('scroll', () => {
    const show = window.scrollY > CONFIG.SCROLL_TOP_OFFSET;
    dom.scrollTopBtn.classList.toggle('visible', show);
    dom.scrollTopBtn.hidden = !show;
  }, { passive: true });
  dom.scrollTopBtn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

/* ============================================================
   FAVORITES & GUEST PROMPT
============================================================ */
function toggleFavorite(filmId, btnEl) {
  if (!state.user && !state.hasSeenGuestLikePrompt) {
    state.hasSeenGuestLikePrompt = true;
    localStorage.setItem('cinechroma_guest_prompt_seen', 'true');
    showToast(t('guest_like_prompt'));
  }

  if (state.favorites.has(filmId)) {
    state.favorites.delete(filmId);
    if (btnEl) {
      btnEl.classList.remove('active');
      btnEl.querySelector('svg').setAttribute('fill','none');
    }
    showToast(t('fav_removed'));
  } else {
    state.favorites.add(filmId);
    if (btnEl) {
      btnEl.classList.add('active');
      btnEl.querySelector('svg').setAttribute('fill','currentColor');
    }
    if (state.user || state.hasSeenGuestLikePrompt) {
      showToast(t('fav_added'));
    }
  }
  localStorage.setItem('cinechroma_favorites', JSON.stringify([...state.favorites]));
  buildDrawerGenreChips();
  if (state.activeGenres.has('__favorites__')) applyFiltersAndRender();
}

/* ============================================================
   USER AUTHENTICATION & PROFILE
============================================================ */
function renderHeaderUserAvatar() {
  if (state.user) {
    dom.headerAvatarImg.src = state.user.avatar || PRESET_AVATARS[0];
    dom.headerAvatarImg.hidden = false;
    dom.headerAvatarPlaceholder.hidden = true;
  } else {
    dom.headerAvatarImg.hidden = true;
    dom.headerAvatarPlaceholder.hidden = false;
  }
}

function openAuthModal(tab = 'login') {
  dom.authModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  switchAuthTab(tab);
  renderPresetAvatars();
}

function closeAuthModal() {
  dom.authModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const isLogin = (tab === 'login');
  dom.authTabLogin.classList.toggle('active', isLogin);
  dom.authTabRegister.classList.toggle('active', !isLogin);
  dom.authFormLogin.hidden = !isLogin;
  dom.authFormRegister.hidden = isLogin;
}

function renderPresetAvatars() {
  if (dom.avatarSelectGrid.children.length > 0) return;
  dom.avatarSelectGrid.innerHTML = PRESET_AVATARS.map((url, idx) => `
    <img src="${url}" class="avatar-select-item${idx === 0 ? ' selected' : ''}" data-url="${url}" alt="Avatar ${idx+1}" />
  `).join('');

  $$('.avatar-select-item').forEach(img => {
    img.addEventListener('click', () => {
      $$('.avatar-select-item').forEach(el => el.classList.remove('selected'));
      img.classList.add('selected');
      state.selectedRegisterAvatar = img.getAttribute('data-url');
    });
  });
}

function handleLogin(e) {
  e.preventDefault();
  const identifier = dom.loginEmail.value.trim();
  if (!identifier) return;

  const user = {
    username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
    email: identifier.includes('@') ? identifier : `${identifier}@cinechroma.app`,
    avatar: PRESET_AVATARS[0],
    joinedDate: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  };

  state.user = user;
  localStorage.setItem('cinechroma_user', JSON.stringify(user));
  renderHeaderUserAvatar();
  closeAuthModal();
  showToast(`${t('login_success')}, ${user.username} !`);
}

function handleRegister(e) {
  e.preventDefault();
  const username = dom.regUsername.value.trim();
  const email = dom.regEmail.value.trim();
  if (!username || !email) return;

  const user = {
    username,
    email,
    avatar: state.selectedRegisterAvatar || PRESET_AVATARS[0],
    joinedDate: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  };

  state.user = user;
  localStorage.setItem('cinechroma_user', JSON.stringify(user));
  renderHeaderUserAvatar();
  closeAuthModal();
  showToast(`${t('register_success')} ${username} !`);
}

function logoutUser() {
  state.user = null;
  localStorage.removeItem('cinechroma_user');
  renderHeaderUserAvatar();
  closeProfileModal();
  showToast(t('logout'));
}

/* ============================================================
   PROFILE VIEW & TABS
============================================================ */
function openProfileModal(tab = 'likes') {
  if (!state.user) {
    openAuthModal('login');
    return;
  }

  dom.profileModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  
  dom.profileAvatarImg.src = state.user.avatar || PRESET_AVATARS[0];
  dom.profileUsername.textContent = state.user.username;
  dom.profileEmail.textContent = state.user.email;
  dom.profileLikesCount.textContent = `${state.favorites.size} favoris`;
  dom.profileCollectionsCount.textContent = `${state.collections.length} collections`;

  switchProfileTab(tab);
}

function closeProfileModal() {
  dom.profileModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function switchProfileTab(tab) {
  const isLikes = (tab === 'likes');
  dom.profileTabLikes.classList.toggle('active', isLikes);
  dom.profileTabCollections.classList.toggle('active', !isLikes);
  dom.profileLikesView.hidden = !isLikes;
  dom.profileCollectionsView.hidden = isLikes;

  if (isLikes) renderProfileLikes();
  else renderProfileCollections();
}

function renderProfileLikes() {
  const favFilms = state.allFilms.filter(f => state.favorites.has(getFilmId(f)));
  if (!favFilms.length) {
    dom.profileLikesGrid.innerHTML = `<div style="grid-column: 1/-1; padding: 24px; text-align: center; color: var(--text-3); font-size: 0.82rem;">Aucun favori pour le moment. Cliquez sur le cœur d'une affiche pour l'ajouter !</div>`;
    return;
  }

  dom.profileLikesGrid.innerHTML = favFilms.map(f => {
    const posterUrl = getMatchingPosterUrl(f);
    return `
      <div class="profile-like-card" data-id="${getFilmId(f)}">
        <img src="${esc(posterUrl)}" alt="${esc(f.titre)}" class="profile-like-img" loading="lazy" />
      </div>
    `;
  }).join('');

  $$('#profile-likes-grid .profile-like-card').forEach(card => {
    card.addEventListener('click', () => {
      const film = state.allFilms.find(f => getFilmId(f) === card.getAttribute('data-id'));
      if (film) {
        closeProfileModal();
        openModal(film);
      }
    });
  });
}

function renderProfileCollections() {
  if (!state.collections.length) {
    dom.collectionsListGrid.innerHTML = `<div style="grid-column: 1/-1; padding: 24px; text-align: center; color: var(--text-3); font-size: 0.82rem;">Aucune collection créée. Cliquez sur "+ Créer une collection" pour organiser vos affiches !</div>`;
    return;
  }

  dom.collectionsListGrid.innerHTML = state.collections.map(col => `
    <div class="collection-card" data-id="${col.id}">
      <button class="collection-delete-btn" data-id="${col.id}" title="Supprimer la collection">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <div class="collection-card-name">${esc(col.title)}</div>
      <div class="collection-card-desc">${esc(col.desc || 'Sans description')}</div>
      <div class="collection-card-count">${col.filmIds ? col.filmIds.length : 0} affiches</div>
    </div>
  `).join('');

  $$('.collection-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const colId = btn.getAttribute('data-id');
      state.collections = state.collections.filter(c => c.id !== colId);
      localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
      renderProfileCollections();
      dom.profileCollectionsCount.textContent = `${state.collections.length} collections`;
      showToast(t('collection_deleted'));
    });
  });
}

/* ============================================================
   COLLECTIONS MODAL
============================================================ */
function openCreateCollectionModal() {
  dom.createCollectionModal.removeAttribute('hidden');
}

function closeCreateCollectionModal() {
  dom.createCollectionModal.setAttribute('hidden', '');
  dom.colTitle.value = '';
  dom.colDesc.value = '';
}

function handleCreateCollection(e) {
  e.preventDefault();
  const title = dom.colTitle.value.trim();
  const desc = dom.colDesc.value.trim();
  if (!title) return;

  const newCol = {
    id: 'col_' + Date.now(),
    title,
    desc,
    filmIds: []
  };

  state.collections.push(newCol);
  localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
  closeCreateCollectionModal();
  renderProfileCollections();
  dom.profileCollectionsCount.textContent = `${state.collections.length} collections`;
  showToast(t('collection_created'));
}

/* ============================================================
   LANDING HERO SECTION
============================================================ */
function initLandingHero() {
  const isHiddenByPref = localStorage.getItem('cinechroma_hide_hero') === 'true';
  if (isHiddenByPref || state.user) {
    dom.landingHero.setAttribute('hidden', '');
  } else {
    dom.landingHero.removeAttribute('hidden');
    setupHeroTitleLetters();
    setupHeroMouseSpotlight();
    setupHeroColorRibbon();
    startHeroGlowCycle();
  }
}

let _selectedHeroColor = null;

function setupHeroColorRibbon() {
  const dots = $$('.hero-color-dot');
  dots.forEach(dot => {
    dot.addEventListener('mouseenter', () => {
      const colorHex = dot.getAttribute('data-color');
      const colorName = dot.getAttribute('data-name') || '';
      applyHeroColorSelection(colorHex, colorName);
    });

    dot.addEventListener('click', () => {
      const colorHex = dot.getAttribute('data-color');
      const colorName = dot.getAttribute('data-name') || '';
      applyHeroColorSelection(colorHex, colorName);
      triggerHeroColorSearch(colorHex);
    });
  });
}

function applyHeroColorSelection(colorHex, colorName) {
  _selectedHeroColor = colorHex;
  $$('.hero-color-dot').forEach(d => {
    if (d.getAttribute('data-color') === colorHex) d.classList.add('active');
    else d.classList.remove('active');
  });

  if (dom.heroCtaExplore) {
    dom.heroCtaExplore.style.background = colorHex;
    dom.heroCtaExplore.style.borderColor = colorHex;
    dom.heroCtaExplore.style.color = '#ffffff';
    dom.heroCtaExplore.style.boxShadow = `0 6px 20px ${hexToRgba(colorHex, 0.45)}`;
    dom.heroCtaExplore.textContent = colorName ? `Explorer les affiches ${colorName} ↓` : `Explorer la galerie ↓`;
  }
}

function triggerHeroColorSearch(colorHex) {
  if (colorHex && !state.activeColors.includes(colorHex)) {
    if (state.activeColors.length >= CONFIG.MAX_COLORS) {
      state.activeColors.shift();
    }
    state.activeColors.push(colorHex);
    applyFiltersAndRender();
    updateURL();
    showToast(t('color_added'));
  }
  dom.filmGrid.scrollIntoView({ behavior: 'smooth' });
}

function setupHeroTitleLetters() {
  const titleEl = $('#hero-title');
  if (!titleEl || titleEl.getAttribute('data-letters-init') === 'true') return;
  titleEl.setAttribute('data-letters-init', 'true');

  const text = titleEl.textContent.trim();
  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#00D2FF', '#FF0055'];

  // Preserve word boundaries so words like 'couleur' never break across lines!
  const words = text.split(/\s+/);
  titleEl.innerHTML = words.map(word => {
    const lettersHtml = word.split('').map(char => `<span class="hero-letter">${esc(char)}</span>`).join('');
    return `<span class="hero-word">${lettersHtml}</span>`;
  }).join(' ');

  $$('#hero-title .hero-letter').forEach(letter => {
    letter.addEventListener('mouseenter', () => {
      const randColor = colors[Math.floor(Math.random() * colors.length)];
      letter.classList.add('letter-hovered');
      letter.style.color = randColor;
      letter.style.textShadow = `0 0 14px ${hexToRgba(randColor, 0.45)}`;

      // Revert letter color & transform after 1.5 seconds as requested
      setTimeout(() => {
        letter.classList.remove('letter-hovered');
        letter.style.color = '';
        letter.style.textShadow = '';
      }, 1500);
    });
  });
}

// Smooth slow color cycling for background ambient glow to prevent epileptic flickering
let _heroGlowInterval = null;
function startHeroGlowCycle() {
  const colors = ['#E50914', '#00D2FF', '#FFB800', '#10B981', '#8B5CF6'];
  let idx = 0;
  if (_heroGlowInterval) clearInterval(_heroGlowInterval);
  
  if (dom.heroAmbientGlow) {
    dom.heroAmbientGlow.style.setProperty('--ambient-glow-color', hexToRgba(colors[0], 0.15));
  }
  
  _heroGlowInterval = setInterval(() => {
    idx = (idx + 1) % colors.length;
    if (dom.heroAmbientGlow && !dom.landingHero.hasAttribute('hidden')) {
      dom.heroAmbientGlow.style.setProperty('--ambient-glow-color', hexToRgba(colors[idx], 0.15));
    }
  }, 5000);
}

// Discreet mouse spotlight follower over hero background
function setupHeroMouseSpotlight() {
  if (!dom.landingHero || $('#hero-mouse-spotlight')) return;
  const spotlight = document.createElement('div');
  spotlight.id = 'hero-mouse-spotlight';
  spotlight.className = 'hero-mouse-spotlight';
  dom.landingHero.appendChild(spotlight);

  dom.landingHero.addEventListener('mousemove', (e) => {
    const rect = dom.landingHero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlight.style.left = `${x}px`;
    spotlight.style.top = `${y}px`;
    spotlight.style.opacity = '1';
  });

  dom.landingHero.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
}

function closeLandingHero() {
  if (_heroGlowInterval) clearInterval(_heroGlowInterval);
  dom.landingHero.setAttribute('hidden', '');
  localStorage.setItem('cinechroma_hide_hero', 'true');
}

function hexToRgba(hex, alpha = 0.2) {
  const c = hexToRgb(hex);
  if (!c) return `rgba(229, 9, 20, ${alpha})`;
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

/* ============================================================
   FILM DETAIL MODAL (Point 1: Download button + Centered poster)
============================================================ */
function openModal(film) {
  state.modalFilm = film;
  state.modalPosterIndex = 0;
  populateModal(film);
  dom.filmModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => dom.modalClose.focus(), 80);
}

function closeModal() {
  dom.filmModal.setAttribute('hidden', '');
  dom.filmModal.style.removeProperty('--modal-glow-color');
  document.body.style.overflow = '';
  state.modalFilm = null;
}

function populateModal(film) {
  updateModalPoster(film, 0);

  // Poster Thumbnails
  dom.modalPosterSelector.innerHTML = '';
  const affiches = film.affiches || [];
  if (affiches.length > 1) {
    affiches.forEach((a, i) => {
      const src = a.affiche_w500 || a.affiche_original;
      if (!src) return;
      const img = document.createElement('img');
      img.src = src; img.alt = `Affiche ${i+1}`;
      img.className = `poster-thumb${i === 0 ? ' active' : ''}`;
      img.loading = 'lazy';
      img.addEventListener('click', () => {
        updateModalPoster(film, i);
        $$('.poster-thumb').forEach(t => t.classList.remove('active'));
        img.classList.add('active');
      });
      dom.modalPosterSelector.appendChild(img);
    });
  }

  // Point 1: Direct Download Button for Poster Image
  dom.modalDownloadBtn.onclick = (e) => {
    e.preventDefault();
    downloadPosterImage(film);
  };

  if (film.bande_annonce_url) {
    dom.modalTrailerBtn.href = film.bande_annonce_url;
    dom.modalTrailerBtn.removeAttribute('hidden');
  } else {
    dom.modalTrailerBtn.setAttribute('hidden', '');
  }

  renderModalPalette(getFirstPalette(film));

  if (film.certification) {
    dom.modalCertification.textContent = film.certification;
    dom.modalCertification.removeAttribute('hidden');
  } else {
    dom.modalCertification.setAttribute('hidden', '');
  }

  dom.modalGenres.innerHTML = (film.genres || [])
    .map(g => `<span class="genre-tag">${esc(translateGenre(g, state.lang))}</span>`).join('');

  dom.modalTitle.textContent = film.titre || film.titre_original || 'Titre inconnu';
  dom.modalOriginalTitle.textContent =
    film.titre_original && film.titre_original !== film.titre ? film.titre_original : '';

  const r = film.note_moyenne || 0;
  dom.modalStars.innerHTML = starsHtml(r);
  dom.modalRating.textContent = r ? r.toFixed(1) : 'N/A';
  dom.modalPopularity.textContent = film.popularite ? Math.round(film.popularite).toLocaleString('fr-FR') : 'N/A';
  dom.modalDirector.textContent = film.realisateur || 'N/A';
  dom.modalDate.textContent     = formatDate(film.date_sortie);
  
  // Property Aliases support for updated database JSON (duree_minutes / duree_min & langue_origine / langue_originale)
  const runtimeMin = film.duree_minutes || film.duree_min;
  const langCode   = film.langue_origine || film.langue_originale || '';
  
  dom.modalRuntime.textContent  = formatRuntime(runtimeMin);
  dom.modalLanguage.textContent = langCode.toUpperCase() || 'N/A';
  dom.modalBudget.textContent   = formatCurrency(film.budget);
  dom.modalRevenue.textContent  = formatCurrency(film.recettes);

  dom.modalSummary.textContent = state.lang === 'en'
    ? (film.resume_en || film.resume_fr || 'Summary not available.')
    : (film.resume_fr || film.resume_en || 'Résumé non disponible.');
}

function updateModalAmbientGlowColor(film, idx) {
  const affiches = film.affiches || [];
  const currentPoster = affiches[idx] || affiches[0];
  if (currentPoster && currentPoster.palette?.length > 0) {
    const hex = currentPoster.palette[0].hex;
    const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
    dom.modalAmbientGlow.style.setProperty('--modal-glow-color', hexToRgba(cleanHex, 0.45));
  } else {
    dom.modalAmbientGlow.style.setProperty('--modal-glow-color', 'transparent');
  }
}

function updateModalPoster(film, idx) {
  state.modalPosterIndex = idx;
  const a = (film.affiches || [])[idx] || {};
  const src = a.affiche_original || a.affiche_w500;
  if (src) {
    dom.modalPosterImg.src = src;
    dom.modalPosterImg.alt = `${film.titre||'Affiche'} — ${idx+1}`;
  }
  if (a.palette?.length) renderModalPalette(a.palette);
  updateModalAmbientGlowColor(film, idx);
}

// Download poster function
function downloadPosterImage(film) {
  const affiches = film.affiches || [];
  const currentPoster = affiches[state.modalPosterIndex] || affiches[0] || {};
  const src = currentPoster.affiche_original || currentPoster.affiche_w500;

  if (!src) return;

  showToast(t('downloading'));

  fetch(src)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${(film.titre || 'affiche').toLowerCase().replace(/[^a-z0-9]/g, '_')}_poster.jpg`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })
    .catch(err => {
      console.error(err);
      window.open(src, '_blank');
      showToast(t('download_error'));
    });
}

function renderModalPalette(palette) {
  dom.modalPalette.innerHTML = '';
  for (const entry of palette) {
    const hex = (entry.hex||'').startsWith('#') ? entry.hex : `#${entry.hex}`;
    if (!hex || hex === '#') continue;
    const isActive = state.activeColors.includes(hex);

    const item = document.createElement('div');
    item.className = `modal-palette-chip${isActive ? ' filter-active' : ''}`;
    item.setAttribute('role', 'button'); item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Filtrer par ${hex}`);
    item.innerHTML = `
      <div class="modal-palette-chip-dot" style="background:${hex}"></div>
      <span>${hex}</span>
    `;
    const doFilter = () => {
      closeModal();
      if (!state.activeColors.includes(hex)) state.activeColors.push(hex);
      if (state.sort !== 'relevance') state.sort = 'relevance';
      applyFiltersAndRender();
      updateURL();
    };
    item.addEventListener('click', doFilter);
    item.addEventListener('keydown', e => { if (e.key === 'Enter') doFilter(); });
    dom.modalPalette.appendChild(item);
  }
}

/* ============================================================
   FORMATTING & UTILS
============================================================ */
function formatCurrency(v) {
  if (!v) return 'N/A';
  if (v >= 1e9) return `$${(v/1e9).toFixed(2)}Md`;
  if (v >= 1e6) return `$${(v/1e6).toFixed(1)}M`;
  return `$${v.toLocaleString('fr-FR')}`;
}
function formatRuntime(m) {
  if (!m) return 'N/A';
  const h = Math.floor(m/60), mn = m%60;
  return h ? `${h}h${mn.toString().padStart(2,'0')}` : `${mn}min`;
}
function formatDate(s) {
  if (!s) return 'N/A';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString(state.lang === 'en' ? 'en-GB' : 'fr-FR', {year:'numeric',month:'long',day:'numeric'});
}
function formatYear(s) {
  if (!s) return '';
  return new Date(s).getFullYear() || '';
}

function getFirstPalette(film) {
  for (const a of (film.affiches || [])) {
    if (a.palette?.length) return a.palette;
  }
  return [];
}
function starsHtml(r) {
  const out = r / 2; let html = '';
  for (let i = 1; i <= 5; i++) {
    if (out >= i) html += '<span class="star-filled">★</span>';
    else if (out >= i-0.5) html += '<span class="star-filled" style="opacity:.4">★</span>';
    else html += '<span class="star-empty">☆</span>';
  }
  return html;
}
function getFilmId(film) {
  const t = (film.titre || film.titre_original || 'x').toLowerCase().replace(/[^a-z0-9]/g,'_');
  return `${t}_${film.date_sortie||'?'}`;
}
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function normalizeStr(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .trim();
}

/* ============================================================
   URL PERSISTENCE
============================================================ */
function updateURL() {
  const p = new URLSearchParams();
  if (state.searchQuery)                        p.set('q', state.searchQuery);
  if (state.activeGenres.size > 0)             p.set('genres', [...state.activeGenres].join(','));
  if (state.activeLanguages.size > 0)          p.set('langs', [...state.activeLanguages].join(','));
  if (state.activeColors.length)                p.set('colors', state.activeColors.map(c => c.replace('#', '')).join(','));
  if (state.sort !== CONFIG.DEFAULT_SORT)       p.set('sort', state.sort);
  if (state.colorThreshold !== CONFIG.DEFAULT_THRESHOLD) p.set('tol', state.colorThreshold);
  if (state.filterMode !== 'or')                p.set('mode', state.filterMode);
  history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname);
}

function readURL() {
  const p = new URLSearchParams(location.search);
  if (p.has('q'))      state.searchQuery = p.get('q');
  if (p.has('genres')) state.activeGenres = new Set(p.get('genres').split(','));
  if (p.has('langs'))  state.activeLanguages = new Set(p.get('langs').split(','));
  if (p.has('genre'))  state.activeGenres.add(p.get('genre'));
  if (p.has('colors')) {
    state.activeColors = p.get('colors')
      .split(',')
      .map(c => c.startsWith('#') ? c : `#${c}`)
      .filter(h => /^#[0-9a-fA-F]{6}$/.test(h));
  }
  if (p.has('sort'))   state.sort = p.get('sort');
  if (p.has('tol'))    state.colorThreshold = parseInt(p.get('tol'),10) || CONFIG.DEFAULT_THRESHOLD;
  if (p.has('mode'))   state.filterMode = p.get('mode') === 'and' ? 'and' : 'or';
}

/* ============================================================
   TOAST & DEBOUNCE
============================================================ */
let _toastTimer = null;
function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2400);
}

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* ============================================================
   EVENTS
============================================================ */
function bindEvents() {
  dom.searchInput.addEventListener('input', debounce(e => {
    state.searchQuery = e.target.value.trim();
    dom.searchClear.hidden = (state.searchQuery.length === 0);
    state.currentPage = 1;
    applyFiltersAndRender();
    updateURL();
  }, 220));

  dom.searchClear.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.searchQuery = '';
    dom.searchClear.hidden = true;
    state.currentPage = 1;
    applyFiltersAndRender();
    updateURL();
    dom.searchInput.focus();
  });

  // Header Actions
  dom.themeToggle.addEventListener('click', toggleTheme);
  dom.burgerTrigger.addEventListener('click', openNavMenu);
  if (dom.langSwitch) {
    dom.langSwitch.addEventListener('click', () => {
      applyLang(state.lang === 'fr' ? 'en' : 'fr');
    });
  }

  // Profile Header Trigger
  dom.userProfileTrigger.addEventListener('click', () => {
    if (state.user) openProfileModal('likes');
    else openAuthModal('login');
  });

  // Landing Hero Actions
  if (dom.heroCloseBtn) {
    dom.heroCloseBtn.addEventListener('click', closeLandingHero);
  }
  if (dom.heroCtaExplore) {
    dom.heroCtaExplore.addEventListener('click', () => {
      if (_selectedHeroColor) {
        triggerHeroColorSearch(_selectedHeroColor);
      } else {
        dom.filmGrid.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  if (dom.heroScrollIndicator) {
    dom.heroScrollIndicator.addEventListener('click', () => {
      dom.filmGrid.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (dom.heroCtaSignup) {
    dom.heroCtaSignup.addEventListener('click', () => openAuthModal('register'));
  }

  // Drawer Language Switch
  if (dom.langSwitchDrawer) {
    dom.langSwitchDrawer.addEventListener('click', () => {
      applyLang(state.lang === 'fr' ? 'en' : 'fr');
    });
  }

  // Nav Menu Links
  if (dom.navLinkGallery) {
    dom.navLinkGallery.addEventListener('click', (e) => {
      e.preventDefault();
      closeNavMenu();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (dom.navLinkFavorites) {
    dom.navLinkFavorites.addEventListener('click', (e) => {
      e.preventDefault();
      closeNavMenu();
      openProfileModal('likes');
    });
  }
  if (dom.navLinkCollections) {
    dom.navLinkCollections.addEventListener('click', (e) => {
      e.preventDefault();
      closeNavMenu();
      openProfileModal('collections');
    });
  }
  if (dom.navLinkProfile) {
    dom.navLinkProfile.addEventListener('click', (e) => {
      e.preventDefault();
      closeNavMenu();
      if (state.user) openProfileModal('likes');
      else openAuthModal('login');
    });
  }

  // Auth Modal Actions
  dom.authModalClose.addEventListener('click', closeAuthModal);
  dom.authModalBackdrop.addEventListener('click', closeAuthModal);
  dom.authTabLogin.addEventListener('click', () => switchAuthTab('login'));
  dom.authTabRegister.addEventListener('click', () => switchAuthTab('register'));
  dom.authFormLogin.addEventListener('submit', handleLogin);
  dom.authFormRegister.addEventListener('submit', handleRegister);

  // Profile Modal Actions
  dom.profileModalClose.addEventListener('click', closeProfileModal);
  dom.profileModalBackdrop.addEventListener('click', closeProfileModal);
  dom.profileTabLikes.addEventListener('click', () => switchProfileTab('likes'));
  dom.profileTabCollections.addEventListener('click', () => switchProfileTab('collections'));
  dom.profileLogoutBtn.addEventListener('click', logoutUser);
  dom.createCollectionBtn.addEventListener('click', openCreateCollectionModal);

  // Collection Modal Actions
  dom.createCollectionClose.addEventListener('click', closeCreateCollectionModal);
  dom.createCollectionBackdrop.addEventListener('click', closeCreateCollectionModal);
  dom.createCollectionForm.addEventListener('submit', handleCreateCollection);

  // Sub-navbar Actions
  dom.filterTrigger.addEventListener('click', openDrawer);
  dom.sortTrigger.addEventListener('click', toggleSortPopover);

  // Nav Menu Close
  dom.navMenuClose.addEventListener('click', closeNavMenu);
  dom.navMenuBackdrop.addEventListener('click', closeNavMenu);

  // Document click to close Sort Popover when clicking outside
  document.addEventListener('click', e => {
    if (!dom.sortPopover.contains(e.target) && e.target !== dom.sortTrigger && !dom.sortTrigger.contains(e.target)) {
      closeSortPopover();
    }
  });

  // Popover Sort Items click handlers
  $$('.sort-popover-item').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sort = btn.getAttribute('data-sort');
      closeSortPopover();
      applyFiltersAndRender();
      updateURL();
    });
  });

  // Point 2: Clear all selection plain text button
  dom.clearAllColorsBtn.addEventListener('click', () => {
    state.activeColors = [];
    state.activeGenres.clear();
    state.activeLanguages.clear();
    state.activeImageSrc = null;
    applyFiltersAndRender();
    updateURL();
    showToast(t('color_removed'));
  });

  // Drawer Events
  dom.drawerClose.addEventListener('click', closeDrawer);
  dom.drawerBackdrop.addEventListener('click', closeDrawer);

  $$('#drawer-sort-options .drawer-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sort = btn.getAttribute('data-sort');
      syncDrawerSortButtons();
    });
  });

  dom.drawerToleranceSlider.addEventListener('input', e => {
    state.colorThreshold = parseInt(e.target.value, 10);
    const label = getToleranceLabel(state.colorThreshold, state.lang);
    dom.drawerTolValue.textContent = label;
    const emptyTolSlider = $('#empty-tolerance-slider');
    const emptyTolValue = $('#empty-tol-value');
    if (emptyTolSlider) emptyTolSlider.value = state.colorThreshold;
    if (emptyTolValue) emptyTolValue.textContent = label;
  });

  const emptyTolSlider = $('#empty-tolerance-slider');
  if (emptyTolSlider) {
    emptyTolSlider.addEventListener('input', e => {
      state.colorThreshold = parseInt(e.target.value, 10);
      const label = getToleranceLabel(state.colorThreshold, state.lang);
      dom.drawerToleranceSlider.value = state.colorThreshold;
      dom.drawerTolValue.textContent = label;
      const emptyTolValue = $('#empty-tol-value');
      if (emptyTolValue) emptyTolValue.textContent = label;
      applyFiltersAndRender();
      updateURL();
    });
  }

  $$('.drawer-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filterMode = btn.getAttribute('data-mode');
      syncDrawerModeButtons();
    });
  });

  dom.drawerResetBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.activeGenres.clear();
    state.activeLanguages.clear();
    state.activeColors = [];
    state.activeImageSrc = null;
    state.sort = CONFIG.DEFAULT_SORT;
    state.colorThreshold = CONFIG.DEFAULT_THRESHOLD;
    state.filterMode = 'or';
    closeDrawer();
    applyFiltersAndRender();
    updateURL();
  });

  dom.drawerApplyBtn.addEventListener('click', () => {
    closeDrawer();
    applyFiltersAndRender();
    updateURL();
  });

  // Director Preset Buttons Click Event
  const presetBtns = document.querySelectorAll('.director-preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const colors = btn.getAttribute('data-colors').split(',').map(c => `#${c}`);
      state.activeColors = colors;
      if (state.sort !== 'relevance') state.sort = 'relevance';
      closeDrawer();
      applyFiltersAndRender();
      updateURL();
      showToast(`${t('color_added')} : ${btn.getAttribute('data-name')}`);
    });
  });

  // Film Detail Modal
  dom.modalClose.addEventListener('click', closeModal);
  dom.modalBackdrop.addEventListener('click', closeModal);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!dom.authModal.hasAttribute('hidden')) closeAuthModal();
      else if (!dom.createCollectionModal.hasAttribute('hidden')) closeCreateCollectionModal();
      else if (!dom.profileModal.hasAttribute('hidden')) closeProfileModal();
      else if (!dom.cosmosColorModal.hasAttribute('hidden')) closeColorModal();
      else if (!dom.imageSearchModal.hasAttribute('hidden')) closeImageSearchModal();
      else if (!dom.burgerDrawer.hasAttribute('hidden')) closeDrawer();
      else if (!dom.navMenu.hasAttribute('hidden')) closeNavMenu();
      else if (!dom.filmModal.hasAttribute('hidden')) closeModal();
    }
    if (!dom.filmModal.hasAttribute('hidden') && state.modalFilm && state.sorted.length > 1) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const idx = state.sorted.findIndex(f => getFilmId(f) === getFilmId(state.modalFilm));
        const next = e.key === 'ArrowRight'
          ? Math.min(idx+1, state.sorted.length-1)
          : Math.max(idx-1, 0);
        if (next !== idx) openModal(state.sorted[next]);
      }
    }
  });

  window.addEventListener('resize', debounce(() => {
    renderGrid(true);
  }, 200));

  dom.retryBtn.addEventListener('click', loadData);
  dom.resetFiltersBtn.addEventListener('click', () => {
    state.activeColors = [];
    state.activeGenres.clear();
    state.searchQuery = '';
    applyFiltersAndRender();
    updateURL();
  });
}

/* ============================================================
   IMAGE SEARCH & COLOR EXTRACTION (K-MEANS)
============================================================ */
function openImageSearchModal() {
  dom.imageSearchModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeImageSearchModal() {
  dom.imageSearchModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function setupImageSearchDragAndDrop() {
  const zone = dom.imageDropzone;
  const fileInput = dom.imageFileInput;
  if (!dom.imageSearchTrigger || !zone) return;

  dom.imageSearchTrigger.addEventListener('click', openImageSearchModal);
  dom.imageModalClose.addEventListener('click', closeImageSearchModal);
  dom.imageModalBackdrop.addEventListener('click', closeImageSearchModal);

  zone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      analyzeImageAndExtractColors(e.target.files[0]);
    }
  });

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      analyzeImageAndExtractColors(e.dataTransfer.files[0]);
    }
  });
}

function analyzeImageAndExtractColors(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 64, 64);
      
      const imgData = ctx.getImageData(0, 0, 64, 64).data;
      const pixels = [];
      for (let i = 0; i < imgData.length; i += 4) {
        if (imgData[i+3] < 128) continue; // Skip transparency
        pixels.push({ r: imgData[i], g: imgData[i+1], b: imgData[i+2] });
      }
      
      if (pixels.length === 0) {
        showToast(state.lang === 'en' ? 'Invalid image pixels' : 'Pixels d\'image invalides');
        return;
      }
      
      const centroids = performKMeans(pixels, 3);
      const hexColors = centroids.map(c => rgbToHex(c).toUpperCase());
      
      state.activeImageSrc = e.target.result;
      state.activeColors = hexColors;
      
      closeImageSearchModal();
      
      if (state.sort !== 'relevance') state.sort = 'relevance';
      applyFiltersAndRender();
      updateURL();
      showToast(state.lang === 'en' ? 'Colors extracted successfully' : 'Couleurs extraites avec succès');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function performKMeans(pixels, k) {
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const randIdx = Math.floor(Math.random() * pixels.length);
    centroids.push({ ...pixels[randIdx] });
  }
  
  const maxIterations = 6;
  let clusters = [];
  
  for (let iter = 0; iter < maxIterations; iter++) {
    clusters = Array.from({ length: k }, () => []);
    
    for (const p of pixels) {
      let minDist = Infinity;
      let closestIdx = 0;
      for (let i = 0; i < k; i++) {
        const c = centroids[i];
        const dist = (p.r - c.r) ** 2 + (p.g - c.g) ** 2 + (p.b - c.b) ** 2;
        if (dist < minDist) {
          minDist = dist;
          closestIdx = i;
        }
      }
      clusters[closestIdx].push(p);
    }
    
    let centroidsChanged = false;
    for (let i = 0; i < k; i++) {
      const cluster = clusters[i];
      if (cluster.length === 0) {
        const randIdx = Math.floor(Math.random() * pixels.length);
        centroids[i] = { ...pixels[randIdx] };
        centroidsChanged = true;
        continue;
      }
      
      let sumR = 0, sumG = 0, sumB = 0;
      for (const p of cluster) {
        sumR += p.r;
        sumG += p.g;
        sumB += p.b;
      }
      
      const newCentroid = {
        r: Math.round(sumR / cluster.length),
        g: Math.round(sumG / cluster.length),
        b: Math.round(sumB / cluster.length)
      };
      
      const dist = (centroids[i].r - newCentroid.r) ** 2 + 
                   (centroids[i].g - newCentroid.g) ** 2 + 
                   (centroids[i].b - newCentroid.b) ** 2;
      if (dist > 1) {
        centroids[i] = newCentroid;
        centroidsChanged = true;
      }
    }
    
    if (!centroidsChanged) break;
  }
  
  const sortedCentroids = centroids.map((c, i) => ({
    centroid: c,
    size: clusters[i]?.length || 0
  })).sort((a, b) => b.size - a.size).map(x => x.centroid);
  
  return sortedCentroids;
}

/* ============================================================
   BOOTSTRAP
============================================================ */
(function bootstrap() {
  readURL();
  bindEvents();
  loadData();
})();

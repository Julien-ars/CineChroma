/**
 * CineChroma — app.js  v6.0 (Emynam Crew & Cosmos Aesthetic Engine)
 *
 * Implements:
 * 1. Row-first order (no filter) vs. Top-to-bottom column order (relevance filter)
 * 2. Best matching poster selection based on active color filter
 * 3. Global language translation (UI + synopsis + genres) without inner modal tabs
 * 4. Search clear icon (x) hidden until text is entered
 * 5. Human-readable color tolerance unit (% precision & label)
 * 6. Multi-genre selection in filter drawer & translation in modal
 * 7. Color modal explicit '+ Ajouter' button & conditional 'Rechercher' pill
 * 8. Emynam Crew logo font & Favicon
 * 9. Enlarged color picker trigger button in search bar
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
    pick_color:          'Couleur',
    add_color_btn:       'Ajouter',
    tolerance:           'Précision des nuances',
    filter_mode:         'Mode de filtre couleur',
    filter_mode_or_desc: 'OU (au moins 1 couleur)',
    filter_mode_and_desc:'ET (toutes les couleurs)',
    filters_menu:        'Filtres & Navigation',
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
    favorites:           '♥ Favoris',
    fav_added:           'Ajouté aux favoris',
    fav_removed:         'Retiré des favoris',
    relevance_active:    'Tri par pertinence activé',
    no_color_for_relevance: 'Sélectionnez d\'abord une couleur',
    copied:              'copié !',
  },
  en: {
    search_placeholder:  'Try a color…',
    search:              'Search',
    pick_color:          'Color',
    add_color_btn:       'Add',
    tolerance:           'Shade Precision',
    filter_mode:         'Color Filter Mode',
    filter_mode_or_desc: 'OR (matches at least 1)',
    filter_mode_and_desc:'AND (matches all colors)',
    filters_menu:        'Filters & Navigation',
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
    favorites:           '♥ Favorites',
    fav_added:           'Added to favorites',
    fav_removed:         'Removed from favorites',
    relevance_active:    'Sorted by relevance',
    no_color_for_relevance: 'Select a color first',
    copied:              'copied!',
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
  activeGenres:    new Set(), // Multi-genre support
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
  
  // Cosmos 2D Picker State
  pickerHue:       0,
  pickerSat:       1,
  pickerVal:       1,
  pickerHex:       '#FF0000',
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
  
  // Active Filter Header Bar
  activeFilterBar:      $('#active-filter-bar'),
  filterColorDots:      $('#filter-color-dots'),
  filterHeadingText:    $('#filter-heading-text'),
  activeCountBadge:     $('#active-count-badge'),
  quickSortBtn:         $('#quick-sort-btn'),
  resetActiveFilterBtn: $('#reset-active-filter-btn'),
  
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

  // Burger Drawer
  burgerDrawer:         $('#burger-drawer'),
  drawerBackdrop:       $('#drawer-backdrop'),
  drawerClose:          $('#drawer-close'),
  drawerSortOptions:    $('#drawer-sort-options'),
  drawerToleranceSlider:$('#drawer-tolerance-slider'),
  drawerTolValue:       $('#drawer-tol-value'),
  drawerGenreChips:     $('#drawer-genre-chips'),
  drawerResetBtn:       $('#drawer-reset-btn'),
  drawerApplyBtn:       $('#drawer-apply-btn'),

  // Film Detail Modal
  filmModal:            $('#film-modal'),
  modalBackdrop:        $('#modal-backdrop'),
  modalClose:           $('#modal-close'),
  modalPosterImg:       $('#modal-poster-img'),
  modalPosterSelector:  $('#modal-poster-selector'),
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
  dom.langSwitch.textContent = lang.toUpperCase();

  $$('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  dom.searchInput.placeholder = t('search_placeholder');

  // Update tolerance human readable unit
  dom.drawerTolValue.textContent = getToleranceLabel(state.colorThreshold, state.lang);

  // Update open modal summary if open
  if (state.modalFilm) {
    dom.modalSummary.textContent = state.lang === 'en'
      ? (state.modalFilm.resume_en || state.modalFilm.resume_fr || '')
      : (state.modalFilm.resume_fr || state.modalFilm.resume_en || '');
    
    // Update modal genres translated
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
   COLOR MATH & MATCHING POSTER SELECTION
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

function filmHasColor(film, targetHex, threshold) {
  for (const a of (film.affiches || [])) {
    for (const { hex } of (a.palette || [])) {
      if (colorDistance(hex, targetHex) <= threshold) return true;
    }
  }
  return false;
}

function filmMatchesColors(film, colors, mode, threshold) {
  if (!colors.length) return true;
  return mode === 'and'
    ? colors.every(h => filmHasColor(film, h, threshold))
    : colors.some(h  => filmHasColor(film, h, threshold));
}

function getMinColorDistance(film) {
  if (!state.activeColors.length) return Infinity;
  let min = Infinity;
  for (const a of (film.affiches || [])) {
    for (const { hex } of (a.palette || [])) {
      for (const t of state.activeColors) {
        const d = colorDistance(hex, t);
        if (d < min) min = d;
      }
    }
  }
  return min;
}

/**
 * Requirement 3: Return the poster variant image URL from film.affiches
 * that best matches the selected filter color(s).
 */
function getMatchingPosterUrl(film) {
  if (!film.affiches || !film.affiches.length) return null;

  if (!state.activeColors.length) {
    const defaultPoster = film.affiches[0];
    return defaultPoster.affiche_w500 || defaultPoster.affiche_original || null;
  }

  let bestPoster = film.affiches[0];
  let minDistance = Infinity;

  for (const affiche of film.affiches) {
    for (const { hex } of (affiche.palette || [])) {
      for (const targetHex of state.activeColors) {
        const d = colorDistance(hex, targetHex);
        if (d < minDistance) {
          minDistance = d;
          bestPoster = affiche;
        }
      }
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
  setupCosmosColorPicker();
  syncUIFromState();
  applyFiltersAndRender();
  setupScrollObserver();
  setupScrollTopBtn();
}

function syncUIFromState() {
  dom.searchInput.value = state.searchQuery;
  
  // Point 5: Show clear button ONLY when input has text
  dom.searchClear.hidden = (state.searchQuery.trim().length === 0);

  // Active color dot in search bar
  if (state.activeColors.length > 0) {
    dom.searchColorDot.hidden = false;
    dom.searchColorDot.style.background = state.activeColors[state.activeColors.length - 1];
  } else {
    dom.searchColorDot.hidden = true;
  }

  // Active Filter Header Bar
  renderActiveFilterBar();

  // Drawer UI state
  dom.drawerToleranceSlider.value = state.colorThreshold;
  dom.drawerTolValue.textContent = getToleranceLabel(state.colorThreshold, state.lang);
  syncDrawerSortButtons();
  syncDrawerModeButtons();

  // Point 8: Color modal search button visibility
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
   ACTIVE FILTER BAR
============================================================ */
function renderActiveFilterBar() {
  const hasColors = state.activeColors.length > 0;
  const hasGenres = state.activeGenres.size > 0;

  if (!hasColors && !hasGenres && !state.searchQuery) {
    dom.activeFilterBar.hidden = true;
    return;
  }

  dom.activeFilterBar.hidden = false;
  dom.filterColorDots.innerHTML = '';

  if (hasColors) {
    for (const hex of state.activeColors) {
      const dot = document.createElement('div');
      dot.className = 'active-dot-lg';
      dot.style.background = hex;
      dom.filterColorDots.appendChild(dot);
    }
    dom.filterHeadingText.textContent = state.activeColors.join(', ');
  } else if (hasGenres) {
    const genreNames = [...state.activeGenres].map(g =>
      g === '__favorites__' ? t('favorites') : translateGenre(g, state.lang)
    );
    dom.filterHeadingText.textContent = genreNames.join(', ');
  } else if (state.searchQuery) {
    dom.filterHeadingText.textContent = `"${state.searchQuery}"`;
  }

  dom.activeCountBadge.textContent = `${state.filtered.length} ${state.lang === 'en' ? 'posters' : 'affiches'}`;
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

  // Point 8: Explicit '+ Ajouter' button adds color and reveals 'Rechercher'
  dom.pickerAddColorBtn.addEventListener('click', () => {
    if (state.activeColors.length >= CONFIG.MAX_COLORS) {
      showToast(t('color_max'));
      return;
    }
    if (!state.activeColors.includes(state.pickerHex)) {
      state.activeColors.push(state.pickerHex);
      renderModalActiveColorsRow();
      dom.pickerSearchBtn.hidden = false; // Reveal search button
      showToast(t('color_added'));
    }
  });

  // Point 8: Search Pill Button in Modal (only acts when colors added)
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
    dom.pickerSearchBtn.hidden = true; // Point 8
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
   BURGER DRAWER (MULTI-GENRE & FILTERS)
============================================================ */
function buildDrawerGenreChips() {
  const genres = [...new Set(state.allFilms.flatMap(f => f.genres || []))].sort();
  dom.drawerGenreChips.innerHTML = '';

  // Favorites Chip
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
    chip.textContent = translateGenre(g, state.lang); // Point 7: Translated genre names
    chip.addEventListener('click', () => toggleDrawerGenre(g, chip));
    dom.drawerGenreChips.appendChild(chip);
  }
}

// Point 7: Multi-genre selection toggle
function toggleDrawerGenre(genre, chipEl) {
  if (state.activeGenres.has(genre)) {
    state.activeGenres.delete(genre);
    chipEl.classList.remove('active');
  } else {
    state.activeGenres.add(genre);
    chipEl.classList.add('active');
  }
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

/* ============================================================
   FILTERING & SORTING
============================================================ */
function applyFiltersAndRender() {
  let films = state.allFilms;

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    films = films.filter(f =>
      (f.titre||'').toLowerCase().includes(q) ||
      (f.titre_original||'').toLowerCase().includes(q) ||
      (f.realisateur||'').toLowerCase().includes(q)
    );
  }

  // Point 7: Multi-genre filtering
  if (state.activeGenres.size > 0) {
    if (state.activeGenres.has('__favorites__')) {
      films = films.filter(f => state.favorites.has(getFilmId(f)));
    } else {
      films = films.filter(f =>
        [...state.activeGenres].some(g => (f.genres||[]).includes(g))
      );
    }
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
      score: state.colorThreshold - getMinColorDistance(f),
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
   COSMOS STAGGERED MASONRY GRID RENDERING (Points 1 & 2)
============================================================ */
function renderGrid(reset = false) {
  if (reset) dom.filmGrid.innerHTML = '';

  if (!state.sorted.length) {
    showState('empty');
    dom.scrollSentinel.innerHTML = '';
    return;
  }

  showState('grid');

  const start = (state.currentPage - 1) * CONFIG.PAGE_SIZE;
  const end   = state.currentPage * CONFIG.PAGE_SIZE;
  const page  = state.sorted.slice(start, end);

  const frag = document.createDocumentFragment();
  const ratioClasses = ['ratio-tall', 'ratio-square', 'ratio-medium', 'ratio-wide'];

  /**
   * Points 1 & 2: Grid order logic
   * - Without color filter / Relevance sort: Transpose array across columns so reading order
   *   flows left-to-right top-to-bottom!
   * - With Relevance sort / Color filter: Keep natural column-first flow so rankings go
   *   from top to bottom down column 1, then column 2, etc.!
   */
  const numColumns = getResponsiveColumnCount();
  const displayPage = (state.sort === 'relevance' && state.activeColors.length)
    ? page // Column-first: Top-to-bottom relevance order!
    : interleaveForRows(page, numColumns); // Row-first: Left-to-right reading order!

  displayPage.forEach((film, index) => {
    const ratioClass = ratioClasses[(start + index) % ratioClasses.length];
    frag.appendChild(buildCard(film, ratioClass));
  });

  dom.filmGrid.appendChild(frag);

  const loaded = Math.min(end, state.sorted.length);
  dom.scrollSentinel.innerHTML = loaded < state.sorted.length
    ? '<div class="scroll-loading"></div>' : '';
}

/**
 * Interleaves array elements across N columns so that CSS `columns` renders them
 * in row-by-row left-to-right order.
 */
function interleaveForRows(arr, numCols) {
  if (numCols <= 1 || arr.length <= 1) return arr;
  const cols = Array.from({ length: numCols }, () => []);
  arr.forEach((item, idx) => {
    cols[idx % numCols].push(item);
  });
  return cols.flat();
}

function getResponsiveColumnCount() {
  const w = window.innerWidth;
  if (w <= 600) return 2;
  if (w <= 900) return 3;
  if (w <= 1200) return 4;
  return 5;
}

/* ============================================================
   CARD BUILDER (Point 3: Matching Poster Display)
============================================================ */
function buildCard(film, ratioClass) {
  const card = document.createElement('article');
  card.className = `film-card ${ratioClass}`;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', film.titre || film.titre_original || 'Film');

  const filmId  = getFilmId(film);
  // Point 3: Fetch the specific poster variant matching active color filter
  const src     = getMatchingPosterUrl(film);
  const year    = formatYear(film.date_sortie);
  const isFav   = state.favorites.has(filmId);

  let matchScore = null;
  if (state.activeColors.length) {
    const d = getMinColorDistance(film);
    if (d !== Infinity) {
      matchScore = Math.max(0, Math.min(100, Math.round((1 - d / state.colorThreshold) * 100)));
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
   FAVORITES
============================================================ */
function toggleFavorite(filmId, btnEl) {
  if (state.favorites.has(filmId)) {
    state.favorites.delete(filmId);
    btnEl.classList.remove('active');
    btnEl.querySelector('svg').setAttribute('fill','none');
    showToast(t('fav_removed'));
  } else {
    state.favorites.add(filmId);
    btnEl.classList.add('active');
    btnEl.querySelector('svg').setAttribute('fill','currentColor');
    showToast(t('fav_added'));
  }
  localStorage.setItem('cinechroma_favorites', JSON.stringify([...state.favorites]));
  buildDrawerGenreChips();
  if (state.activeGenres.has('__favorites__')) applyFiltersAndRender();
}

/* ============================================================
   FILM DETAIL MODAL (Point 4: Auto-translated by global lang)
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
  document.body.style.overflow = '';
  state.modalFilm = null;
}

function populateModal(film) {
  updateModalPoster(film, 0);

  // Poster thumbnails
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

  // Trailer
  if (film.bande_annonce_url) {
    dom.modalTrailerBtn.href = film.bande_annonce_url;
    dom.modalTrailerBtn.removeAttribute('hidden');
  } else {
    dom.modalTrailerBtn.setAttribute('hidden', '');
  }

  // Palette
  renderModalPalette(getFirstPalette(film));

  // Metadata
  if (film.certification) {
    dom.modalCertification.textContent = film.certification;
    dom.modalCertification.removeAttribute('hidden');
  } else {
    dom.modalCertification.setAttribute('hidden', '');
  }

  // Point 7: Translated genres in modal
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
  dom.modalRuntime.textContent  = formatRuntime(film.duree_min);
  dom.modalLanguage.textContent = (film.langue_originale||'').toUpperCase() || 'N/A';
  dom.modalBudget.textContent   = formatCurrency(film.budget);
  dom.modalRevenue.textContent  = formatCurrency(film.recettes);

  // Point 4: Single synopsis text translated automatically by global language setting
  dom.modalSummary.textContent = state.lang === 'en'
    ? (film.resume_en || film.resume_fr || 'Summary not available.')
    : (film.resume_fr || film.resume_en || 'Résumé non disponible.');
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
}

function renderModalPalette(palette) {
  dom.modalPalette.innerHTML = '';
  const maxW = Math.max(...palette.map(e => e.weight||0), 1);
  for (const entry of palette) {
    const hex = (entry.hex||'').startsWith('#') ? entry.hex : `#${entry.hex}`;
    if (!hex || hex === '#') continue;
    const barPct = Math.round((entry.weight||0) / maxW * 100);
    const isActive = state.activeColors.includes(hex);

    const item = document.createElement('div');
    item.className = `modal-palette-item${isActive ? ' filter-active' : ''}`;
    item.setAttribute('role', 'button'); item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Filtrer par ${hex}`);
    item.innerHTML = `
      <div class="modal-palette-swatch" style="background:${hex}"></div>
      <div class="modal-palette-info">
        <div class="modal-palette-hex">${hex}</div>
        <div class="palette-bar-container">
          <div class="palette-bar-fill" style="background:${hex}; width:${barPct}%"></div>
        </div>
        <div class="modal-palette-weight">${(entry.weight||0).toFixed(1)}%</div>
      </div>
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

function getFirstPoster(film) {
  for (const a of (film.affiches || [])) {
    if (a.affiche_w500) return a.affiche_w500;
    if (a.affiche_original) return a.affiche_original;
  }
  return null;
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

/* ============================================================
   URL PERSISTENCE
============================================================ */
function updateURL() {
  const p = new URLSearchParams();
  if (state.searchQuery)                        p.set('q', state.searchQuery);
  if (state.activeGenres.size > 0)             p.set('genres', [...state.activeGenres].join(','));
  if (state.activeColors.length)                p.set('colors', state.activeColors.join(','));
  if (state.sort !== CONFIG.DEFAULT_SORT)       p.set('sort', state.sort);
  if (state.colorThreshold !== CONFIG.DEFAULT_THRESHOLD) p.set('tol', state.colorThreshold);
  if (state.filterMode !== 'or')                p.set('mode', state.filterMode);
  history.replaceState(null, '', p.toString() ? `?${p}` : location.pathname);
}

function readURL() {
  const p = new URLSearchParams(location.search);
  if (p.has('q'))      state.searchQuery = p.get('q');
  if (p.has('genres')) state.activeGenres = new Set(p.get('genres').split(','));
  if (p.has('genre'))  state.activeGenres.add(p.get('genre'));
  if (p.has('colors')) state.activeColors = p.get('colors').split(',').filter(h => /^#[0-9a-fA-F]{6}$/.test(h));
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
  // Point 5: Show clear search button ONLY when input has text
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
  dom.burgerTrigger.addEventListener('click', openDrawer);
  
  // Point 4: Global language switch changes everything including modal synopsis
  dom.langSwitch.addEventListener('click', () => {
    applyLang(state.lang === 'fr' ? 'en' : 'fr');
  });

  // Active Filter Header Bar Actions
  dom.resetActiveFilterBtn.addEventListener('click', () => {
    state.activeColors = [];
    state.activeGenres.clear();
    state.searchQuery = '';
    dom.searchInput.value = '';
    applyFiltersAndRender();
    updateURL();
  });

  dom.quickSortBtn.addEventListener('click', openDrawer);

  // Drawer Events
  dom.drawerClose.addEventListener('click', closeDrawer);
  dom.drawerBackdrop.addEventListener('click', closeDrawer);

  $$('#drawer-sort-options .drawer-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sort = btn.getAttribute('data-sort');
      syncDrawerSortButtons();
    });
  });

  // Point 6: Tolerance slider update with human-readable label
  dom.drawerToleranceSlider.addEventListener('input', e => {
    state.colorThreshold = parseInt(e.target.value, 10);
    dom.drawerTolValue.textContent = getToleranceLabel(state.colorThreshold, state.lang);
  });

  $$('.drawer-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filterMode = btn.getAttribute('data-mode');
      syncDrawerModeButtons();
    });
  });

  dom.drawerResetBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.activeGenres.clear();
    state.activeColors = [];
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

  // Film Detail Modal
  dom.modalClose.addEventListener('click', closeModal);
  dom.modalBackdrop.addEventListener('click', closeModal);

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!dom.cosmosColorModal.hasAttribute('hidden')) closeColorModal();
      else if (!dom.burgerDrawer.hasAttribute('hidden')) closeDrawer();
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

  // Resize listener for grid interleaving update
  window.addEventListener('resize', debounce(() => {
    renderGrid(true);
  }, 200));

  // Retry / Reset
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
   BOOTSTRAP
============================================================ */
(function bootstrap() {
  readURL();
  bindEvents();
  loadData();
})();

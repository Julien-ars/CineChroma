/**
 * CineChroma — app.js  v2.0
 * Features: i18n FR/EN, multi-color filter (max 5, OR mode),
 *           6 preset swatches, custom color popover (spectrum + hex + HSL),
 *           sorting, genre chips, modal, toast.
 */

'use strict';

/* ============================================================
   CONFIGURATION
============================================================ */
const CONFIG = {
  DATA_URL: './database_films_tmdb_riche.json',
  PAGE_SIZE: 40,
  DEFAULT_SORT: 'popularity',
  MAX_GLOBAL_SWATCHES: 60,
  DEFAULT_THRESHOLD: 30,
  MAX_COLORS: 5,
};

/* ============================================================
   PRESET COLORS  (ordre arc-en-ciel)
============================================================ */
const PRESET_COLORS = [
  { hex: '#e63946', name_fr: 'Rouge',  name_en: 'Red'    },
  { hex: '#f4a261', name_fr: 'Orange', name_en: 'Orange' },
  { hex: '#f4d03f', name_fr: 'Jaune',  name_en: 'Yellow' },
  { hex: '#2a9d8f', name_fr: 'Vert',   name_en: 'Green'  },
  { hex: '#457b9d', name_fr: 'Bleu',   name_en: 'Blue'   },
  { hex: '#8b5cf6', name_fr: 'Violet', name_en: 'Violet' },
];

/* ============================================================
   i18n DICTIONARIES
============================================================ */
const I18N = {
  fr: {
    brand_sub:        'Moteur cinématographique par couleur',
    search_placeholder: 'Rechercher par titre ou réalisateur…',
    counter_label:    'films',
    filter_by_color:  'Filtrer par couleur',
    filter_mode_or:   'OU',
    filter_mode_and:  'ET',
    add_color:        'Couleur',
    tolerance:        'Tolérance',
    reset:            'Réinitialiser',
    custom_color:     'Couleur personnalisée',
    hue:              'Teinte',
    saturation:       'Saturation',
    lightness:        'Luminosité',
    from_films:       'Depuis les films',
    cancel:           'Annuler',
    apply:            'Appliquer',
    sort_by:          'Trier par :',
    sort_popularity:  'Popularité',
    sort_rating:      'Note',
    sort_date:        'Date de sortie',
    sort_title:       'Titre (A-Z)',
    sort_revenue:     'Recettes',
    loading:          'Chargement de la cinémathèque…',
    error_title:      'Impossible de charger la base de données',
    retry:            'Réessayer',
    no_results:       'Aucun film trouvé',
    no_results_hint:  'Essayez d\'ajuster vos filtres ou votre recherche.',
    reset_filters:    'Réinitialiser les filtres',
    load_more:        'Charger plus de films',
    watch_trailer:    'Voir la bande-annonce',
    chromatic_palette:'Palette chromatique',
    director:         'Réalisateur',
    release:          'Sortie',
    runtime:          'Durée',
    language:         'Langue',
    budget:           'Budget',
    revenue:          'Recettes',
    popularity:       'popularité',
    color_added:      'Couleur ajoutée',
    color_max:        'Maximum 5 couleurs atteint',
    color_removed:    'Couleur retirée',
    copied:           'copié !',
    load_more_remaining: 'restants',
  },
  en: {
    brand_sub:        'Cinematic color search engine',
    search_placeholder: 'Search by title or director…',
    counter_label:    'films',
    filter_by_color:  'Filter by color',
    filter_mode_or:   'OR',
    filter_mode_and:  'AND',
    add_color:        'Color',
    tolerance:        'Tolerance',
    reset:            'Reset',
    custom_color:     'Custom color',
    hue:              'Hue',
    saturation:       'Saturation',
    lightness:        'Lightness',
    from_films:       'From films',
    cancel:           'Cancel',
    apply:            'Apply',
    sort_by:          'Sort by:',
    sort_popularity:  'Popularity',
    sort_rating:      'Rating',
    sort_date:        'Release date',
    sort_title:       'Title (A-Z)',
    sort_revenue:     'Revenue',
    loading:          'Loading the film library…',
    error_title:      'Failed to load the database',
    retry:            'Retry',
    no_results:       'No films found',
    no_results_hint:  'Try adjusting your filters or search query.',
    reset_filters:    'Reset filters',
    load_more:        'Load more films',
    watch_trailer:    'Watch trailer',
    chromatic_palette:'Chromatic palette',
    director:         'Director',
    release:          'Release',
    runtime:          'Runtime',
    language:         'Language',
    budget:           'Budget',
    revenue:          'Revenue',
    popularity:       'popularity',
    color_added:      'Color added',
    color_max:        'Maximum 5 colors reached',
    color_removed:    'Color removed',
    copied:           'copied!',
    load_more_remaining: 'remaining',
  },
};

/* ============================================================
   STATE
============================================================ */
const state = {
  allFilms:      [],
  filtered:      [],
  sorted:        [],
  currentPage:   1,
  searchQuery:   '',
  activeGenre:   null,
  activeColors:  [],          // array of hex strings (max 5)
  filterMode:    'or',        // 'or' | 'and'
  colorThreshold: CONFIG.DEFAULT_THRESHOLD,
  sort:          CONFIG.DEFAULT_SORT,
  lang:          localStorage.getItem('cinechroma_lang') || 'fr',
  modalFilm:     null,
  modalPosterIndex: 0,
  globalSwatches: [],         // top colors extracted from all films
};

/* ============================================================
   DOM REFERENCES
============================================================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const dom = {
  searchInput:        $('#search-input'),
  searchClear:        $('#search-clear'),
  visibleCount:       $('#visible-count'),
  totalCount:         $('#total-count'),
  filmGrid:           $('#film-grid'),
  loadingState:       $('#loading-state'),
  errorState:         $('#error-state'),
  errorMessage:       $('#error-message'),
  emptyState:         $('#empty-state'),
  retryBtn:           $('#retry-btn'),
  resetFiltersBtn:    $('#reset-filters-btn'),
  clearColorFilter:   $('#clear-color-filter'),
  similaritySlider:   $('#similarity-threshold'),
  thresholdDisplay:   $('#threshold-display'),
  genreChips:         $('#genre-chips'),
  sortSelect:         $('#sort-select'),
  loadMoreContainer:  $('#load-more-container'),
  loadMoreBtn:        $('#load-more-btn'),
  filmModal:          $('#film-modal'),
  modalBackdrop:      $('#modal-backdrop'),
  modalClose:         $('#modal-close'),
  modalPosterImg:     $('#modal-poster-img'),
  modalPosterSelector: $('#modal-poster-selector'),
  modalTrailerBtn:    $('#modal-trailer-btn'),
  modalPalette:       $('#modal-palette'),
  modalCertification: $('#modal-certification'),
  modalGenres:        $('#modal-genres'),
  modalTitle:         $('#modal-title'),
  modalOriginalTitle: $('#modal-original-title'),
  modalStars:         $('#modal-stars'),
  modalRating:        $('#modal-rating'),
  modalPopularity:    $('#modal-popularity'),
  modalDirector:      $('#modal-director'),
  modalDate:          $('#modal-date'),
  modalRuntime:       $('#modal-runtime'),
  modalLanguage:      $('#modal-language'),
  modalBudget:        $('#modal-budget'),
  modalRevenue:       $('#modal-revenue'),
  summaryFr:          $('#summary-fr'),
  summaryEn:          $('#summary-en'),
  toast:              $('#toast'),
  // Color panel
  presetSwatches:     $('#preset-swatches'),
  activeColorPills:   $('#active-color-pills'),
  filterModeBadge:    $('#filter-mode-badge'),
  addColorBtn:        $('#add-color-btn'),
  // Popover
  colorPopover:       $('#color-popover'),
  popoverBackdrop:    $('#popover-backdrop'),
  customColorInput:   $('#custom-color-input'),
  hexTextInput:       $('#hex-text-input'),
  hexPreview:         $('#hex-preview'),
  hslH:               $('#hsl-h'),
  hslS:               $('#hsl-s'),
  hslL:               $('#hsl-l'),
  hslHVal:            $('#hsl-h-val'),
  hslSVal:            $('#hsl-s-val'),
  hslLVal:            $('#hsl-l-val'),
  popoverSwatches:    $('#popover-swatches'),
  popoverCancel:      $('#popover-cancel'),
  popoverApply:       $('#popover-apply'),
  // Lang
  langToggle:         $('.lang-toggle'),
};

/* ============================================================
   i18n
============================================================ */
function t(key) {
  return (I18N[state.lang] || I18N.fr)[key] || key;
}

function applyLang(lang) {
  state.lang = lang;
  localStorage.setItem('cinechroma_lang', lang);

  // Update <html> attribute
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-lang', lang);

  // Update lang toggle pill
  dom.langToggle.setAttribute('data-active', lang);
  $$('[data-lang-switch]').forEach(btn => {
    const isActive = btn.getAttribute('data-lang-switch') === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  // Update all data-i18n elements
  $$('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Update placeholder inputs
  $$('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // Update preset swatch tooltips
  $$('.preset-swatch-btn').forEach(btn => {
    const idx = parseInt(btn.getAttribute('data-preset-index'), 10);
    const preset = PRESET_COLORS[idx];
    if (preset) {
      const name = lang === 'fr' ? preset.name_fr : preset.name_en;
      btn.setAttribute('data-name', name);
      btn.setAttribute('aria-label', `${t('filter_by_color')} : ${name}`);
    }
  });

  // Update sort options text
  $$('#sort-select option[data-i18n]').forEach(opt => {
    opt.textContent = t(opt.getAttribute('data-i18n'));
  });

  // Update filter mode badge
  renderFilterModeBadge();

  // Update load more button
  renderLoadMoreBtn();
}

/* ============================================================
   UTILITY: COLOR MATH
============================================================ */
function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function linearize(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function rgbToLab({ r, g, b }) {
  const rl = linearize(r), gl = linearize(g), bl = linearize(b);
  let x = rl * 0.4124 + gl * 0.3576 + bl * 0.1805;
  let y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  let z = rl * 0.0193 + gl * 0.1192 + bl * 0.9505;
  x /= 0.9505; y /= 1.0000; z /= 1.0890;
  const f = v => v > 0.008856 ? Math.cbrt(v) : (7.787 * v) + (16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

function colorDistance(hexA, hexB) {
  const rgbA = hexToRgb(hexA), rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return Infinity;
  const labA = rgbToLab(rgbA), labB = rgbToLab(rgbB);
  return Math.sqrt(
    Math.pow(labA.L - labB.L, 2) +
    Math.pow(labA.a - labB.a, 2) +
    Math.pow(labA.b - labB.b, 2)
  );
}

function filmHasColor(film, targetHex, threshold) {
  for (const affiche of (film.affiches || [])) {
    for (const { hex } of (affiche.palette || [])) {
      if (colorDistance(hex, targetHex) <= threshold) return true;
    }
  }
  return false;
}

function filmMatchesColors(film, colors, mode, threshold) {
  if (!colors.length) return true;
  if (mode === 'and') {
    return colors.every(hex => filmHasColor(film, hex, threshold));
  }
  return colors.some(hex => filmHasColor(film, hex, threshold));
}

/* ============================================================
   HSL ↔ HEX conversion helpers
============================================================ */
function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };
  let { r, g, b } = rgb;
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/* ============================================================
   UTILITY: FORMATTING
============================================================ */
function formatCurrency(val) {
  if (!val || val === 0) return 'N/A';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}Md`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  return `$${val.toLocaleString('fr-FR')}`;
}

function formatRuntime(min) {
  if (!min || min === 0) return 'N/A';
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h}h ${m.toString().padStart(2, '0')}min` : `${m}min`;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const locale = state.lang === 'en' ? 'en-GB' : 'fr-FR';
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatYear(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).getFullYear() || '';
}

function getFirstPoster(film, size = 'w500') {
  const key = size === 'w500' ? 'affiche_w500' : 'affiche_original';
  for (const a of (film.affiches || [])) {
    if (a[key]) return a[key];
  }
  for (const a of (film.affiches || [])) {
    if (a.affiche_w500) return a.affiche_w500;
    if (a.affiche_original) return a.affiche_original;
  }
  return null;
}

function getFirstPalette(film) {
  for (const a of (film.affiches || [])) {
    if (a.palette && a.palette.length) return a.palette;
  }
  return [];
}

function starsHtml(rating) {
  const out = rating / 2;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (out >= i) html += '<span class="star-filled">★</span>';
    else if (out >= i - 0.5) html += '<span class="star-filled" style="opacity:0.5">★</span>';
    else html += '<span class="star-empty">☆</span>';
  }
  return html;
}

/* ============================================================
   DATA LOADING
============================================================ */
async function loadData() {
  showState('loading');
  try {
    const res = await fetch(CONFIG.DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
    const raw = await res.json();
    const films = Array.isArray(raw) ? raw : raw.films || raw.data || Object.values(raw);
    if (!films.length) throw new Error('Aucun film trouvé dans le fichier JSON.');
    state.allFilms = films;
    dom.totalCount.textContent = films.length;
    initApp();
  } catch (err) {
    console.error('[CineChroma] Erreur de chargement :', err);
    dom.errorMessage.textContent = err.message;
    showState('error');
  }
}

/* ============================================================
   APP INIT
============================================================ */
function initApp() {
  buildGenreChips();
  buildPresetSwatches();
  buildGlobalSwatches();
  applyLang(state.lang);
  applyFiltersAndRender();
}

/* ============================================================
   STATE MANAGEMENT
============================================================ */
function showState(s) {
  dom.loadingState.style.display  = s === 'loading' ? 'flex' : 'none';
  dom.errorState.style.display    = s === 'error'   ? 'flex' : 'none';
  dom.emptyState.style.display    = s === 'empty'   ? 'flex' : 'none';
  dom.filmGrid.style.display      = s === 'grid'    ? 'grid' : 'none';
  dom.loadMoreContainer.style.display = s === 'grid' ? 'flex' : 'none';
}

/* ============================================================
   GENRE CHIPS
============================================================ */
function buildGenreChips() {
  const genreSet = new Set();
  for (const film of state.allFilms) {
    for (const g of (film.genres || [])) genreSet.add(g);
  }
  const genres = [...genreSet].sort();
  dom.genreChips.innerHTML = '';
  for (const g of genres) {
    const chip = document.createElement('button');
    chip.className = 'genre-chip';
    chip.textContent = g;
    chip.setAttribute('data-genre', g);
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => toggleGenre(g, chip));
    dom.genreChips.appendChild(chip);
  }
}

function toggleGenre(genre, chipEl) {
  if (state.activeGenre === genre) {
    state.activeGenre = null;
    chipEl.classList.remove('active');
    chipEl.setAttribute('aria-pressed', 'false');
  } else {
    state.activeGenre = genre;
    $$('.genre-chip.active').forEach(c => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    chipEl.classList.add('active');
    chipEl.setAttribute('aria-pressed', 'true');
  }
  state.currentPage = 1;
  applyFiltersAndRender();
}

/* ============================================================
   PRESET SWATCHES
============================================================ */
function buildPresetSwatches() {
  dom.presetSwatches.innerHTML = '';
  PRESET_COLORS.forEach((preset, idx) => {
    const btn = document.createElement('button');
    btn.className = 'preset-swatch-btn';
    btn.style.backgroundColor = preset.hex;
    btn.setAttribute('data-hex', preset.hex);
    btn.setAttribute('data-preset-index', idx);
    const name = state.lang === 'fr' ? preset.name_fr : preset.name_en;
    btn.setAttribute('data-name', name);
    btn.setAttribute('aria-label', `${t('filter_by_color')} : ${name}`);
    btn.addEventListener('click', () => toggleColorFilter(preset.hex));
    dom.presetSwatches.appendChild(btn);
  });
}

/* ============================================================
   GLOBAL SWATCHES (for popover)
============================================================ */
function buildGlobalSwatches() {
  const colorMap = new Map();
  for (const film of state.allFilms) {
    for (const affiche of (film.affiches || [])) {
      for (const entry of (affiche.palette || [])) {
        const hex = (entry.hex || '').toLowerCase();
        if (!hex || !/^#?[0-9a-f]{6}$/i.test(hex)) continue;
        const norm = hex.startsWith('#') ? hex : `#${hex}`;
        colorMap.set(norm, (colorMap.get(norm) || 0) + (entry.weight || 0));
      }
    }
  }
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
  const selected = [];
  const CLUSTER_THRESH = 18;
  for (const [hex] of sorted) {
    if (selected.length >= CONFIG.MAX_GLOBAL_SWATCHES) break;
    const tooClose = selected.some(s => colorDistance(s, hex) < CLUSTER_THRESH);
    if (!tooClose) selected.push(hex);
  }
  state.globalSwatches = selected;

  // Populate popover swatches
  dom.popoverSwatches.innerHTML = '';
  for (const hex of selected.slice(0, 30)) {
    const sw = document.createElement('button');
    sw.className = 'popover-swatch';
    sw.style.backgroundColor = hex;
    sw.title = hex;
    sw.setAttribute('aria-label', hex);
    sw.addEventListener('click', () => {
      setPopoverColor(hex);
    });
    dom.popoverSwatches.appendChild(sw);
  }
}

/* ============================================================
   COLOR FILTER LOGIC
============================================================ */
function toggleColorFilter(hex) {
  const idx = state.activeColors.indexOf(hex);
  if (idx !== -1) {
    // Remove
    state.activeColors.splice(idx, 1);
    showToast(t('color_removed'));
  } else {
    // Add
    if (state.activeColors.length >= CONFIG.MAX_COLORS) {
      showToast(t('color_max'));
      return;
    }
    state.activeColors.push(hex);
    showToast(t('color_added'));
  }
  state.currentPage = 1;
  renderActiveColorPills();
  syncPresetHighlights();
  updateClearBtn();
  updateAddColorBtn();
  applyFiltersAndRender();
}

function addCustomColor(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  if (state.activeColors.includes(hex)) {
    closePopover();
    return;
  }
  if (state.activeColors.length >= CONFIG.MAX_COLORS) {
    showToast(t('color_max'));
    closePopover();
    return;
  }
  state.activeColors.push(hex);
  state.currentPage = 1;
  showToast(t('color_added'));
  renderActiveColorPills();
  syncPresetHighlights();
  updateClearBtn();
  updateAddColorBtn();
  applyFiltersAndRender();
  closePopover();
}

function removeColor(hex) {
  const idx = state.activeColors.indexOf(hex);
  if (idx !== -1) {
    state.activeColors.splice(idx, 1);
    state.currentPage = 1;
    renderActiveColorPills();
    syncPresetHighlights();
    updateClearBtn();
    updateAddColorBtn();
    applyFiltersAndRender();
    showToast(t('color_removed'));
  }
}

function clearColorFilter() {
  state.activeColors = [];
  state.currentPage = 1;
  renderActiveColorPills();
  syncPresetHighlights();
  updateClearBtn();
  updateAddColorBtn();
  applyFiltersAndRender();
}

function renderActiveColorPills() {
  dom.activeColorPills.innerHTML = '';
  for (const hex of state.activeColors) {
    const pill = document.createElement('div');
    pill.className = 'color-pill';
    pill.innerHTML = `
      <span class="pill-dot" style="background:${hex}; box-shadow: 0 0 6px ${hex}80"></span>
      <span>${hex}</span>
      <button class="pill-remove" aria-label="Supprimer ${hex}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    `;
    pill.querySelector('.pill-remove').addEventListener('click', () => removeColor(hex));
    dom.activeColorPills.appendChild(pill);
  }
  renderFilterModeBadge();
}

function renderFilterModeBadge() {
  if (state.activeColors.length >= 2) {
    dom.filterModeBadge.style.display = 'inline-flex';
    dom.filterModeBadge.textContent = t(state.filterMode === 'or' ? 'filter_mode_or' : 'filter_mode_and');
  } else {
    dom.filterModeBadge.style.display = 'none';
  }
}

function syncPresetHighlights() {
  $$('.preset-swatch-btn').forEach(btn => {
    const hex = btn.getAttribute('data-hex');
    btn.classList.toggle('active', state.activeColors.includes(hex));
  });
}

function updateClearBtn() {
  dom.clearColorFilter.hidden = state.activeColors.length === 0;
}

function updateAddColorBtn() {
  const disabled = state.activeColors.length >= CONFIG.MAX_COLORS;
  dom.addColorBtn.classList.toggle('disabled', disabled);
  dom.addColorBtn.setAttribute('aria-disabled', String(disabled));
}

/* ============================================================
   COLOR POPOVER
============================================================ */
function openPopover() {
  if (state.activeColors.length >= CONFIG.MAX_COLORS) {
    showToast(t('color_max'));
    return;
  }
  dom.colorPopover.hidden = false;
  dom.popoverBackdrop.hidden = false;
  dom.addColorBtn.setAttribute('aria-expanded', 'true');
  // Position popover below add button
  positionPopover();
}

function positionPopover() {
  const btnRect = dom.addColorBtn.getBoundingClientRect();
  const popover = dom.colorPopover;
  const pw = popover.offsetWidth || 320;
  let left = btnRect.left + btnRect.width / 2 - pw / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
  const top = btnRect.bottom + 12;
  popover.style.left = `${left}px`;
  popover.style.top  = `${top}px`;
  popover.style.position = 'fixed';

  // Move arrow
  const arrow = popover.querySelector('.popover-arrow');
  if (arrow) {
    const arrowLeft = btnRect.left + btnRect.width / 2 - left - 7;
    arrow.style.left = `${Math.max(14, Math.min(arrowLeft, pw - 14))}px`;
  }
}

function closePopover() {
  dom.colorPopover.hidden = true;
  dom.popoverBackdrop.hidden = true;
  dom.addColorBtn.setAttribute('aria-expanded', 'false');
}

function setPopoverColor(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  dom.customColorInput.value = hex;
  dom.hexTextInput.value = hex;
  dom.hexPreview.style.background = hex;
  // Update HSL sliders
  const { h, s, l } = hexToHsl(hex);
  dom.hslH.value = h; dom.hslHVal.textContent = `${h}°`;
  dom.hslS.value = s; dom.hslSVal.textContent = `${s}%`;
  dom.hslL.value = l; dom.hslLVal.textContent = `${l}%`;
  // Update sat/lum track color
  updateSliderTracks(h, s, l);
}

function updateSliderTracks(h, s, l) {
  dom.hslS.closest('.sat-track').style.background =
    `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`;
  dom.hslL.closest('.lum-track').style.background =
    `linear-gradient(to right, #000, hsl(${h},${s}%,50%), #fff)`;
}

/* ============================================================
   FILTERING
============================================================ */
function applyFiltersAndRender() {
  let films = state.allFilms;

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    films = films.filter(f =>
      (f.titre || '').toLowerCase().includes(q) ||
      (f.titre_original || '').toLowerCase().includes(q) ||
      (f.realisateur || '').toLowerCase().includes(q)
    );
  }

  if (state.activeGenre) {
    films = films.filter(f => (f.genres || []).includes(state.activeGenre));
  }

  if (state.activeColors.length) {
    films = films.filter(f =>
      filmMatchesColors(f, state.activeColors, state.filterMode, state.colorThreshold)
    );
  }

  state.filtered = films;
  state.sorted = sortFilms(films, state.sort);
  state.currentPage = 1;
  renderGrid(true);
  dom.visibleCount.textContent = Math.min(CONFIG.PAGE_SIZE, state.sorted.length);
}

/* ============================================================
   SORTING
============================================================ */
function sortFilms(films, sortKey) {
  return [...films].sort((a, b) => {
    switch (sortKey) {
      case 'popularity': return (b.popularite || 0) - (a.popularite || 0);
      case 'rating':     return (b.note_moyenne || 0) - (a.note_moyenne || 0);
      case 'date':       return new Date(b.date_sortie || 0) - new Date(a.date_sortie || 0);
      case 'title':      return (a.titre || '').localeCompare(b.titre || '', 'fr');
      case 'revenue':    return (b.recettes || 0) - (a.recettes || 0);
      default:           return 0;
    }
  });
}

/* ============================================================
   GRID RENDERING
============================================================ */
function renderGrid(reset = false) {
  if (reset) dom.filmGrid.innerHTML = '';

  if (state.sorted.length === 0) {
    showState('empty');
    return;
  }

  showState('grid');

  const start = (state.currentPage - 1) * CONFIG.PAGE_SIZE;
  const end   = state.currentPage * CONFIG.PAGE_SIZE;
  const page  = state.sorted.slice(start, end);

  for (const film of page) {
    const card = buildCard(film);
    dom.filmGrid.appendChild(card);
  }

  renderLoadMoreBtn();
  dom.visibleCount.textContent = Math.min(end, state.sorted.length);
}

function renderLoadMoreBtn() {
  const end = state.currentPage * CONFIG.PAGE_SIZE;
  if (state.sorted && end < state.sorted.length) {
    dom.loadMoreContainer.style.display = 'flex';
    const remaining = state.sorted.length - end;
    dom.loadMoreBtn.innerHTML = `
      <span>${t('load_more')} (${remaining} ${t('load_more_remaining')})</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <path d="M12 5v14M5 12l7 7 7-7"/>
      </svg>
    `;
  } else {
    dom.loadMoreContainer.style.display = 'none';
  }
}

/* ============================================================
   CARD BUILDER
============================================================ */
function buildCard(film) {
  const card = document.createElement('article');
  card.className = 'film-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${film.titre || 'Film'}`);

  const posterSrc = getFirstPoster(film, 'w500');
  const palette   = getFirstPalette(film);
  const year      = formatYear(film.date_sortie);
  const genres    = (film.genres || []).slice(0, 2);
  const rating    = film.note_moyenne ? film.note_moyenne.toFixed(1) : null;

  // Dominant color for glow
  const dominantHex = palette[0]?.hex
    ? (palette[0].hex.startsWith('#') ? palette[0].hex : `#${palette[0].hex}`)
    : null;

  card.innerHTML = `
    <div class="card-poster-wrap">
      ${posterSrc
        ? `<img class="card-poster" src="${escHtml(posterSrc)}" alt="${escHtml(film.titre || 'Affiche')}" loading="lazy" />`
        : `<div class="card-poster-placeholder">🎬</div>`
      }
      ${rating ? `
        <div class="card-rating-badge">
          <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${rating}
        </div>
      ` : ''}
      <div class="card-gradient-overlay"></div>
    </div>
    <div class="card-info">
      <p class="card-title">${escHtml(film.titre || film.titre_original || 'Titre inconnu')}</p>
      <div class="card-meta">
        <span class="card-date">${year || 'N/A'}</span>
      </div>
      ${genres.length ? `<div class="card-genres">${genres.map(g => `<span class="genre-tag">${escHtml(g)}</span>`).join('')}</div>` : ''}
      ${buildPaletteBars(palette)}
    </div>
  `;

  // Colored glow on match
  if (state.activeColors.length && filmMatchesColors(film, state.activeColors, state.filterMode, state.colorThreshold)) {
    const glowHex = state.activeColors[0];
    card.style.boxShadow = `0 0 0 1.5px ${glowHex}55, 0 12px 40px ${glowHex}30`;
    card.style.borderColor = `${glowHex}44`;
  }

  card.addEventListener('click', () => openModal(film));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(film); }
  });

  return card;
}

function buildPaletteBars(palette) {
  if (!palette || !palette.length) return '';
  const validItems = palette.filter(p => p.hex && /^#?[0-9a-f]{6}$/i.test(p.hex));
  if (!validItems.length) return '';

  const bars = validItems
    .map(p => {
      const hex = p.hex.startsWith('#') ? p.hex : `#${p.hex}`;
      const pct = (p.weight || 0).toFixed(1);
      return `<div class="palette-bar" style="background:${hex}; flex:${pct}" title="${hex} — ${pct}%"
              data-hex="${hex}" role="img" aria-label="Couleur ${hex} : ${pct}%"></div>`;
    }).join('');

  const swatches = validItems.slice(0, 4)
    .map(p => {
      const hex = p.hex.startsWith('#') ? p.hex : `#${p.hex}`;
      return `<span class="mini-swatch">
        <span class="mini-swatch-dot" style="background:${hex}"></span>
        ${hex}
      </span>`;
    }).join('');

  return `<div class="card-palette">${bars}</div>
          <div class="card-palette-swatches">${swatches}</div>`;
}

/* ============================================================
   MODAL
============================================================ */
function openModal(film) {
  state.modalFilm = film;
  state.modalPosterIndex = 0;
  populateModal(film);
  dom.filmModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  dom.filmModal.setAttribute('aria-label', `${film.titre || film.titre_original || 'Film'}`);
  setTimeout(() => dom.modalClose.focus(), 100);
}

function closeModal() {
  dom.filmModal.style.display = 'none';
  document.body.style.overflow = '';
  state.modalFilm = null;
}

function populateModal(film) {
  const affiches = film.affiches || [];

  updateModalPoster(film, 0);

  // Poster selector
  dom.modalPosterSelector.innerHTML = '';
  if (affiches.length > 1) {
    affiches.forEach((a, i) => {
      const src = a.affiche_w500 || a.affiche_original;
      if (!src) return;
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Affiche ${i + 1}`;
      img.className = `poster-thumb ${i === 0 ? 'active' : ''}`;
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
    dom.modalTrailerBtn.style.display = 'flex';
  } else {
    dom.modalTrailerBtn.style.display = 'none';
  }

  // Palette
  const palette = getFirstPalette(film);
  renderModalPalette(palette);

  // Certification
  if (film.certification) {
    dom.modalCertification.textContent = film.certification;
    dom.modalCertification.style.display = 'inline-block';
  } else {
    dom.modalCertification.style.display = 'none';
  }

  const genres = film.genres || [];
  dom.modalGenres.innerHTML = genres.map(g => `<span class="genre-tag">${escHtml(g)}</span>`).join('');
  dom.modalTitle.textContent = film.titre || film.titre_original || 'Titre inconnu';
  dom.modalOriginalTitle.textContent = film.titre_original && film.titre_original !== film.titre
    ? `${film.titre_original}` : '';

  const rating = film.note_moyenne || 0;
  dom.modalStars.innerHTML = starsHtml(rating);
  dom.modalRating.textContent = rating ? rating.toFixed(1) : 'N/A';
  dom.modalPopularity.textContent = film.popularite ? Math.round(film.popularite).toLocaleString('fr-FR') : 'N/A';

  dom.modalDirector.textContent = film.realisateur || 'N/A';
  dom.modalDate.textContent = formatDate(film.date_sortie);
  dom.modalRuntime.textContent = formatRuntime(film.duree_min);
  dom.modalLanguage.textContent = (film.langue_originale || '').toUpperCase() || 'N/A';
  dom.modalBudget.textContent = formatCurrency(film.budget);
  dom.modalRevenue.textContent = formatCurrency(film.recettes);

  dom.summaryFr.textContent = film.resume_fr || 'Résumé non disponible.';
  dom.summaryEn.textContent = film.resume_en || 'Summary not available.';
  $$('.summary-tab').forEach(t => t.classList.remove('active'));
  $$('.summary-content').forEach(c => c.classList.remove('active'));
  $('[data-lang="fr"]').classList.add('active');
  dom.summaryFr.classList.add('active');
}

function renderModalPalette(palette) {
  dom.modalPalette.innerHTML = '';
  for (const entry of palette) {
    const hex = (entry.hex || '').startsWith('#') ? entry.hex : `#${entry.hex}`;
    if (!hex || hex === '#') continue;
    const pct = (entry.weight || 0).toFixed(1);
    const item = document.createElement('div');
    item.className = 'modal-palette-item';
    item.setAttribute('title', `Cliquer pour copier ${hex}`);
    item.innerHTML = `
      <div class="modal-palette-swatch" style="background:${hex}"></div>
      <div class="modal-palette-info">
        <div class="modal-palette-hex">${hex}</div>
        <div class="palette-bar-container">
          <div class="palette-bar-fill" style="background:${hex}; width:${pct}%"></div>
        </div>
        <div class="modal-palette-weight">${pct}%</div>
      </div>
    `;
    item.addEventListener('click', () => copyToClipboard(hex));
    dom.modalPalette.appendChild(item);
  }
}

function updateModalPoster(film, index) {
  state.modalPosterIndex = index;
  const affiches = film.affiches || [];
  const affiche = affiches[index] || {};
  const src = affiche.affiche_original || affiche.affiche_w500;
  if (src) {
    dom.modalPosterImg.src = src;
    dom.modalPosterImg.alt = `${film.titre || 'Affiche'} — ${index + 1}`;
  } else {
    dom.modalPosterImg.src = '';
    dom.modalPosterImg.alt = 'Affiche non disponible';
  }
  // Update glow
  const glow = $('#modal-poster-glow');
  const palette = affiche.palette || [];
  if (glow && palette[0]?.hex) {
    const hex = palette[0].hex.startsWith('#') ? palette[0].hex : `#${palette[0].hex}`;
    glow.style.background = hex;
  }
  // Update palette for this specific poster
  const palette2 = affiche.palette || [];
  if (palette2.length) renderModalPalette(palette2);
}

/* ============================================================
   CLIPBOARD + TOAST
============================================================ */
function copyToClipboard(text) {
  if (!navigator.clipboard) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } else {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  showToast(`${text} ${t('copied')}`);
}

let toastTimer = null;
function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.remove('show'), 2800);
}

/* ============================================================
   HELPERS
============================================================ */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   EVENT LISTENERS
============================================================ */
function bindEvents() {
  // Search
  dom.searchInput.addEventListener('input', debounce(e => {
    state.searchQuery = e.target.value.trim();
    dom.searchClear.style.display = state.searchQuery ? 'flex' : 'none';
    state.currentPage = 1;
    applyFiltersAndRender();
  }, 250));

  dom.searchClear.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.searchQuery = '';
    dom.searchClear.style.display = 'none';
    state.currentPage = 1;
    applyFiltersAndRender();
    dom.searchInput.focus();
  });

  // Sort
  dom.sortSelect.addEventListener('change', e => {
    state.sort = e.target.value;
    state.currentPage = 1;
    state.sorted = sortFilms(state.filtered, state.sort);
    renderGrid(true);
  });

  // Tolerance
  dom.similaritySlider.addEventListener('input', e => {
    state.colorThreshold = parseInt(e.target.value, 10);
    dom.thresholdDisplay.textContent = state.colorThreshold;
    if (state.activeColors.length) applyFiltersAndRender();
  });

  // Clear color filter
  dom.clearColorFilter.addEventListener('click', clearColorFilter);

  // Filter mode badge toggle (OR ↔ AND)
  dom.filterModeBadge.addEventListener('click', () => {
    state.filterMode = state.filterMode === 'or' ? 'and' : 'or';
    renderFilterModeBadge();
    if (state.activeColors.length >= 2) applyFiltersAndRender();
  });

  // Add color button → open popover
  dom.addColorBtn.addEventListener('click', () => {
    if (dom.colorPopover.hidden) openPopover();
    else closePopover();
  });

  // Popover backdrop
  dom.popoverBackdrop.addEventListener('click', closePopover);

  // Popover cancel
  dom.popoverCancel.addEventListener('click', closePopover);

  // Popover apply
  dom.popoverApply.addEventListener('click', () => {
    const hex = dom.hexTextInput.value.trim();
    addCustomColor(hex.startsWith('#') ? hex : `#${hex}`);
  });

  // Color wheel ↔ hex sync
  dom.customColorInput.addEventListener('input', () => {
    const hex = dom.customColorInput.value;
    dom.hexTextInput.value = hex;
    dom.hexPreview.style.background = hex;
    const { h, s, l } = hexToHsl(hex);
    dom.hslH.value = h; dom.hslHVal.textContent = `${h}°`;
    dom.hslS.value = s; dom.hslSVal.textContent = `${s}%`;
    dom.hslL.value = l; dom.hslLVal.textContent = `${l}%`;
    updateSliderTracks(h, s, l);
  });

  // Hex text input → color wheel + preview
  dom.hexTextInput.addEventListener('input', () => {
    let hex = dom.hexTextInput.value.trim();
    if (!hex.startsWith('#')) hex = `#${hex}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      dom.customColorInput.value = hex;
      dom.hexPreview.style.background = hex;
      const { h, s, l } = hexToHsl(hex);
      dom.hslH.value = h; dom.hslHVal.textContent = `${h}°`;
      dom.hslS.value = s; dom.hslSVal.textContent = `${s}%`;
      dom.hslL.value = l; dom.hslLVal.textContent = `${l}%`;
      updateSliderTracks(h, s, l);
    }
  });

  // HSL sliders → hex
  function updateFromHsl() {
    const h = parseInt(dom.hslH.value);
    const s = parseInt(dom.hslS.value);
    const l = parseInt(dom.hslL.value);
    dom.hslHVal.textContent = `${h}°`;
    dom.hslSVal.textContent = `${s}%`;
    dom.hslLVal.textContent = `${l}%`;
    const hex = hslToHex(h, s, l);
    dom.customColorInput.value = hex;
    dom.hexTextInput.value = hex;
    dom.hexPreview.style.background = hex;
    updateSliderTracks(h, s, l);
  }
  dom.hslH.addEventListener('input', updateFromHsl);
  dom.hslS.addEventListener('input', updateFromHsl);
  dom.hslL.addEventListener('input', updateFromHsl);

  // Load more
  dom.loadMoreBtn.addEventListener('click', () => {
    state.currentPage++;
    renderGrid(false);
    setTimeout(() => {
      const cards = $$('.film-card');
      const firstNew = cards[CONFIG.PAGE_SIZE * (state.currentPage - 1)];
      if (firstNew) firstNew.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  });

  // Modal
  dom.modalClose.addEventListener('click', closeModal);
  dom.modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!dom.colorPopover.hidden) closePopover();
      else if (dom.filmModal.style.display !== 'none') closeModal();
    }
  });

  // Summary tabs
  $$('.summary-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const lang = tab.getAttribute('data-lang');
      $$('.summary-tab').forEach(t => t.classList.remove('active'));
      $$('.summary-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $(`#summary-${lang}`).classList.add('active');
    });
  });

  // Retry on error
  dom.retryBtn.addEventListener('click', loadData);
  dom.resetFiltersBtn.addEventListener('click', resetAllFilters);

  // Lang switch
  $$('[data-lang-switch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang-switch');
      applyLang(lang);
    });
  });

  // Close popover on window resize
  window.addEventListener('resize', () => {
    if (!dom.colorPopover.hidden) positionPopover();
  });
}

function resetAllFilters() {
  state.searchQuery = '';
  state.activeGenre = null;
  state.activeColors = [];
  state.currentPage = 1;
  dom.searchInput.value = '';
  dom.searchClear.style.display = 'none';
  $$('.genre-chip.active').forEach(c => {
    c.classList.remove('active');
    c.setAttribute('aria-pressed', 'false');
  });
  renderActiveColorPills();
  syncPresetHighlights();
  updateClearBtn();
  updateAddColorBtn();
  applyFiltersAndRender();
}

/* ============================================================
   DEBOUNCE
============================================================ */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ============================================================
   BOOTSTRAP
============================================================ */
(function bootstrap() {
  bindEvents();
  loadData();
})();

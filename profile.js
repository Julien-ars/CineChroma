/**
 * CineChroma — profile.js
 * Standalone User Profile, Favorites, and Collections manager
 */

(function() {
  'use strict';


// Configuration
const CONFIG = {
  DATA_URLS: ['./films_part1.json', './films_part2.json', './films_part3.json'],
};

// SVG Preset Avatars
const rawSvgs = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#fox-grad)"/><linearGradient id="fox-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF5E3A"/><stop offset="100%" stop-color="#FF2A68"/></linearGradient><polygon points="50,75 25,45 75,45" fill="#FFFFFF" opacity="0.9"/><polygon points="50,75 40,45 60,45" fill="#FF5E3A"/><polygon points="25,45 15,20 40,38" fill="#FFFFFF" opacity="0.9"/><polygon points="75,45 85,20 60,38" fill="#FFFFFF" opacity="0.9"/><polygon points="25,45 15,20 30,45" fill="#FF2A68" opacity="0.3"/><polygon points="75,45 85,20 70,45" fill="#FF2A68" opacity="0.3"/><circle cx="38" cy="48" r="3" fill="#1A1A1A"/><circle cx="62" cy="48" r="3" fill="#1A1A1A"/><polygon points="50,75 46,70 54,70" fill="#1A1A1A"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#panda-grad)"/><linearGradient id="panda-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#87F1FF"/><stop offset="100%" stop-color="#0078FF"/></linearGradient><circle cx="30" cy="30" r="14" fill="#2C3E50"/><circle cx="70" cy="30" r="14" fill="#2C3E50"/><circle cx="50" cy="55" r="30" fill="#FFFFFF"/><ellipse cx="38" cy="52" rx="9" ry="12" fill="#2C3E50" transform="rotate(-15 38 52)"/><ellipse cx="62" cy="52" rx="9" ry="12" fill="#2C3E50" transform="rotate(15 62 52)"/><circle cx="38" cy="50" r="3" fill="#FFFFFF"/><circle cx="62" cy="50" r="3" fill="#FFFFFF"/><polygon points="50,65 44,60 56,60" fill="#2C3E50"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#owl-grad)"/><linearGradient id="owl-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#B388FF"/><stop offset="100%" stop-color="#651FFF"/></linearGradient><polygon points="50,45 25,25 35,45" fill="#FFFFFF" opacity="0.8"/><polygon points="50,45 75,25 65,45" fill="#FFFFFF" opacity="0.8"/><circle cx="35" cy="50" r="12" fill="#FFFFFF"/><circle cx="65" cy="50" r="12" fill="#FFFFFF"/><circle cx="35" cy="50" r="6" fill="#2D3748"/><circle cx="65" cy="50" r="6" fill="#2D3748"/><circle cx="37" cy="48" r="2.5" fill="#FFFFFF"/><circle cx="67" cy="48" r="2.5" fill="#FFFFFF"/><polygon points="50,50 45,62 55,62" fill="#FFC107"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#lion-grad)"/><linearGradient id="lion-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FAD961"/><stop offset="100%" stop-color="#F76B1C"/></linearGradient><polygon points="50,15 62,30 78,25 72,42 88,48 74,58 78,75 60,70 50,85 40,70 22,75 26,58 12,48 28,42 22,25 38,30" fill="#D84B16"/><polygon points="50,30 65,48 60,68 40,68 35,48" fill="#FFFFFF" opacity="0.95"/><polygon points="50,30 45,48 55,48" fill="#FAD961"/><polygon points="50,56 46,50 54,50" fill="#2D3748"/><circle cx="42" cy="44" r="2.5" fill="#2D3748"/><circle cx="58" cy="44" r="2.5" fill="#2D3748"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#koala-grad)"/><linearGradient id="koala-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient><circle cx="28" cy="38" r="16" fill="#64748B"/><circle cx="28" cy="38" r="10" fill="#FFD2D2"/><circle cx="72" cy="38" r="16" fill="#64748B"/><circle cx="72" cy="38" r="10" fill="#FFD2D2"/><circle cx="50" cy="56" r="26" fill="#64748B"/><circle cx="41" cy="50" r="2.5" fill="#1E293B"/><circle cx="59" cy="50" r="2.5" fill="#1E293B"/><ellipse cx="50" cy="58" rx="6" ry="10" fill="#1E293B"/></svg>`
];
const PRESET_AVATARS = rawSvgs.map(svg => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))));

function safeGetJSON(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

// State
const state = {
  lang: localStorage.getItem('cinechroma_lang') || 'fr',
  theme: localStorage.getItem('cinechroma_theme') || 'dark',
  allFilms: [],
  user: safeGetJSON('cinechroma_user', null),
  favorites: new Set(), // initialized after migration
  collections: safeGetJSON('cinechroma_collections', []),
  activeTab: 'likes', // 'likes' or 'collections'
  activeCollectionId: null, // Selected collection in details view
  modalFilm: null,
  modalPosterIndex: 0,
  chooserFilm: null,
  chooserPosterIndex: 0,
  selectedAvatarToEdit: null,
};

// DOM Cache
const dom = {
  loggedOutContainer: $('#logged-out-container'),
  loggedInContainer: $('#loggedIn-container') || $('#logged-in-container'),
  profileLoginForm: $('#profile-login-form'),
  loginUsername: $('#login-username'),
  loginPwd: $('#login-pwd'),
  
  // Sidebar info
  profileSidebarAvatar: $('#profile-sidebar-avatar'),
  profileDisplayUsername: $('#profile-display-username'),
  profileDisplayEmail: $('#profile-display-email'),
  badgeFavCount: $('#badge-fav-count'),
  badgeColCount: $('#badge-col-count'),
  infoValName: $('#info-val-name'),
  infoValAge: $('#info-val-age'),
  infoValJoined: $('#info-val-joined'),
  
  // Actions
  btnEditProfile: $('#btn-edit-profile'),
  profileEditAvatarBtn: $('#profile-edit-avatar-btn'),
  btnLogout: $('#btn-logout'),
  
  // Tabs
  tabLikes: $('#tab-likes'),
  tabCollections: $('#tab-collections'),
  
  // Tab Views
  viewLikes: $('#view-likes'),
  viewCollections: $('#view-collections'),
  viewCollectionDetail: $('#view-collection-detail'),
  
  // Grids
  likesGrid: $('#likes-grid'),
  likesEmpty: $('#likes-empty'),
  collectionsGrid: $('#collections-grid'),
  collectionsEmpty: $('#collections-empty'),
  collectionPostersGrid: $('#collection-posters-grid'),
  collectionPostersEmpty: $('#collection-posters-empty'),
  
  // Collection details
  collectionDetailTitle: $('#collection-detail-title'),
  collectionDetailDesc: $('#collection-detail-desc'),
  collectionDetailBadge: $('#collection-detail-badge'),
  btnBackToCollections: $('#btn-back-to-collections'),
  btnEditCollection: $('#btn-edit-collection'),
  btnDeleteCollection: $('#btn-delete-collection'),
  btnCreateCollection: $('#btn-create-collection'),
  btnTriggerCreateCollection: $('.btn-trigger-create-collection'),
  
  // Film details modal
  filmModal: $('#film-modal'),
  modalBackdrop: $('#modal-backdrop'),
  modalAmbientGlow: $('#modal-ambient-glow'),
  modalClose: $('#modal-close'),
  modalPosterImg: $('#modal-poster-img'),
  modalPosterSelector: $('#modal-poster-selector'),
  modalDownloadBtn: $('#modal-download-btn'),
  modalGenres: $('#modal-genres'),
  modalCertification: $('#modal-certification'),
  modalTitle: $('#modal-title'),
  modalOriginalTitle: $('#modal-original-title'),
  modalStars: $('#modal-stars'),
  modalRating: $('#modal-rating'),
  modalLikeBtn: $('#modal-like-btn'),
  domModalColBtn: $('#modal-col-btn'), // Keep compatibility
  modalColBtn: $('#modal-col-btn'),
  modalShareCardBtn: $('#modal-share-card-btn'),
  modalTrailerBtn: $('#modal-trailer-btn'),
  modalDirector: $('#modal-director'),
  modalDate: $('#modal-date'),
  modalRuntime: $('#modal-runtime'),
  modalLanguage: $('#modal-language'),
  modalBudget: $('#modal-budget'),
  modalRevenue: $('#modal-revenue'),
  modalPopularity: $('#modal-popularity'),
  modalPalette: $('#modal-palette'),
  modal3dToggleBtn: $('#modal-3d-toggle-btn'),
  modal3dCloud: $('#modal-3d-cloud'),
  modalSummary: $('#modal-summary'),
  
  // Lightbox
  lightbox: $('#poster-lightbox'),
  lightboxImg: $('#lightbox-img'),
  lightboxGlow: $('#lightbox-ambient-glow'),
  
  // Toast
  toast: $('#toast'),
  
  // Modals
  editProfileModal: $('#edit-profile-modal'),
  editProfileBackdrop: $('#edit-profile-backdrop'),
  editProfileClose: $('#edit-profile-close'),
  editProfileForm: $('#edit-profile-form'),
  editProfileAvatarGrid: $('#edit-profile-avatar-grid'),
  editProfileUsername: $('#edit-profile-username'),
  editProfileEmail: $('#edit-profile-email'),
  editProfileName: $('#edit-profile-name'),
  editProfileAge: $('#edit-profile-age'),
  editProfileCustomAvatar: $('#edit-profile-custom-avatar'),
  
  createCollectionModal: $('#create-collection-modal'),
  colModalBackdrop: $('#col-modal-backdrop'),
  colModalClose: $('#col-modal-close'),
  colForm: $('#col-form'),
  colTitle: $('#col-title'),
  colDesc: $('#col-desc'),
  colSubmitBtn: $('#col-submit-btn'),
  colModalTitle: $('#col-modal-title'),
  
  collectionChooserModal: $('#collection-chooser-modal'),
  chooserModalBackdrop: $('#chooser-modal-backdrop'),
  chooserModalClose: $('#chooser-modal-close'),
  chooserCollectionsList: $('#chooser-collections-list'),
  btnChooserNewCol: $('#btn-chooser-new-col'),
};

// Initialisation
async function init() {
  migrateLegacyFavorites();
  migrateLegacyCollections();
  bindCommonUI();
  await loadDatabase();
  
  if (state.user) {
    showDashboard();
  } else {
    showLogin();
  }
}

// Bind standard events
function bindCommonUI() {
  // Theme and language drawer sync are already loaded by pages.js!
  
  // Authenticated state forms
  dom.profileLoginForm.addEventListener('submit', handleLogin);
  
  // Sidebar
  dom.btnEditProfile.addEventListener('click', openEditProfileModal);
  dom.profileEditAvatarBtn.addEventListener('click', openEditProfileModal);
  dom.btnLogout.addEventListener('click', logoutUser);
  
  // Tabs
  dom.tabLikes.addEventListener('click', () => switchTab('likes'));
  dom.tabCollections.addEventListener('click', () => switchTab('collections'));
  
  // Back to collection list
  dom.btnBackToCollections.addEventListener('click', showCollectionsList);
  
  // Collection Actions
  dom.btnCreateCollection.addEventListener('click', () => openColModal());
  if (dom.btnTriggerCreateCollection) {
    dom.btnTriggerCreateCollection.addEventListener('click', () => openColModal());
  }
  
  dom.btnEditCollection.addEventListener('click', () => openColModal(state.activeCollectionId));
  dom.btnDeleteCollection.addEventListener('click', () => handleDeleteCollection(state.activeCollectionId));
  
  // Edit Profile Modal
  dom.editProfileClose.addEventListener('click', closeEditProfileModal);
  dom.editProfileBackdrop.addEventListener('click', closeEditProfileModal);
  dom.editProfileForm.addEventListener('submit', handleSaveProfile);
  
  // Collection Modal
  dom.colModalClose.addEventListener('click', closeColModal);
  dom.colModalBackdrop.addEventListener('click', closeColModal);
  dom.colForm.addEventListener('submit', handleColFormSubmit);
  
  // Chooser Modal
  dom.chooserModalClose.addEventListener('click', closeChooserModal);
  dom.chooserModalBackdrop.addEventListener('click', closeChooserModal);
  dom.btnChooserNewCol.addEventListener('click', () => {
    closeChooserModal();
    openColModal();
  });
  
  // Film details modal
  dom.modalClose.addEventListener('click', closeModal);
  dom.modalBackdrop.addEventListener('click', closeModal);
  
  // Lightbox click closure
  dom.lightbox.addEventListener('click', () => {
    dom.lightbox.classList.remove('active');
    setTimeout(() => dom.lightbox.setAttribute('hidden', ''), 400);
  });
  
  // Direct poster zoom
  dom.modalPosterImg.addEventListener('click', () => {
    const src = dom.modalPosterImg.src;
    if (!src) return;
    dom.lightboxImg.src = src;
    dom.lightboxGlow.style.setProperty('--modal-glow-color', dom.modalAmbientGlow.style.getPropertyValue('--modal-glow-color'));
    dom.lightbox.removeAttribute('hidden');
    requestAnimationFrame(() => dom.lightbox.classList.add('active'));
  });
  
  // Modal 3D Toggle
  dom.modal3dToggleBtn.addEventListener('click', () => {
    const expanded = dom.modal3dCloud.classList.toggle('expanded');
    dom.modal3dToggleBtn.classList.toggle('active', expanded);
    if (expanded && state.modalFilm) {
      const colors = (state.modalFilm.affiches || [])[state.modalPosterIndex]?.palette || [];
      const hexList = colors.map(c => c.hex);
      if (window.init3DCloud) {
        window.init3DCloud('modal-3d-cloud', hexList);
      }
    } else {
      if (window.cleanup3DCloud) window.cleanup3DCloud();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!dom.lightbox.hasAttribute('hidden')) {
        dom.lightbox.classList.remove('active');
        setTimeout(() => dom.lightbox.setAttribute('hidden', ''), 400);
      }
      else if (!dom.editProfileModal.hasAttribute('hidden')) closeEditProfileModal();
      else if (!dom.createCollectionModal.hasAttribute('hidden')) closeColModal();
      else if (!dom.collectionChooserModal.hasAttribute('hidden')) closeChooserModal();
      else if (!dom.filmModal.hasAttribute('hidden')) closeModal();
    }
    
    // Left/Right arrows navigation
    if (!dom.filmModal.hasAttribute('hidden') && state.modalFilm) {
      const targetList = getActiveViewFilmList();
      if (targetList.length > 1 && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        const idx = targetList.findIndex(f => getFilmId(f) === getFilmId(state.modalFilm));
        if (idx !== -1) {
          const nextIdx = e.key === 'ArrowRight'
            ? Math.min(idx + 1, targetList.length - 1)
            : Math.max(idx - 1, 0);
          if (nextIdx !== idx) {
            openModal(targetList[nextIdx]);
          }
        }
      }
    }
  });
  
  // Sync tabs from URL search parameters on load
  const p = new URLSearchParams(window.location.search);
  if (p.has('tab')) {
    const tabName = p.get('tab');
    if (tabName === 'likes' || tabName === 'collections') {
      switchTab(tabName);
    }
  }
}

// Get film list corresponding to currently active tab/subview
function getActiveViewFilmList() {
  if (state.activeTab === 'likes') {
    return state.allFilms.filter(f => { const prefix = getFilmId(f) + ':'; return [...state.favorites].some(k => k.startsWith(prefix)); });
  } else if (state.activeTab === 'collections' && state.activeCollectionId) {
    const col = state.collections.find(c => c.id === state.activeCollectionId);
    if (col && col.posterKeys) {
      // Return unique films that have at least one posterKey in this collection
      const filmIds = [...new Set(col.posterKeys.map(k => parsePosterKey(k).filmId))];
      return state.allFilms.filter(f => filmIds.includes(getFilmId(f)));
    }
  }
  return [];
}

// Load movies JSON databases
async function loadDatabase() {
  try {
    const responses = await Promise.all(CONFIG.DATA_URLS.map(url => fetch(url)));
    const dataParts = await Promise.all(responses.map(res => res.json()));
    
    // Flatten parts & normalize posters list
    state.allFilms = dataParts.flat().map(film => {
      // Compatibility with affiches_globales / affiches
      if (!film.affiches && film.affiches_globales) {
        film.affiches = film.affiches_globales;
      }
      return film;
    });
  } catch (err) {
    console.error('Failed to load films database:', err);
    showToast("Erreur de chargement de la base de données.");
  }
}

// Display login container
function showLogin() {
  dom.loggedInContainer.setAttribute('hidden', '');
  dom.loggedOutContainer.removeAttribute('hidden');
}

// Display dashboard container
function showDashboard() {
  dom.loggedOutContainer.setAttribute('hidden', '');
  dom.loggedInContainer.removeAttribute('hidden');
  
  // Re-sync user info
  syncSidebarInfo();
  
  // Render current tab contents
  if (state.activeTab === 'likes') {
    renderLikesTab();
  } else {
    if (state.activeCollectionId) {
      renderCollectionDetails(state.activeCollectionId);
    } else {
      renderCollectionsTab();
    }
  }
}

// Sync Sidebar text and icons
function syncSidebarInfo() {
  if (!state.user) return;
  
  dom.profileSidebarAvatar.src = state.user.avatar || PRESET_AVATARS[0];
  dom.profileDisplayUsername.textContent = state.user.username;
  dom.profileDisplayEmail.textContent = state.user.email;
  
  let favText = '';
  if (state.lang === 'ja') {
    favText = `${state.favorites.size} 件のお気に入り`;
  } else if (state.lang === 'en') {
    favText = `${state.favorites.size} favorite${state.favorites.size > 1 ? 's' : ''}`;
  } else {
    favText = `${state.favorites.size} favori${state.favorites.size > 1 ? 's' : ''}`;
  }
  dom.badgeFavCount.textContent = favText;

  let colText = '';
  if (state.lang === 'ja') {
    colText = `${state.collections.length} 個のコレクション`;
  } else if (state.lang === 'en') {
    colText = `${state.collections.length} collection${state.collections.length > 1 ? 's' : ''}`;
  } else {
    colText = `${state.collections.length} collection${state.collections.length > 1 ? 's' : ''}`;
  }
  dom.badgeColCount.textContent = colText;
  
  dom.infoValName.textContent = state.user.name || 'N/A';
  
  let ageText = 'N/A';
  if (state.user.age) {
    if (state.lang === 'ja') {
      ageText = `${state.user.age} 歳`;
    } else if (state.lang === 'en') {
      ageText = `${state.user.age} years old`;
    } else {
      ageText = `${state.user.age} ans`;
    }
  }
  dom.infoValAge.textContent = ageText;
  
  dom.infoValJoined.textContent = state.user.joinedDate || 'N/A';
  
  // Sync pages.js header triggers if present
  const headerAvatarImg = $('#header-avatar-img');
  const headerPlaceholder = $('#header-avatar-placeholder');
  if (headerAvatarImg) {
    headerAvatarImg.src = state.user.avatar || PRESET_AVATARS[0];
    headerAvatarImg.removeAttribute('hidden');
  }
  if (headerPlaceholder) {
    headerPlaceholder.style.display = 'none';
  }
}

// Authenticated Login Simulation
function handleLogin(e) {
  e.preventDefault();
  
  const ident = dom.loginUsername.value.trim();
  if (!ident) return;
  
  const locale = state.lang === 'ja' ? 'ja-JP' : state.lang === 'en' ? 'en-US' : 'fr-FR';
  const user = {
    username: ident.includes('@') ? ident.split('@')[0] : ident,
    email: ident.includes('@') ? ident : `${ident}@cinechroma.app`,
    name: '',
    age: '',
    avatar: PRESET_AVATARS[0],
    joinedDate: new Date().toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  };
  
  state.user = user;
  localStorage.setItem('cinechroma_user', JSON.stringify(user));
  showToast(t('profile_toast_login_success'));
  showDashboard();
}

// Logout user
function logoutUser() {
  localStorage.removeItem('cinechroma_user');
  state.user = null;
  showToast(t('profile_toast_logout_success'));
  
  // Sync pages.js header triggers
  const headerAvatarImg = $('#header-avatar-img');
  const headerPlaceholder = $('#header-avatar-placeholder');
  if (headerAvatarImg) {
    headerAvatarImg.setAttribute('hidden', '');
  }
  if (headerPlaceholder) {
    headerPlaceholder.style.removeProperty('display');
  }
  
  showLogin();
}

// Switch navigation tabs
function switchTab(tabName) {
  state.activeTab = tabName;
  state.activeCollectionId = null; // Reset collection details view
  
  dom.tabLikes.classList.toggle('active', tabName === 'likes');
  dom.tabCollections.classList.toggle('active', tabName === 'collections');
  
  dom.viewLikes.hidden = (tabName !== 'likes');
  dom.viewCollections.hidden = (tabName !== 'collections');
  dom.viewCollectionDetail.hidden = true;
  
  // Update URL search parameters
  const url = new URL(window.location);
  url.searchParams.set('tab', tabName);
  window.history.replaceState({}, '', url);
  
  if (tabName === 'likes') {
    renderLikesTab();
  } else {
    renderCollectionsTab();
  }
}

// Show Collection Detail Subview
function viewCollectionDetail(colId) {
  state.activeCollectionId = colId;
  
  dom.viewLikes.hidden = true;
  dom.viewCollections.hidden = true;
  dom.viewCollectionDetail.removeAttribute('hidden');
  
  renderCollectionDetails(colId);
}

// Back to list of collections
function showCollectionsList() {
  state.activeCollectionId = null;
  dom.viewCollectionDetail.hidden = true;
  dom.viewCollections.removeAttribute('hidden');
  renderCollectionsTab();
}

// A. RENDER LIKES TAB
function renderLikesTab() {
  dom.likesGrid.innerHTML = '';
  
  const favKeys = [...state.favorites];
  if (favKeys.length === 0) {
    dom.likesEmpty.removeAttribute('hidden');
    dom.likesGrid.hidden = true;
    return;
  }
  
  // Resolve posterKeys to {film, posterIndex}
  const resolved = [];
  favKeys.forEach(key => {
    const { filmId, posterIndex } = parsePosterKey(key);
    const film = state.allFilms.find(f => getFilmId(f) === filmId);
    if (film) resolved.push({ film, posterIndex, key });
  });

  if (resolved.length === 0) {
    dom.likesEmpty.removeAttribute('hidden');
    dom.likesGrid.hidden = true;
    return;
  }
  
  dom.likesEmpty.setAttribute('hidden', '');
  dom.likesGrid.removeAttribute('hidden');
  
  resolved.forEach(({ film, posterIndex, key }) => {
    const card = buildPosterCard(film, posterIndex, true);
    dom.likesGrid.appendChild(card);
  });
}

// B. RENDER COLLECTIONS TAB
function renderCollectionsTab() {
  dom.collectionsGrid.innerHTML = '';
  
  if (state.collections.length === 0) {
    dom.collectionsEmpty.removeAttribute('hidden');
    dom.collectionsGrid.hidden = true;
    return;
  }
  
  dom.collectionsEmpty.setAttribute('hidden', '');
  dom.collectionsGrid.removeAttribute('hidden');
  
  state.collections.forEach(col => {
    if (!col.posterKeys) col.posterKeys = [];
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.setAttribute('data-id', col.id);
    
    const count = col.posterKeys.length;
    let previewsHtml = '';
    
    if (count > 0 && state.allFilms.length > 0) {
      // Show up to 3 preview thumbnails using the specific poster from each key
      const previewKeys = col.posterKeys.slice(0, 3);
      const thumbs = previewKeys.map(key => {
        const { filmId, posterIndex } = parsePosterKey(key);
        const film = state.allFilms.find(f => getFilmId(f) === filmId);
        if (!film) return null;
        const affiches = film.affiches || [];
        const poster = affiches[posterIndex] || affiches[0] || {};
        return poster.affiche_w500 || poster.affiche_original || null;
      }).filter(Boolean);
      previewsHtml = `
        <div class="collection-preview-thumbnails">
          ${thumbs.map(url => `<img src="${esc(url)}" alt="" class="collection-preview-thumb-img" />`).join('')}
        </div>
      `;
    } else {
      previewsHtml = `<div class="collection-preview-empty">${t('profile_col_empty_folder')}</div>`;
    }
    
    let itemsCountText = '';
    if (state.lang === 'ja') {
      itemsCountText = `${count} 枚のポスター`;
    } else if (state.lang === 'en') {
      itemsCountText = `${count} poster${count > 1 ? 's' : ''}`;
    } else {
      itemsCountText = `${count} affiche${count > 1 ? 's' : ''}`;
    }

    card.innerHTML = `
      <button class="collection-delete-btn" data-id="${col.id}" title="${t('profile_btn_delete_col')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      ${previewsHtml}
      <div class="collection-card-name">${esc(col.title)}</div>
      <div class="collection-card-desc">${esc(col.desc || t('profile_col_no_desc'))}</div>
      <div class="collection-card-count">${itemsCountText}</div>
    `;
    
    card.addEventListener('click', (e) => {
      if (e.target.closest('.collection-delete-btn')) return;
      viewCollectionDetail(col.id);
    });
    
    card.querySelector('.collection-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteCollection(col.id);
    });
    
    dom.collectionsGrid.appendChild(card);
  });
}

// C. RENDER COLLECTION DETAIL
function renderCollectionDetails(colId) {
  const col = state.collections.find(c => c.id === colId);
  if (!col) {
    showCollectionsList();
    return;
  }
  if (!col.posterKeys) col.posterKeys = [];
  
  dom.collectionDetailTitle.textContent = col.title;
  dom.collectionDetailDesc.textContent = col.desc || t('profile_col_any_no_desc');
  
  dom.collectionPostersGrid.innerHTML = '';
  
  const count = col.posterKeys.length;
  
  let itemsCountText = '';
  if (state.lang === 'ja') {
    itemsCountText = `${count} 枚のポスター`;
  } else if (state.lang === 'en') {
    itemsCountText = `${count} poster${count > 1 ? 's' : ''}`;
  } else {
    itemsCountText = `${count} affiche${count > 1 ? 's' : ''}`;
  }
  dom.collectionDetailBadge.textContent = itemsCountText;
  
  if (count === 0) {
    dom.collectionPostersEmpty.removeAttribute('hidden');
    dom.collectionPostersGrid.hidden = true;
    return;
  }
  
  dom.collectionPostersEmpty.setAttribute('hidden', '');
  dom.collectionPostersGrid.removeAttribute('hidden');
  
  col.posterKeys.forEach(key => {
    const { filmId, posterIndex } = parsePosterKey(key);
    const film = state.allFilms.find(f => getFilmId(f) === filmId);
    if (!film) return;
    const card = buildPosterCard(film, posterIndex, false, col.id, key);
    dom.collectionPostersGrid.appendChild(card);
  });
}

// BUILD POSTER CARD
function buildPosterCard(film, posterIndex = 0, isLikesGrid = true, colId = null, posterKey = null) {
  const card = document.createElement('article');
  card.className = 'film-card ratio-tall';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', film.titre || film.titre_original || 'Film');
  
  const filmId = getFilmId(film);
  card.setAttribute('data-id', filmId);

  // Use the specific poster at posterIndex
  const affiches = film.affiches || [];
  const poster = affiches[posterIndex] || affiches[0] || {};
  const src = poster.affiche_w500 || poster.affiche_original || getMatchingPosterUrl(film);
  const resolvedKey = posterKey || getPosterKey(filmId, posterIndex);
  const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : '';
  
  const actionButton = isLikesGrid ? `
    <button class="card-fav-btn active" aria-label="Retirer des favoris" title="Retirer des favoris" tabindex="-1">
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" width="13" height="13">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  ` : `
    <button class="card-col-btn active" aria-label="Retirer de la collection" title="Retirer de la collection" tabindex="-1">
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" width="13" height="13">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  `;
  
  card.innerHTML = `
    ${src
      ? `<img class="card-poster" src="${esc(src)}" alt="${esc(film.titre||'Affiche')}" loading="lazy" decoding="async" />`
      : `<div class="card-poster-placeholder">◻</div>`
    }
    ${actionButton}
    <div class="card-overlay" aria-hidden="true">
      <div class="card-title">${esc(film.titre || film.titre_original || '')}</div>
      <div class="card-meta">${[film.realisateur, year].filter(Boolean).join(' · ')}</div>
    </div>
  `;
  
  card.addEventListener('click', () => openModal(film, posterIndex));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(film, posterIndex); }
  });
  
  if (isLikesGrid) {
    card.querySelector('.card-fav-btn').addEventListener('click', e => {
      e.stopPropagation();
      toggleFavorite(resolvedKey);
    });
  } else {
    card.querySelector('.card-col-btn').addEventListener('click', e => {
      e.stopPropagation();
      removePosterFromCollection(resolvedKey, colId);
    });
  }
  
  return card;
}

// TOGGLE FAVORITE
function toggleFavorite(posterKey) {
  const isRemoving = state.favorites.has(posterKey);
  if (isRemoving) {
    state.favorites.delete(posterKey);
    showToast(t('profile_toast_fav_removed'));
  } else {
    state.favorites.add(posterKey);
    showToast(t('profile_toast_fav_added'));
  }
  
  localStorage.setItem('cinechroma_favorites', JSON.stringify([...state.favorites]));
  
  // Re-sync view
  syncSidebarInfo();
  if (state.activeTab === 'likes') {
    renderLikesTab();
  }
  
  // Update details modal button if open
  if (state.modalFilm) {
    const currentFilmId = getFilmId(state.modalFilm);
    const currentKey = getPosterKey(currentFilmId, state.modalPosterIndex);
    const currentFav = state.favorites.has(currentKey);
    dom.modalLikeBtn.classList.toggle('active-like', currentFav);
    dom.modalLikeBtn.querySelector('svg').setAttribute('fill', currentFav ? 'currentColor' : 'none');
  }
}

// REMOVE POSTER FROM A COLLECTION
function removePosterFromCollection(posterKey, colId) {
  const col = state.collections.find(c => c.id === colId);
  if (!col || !col.posterKeys) return;
  
  col.posterKeys = col.posterKeys.filter(k => k !== posterKey);
  localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
  showToast(t('profile_toast_col_removed'));
  
  // Re-render collection detail
  renderCollectionDetails(colId);
}

// DELETE COLLECTION
function handleDeleteCollection(colId) {
  const col = state.collections.find(c => c.id === colId);
  if (!col) return;
  
  const confirmMsg = t('profile_confirm_delete_col').replace('{name}', col.title);
  if (confirm(confirmMsg)) {
    state.collections = state.collections.filter(c => c.id !== colId);
    localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
    showToast(t('profile_toast_col_deleted'));
    
    syncSidebarInfo();
    showCollectionsList();
  }
}

// EDIT PROFILE MODAL ACTIONS
function openEditProfileModal() {
  if (!state.user) return;
  
  dom.editProfileUsername.value = state.user.username;
  dom.editProfileEmail.value = state.user.email;
  dom.editProfileName.value = state.user.name || '';
  dom.editProfileAge.value = state.user.age || '';
  dom.editProfileCustomAvatar.value = state.user.avatar && !state.user.avatar.startsWith('data:') ? state.user.avatar : '';
  
  state.selectedAvatarToEdit = state.user.avatar;
  renderPresetAvatarsGrid();
  
  dom.editProfileModal.removeAttribute('hidden');
}

function closeEditProfileModal() {
  dom.editProfileModal.setAttribute('hidden', '');
}

function renderPresetAvatarsGrid() {
  dom.editProfileAvatarGrid.innerHTML = '';
  PRESET_AVATARS.forEach((src, i) => {
    const box = document.createElement('div');
    box.className = `avatar-preset-item${state.selectedAvatarToEdit === src ? ' active' : ''}`;
    box.innerHTML = `<img src="${src}" alt="Avatar ${i+1}" />`;
    box.addEventListener('click', () => {
      state.selectedAvatarToEdit = src;
      dom.editProfileCustomAvatar.value = ''; // Clear custom input
      $$('.avatar-preset-item').forEach(el => el.classList.remove('active'));
      box.classList.add('active');
    });
    dom.editProfileAvatarGrid.appendChild(box);
  });
}

function handleSaveProfile(e) {
  e.preventDefault();
  
  const username = dom.editProfileUsername.value.trim();
  const email = dom.editProfileEmail.value.trim();
  const name = dom.editProfileName.value.trim();
  const ageVal = dom.editProfileAge.value.trim();
  const customAvatar = dom.editProfileCustomAvatar.value.trim();
  
  if (!username || !email) return;
  
  let finalAvatar = state.selectedAvatarToEdit || PRESET_AVATARS[0];
  if (customAvatar) {
    finalAvatar = customAvatar;
  }
  
  state.user.username = username;
  state.user.email = email;
  state.user.name = name;
  state.user.age = ageVal ? parseInt(ageVal, 10) : '';
  state.user.avatar = finalAvatar;
  
  localStorage.setItem('cinechroma_user', JSON.stringify(state.user));
  showToast(t('profile_toast_saved'));
  
  syncSidebarInfo();
  closeEditProfileModal();
}

// CREATE / EDIT COLLECTION MODAL
function openColModal(colId = null) {
  if (colId) {
    // Edit collection state
    const col = state.collections.find(c => c.id === colId);
    if (!col) return;
    
    dom.colModalTitle.textContent = t('profile_btn_edit_col') + ' ' + t('poster_style');
    dom.colTitle.value = col.title;
    dom.colDesc.value = col.desc || '';
    dom.colSubmitBtn.textContent = t('profile_save_btn');
    state.activeCollectionId = colId;
  } else {
    // Create new collection state
    dom.colModalTitle.textContent = t('new_collection');
    dom.colTitle.value = '';
    dom.colDesc.value = '';
    dom.colSubmitBtn.textContent = t('create_collection_btn');
  }
  
  dom.createCollectionModal.removeAttribute('hidden');
}

function closeColModal() {
  dom.createCollectionModal.setAttribute('hidden', '');
}

function handleColFormSubmit(e) {
  e.preventDefault();
  
  const title = dom.colTitle.value.trim();
  const desc = dom.colDesc.value.trim();
  if (!title) return;
  
  if ((dom.colSubmitBtn.textContent === t('profile_save_btn') || dom.colSubmitBtn.textContent === "Enregistrer") && state.activeCollectionId) {
    // Save modifications
    const col = state.collections.find(c => c.id === state.activeCollectionId);
    if (col) {
      col.title = title;
      col.desc = desc;
      localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
      showToast(t('profile_toast_col_updated'));
      
      closeColModal();
      renderCollectionDetails(state.activeCollectionId);
    }
  } else {
    // Create new collection
    const newCol = {
      id: 'col_' + Date.now(),
      title,
      desc,
      posterKeys: []
    };
    
    state.collections.push(newCol);
    localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
    showToast(t('profile_toast_col_created'));
    
    closeColModal();
    syncSidebarInfo();
    showCollectionsList();
  }
}

// ADD POSTER TO COLLECTION CHOOSER MODAL
function openCollectionChooser(film, posterIndex) {
  state.chooserFilm = film;
  state.chooserPosterIndex = (posterIndex !== undefined) ? posterIndex : state.modalPosterIndex;
  const posterKey = getPosterKey(getFilmId(film), state.chooserPosterIndex);
  
  dom.chooserCollectionsList.innerHTML = '';
  
  if (state.collections.length === 0) {
    dom.chooserCollectionsList.innerHTML = `<div style="text-align:center;padding:12px;color:var(--text-3);font-size:0.78rem;">${t('profile_toast_empty_cols')}</div>`;
  } else {
    state.collections.forEach(col => {
      if (!col.posterKeys) col.posterKeys = [];
      const inCol = col.posterKeys.includes(posterKey);
      const row = document.createElement('div');
      row.className = `chooser-col-row${inCol ? ' active' : ''}`;
      row.innerHTML = `
        <span class="chooser-col-name">${esc(col.title)}</span>
        <svg viewBox="0 0 24 24" fill="${inCol ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="14" height="14" class="chooser-col-check">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
      row.addEventListener('click', () => {
        togglePosterInCollection(posterKey, col.id);
        const active = col.posterKeys.includes(posterKey);
        row.classList.toggle('active', active);
        row.querySelector('svg').setAttribute('fill', active ? 'currentColor' : 'none');
      });
      
      dom.chooserCollectionsList.appendChild(row);
    });
  }
  
  dom.collectionChooserModal.removeAttribute('hidden');
}

function closeChooserModal() {
  dom.collectionChooserModal.setAttribute('hidden', '');
  state.chooserFilm = null;
}

function togglePosterInCollection(posterKey, colId) {
  const col = state.collections.find(c => c.id === colId);
  if (!col) return;
  
  if (!col.posterKeys) col.posterKeys = [];
  
  const idx = col.posterKeys.indexOf(posterKey);
  if (idx === -1) {
    col.posterKeys.push(posterKey);
    const addedMsg = t('profile_toast_col_added_to').replace('{name}', col.title);
    showToast(addedMsg);
  } else {
    col.posterKeys.splice(idx, 1);
    const removedMsg = t('profile_toast_col_removed_from').replace('{name}', col.title);
    showToast(removedMsg);
  }
  
  localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
  
  // Re-sync UI
  syncSidebarInfo();
  if (state.activeTab === 'collections') {
    if (state.activeCollectionId === colId) {
      renderCollectionDetails(colId);
    } else {
      renderCollectionsTab();
    }
  }
  
  // Sync col button in modal if open
  if (state.modalFilm) {
    const filmId = getFilmId(state.modalFilm);
    const filmPrefix = filmId + ':';
    const isCol = state.collections.some(c => c.posterKeys && c.posterKeys.some(k => k.startsWith(filmPrefix)));
    dom.modalColBtn.classList.toggle('active-col', isCol);
    dom.modalColBtn.querySelector('svg').setAttribute('fill', isCol ? 'currentColor' : 'none');
  }
}


/* ============================================================
   FILM DETAILS MODAL (Duplicate features from app.js)
 ============================================================ */
function openModal(film, startingPosterIndex = 0) {
  state.modalFilm = film;
  state.modalPosterIndex = startingPosterIndex;
  populateModal(film, startingPosterIndex);
  dom.filmModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => dom.modalClose.focus(), 80);
}

function closeModal() {
  if (window.cleanup3DCloud) {
    window.cleanup3DCloud();
  }
  dom.modal3dCloud.classList.remove('expanded');
  dom.modal3dToggleBtn.classList.remove('active');
  
  dom.filmModal.setAttribute('hidden', '');
  dom.filmModal.style.removeProperty('--modal-glow-color');
  document.body.style.overflow = '';
  state.modalFilm = null;
}

function populateModal(film, startingPosterIndex = 0) {
  updateModalPoster(film, startingPosterIndex);

  // Poster Thumbnails
  dom.modalPosterSelector.innerHTML = '';
  const affiches = film.affiches || [];
  if (affiches.length > 1) {
    affiches.forEach((a, i) => {
      const src = a.affiche_w500 || a.affiche_original;
      if (!src) return;
      const img = document.createElement('img');
      img.src = src; img.alt = `Affiche ${i+1}`;
      img.className = `poster-thumb${i === startingPosterIndex ? ' active' : ''}`;
      img.loading = 'lazy';
      img.addEventListener('click', () => {
        state.modalPosterIndex = i;
        updateModalPoster(film, i);
        $$('.poster-thumb').forEach(t => t.classList.remove('active'));
        img.classList.add('active');
        // Refresh like/col buttons for new poster
        const currentFilmId = getFilmId(film);
        const currentKey = getPosterKey(currentFilmId, i);
        const filmPrefix = currentFilmId + ':';
        dom.modalLikeBtn.classList.toggle('active-like', state.favorites.has(currentKey));
        dom.modalLikeBtn.querySelector('svg').setAttribute('fill', state.favorites.has(currentKey) ? 'currentColor' : 'none');
        dom.modalLikeBtn.onclick = (e) => { e.preventDefault(); toggleFavorite(currentKey); };
        const currentCol = state.collections.some(c => c.posterKeys && c.posterKeys.some(k => k.startsWith(filmPrefix)));
        dom.modalColBtn.classList.toggle('active-col', currentCol);
        dom.modalColBtn.querySelector('svg').setAttribute('fill', currentCol ? 'currentColor' : 'none');
        dom.modalColBtn.onclick = (e) => { e.preventDefault(); openCollectionChooser(film, i); };
      });
      dom.modalPosterSelector.appendChild(img);
    });
  }

  // Action Buttons Binding
  dom.modalDownloadBtn.onclick = (e) => {
    e.preventDefault();
    downloadPosterImage(film);
  };
  dom.modalShareCardBtn.onclick = (e) => {
    e.preventDefault();
    shareCardImage(film);
  };

  const filmId = getFilmId(film);
  const currentPosterKey = getPosterKey(filmId, startingPosterIndex);
  const filmPrefix = filmId + ':';
  const isFav = state.favorites.has(currentPosterKey);
  const isCol = state.collections.some(c => c.posterKeys && c.posterKeys.some(k => k.startsWith(filmPrefix)));
  
  dom.modalLikeBtn.classList.toggle('active-like', isFav);
  dom.modalLikeBtn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
  dom.modalLikeBtn.onclick = (e) => {
    e.preventDefault();
    toggleFavorite(getPosterKey(filmId, state.modalPosterIndex));
  };

  dom.modalColBtn.classList.toggle('active-col', isCol);
  dom.modalColBtn.querySelector('svg').setAttribute('fill', isCol ? 'currentColor' : 'none');
  dom.modalColBtn.onclick = (e) => {
    e.preventDefault();
    openCollectionChooser(film, state.modalPosterIndex);
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

  dom.modalTitle.textContent = film.titre || film.titre_original || t('profile_unknown_title');
  dom.modalOriginalTitle.textContent =
    film.titre_original && film.titre_original !== film.titre ? film.titre_original : '';

  const r = film.note_moyenne || 0;
  dom.modalStars.innerHTML = starsHtml(r);
  dom.modalRating.textContent = r ? r.toFixed(1) : 'N/A';
  dom.modalPopularity.textContent = film.popularite ? Math.round(film.popularite).toLocaleString(state.lang === 'ja' ? 'ja-JP' : state.lang === 'en' ? 'en-US' : 'fr-FR') : 'N/A';
  dom.modalDirector.textContent = film.realisateur || t('profile_unknown_director');
  dom.modalDate.textContent     = formatDate(film.date_sortie);
  
  const runtimeMin = film.duree_minutes || film.duree_min;
  const langCode   = film.langue_origine || film.langue_originale || '';
  
  dom.modalRuntime.textContent  = formatRuntime(runtimeMin);
  dom.modalLanguage.textContent = langCode.toUpperCase() || 'N/A';
  dom.modalBudget.textContent   = formatCurrency(film.budget);
  dom.modalRevenue.textContent  = formatCurrency(film.revenue);

  // Translate summary based on active language
  let summary = '';
  if (state.lang === 'ja') {
    summary = film.resume_ja || film.resume_en || film.resume_fr || t('profile_summary_no_available');
  } else if (state.lang === 'en') {
    summary = film.resume_en || film.resume_fr || t('profile_summary_no_available');
  } else {
    summary = film.resume_fr || film.resume_en || t('profile_summary_no_available');
  }
  dom.modalSummary.textContent = summary;
}

function updateModalAmbientGlowColor(film, idx) {
  const affiches = film.affiches || [];
  const currentPoster = affiches[idx] || affiches[0];
  if (currentPoster && currentPoster.palette?.length > 0) {
    const hex = currentPoster.palette[0].hex;
    const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
    dom.modalAmbientGlow.style.setProperty('--modal-glow-color', hexToRgba(cleanHex, 0.45));
    
    const posterCol = $('.modal-poster-col');
    if (posterCol) {
      posterCol.style.setProperty('--poster-glow', hexToRgba(cleanHex, 0.85));
    }
  } else {
    dom.modalAmbientGlow.style.setProperty('--modal-glow-color', 'transparent');
    const posterCol = $('.modal-poster-col');
    if (posterCol) {
      posterCol.style.setProperty('--poster-glow', 'transparent');
    }
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

function renderModalPalette(palette) {
  dom.modalPalette.innerHTML = '';
  palette.forEach(color => {
    const dot = document.createElement('button');
    dot.className = 'modal-palette-dot';
    const hex = color.hex.startsWith('#') ? color.hex : `#${color.hex}`;
    dot.style.backgroundColor = hex;
    dot.title = `${hex} (${Math.round(color.weight)}%)`;
    
    // Redirect on click: return to gallery with active color filter!
    dot.addEventListener('click', () => {
      closeModal();
      window.location.href = `./index.html?colors=${color.hex.replace('#','')}`;
    });
    
    dom.modalPalette.appendChild(dot);
  });
}

// Download poster
function downloadPosterImage(film) {
  const affiches = film.affiches || [];
  const currentPoster = affiches[state.modalPosterIndex] || affiches[0] || {};
  const src = currentPoster.affiche_original || currentPoster.affiche_w500;

  if (!src) return;

  showToast("Téléchargement de l'affiche...");

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
      showToast("Téléchargement direct échoué (clic droit pour enregistrer)");
    });
}

// Share Card
async function shareCardImage(film) {
  showToast('Génération de la carte...');
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1350;

    ctx.fillStyle = '#0B0B0E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const affiches = film.affiches || [];
    const currentPoster = affiches[state.modalPosterIndex] || affiches[0] || {};
    const src = currentPoster.affiche_original || currentPoster.affiche_w500;

    if (src) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('CORS Error'));
        const sep = src.includes('?') ? '&' : '?';
        img.src = src + sep + 'cb=' + Date.now();
      });

      const dy = 70;
      const imgHeight = 660;
      const imgWidth = (img.naturalWidth / img.naturalHeight) * imgHeight;
      const dx = (1080 - imgWidth) / 2;

      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(dx, dy, imgWidth, imgHeight, 16);
      } else {
        const r = 16;
        ctx.moveTo(dx + r, dy);
        ctx.lineTo(dx + imgWidth - r, dy);
        ctx.quadraticCurveTo(dx + imgWidth, dy, dx + imgWidth, dy + r);
        ctx.lineTo(dx + imgWidth, dy + imgHeight - r);
        ctx.quadraticCurveTo(dx + imgWidth, dy + imgHeight, dx + imgWidth - r, dy + imgHeight);
        ctx.lineTo(dx + r, dy + imgHeight);
        ctx.quadraticCurveTo(dx, dy + imgHeight, dx, dy + imgHeight - r);
        ctx.lineTo(dx, dy + r);
        ctx.quadraticCurveTo(dx, dy, dx + r, dy);
      }
      ctx.clip();
      ctx.drawImage(img, dx, dy, imgWidth, imgHeight);
      ctx.restore();

      const textStartY = dy + imgHeight + 40;
      ctx.textAlign = 'center';
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      const title = (film.titre || film.titre_original || 'FILM').toUpperCase();
      ctx.fillText(title, 540, textStartY + 44);

      ctx.fillStyle = '#8E8E93';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      const director = (film.realisateur || 'INCONNU').toUpperCase();
      const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : '';
      ctx.fillText(`${director}  •  ${year}`, 540, textStartY + 44 + 35);

      const palette = currentPoster.palette || [];
      const swatchWidth = 140;
      const swatchHeight = 70;
      const gap = 16;
      const totalWidth = (palette.length * swatchWidth) + ((palette.length - 1) * gap);
      const startX = (1080 - totalWidth) / 2;
      const swatchY = textStartY + 44 + 35 + 80;

      palette.forEach((color, i) => {
        const x = startX + (i * (swatchWidth + gap));
        const hex = color.hex.startsWith('#') ? color.hex : `#${hex}`;
        
        ctx.fillStyle = hex;
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, swatchY, swatchWidth, swatchHeight, 10);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${Math.round(color.weight)}%`, x + (swatchWidth / 2), swatchY + swatchHeight + 35);
      });

      // Brand sign
      ctx.fillStyle = '#E50914';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CINECHROMA', 540, 1260);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'cinechroma_card.jpg', { type: 'image/jpeg' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: film.titre || 'CineChroma Card',
        text: `Découvrez la signature chromatique de ${film.titre} sur CineChroma !`
      });
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${(film.titre || 'affiche').toLowerCase().replace(/[^a-z0-9]/g, '_')}_card.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("Partage impossible : carte téléchargée localement.");
    }
  } catch (err) {
    console.error('Failed to share card:', err);
    showToast("Erreur de génération de l'image.");
  }
}


/* ============================================================
   HELPERS
 ============================================================ */
function getFilmId(film) {
  const t = (film.titre || film.titre_original || 'x').toLowerCase().replace(/[^a-z0-9]/g,'_');
  return `${t}_${film.date_sortie||'?'}`;
}

// Poster-level key helpers
function getPosterKey(filmId, posterIndex) {
  return `${filmId}:${posterIndex}`;
}
function parsePosterKey(key) {
  const parts = String(key).split(':');
  const posterIndex = Number(parts[parts.length - 1]);
  const filmId = parts.slice(0, -1).join(':');
  return { filmId, posterIndex: isNaN(posterIndex) ? 0 : posterIndex };
}

function migrateLegacyFavorites() {
  const raw = safeGetJSON('cinechroma_favorites', []);
  const migrated = raw.map(v => {
    const s = String(v);
    if (/:\d+$/.test(s)) return s;
    return `${s}:0`;
  });
  state.favorites = new Set(migrated);
  localStorage.setItem('cinechroma_favorites', JSON.stringify(migrated));
}

function migrateLegacyCollections() {
  let changed = false;
  state.collections.forEach(col => {
    if (col.filmIds && !col.posterKeys) {
      col.posterKeys = col.filmIds.map(id => `${id}:0`);
      delete col.filmIds;
      changed = true;
    }
    if (!col.posterKeys) col.posterKeys = [];
  });
  if (changed) {
    localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
  }
}

function getMatchingPosterUrl(film) {
  if (!film.affiches || !film.affiches.length) return null;
  const defaultPoster = film.affiches[0];
  return defaultPoster.affiche_w500 || defaultPoster.affiche_original || null;
}

function getFirstPalette(film) {
  if (film.affiches && film.affiches.length && film.affiches[0].palette) {
    return film.affiches[0].palette;
  }
  return [];
}

function hexToRgba(hex, alpha = 0.2) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function starsHtml(rating) {
  const full = Math.floor(rating / 2);
  const half = (rating % 2) >= 1 ? 1 : 0;
  const empty = 5 - full - half;
  
  let html = '';
  for (let i = 0; i < full; i++) html += '★';
  if (half) html += '½';
  for (let i = 0; i < empty; i++) html += '☆';
  return html;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    const locale = state.lang === 'ja' ? 'ja-JP' : state.lang === 'en' ? 'en-US' : 'fr-FR';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch(e) {
    return dateStr;
  }
}

function formatRuntime(runtime) {
  if (!runtime) return 'N/A';
  const hrs = Math.floor(runtime / 60);
  const mins = runtime % 60;
  if (state.lang === 'ja') {
    return hrs > 0 ? `${hrs}時間 ${mins}分` : `${mins}分`;
  } else if (state.lang === 'en') {
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  } else {
    return hrs > 0 ? `${hrs}h ${mins}min` : `${mins}min`;
  }
}

function formatCurrency(val) {
  if (!val) return 'N/A';
  const currencyCode = state.lang === 'ja' ? 'JPY' : 'USD';
  return new Intl.NumberFormat(state.lang === 'ja' ? 'ja-JP' : 'en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(val);
}

// Custom Toast Manager
let toastTimeout;
function showToast(msg) {
  if (!dom.toast) return;
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => dom.toast.classList.remove('show'), 3000);
}

// Kickstart
document.addEventListener('DOMContentLoaded', init);
})();

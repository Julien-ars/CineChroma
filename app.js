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
  DATA_URLS:         ['./films_part1.json', './films_part2.json', './films_part3.json'],
  PAGE_SIZE:         60,
  DEFAULT_SORT:      'popularity',
  DEFAULT_THRESHOLD: 30,
  MAX_COLORS:        5,
  SCROLL_TOP_OFFSET: 350,
};

const rawSvgs = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#fox-grad)"/><linearGradient id="fox-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF5E3A"/><stop offset="100%" stop-color="#FF2A68"/></linearGradient><polygon points="50,75 25,45 75,45" fill="#FFFFFF" opacity="0.9"/><polygon points="50,75 40,45 60,45" fill="#FF5E3A"/><polygon points="25,45 15,20 40,38" fill="#FFFFFF" opacity="0.9"/><polygon points="75,45 85,20 60,38" fill="#FFFFFF" opacity="0.9"/><polygon points="25,45 15,20 30,45" fill="#FF2A68" opacity="0.3"/><polygon points="75,45 85,20 70,45" fill="#FF2A68" opacity="0.3"/><circle cx="38" cy="48" r="3" fill="#1A1A1A"/><circle cx="62" cy="48" r="3" fill="#1A1A1A"/><polygon points="50,75 46,70 54,70" fill="#1A1A1A"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#panda-grad)"/><linearGradient id="panda-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#87F1FF"/><stop offset="100%" stop-color="#0078FF"/></linearGradient><circle cx="30" cy="30" r="14" fill="#2C3E50"/><circle cx="70" cy="30" r="14" fill="#2C3E50"/><circle cx="50" cy="55" r="30" fill="#FFFFFF"/><ellipse cx="38" cy="52" rx="9" ry="12" fill="#2C3E50" transform="rotate(-15 38 52)"/><ellipse cx="62" cy="52" rx="9" ry="12" fill="#2C3E50" transform="rotate(15 62 52)"/><circle cx="38" cy="50" r="3" fill="#FFFFFF"/><circle cx="62" cy="50" r="3" fill="#FFFFFF"/><polygon points="50,65 44,60 56,60" fill="#2C3E50"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#owl-grad)"/><linearGradient id="owl-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#B388FF"/><stop offset="100%" stop-color="#651FFF"/></linearGradient><polygon points="50,45 25,25 35,45" fill="#FFFFFF" opacity="0.8"/><polygon points="50,45 75,25 65,45" fill="#FFFFFF" opacity="0.8"/><circle cx="35" cy="50" r="12" fill="#FFFFFF"/><circle cx="65" cy="50" r="12" fill="#FFFFFF"/><circle cx="35" cy="50" r="6" fill="#2D3748"/><circle cx="65" cy="50" r="6" fill="#2D3748"/><circle cx="37" cy="48" r="2.5" fill="#FFFFFF"/><circle cx="67" cy="48" r="2.5" fill="#FFFFFF"/><polygon points="50,50 45,62 55,62" fill="#FFC107"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#lion-grad)"/><linearGradient id="lion-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FAD961"/><stop offset="100%" stop-color="#F76B1C"/></linearGradient><polygon points="50,15 62,30 78,25 72,42 88,48 74,58 78,75 60,70 50,85 40,70 22,75 26,58 12,48 28,42 22,25 38,30" fill="#D84B16"/><polygon points="50,30 65,48 60,68 40,68 35,48" fill="#FFFFFF" opacity="0.95"/><polygon points="50,30 45,48 55,48" fill="#FAD961"/><polygon points="50,56 46,50 54,50" fill="#2D3748"/><circle cx="42" cy="44" r="2.5" fill="#2D3748"/><circle cx="58" cy="44" r="2.5" fill="#2D3748"/></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="url(#koala-grad)"/><linearGradient id="koala-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient><circle cx="28" cy="38" r="16" fill="#64748B"/><circle cx="28" cy="38" r="10" fill="#FFD2D2"/><circle cx="72" cy="38" r="16" fill="#64748B"/><circle cx="72" cy="38" r="10" fill="#FFD2D2"/><circle cx="50" cy="56" r="26" fill="#64748B"/><circle cx="41" cy="50" r="2.5" fill="#1E293B"/><circle cx="59" cy="50" r="2.5" fill="#1E293B"/><ellipse cx="50" cy="58" rx="6" ry="10" fill="#1E293B"/></svg>`
];
const PRESET_AVATARS = rawSvgs.map(svg => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg))));

/* ============================================================
   GENRE DICTIONARY (FR / EN)
============================================================ */
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
    share_card:          '📸 Partager la carte',
    generating_card:     'Génération de la carte...',
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
      nav_game:            'Le Jeu',
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
    hero_subtitle:       'Explorez plus de 20 000 affiches sous un nouvel angle. Choisissez une teinte et découvrez instantanément les œuvres qui partagent la même signature esthétique.',
    hero_try_colors:     'Explorez les nuances :',
    hero_btn_explore:    'Explorer la galerie ↓',
    hero_btn_picker:     '🎨 Tester le nuancier',
    hero_btn_signup:     'Créer un compte',
    hero_scroll_hint:    'Découvrir les affiches',
    learn_more:          'Source : TMDb',
    languages:           'Langue d\'origine',
    lang_search_placeholder: 'Rechercher une langue…',
    poster_style:        'Style d\'affiche',
    style_textless:      'Sans texte',
    style_origine:       'Langue d\'origine',
    style_monde:         'International',
    filter_mode_or_short:'AU MOINS 1',
    filter_mode_and_short:'TOUTES',
    nav_contact:         'Contact',
    nav_about:           'En savoir plus',
    contact_title:       'Contactez-nous',
    contact_name:        'Nom / Pseudo',
    contact_email:       'Adresse Email',
    contact_message:     'Message',
    contact_send:        'Envoyer le message',
    contact_success:     'Message envoyé avec succès ! (Mode démo)',
    about_project_tab:   'Le Projet',
    about_legal_tab:     'Mentions Légales',
    about_project_title: 'À propos de CineChroma',
    about_project_p1:    'CineChroma est une galerie d\'exploration cinématographique par la couleur. Conçu pour les cinéphiles et les designers, le site permet de naviguer dans une sélection d\'affiches de films à travers leur spectre colorimétrique.',
    about_project_p2:    'Grâce à notre outil d\'analyse locale (K-Means), vous pouvez également téléverser n\'importe quelle image pour en extraire la palette de couleurs dominante et trouver instantanément les affiches possédant une signature chromatique similaire.',
    about_feat1_title:   'Recherche Chromatique',
    about_feat1_desc:    'Sélectionnez une ou plusieurs couleurs pour filtrer la base de données.',
    about_feat2_title:   'Extraction Intelligente',
    about_feat2_desc:    'Algorithme K-Means s\'exécutant à 100% dans votre navigateur.',
    about_legal_title:   'Mentions Légales',
    legal_section_editor:'Édition du site',
    legal_editor_desc:   'Le site CineChroma est édité à des fins de démonstration technique et artistique.',
    legal_section_host:  'Hébergement',
    legal_host_desc:     'Hébergé localement ou sur une plateforme d\'hébergement statique sécurisée.',
    legal_section_data:  'Données et API',
    legal_data_desc:     'Les données des films et affiches proviennent de l\'API publique de TMDb (The Movie Database). Les affiches restent la propriété exclusive de leurs producteurs et studios respectifs.',
    legal_section_cookies:'Données personnelles',
    legal_cookies_desc:  'Aucun cookie traceur tiers n\'est utilisé. Vos favoris et collections sont stockés exclusivement en local dans votre navigateur (localStorage).',
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
    share_card:          '📸 Share Card',
    generating_card:     'Generating card...',
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
      nav_game:            'The Game',
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
    hero_subtitle:       'Explore 20,000+ movie posters from a new perspective. Pick a shade and instantly discover posters sharing the same aesthetic signature.',
    hero_try_colors:     'Explore shades:',
    hero_btn_explore:    'Explore gallery ↓',
    hero_btn_picker:     '🎨 Try color picker',
    hero_btn_signup:     'Sign up',
    hero_scroll_hint:    'Discover posters',
    learn_more:          'Source: TMDb',
    languages:           'Original language',
    lang_search_placeholder: 'Search a language…',
    poster_style:        'Poster style',
    style_textless:      'Textless',
    style_origine:       'Original language',
    style_monde:         'International',
    filter_mode_or_short:'AT LEAST 1',
    filter_mode_and_short:'ALL',
    nav_contact:         'Contact',
    nav_about:           'Learn more',
    contact_title:       'Contact Us',
    contact_name:        'Name / Username',
    contact_email:       'Email Address',
    contact_message:     'Message',
    contact_send:        'Send Message',
    contact_success:     'Message sent successfully! (Demo mode)',
    about_project_tab:   'The Project',
    about_legal_tab:     'Legal Notice',
    about_project_title: 'About CineChroma',
    about_project_p1:    'CineChroma is a cinematic exploration gallery based on color. Built for film lovers and designers, it lets you browse film posters through their chromatic spectrum.',
    about_project_p2:    'Using our local color extraction tool (K-Means), you can also upload any image to extract its dominant palette and find posters sharing the same aesthetic signature.',
    about_feat1_title:   'Chromatic Search',
    about_feat1_desc:    'Select one or multiple colors to filter the movie database.',
    about_feat2_title:   'Smart Extraction',
    about_feat2_desc:    'K-Means clustering algorithm running 100% locally in your browser.',
    about_legal_title:   'Legal Information',
    legal_section_editor:'Website Publication',
    legal_editor_desc:   'CineChroma is published as a technical and artistic demonstration.',
    legal_section_host:  'Hosting',
    legal_host_desc:     'Hosted locally or on a secure static hosting provider.',
    legal_section_data:  'Data & API Sources',
    legal_data_desc:     'Movie data and posters are provided by the TMDb API. Posters remain the property of their respective production companies.',
    legal_section_cookies:'Privacy & GDPR',
    legal_cookies_desc:  'No third-party trackers are used. Your favorites and collections are stored exclusively in your browser\'s local storage.',
  },
  ja: {
      search_placeholder:  '色を試す...',
      search:              '検索',
      validate:            '確認',
      pick_color:          '色',
      add_color_btn:       '+ 色',
      clear_selection:     '選択をクリア',
      tolerance:           '許容範囲',
      filter_mode:         'カラーフィルターモード',
      filter_mode_or_desc: 'OR (少なくとも1つに一致)',
      filter_mode_and_desc:'AND (すべての色に一致)',
      filters_menu:        'フィルターとナビゲーション',
      filters_menu_short:  'フィルター',
      sort_by:             '並べ替え',
      sort_relevance:      '色の関連性',
      sort_popularity:     '人気度',
      sort_rating:         '平均評価',
      sort_date:           '公開日',
      sort_title:          'アルファベット順',
      genres:              '映画のジャンル (複数選択可)',
      reset_all:           'すべてリセット',
      apply:               '適用',
      error_title:         'データベースの読み込みに失敗しました',
      retry:               '再試行',
      no_results:          'ポスターが見つかりません',
      no_results_hint:     '検索やフィルターを調整してください。',
      reset_filters:       'リセット',
      download_poster:     'ダウンロード',
      share_card:          'カードを共有',
      generating_card:     'カードを生成中...',
      watch_trailer:       '予告編',
      chromatic_palette:   'パレット',
      palette_hint:        'クリックしてフィルタリング',
      director:            '監督',
      release:             '公開',
      runtime:             '上映時間',
      language:            '言語',
      budget:              '予算',
      revenue:             '興行収入',
      popularity:          '人気度',
      color_added:         '色が追加されました',
      color_max:           '最大5色',
      color_removed:       '色が削除されました',
      favorites:           'お気に入り',
      fav_added:           'お気に入りに追加しました',
      fav_removed:         'お気に入りから削除しました',
      copied_hex:          '16進数コードがクリップボードにコピーされました！',
      downloading:         'ポスターをダウンロード中...',
      download_error:      '直接ダウンロードに失敗しました (右クリックで保存)',
      nav_gallery:         '探検',
      nav_game:            'クイズ',
      nav_collections:     'コレクション',
      collections_title:   'テーマ別コレクション',
      nav_profile:         'プロフィール',
      guest_like_prompt:   'アカウントなしでも「いいね」できます！無料アカウントを作成して、すべてのデバイスでお気に入りを同期しましょう。',
      login:               'ログイン',
      register:            '登録',
      logout:              'ログアウト',
      tab_likes:           'お気に入り',
      tab_collections:     'コレクション',
      create_collection:   '+ コレクションを作成',
      new_collection:      '新しいコレクション',
      collection_name:     'コレクション名',
      collection_desc:     '説明（任意）',
      create_collection_btn:'コレクションを作成',
      auth_username:       'ユーザー名',
      auth_email:          'メールアドレス',
      auth_username_email: 'メールまたはユーザー名',
      auth_password:       'パスワード',
      auth_choose_avatar:  'アバターを選択',
      register_btn:        'アカウントを作成',
      login_success:       'ログイン成功！ようこそ',
      register_success:    'アカウントが正常に作成されました！',
      collection_created:  'コレクションが正常に作成されました！',
      collection_deleted:  'コレクションが削除されました',
      hero_tagline:        '視覚的かつ映画的な体験',
      hero_title:          '色彩で明らかになる映画の芸術',
      hero_subtitle:       '20,000以上の映画ポスターを新しい視点から探求。色合いを選び、同じ美的シグネチャを共有するポスターを瞬時に発見します。',
      hero_try_colors:     '色合いを探る:',
      hero_btn_explore:    'ギャラリーを見る',
      hero_btn_picker:     'カラーチャートをテスト',
      hero_btn_signup:     'アカウントを作成',
      hero_scroll_hint:    'ポスターを発見',
      learn_more:          'ソース: TMDb',
      languages:           'オリジナル言語',
      lang_search_placeholder: '言語を検索…',
      poster_style:        'ポスタースタイル',
      style_textless:      'テキストなし',
      style_origine:       'オリジナル言語',
      style_monde:         '国際版',
      filter_mode_or_short:'少なくとも1つ',
      filter_mode_and_short:'すべて',
      nav_contact:         'お問い合わせ',
      nav_about:           'もっと詳しく',
      contact_title:       'お問い合わせ',
      contact_name:        '名前 / ニックネーム',
      contact_email:       'メールアドレス',
      contact_message:     'メッセージ',
      contact_send:        'メッセージを送信',
      contact_success:     'メッセージが正常に送信されました！(デモモード)',
      about_project_tab:   'プロジェクト',
      about_legal_tab:     '法的通知',
      about_project_title: 'CineChromaについて',
      about_project_p1:    'CineChromaは色彩による映画探求ギャラリーです。映画ファンやデザイナー向けに設計されており、色彩スペクトルを通じて映画ポスターのセレクションをナビゲートできます。',
      about_project_p2:    'ローカル解析ツール(K-Means)を使用すると、任意の画像をアップロードして主要なカラーパレットを抽出し、類似した色彩シグネチャを持つポスターを即座に見つけることができます。',
      about_feat1_title:   '色彩検索',
      about_feat1_desc:    '1つまたは複数の色を選択してデータベースをフィルタリングします。',
      about_feat2_title:   'インテリジェント抽出',
      about_feat2_desc:    'K-Meansアルゴリズムがブラウザで100%実行されます。',
      about_legal_title:   '法的通知',
      legal_section_editor:'サイト編集',
      legal_editor_desc:   'CineChromaサイトは技術的および芸術的なデモンストレーションを目的として公開されています。',
      legal_section_host:  'ホスティング',
      legal_host_desc:     'ローカルまたは安全な静的ホスティングプラットフォームでホストされています。',
      legal_section_data:  'データとAPI',
      legal_data_desc:     '映画とポスターのデータはTMDb (The Movie Database)の公開APIから提供されています。ポスターは各プロデューサーとスタジオの独占的な財産です。',
      legal_section_cookies:'個人データ',
      legal_cookies_desc:  'サードパーティのトラッキングクッキーは使用されていません。お気に入りやコレクションは、ブラウザ(localStorage)にローカルにのみ保存されます。'
    }
};

function safeGetJSON(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

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
  activePosterStyles: new Set(['textless']),
  activeColors:    [],
  filterMode:      'or',
  colorThreshold:  CONFIG.DEFAULT_THRESHOLD,
  sort:            CONFIG.DEFAULT_SORT,
  lang:            localStorage.getItem('cinechroma_lang') || 'fr',
  theme:           localStorage.getItem('cinechroma_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  modalFilm:       null,
  modalPosterIndex:0,
  isLoadingMore:   false,
  favorites:       new Set(safeGetJSON('cinechroma_favorites', [])),
  user:                    safeGetJSON('cinechroma_user', null),
  collections:             safeGetJSON('cinechroma_collections', []),
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
  pickerValidationRow:  $('#picker-validation-row'),
  modalActiveColorsRow: $('#modal-active-colors-row'),
  modalAmbientGlow:     $('#modal-ambient-glow'),

  // Image Search Modal
  imageSearchTrigger:   $('#image-search-trigger'),
  imageSearchModal:     $('#image-search-modal'),
  imageModalBackdrop:   $('#image-modal-backdrop'),
  imageModalClose:      $('#image-modal-close'),
  imageDropzone:        $('#image-dropzone'),
  imageDropzoneState:   $('#image-dropzone-state'),
  imageExtractionState: $('#image-extraction-state'),
  extractionPreviewImg: $('#extraction-preview-img'),
  extractionMessage:    $('#extraction-message'),
  extractionColors:     $('#extraction-colors'),
  imageFileInput:       $('#image-file-input'),

  // Burger Drawer
  burgerDrawer:           $('#burger-drawer'),
  drawerBackdrop:         $('#drawer-backdrop'),
  drawerClose:            $('#drawer-close'),
  drawerSortOptions:      $('#drawer-sort-options'),
  drawerToleranceSlider:  $('#drawer-tolerance-slider'),
  drawerTolValue:         $('#drawer-tol-value'),
  drawerGenreChips:       $('#drawer-genre-chips'),
  drawerLanguageChips:    $('#drawer-language-chips'),
  drawerLanguageSelect:   $('#drawer-language-select'),
  drawerResetBtn:         $('#drawer-reset-btn'),
  drawerApplyBtn:         $('#drawer-apply-btn'),

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
  navLinkLogout:        $('#nav-link-logout'),
  navLinkContact:       $('#nav-link-contact'),
  navLinkAbout:         $('#nav-link-about'),


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
  modalShareCardBtn:    $('#modal-share-card-btn'),
  modalLikeBtn:         $('#modal-like-btn'),
  modalColBtn:          $('#modal-col-btn'),
  
  // Collection Chooser Modal
  colChooserModal:      $('#collection-chooser-modal'),
  colChooserBackdrop:   $('#col-chooser-backdrop'),
  colChooserClose:      $('#col-chooser-close'),
  colChooserList:       $('#col-chooser-list'),
  colChooserBtnCreate:  $('#col-chooser-btn-create'),
  colChooserBtnClose:   $('#col-chooser-btn-close'),
  
  modalTrailerBtn:      $('#modal-trailer-btn'),
  modalPalette:         $('#modal-palette'),
  modal3dToggle:        $('#modal-3d-toggle-btn'),
  modal3dCloud:         $('#modal-3d-cloud'),
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
  
  lightbox:             $('#poster-lightbox'),
  lightboxImg:          $('#lightbox-img'),
  lightboxGlow:         $('#lightbox-ambient-glow'),
  
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
  if (dom.langSwitch) dom.langSwitch.value = lang;
  if (dom.langSwitchDrawer) dom.langSwitchDrawer.value = lang;

  // Sync drawer pill buttons active state
  $$('.lang-switch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langVal === lang);
  });

  // Sync header dropdown items active state + button label
  $$('.lang-dropdown-item').forEach(item => {
    item.classList.toggle('active', item.dataset.langVal === lang);
  });
  const headerLangBtn = $('#header-lang-btn');
  if (headerLangBtn) headerLangBtn.textContent = lang.toUpperCase();

  $$('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  dom.searchInput.placeholder = t('search_placeholder');
  dom.drawerTolValue.textContent = getToleranceLabel(state.colorThreshold, state.lang);

  if (state.modalFilm) {
    dom.modalSummary.textContent = state.lang === 'ja' ? (state.modalFilm.resume_ja || state.modalFilm.resume_en || state.modalFilm.resume_fr || '') : (state.lang === 'en' ? (state.modalFilm.resume_en || state.modalFilm.resume_fr || '') : (state.modalFilm.resume_fr || state.modalFilm.resume_en || ''));
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
  if (lang === 'ja') {
    return val === 15 ? '厳格' : (val === 25 ? '中程度' : '広範');
  }
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

  // Filter by active poster style if any
  const styleFiltered = state.activePosterStyles.size > 0
    ? film.affiches.filter(a => state.activePosterStyles.has(a.categorie))
    : film.affiches;
  const candidates = styleFiltered.length > 0 ? styleFiltered : film.affiches;

  if (!state.activeColors.length) {
    const defaultPoster = candidates[0];
    return defaultPoster.affiche_w500 || defaultPoster.affiche_original || null;
  }

  let bestPoster = candidates[0];
  let maxScore = -1;

  for (const affiche of candidates) {
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
  updateSplash(10, 'Initialisation...');
  try {
    updateSplash(30, 'Connexion à la base de données...');
    const responses = await Promise.all(CONFIG.DATA_URLS.map(url => fetch(url)));
    
    for (const res of responses) {
      if (!res.ok) throw new Error(`HTTP ${res.status} sur ${res.url}`);
    }
    
    updateSplash(50, 'Téléchargement de la bibliothèque...');
    const rawDataArray = await Promise.all(responses.map(res => res.json()));
    
    updateSplash(80, 'Indexation des œuvres...');
    let films = [];
    for (const raw of rawDataArray) {
      const partFilms = Array.isArray(raw) ? raw : raw.films || raw.data || Object.values(raw);
      
      // Reconstruction of the 'affiches' property for compatibility
      for (const film of partFilms) {
        let allAffiches = [];
        if (film.affiches_globales) {
          allAffiches = allAffiches.concat(film.affiches_globales);
        }
        if (film.saisons) {
          for (const saison of film.saisons) {
            if (saison.affiches) {
              allAffiches = allAffiches.concat(saison.affiches);
            }
          }
        }
        // Fallback if 'affiches' already exists natively
        if (allAffiches.length === 0 && film.affiches) {
          allAffiches = film.affiches;
        }
        film.affiches = allAffiches;
      }
      
      films = films.concat(partFilms);
    }
    
    if (!films.length) throw new Error('Aucun film trouvé.');
    state.allFilms = films;
    updateSplash(95, 'Génération de la galerie...');
    initApp();
    updateSplash(100, 'Prêt !');
    setTimeout(hideSplashScreen, 300);
  } catch (err) {
    console.error('[CineChroma]', err);
    dom.errorMessage.textContent = err.message;
    showState('error');
    hideSplashScreen();
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
  buildPosterStyleChips();
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

  syncPosterStyleChips();

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

  dom.activeCountBadge.textContent = `${state.filtered.length} ${state.lang === 'en' ? 'movies' : (state.lang === 'ja' ? '映画' : 'films')}`;

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
        <span class="cosmos-image-thumbnail-title">${state.lang === 'en' ? 'Analyzed Image' : (state.lang === 'ja' ? '解析された画像' : 'Image analysée')}</span>
      </div>
      <button class="cosmos-icon-action-btn btn-delete-image" title="${state.lang === 'en' ? 'Remove Image' : (state.lang === 'ja' ? '画像を削除' : 'Supprimer l\'image')}" aria-label="Delete image">
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

  dom.activeCountBadge.textContent = `${state.filtered.length} ${state.lang === 'en' ? 'movies' : (state.lang === 'ja' ? '映画' : 'films')}`;
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
    if (dom.pickerValidationRow) {
      dom.pickerValidationRow.removeAttribute('hidden');
      dom.pickerValidationRow.style.display = 'flex';
    }
    dom.pickerAddColorBtn.classList.remove('initial-dark');
    showToast(t('color_added'));
  });

  dom.pickerSearchBtn.addEventListener('click', () => {
    if (state.activeColors.length === 0 && state.pickerHex) {
      state.activeColors.push(state.pickerHex);
    }
    if (state.activeColors.length > 0) {
      // When validating a color, activate all 3 poster styles
      state.activePosterStyles = new Set(['textless', 'origine', 'monde']);
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
  
  if (state.activeColors.length === 0) {
    dom.pickerAddColorBtn.classList.add('initial-dark');
  } else {
    dom.pickerAddColorBtn.classList.remove('initial-dark');
  }
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
  
  if (dom.pickerAddColorBtn) {
    dom.pickerAddColorBtn.classList.remove('initial-dark');
  }
}

function updatePickerColorOutputs() {
  const rgb = hsvToRgb(state.pickerHue, state.pickerSat, state.pickerVal);
  state.pickerHex = rgbToHex(rgb).toUpperCase();

  dom.pickerSwatchDot.style.background = state.pickerHex;
  dom.pickerHexInput.value = state.pickerHex;
  
  if (dom.pickerAddColorBtn) {
    dom.pickerAddColorBtn.classList.remove('initial-dark');
  }
}

function renderModalActiveColorsRow() {
  dom.modalActiveColorsRow.innerHTML = '';

  if (!state.activeColors.length) {
    if (dom.pickerValidationRow) {
      dom.pickerValidationRow.setAttribute('hidden', '');
      dom.pickerValidationRow.style.display = 'none';
    }
    if (dom.pickerSearchBtn) {
      dom.pickerSearchBtn.setAttribute('hidden', '');
      dom.pickerSearchBtn.style.display = 'none';
    }
    return;
  }

  if (dom.pickerValidationRow) {
    dom.pickerValidationRow.removeAttribute('hidden');
    dom.pickerValidationRow.style.display = 'flex';
  }
  if (dom.pickerSearchBtn) {
    dom.pickerSearchBtn.removeAttribute('hidden');
    dom.pickerSearchBtn.style.display = 'inline-flex';
  }

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

/* Language names for display — keyed by ISO code */
const LANG_NAMES_FR = {
  fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand',
  it: 'Italien', ja: 'Japonais', ko: 'Coréen', zh: 'Chinois',
  pt: 'Portugais', ru: 'Russe', ar: 'Arabe', hi: 'Hindi',
  sv: 'Suédois', da: 'Danois', nl: 'Néerlandais', pl: 'Polonais',
  tr: 'Turc', cs: 'Tchèque', ro: 'Roumain', hu: 'Hongrois',
  no: 'Norvégien', fi: 'Finnois', he: 'Hébreu', el: 'Grec',
  th: 'Thaï', uk: 'Ukrainien', vi: 'Vietnamien', id: 'Indonésien',
  nb: 'Norvégien', sk: 'Slovaque', hr: 'Croate', bg: 'Bulgare',
  sr: 'Serbe', lt: 'Lituanien', lv: 'Letton', sl: 'Slovène',
  ca: 'Catalan', eu: 'Basque', gl: 'Galicien', is: 'Islandais',
  ms: 'Malais', tl: 'Philippin', ta: 'Tamoul', te: 'Télougou',
  bn: 'Bengali', fa: 'Persan', ur: 'Ourdou', sw: 'Swahili',
  af: 'Afrikaans', sq: 'Albanais', hy: 'Arménien', ka: 'Géorgien',
  mk: 'Macédonien', mn: 'Mongol', az: 'Azerbaïdjanais',
};
const LANG_NAMES_EN = {
  fr: 'French', en: 'English', es: 'Spanish', de: 'German',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', zh: 'Chinese',
  pt: 'Portuguese', ru: 'Russian', ar: 'Arabic', hi: 'Hindi',
  sv: 'Swedish', da: 'Danish', nl: 'Dutch', pl: 'Polish',
  tr: 'Turkish', cs: 'Czech', ro: 'Romanian', hu: 'Hungarian',
  no: 'Norwegian', fi: 'Finnish', he: 'Hebrew', el: 'Greek',
  th: 'Thai', uk: 'Ukrainian', vi: 'Vietnamese', id: 'Indonesian',
  nb: 'Norwegian', sk: 'Slovak', hr: 'Croatian', bg: 'Bulgarian',
  sr: 'Serbian', lt: 'Lithuanian', lv: 'Latvian', sl: 'Slovenian',
  ca: 'Catalan', eu: 'Basque', gl: 'Galician', is: 'Icelandic',
  ms: 'Malay', tl: 'Filipino', ta: 'Tamil', te: 'Telugu',
  bn: 'Bengali', fa: 'Persian', ur: 'Urdu', sw: 'Swahili',
  af: 'Afrikaans', sq: 'Albanian', hy: 'Armenian', ka: 'Georgian',
  mk: 'Macedonian', mn: 'Mongolian', az: 'Azerbaijani',
};
const LANG_NAMES_JA = {
  fr: 'フランス語', en: '英語', es: 'スペイン語', de: 'ドイツ語',
  it: 'イタリア語', ja: '日本語', ko: '韓国語', zh: '中国語',
  pt: 'ポルトガル語', ru: 'ロシア語', ar: 'アラビア語', hi: 'ヒンディー語',
  sv: 'スウェーデン語', da: 'デンマーク語', nl: 'オランダ語', pl: 'ポーランド語',
  tr: 'トルコ語', cs: 'チェコ語', ro: 'ルーマニア語', hu: 'ハンガリー語',
};

function getLangName(code) {
  const names = state.lang === 'en' ? LANG_NAMES_EN : state.lang === 'ja' ? LANG_NAMES_JA : LANG_NAMES_FR;
  return names[code] || code.toUpperCase();
}

function buildDrawerLanguageChips() {
  const allLangCodes = [...new Set(state.allFilms.map(f => (f.langue_origine || f.langue_originale || '').toLowerCase()).filter(Boolean))].sort();

  // Build the search input UI replacing the old select
  const container = $('#drawer-language-container');
  if (!container) return;
  container.innerHTML = '';

  // --- Search input ---
  const searchWrap = document.createElement('div');
  searchWrap.className = 'lang-search-wrap';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'drawer-lang-search-input';
  searchInput.className = 'lang-search-input';
  searchInput.placeholder = t('lang_search_placeholder');
  searchInput.autocomplete = 'off';
  searchInput.setAttribute('aria-label', t('languages'));

  const searchIcon = document.createElement('span');
  searchIcon.className = 'lang-search-icon';
  searchIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`;

  searchWrap.appendChild(searchIcon);
  searchWrap.appendChild(searchInput);
  container.appendChild(searchWrap);

  // --- Active selection chips row ---
  const activeRow = document.createElement('div');
  activeRow.id = 'lang-active-chips';
  activeRow.className = 'lang-active-chips';
  container.appendChild(activeRow);

  // --- Suggestions dropdown ---
  const dropdown = document.createElement('div');
  dropdown.id = 'lang-dropdown';
  dropdown.className = 'lang-dropdown';
  dropdown.setAttribute('hidden', '');
  container.appendChild(dropdown);

  function renderActiveChips() {
    activeRow.innerHTML = '';
    state.activeLanguages.forEach(code => {
      const chip = document.createElement('button');
      chip.className = 'lang-chip-active';
      chip.innerHTML = `<span>${getLangName(code)}</span><span class="lang-chip-del" aria-label="Retirer">×</span>`;
      chip.querySelector('.lang-chip-del').addEventListener('click', (e) => {
        e.stopPropagation();
        state.activeLanguages.delete(code);
        renderActiveChips();
        renderDropdown(searchInput.value);
      });
      activeRow.appendChild(chip);
    });
    activeRow.hidden = state.activeLanguages.size === 0;
  }

  function renderDropdown(query) {
    const q = query.trim().toLowerCase();
    const filtered = allLangCodes.filter(code => {
      if (state.activeLanguages.has(code)) return false;
      if (!q) return true;
      const name = getLangName(code).toLowerCase();
      return name.includes(q) || code.includes(q);
    }).slice(0, 8);

    dropdown.innerHTML = '';
    if (filtered.length === 0 || !q) {
      dropdown.setAttribute('hidden', '');
      return;
    }
    dropdown.removeAttribute('hidden');
    filtered.forEach(code => {
      const item = document.createElement('button');
      item.className = 'lang-dropdown-item';
      item.innerHTML = `<span class="lang-item-name">${getLangName(code)}</span><span class="lang-item-code">${code.toUpperCase()}</span>`;
      item.addEventListener('click', () => {
        state.activeLanguages.add(code);
        searchInput.value = '';
        dropdown.setAttribute('hidden', '');
        renderActiveChips();
        renderDropdown('');
      });
      dropdown.appendChild(item);
    });
  }

  searchInput.addEventListener('input', () => renderDropdown(searchInput.value));
  searchInput.addEventListener('focus', () => { if (searchInput.value) renderDropdown(searchInput.value); });
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) dropdown.setAttribute('hidden', '');
  }, { capture: false });

  renderActiveChips();

  // Legacy compat — keep old elements non-blocking
  if (dom.drawerLanguageSelect) dom.drawerLanguageSelect.style.display = 'none';
  if (dom.drawerLanguageChips) dom.drawerLanguageChips.hidden = true;
}

function syncDrawerLanguageChips() {
  // Sync active chips display in the new UI
  const activeRow = $('#lang-active-chips');
  if (!activeRow) return;
  // Trigger re-render by calling buildDrawerLanguageChips if container exists
  const container = $('#drawer-language-container');
  if (container && container.querySelector('#drawer-lang-search-input')) {
    // Already built, just refresh the active chips
    activeRow.innerHTML = '';
    state.activeLanguages.forEach(code => {
      const chip = document.createElement('button');
      chip.className = 'lang-chip-active';
      chip.innerHTML = `<span>${getLangName(code)}</span><span class="lang-chip-del" aria-label="Retirer">×</span>`;
      chip.querySelector('.lang-chip-del').addEventListener('click', (e) => {
        e.stopPropagation();
        state.activeLanguages.delete(code);
        syncDrawerLanguageChips();
      });
      activeRow.appendChild(chip);
    });
    activeRow.hidden = state.activeLanguages.size === 0;
  }
}

function buildPosterStyleChips() {
  const container = $('#drawer-poster-style-chips');
  if (!container) return;
  container.innerHTML = '';
  const styles = [
    { val: 'textless', key: 'style_textless' },
    { val: 'origine',  key: 'style_origine' },
    { val: 'monde',    key: 'style_monde' },
  ];
  styles.forEach(({ val, key }) => {
    const btn = document.createElement('button');
    btn.className = `drawer-chip poster-style-chip${state.activePosterStyles.has(val) ? ' active' : ''}`;
    btn.dataset.styleVal = val;
    btn.textContent = t(key);
    btn.addEventListener('click', () => {
      if (state.activePosterStyles.has(val)) {
        // Don't deselect if it's the last one
        if (state.activePosterStyles.size > 1) state.activePosterStyles.delete(val);
      } else {
        state.activePosterStyles.add(val);
      }
      btn.classList.toggle('active', state.activePosterStyles.has(val));
    });
    container.appendChild(btn);
  });
}

function syncPosterStyleChips() {
  $$('.poster-style-chip').forEach(btn => {
    const val = btn.dataset.styleVal;
    btn.classList.toggle('active', state.activePosterStyles.has(val));
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
  // Support both old .drawer-toggle-btn and new .drawer-mode-btn
  $$('.drawer-toggle-btn, .drawer-mode-btn').forEach(btn => {
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
  if (state.activeColors.length > 1) {
    state.filterMode = 'and';
    syncDrawerModeButtons();
  }
  let films = state.allFilms;

  if (state.searchQuery) {
    const qNorm = normalizeStr(state.searchQuery);
    const qTokens = qNorm.split(/\s+/).filter(Boolean);

    films = films.filter(f => {
      const titleNorm     = normalizeStr(f.titre || f.title || '');
      const origTitleNorm = normalizeStr(f.titre_original || f.original_title || '');
      const directorNorm  = normalizeStr(f.realisateur || f.director || '');
      const dbWords       = `${titleNorm} ${origTitleNorm} ${directorNorm}`.split(/\s+/).filter(Boolean);

      return qTokens.every(token => fuzzyMatch(token, dbWords));
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

  // NOTE: poster style filter applies in getMatchingPosterUrl (card display), not in film-level filter
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
  card.setAttribute('aria-label', (state.lang === 'ja' && film.titre_ja ? film.titre_ja : (state.lang === 'en' && film.titre_en ? film.titre_en : (film.titre || film.titre_original))) || 'Film');

  const filmId  = getFilmId(film);
  card.setAttribute('data-id', filmId);
  const src     = getMatchingPosterUrl(film);
  const year    = formatYear(film.date_sortie);
  const isFav   = state.favorites.has(filmId);
  const isColActive = state.collections.some(c => c.filmIds && c.filmIds.includes(filmId));

  let matchScore = null;
  if (state.activeColors.length) {
    const score = getFilmMultiColorScore(film);
    if (score > 0) {
      matchScore = Math.min(99, Math.round(score));
    }
  }

  const colButtonHtml = state.user ? `
    <button class="card-col-btn${isColActive ? ' active' : ''}" aria-label="Organiser dans les collections" tabindex="-1">
      <svg viewBox="0 0 24 24" fill="${isColActive ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="13" height="13">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  ` : '';

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
    ${colButtonHtml}
    <div class="card-overlay" aria-hidden="true">
      <div class="card-title">${esc((state.lang === 'ja' && film.titre_ja ? film.titre_ja : (state.lang === 'en' && film.titre_en ? film.titre_en : (film.titre || film.titre_original))) || '')}</div>
      <div class="card-meta">${[film.realisateur, year].filter(Boolean).join(' · ')}</div>
    </div>
  `;

  const affiches = film.affiches || [];
  const clickedPosterIndex = Math.max(0, affiches.findIndex(a => (a.affiche_w500 || a.affiche_original) === src));
  card.addEventListener('click', () => openModal(film, clickedPosterIndex));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(film, clickedPosterIndex); }
  });
  card.querySelector('.card-fav-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(filmId, e.currentTarget);
  });
  
  const colBtn = card.querySelector('.card-col-btn');
  if (colBtn) {
    colBtn.addEventListener('click', e => {
      e.stopPropagation();
      openCollectionChooser(film, colBtn);
    });
  }
  
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

  const isRemoving = state.favorites.has(filmId);
  if (isRemoving) {
    state.favorites.delete(filmId);
    showToast(t('fav_removed'));
  } else {
    state.favorites.add(filmId);
    if (state.user || state.hasSeenGuestLikePrompt) {
      showToast(t('fav_added'));
    }
  }

  // Update all matching cards in DOM
  const activeVal = !isRemoving;
  $$(`.film-card[data-id="${filmId}"]`).forEach(card => {
    const btn = card.querySelector('.card-fav-btn');
    if (btn) {
      btn.classList.toggle('active', activeVal);
      btn.querySelector('svg').setAttribute('fill', activeVal ? 'currentColor' : 'none');
    }
  });

  // Update details modal button state if open
  if (state.modalFilm && getFilmId(state.modalFilm) === filmId) {
    if (dom.modalLikeBtn) {
      dom.modalLikeBtn.classList.toggle('active-like', activeVal);
      dom.modalLikeBtn.querySelector('svg').setAttribute('fill', activeVal ? 'currentColor' : 'none');
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
    
    // Set Profile link text to Mon Profil and show Logout
    if (dom.navLinkProfile) {
      const span = dom.navLinkProfile.querySelector('span');
      if (span) span.textContent = t('nav_profile');
    }
    if (dom.navLinkLogout) {
      dom.navLinkLogout.hidden = false;
    }
  } else {
    dom.headerAvatarImg.hidden = true;
    dom.headerAvatarPlaceholder.hidden = false;
    
    // Set Profile link text to Se connecter and hide Logout
    if (dom.navLinkProfile) {
      const span = dom.navLinkProfile.querySelector('span');
      if (span) span.textContent = t('login');
    }
    if (dom.navLinkLogout) {
      dom.navLinkLogout.hidden = true;
    }
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
  if (dom.authTabLogin) dom.authTabLogin.classList.toggle('active', isLogin);
  if (dom.authTabRegister) dom.authTabRegister.classList.toggle('active', !isLogin);
  if (dom.authFormLogin) dom.authFormLogin.hidden = !isLogin;
  if (dom.authFormRegister) dom.authFormRegister.hidden = isLogin;
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
        const posterImg = card.querySelector('.profile-like-img');
        const posterUrl = posterImg ? posterImg.getAttribute('src') : '';
        const affiches = film.affiches || [];
        const clickedPosterIndex = Math.max(0, affiches.findIndex(a => (a.affiche_w500 || a.affiche_original) === posterUrl));
        openModal(film, clickedPosterIndex);
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
  
  if (state.chooserFilm) {
    renderCollectionChooserList();
  }
}

/* ============================================================
   COLLECTION CHOOSER POPUP & HELPERS
============================================================ */
function openCollectionChooser(film, triggerEl) {
  state.chooserFilm = film;
  renderCollectionChooserList();
  dom.colChooserModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCollectionChooser() {
  dom.colChooserModal.setAttribute('hidden', '');
  document.body.style.overflow = '';
  state.chooserFilm = null;
}

function renderCollectionChooserList() {
  dom.colChooserList.innerHTML = '';
  if (!state.chooserFilm) return;
  const filmId = getFilmId(state.chooserFilm);
  
  if (state.collections.length === 0) {
    dom.colChooserList.innerHTML = `<div style="text-align:center; padding:16px; font-size:0.78rem; color:var(--text-3);">Aucune collection. Créez-en une ci-dessous !</div>`;
    return;
  }
  
  state.collections.forEach(col => {
    const isChecked = col.filmIds && col.filmIds.includes(filmId);
    const item = document.createElement('div');
    item.className = 'col-chooser-item';
    item.innerHTML = `
      <div class="col-chooser-item-left">
        <div class="col-chooser-checkbox${isChecked ? ' checked' : ''}">
          ${isChecked ? `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="10" height="10">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ` : ''}
        </div>
        <span class="col-chooser-name">${esc(col.title)}</span>
      </div>
      <span class="col-chooser-count">${col.filmIds ? col.filmIds.length : 0}</span>
    `;
    
    item.addEventListener('click', () => {
      if (!col.filmIds) col.filmIds = [];
      const idx = col.filmIds.indexOf(filmId);
      if (idx > -1) {
        col.filmIds.splice(idx, 1);
        showToast(state.lang === 'en' ? `Removed from "${col.title}"` : `Retiré de la collection "${col.title}"`);
      } else {
        col.filmIds.push(filmId);
        showToast(state.lang === 'en' ? `Added to "${col.title}"` : `Ajouté à la collection "${col.title}"`);
      }
      localStorage.setItem('cinechroma_collections', JSON.stringify(state.collections));
      
      renderCollectionChooserList();
      if (dom.profileCollectionsCount) {
        dom.profileCollectionsCount.textContent = `${state.collections.length} collections`;
      }
      syncCardCollectionStates(filmId);
      updateDetailsModalCollectionBtn(filmId);
    });
    
    dom.colChooserList.appendChild(item);
  });
}

function syncCardCollectionStates(filmId) {
  const isColActive = state.collections.some(c => c.filmIds && c.filmIds.includes(filmId));
  $$(`.film-card[data-id="${filmId}"]`).forEach(card => {
    const btn = card.querySelector('.card-col-btn');
    if (btn) {
      btn.classList.toggle('active', isColActive);
      btn.querySelector('svg').setAttribute('fill', isColActive ? 'currentColor' : 'none');
    }
  });
}

function updateDetailsModalCollectionBtn(filmId) {
  if (state.modalFilm && getFilmId(state.modalFilm) === filmId) {
    if (dom.modalColBtn) {
      const isCol = state.collections.some(c => c.filmIds && c.filmIds.includes(filmId));
      dom.modalColBtn.classList.toggle('active-col', isCol);
      dom.modalColBtn.querySelector('svg').setAttribute('fill', isCol ? 'currentColor' : 'none');
    }
  }
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
    // Check if staying on same page
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

function updateSplash(percent, text) {
  const progress = document.getElementById('splash-progress');
  const status = document.getElementById('splash-status');
  if (progress) progress.style.width = `${percent}%`;
  if (status && text) status.textContent = text;
}

function hideSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.add('splash-hidden');
  }
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
function openModal(film, startingPosterIndex = 0) {
  state.modalFilm = film;
  state.modalPosterIndex = startingPosterIndex;
  populateModal(film, startingPosterIndex);
  dom.filmModal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => dom.modalClose.focus(), 80);
}

function closeModal() {
  // Cleanup 3D Cloud
  if (window.cleanup3DCloud) {
    window.cleanup3DCloud();
  }
  dom.modal3dCloud.classList.remove('expanded');
  dom.modal3dToggle.classList.remove('active');
  
  dom.filmModal.setAttribute('hidden', '');
  dom.filmModal.style.removeProperty('--modal-glow-color');
  document.body.style.overflow = '';
  state.modalFilm = null;
}

function populateModal(film, startingPosterIndex = 0) {
  // Poster Categories and Dots Selector
  const affiches = film.affiches || [];
  const grouped = {
    textless: affiches.filter(a => a.categorie === 'textless'),
    origine: affiches.filter(a => a.categorie === 'origine'),
    monde: affiches.filter(a => a.categorie === 'monde')
  };

  const startingPoster = affiches[startingPosterIndex] || affiches[0];
  let activeCat = startingPoster ? (startingPoster.categorie || 'textless') : 'textless';
  
  if (!grouped[activeCat] || grouped[activeCat].length === 0) {
    if (grouped.textless.length > 0) activeCat = 'textless';
    else if (grouped.origine.length > 0) activeCat = 'origine';
    else if (grouped.monde.length > 0) activeCat = 'monde';
  }

  let activeIndexInCat = 0;
  if (grouped[activeCat]) {
    const activeUrl = startingPoster ? (startingPoster.affiche_w500 || startingPoster.affiche_original) : '';
    const idx = grouped[activeCat].findIndex(a => (a.affiche_w500 || a.affiche_original) === activeUrl);
    if (idx !== -1) activeIndexInCat = idx;
  }

  function renderPosterSection() {
    const catPosters = (grouped[activeCat] || []).slice(0, 3);
    const poster = catPosters[activeIndexInCat] || catPosters[0] || affiches[0];
    
    if (poster) {
      const idxInGlobal = affiches.indexOf(poster);
      state.modalPosterIndex = idxInGlobal !== -1 ? idxInGlobal : 0;
      updateModalPoster(film, state.modalPosterIndex);
    }

    const catsContainer = $('#modal-poster-cats');
    if (catsContainer) {
      catsContainer.innerHTML = '';
      const catLabels = {
        textless: state.lang === 'ja' ? '文字なし' : (state.lang === 'en' ? 'Textless' : 'Sans texte'),
        origine: state.lang === 'ja' ? 'オリジナル' : (state.lang === 'en' ? 'Original' : "Langue d'origine"),
        monde: state.lang === 'ja' ? 'インターナショナル' : (state.lang === 'en' ? 'World' : 'Du monde')
      };

      ['textless', 'origine', 'monde'].forEach(cat => {
        if (grouped[cat] && grouped[cat].length > 0) {
          const btn = document.createElement('button');
          btn.className = `modal-poster-cat-btn${cat === activeCat ? ' active' : ''}`;
          btn.textContent = catLabels[cat];
          btn.addEventListener('click', () => {
            activeCat = cat;
            activeIndexInCat = 0;
            renderPosterSection();
          });
          catsContainer.appendChild(btn);
        }
      });
    }

    const dotsContainer = $('#modal-poster-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      const catPosters = (grouped[activeCat] || []).slice(0, 3);
      if (catPosters.length > 1) {
        catPosters.forEach((p, i) => {
          const thumbUrl = p.affiche_w500 || p.affiche_original || null;
          if (thumbUrl) {
            const img = document.createElement('img');
            img.src = thumbUrl;
            img.className = `poster-thumb${i === activeIndexInCat ? ' active' : ''}`;
            img.alt = `Poster ${i+1}`;
            img.setAttribute('role', 'button');
            img.setAttribute('tabindex', '0');
            img.addEventListener('click', () => {
              activeIndexInCat = i;
              renderPosterSection();
            });
            img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { activeIndexInCat = i; renderPosterSection(); } });
            dotsContainer.appendChild(img);
          } else {
            const dot = document.createElement('button');
            dot.className = `modal-poster-dot${i === activeIndexInCat ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Poster ${i+1}`);
            dot.addEventListener('click', () => {
              activeIndexInCat = i;
              renderPosterSection();
            });
            dotsContainer.appendChild(dot);
          }
        });
      }
    }
  }

  renderPosterSection();
  dom.modalPosterSelector.innerHTML = ''; // Keep cleared for compat


  // Point 1: Direct Download Button for Poster Image
  dom.modalDownloadBtn.onclick = (e) => {
    e.preventDefault();
    downloadPosterImage(film);
  };

  // Share Card Button
  dom.modalShareCardBtn.onclick = (e) => {
    e.preventDefault();
    shareCardImage(film);
  };

  // Details Modal actions row (Like & Collection)
  const filmId = getFilmId(film);
  const isFav = state.favorites.has(filmId);
  const isCol = state.collections.some(c => c.filmIds && c.filmIds.includes(filmId));
  
  if (dom.modalLikeBtn) {
    dom.modalLikeBtn.classList.toggle('active-like', isFav);
    dom.modalLikeBtn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
    dom.modalLikeBtn.onclick = (e) => {
      e.preventDefault();
      toggleFavorite(filmId, null);
    };
  }

  if (dom.modalColBtn) {
    if (state.user) {
      dom.modalColBtn.hidden = false;
      dom.modalColBtn.classList.toggle('active-col', isCol);
      dom.modalColBtn.querySelector('svg').setAttribute('fill', isCol ? 'currentColor' : 'none');
      dom.modalColBtn.onclick = (e) => {
        e.preventDefault();
        openCollectionChooser(film, dom.modalColBtn);
      };
    } else {
      dom.modalColBtn.hidden = true;
    }
  }

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

  dom.modalTitle.textContent = (state.lang === 'ja' && film.titre_ja ? film.titre_ja : (state.lang === 'en' && film.titre_en ? film.titre_en : (film.titre || film.titre_original))) || 'Titre inconnu';
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

  dom.modalSummary.textContent = state.lang === 'ja' ? (film.resume_ja || film.resume_en || film.resume_fr || '概要はありません。') : (state.lang === 'en' ? (film.resume_en || film.resume_fr || 'Summary not available.') : (film.resume_fr || film.resume_en || 'Résumé non disponible.'));
}

function updateModalAmbientGlowColor(film, idx) {
  const affiches = film.affiches || [];
  const currentPoster = affiches[idx] || affiches[0];
  if (currentPoster && currentPoster.palette?.length > 0) {
    const hex = currentPoster.palette[0].hex;
    const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
    dom.modalAmbientGlow.style.setProperty('--modal-glow-color', hexToRgba(cleanHex, 0.45));
    
    // Set poster-glow custom property center behind the poster
    const posterCol = $('.modal-poster-col');
    if (posterCol) {
      posterCol.style.setProperty('--poster-glow', hexToRgba(cleanHex, 0.85)); /* Intensité maximale */
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

// Generate and Share Card
async function shareCardImage(film) {
  showToast(t('generating_card') || 'Génération de la carte...');
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1350;

    // 1. Fond sombre mat premium
    ctx.fillStyle = '#0B0B0E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get image src
    const affiches = film.affiches || [];
    const currentPoster = affiches[state.modalPosterIndex] || affiches[0] || {};
    const src = currentPoster.affiche_original || currentPoster.affiche_w500;

    if (src) {
      // Create image with anonymous crossOrigin and cache-buster
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Erreur de chargement de l\'image (CORS/Réseau)'));
        const sep = src.includes('?') ? '&' : '?';
        img.src = src + sep + 'cb=' + Date.now();
      });

      // 2. Affiche du film (Zone haute)
      const dy = 70;
      const imgHeight = 660;
      const imgWidth = (img.naturalWidth / img.naturalHeight) * imgHeight;
      const dx = (1080 - imgWidth) / 2;

      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(dx, dy, imgWidth, imgHeight, 16);
      } else {
        // Fallback round rect just in case
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

      // 3. Typographie & Métadonnées (Zone centrale)
      const textStartY = dy + imgHeight + 40; // 70 + 660 + 40 = 770 (espacement)
      ctx.textAlign = 'center';
      
      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
      const title = ((state.lang === 'ja' && film.titre_ja ? film.titre_ja : (state.lang === 'en' && film.titre_en ? film.titre_en : (film.titre || film.titre_original))) || 'FILM').toUpperCase();
      ctx.fillText(title, 540, textStartY + 44);

      // Subtitle
      ctx.fillStyle = '#8E8E93';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      const director = (film.realisateur || 'INCONNU').toUpperCase();
      const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : '';
      ctx.fillText(`${director}  •  ${year}`, 540, textStartY + 44 + 35);

      // 4. Palette de Couleurs (Zone basse)
      const palette = currentPoster.palette || [];
      if (palette.length > 0) {
        const swatchWidth = 170;
        const swatchHeight = 90;
        const gap = 15;
        const totalWidth = (palette.length * swatchWidth) + ((palette.length - 1) * gap);
        let startX = (1080 - totalWidth) / 2;
        const startY = 1010; // Fixé par la spec

        palette.forEach(p => {
          const hex = (p.hex.startsWith('#') ? p.hex : '#' + p.hex).toUpperCase();
          
          ctx.fillStyle = hex;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(startX, startY, swatchWidth, swatchHeight, 25);
          } else {
            ctx.rect(startX, startY, swatchWidth, swatchHeight);
          }
          ctx.fill();
          
          // Codes HEX
          ctx.textAlign = 'center';
          ctx.font = '16px monospace, sans-serif';
          ctx.fillStyle = '#A1A1AA';
          ctx.fillText(hex, startX + (swatchWidth / 2), startY + swatchHeight + 25);
          
          startX += swatchWidth + gap;
        });
      }

      // 5. Branding Footer (Tout en bas)
      // Ligne de séparation
      const lineY = 1230;
      ctx.strokeStyle = '#1E1E24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, lineY);
      ctx.lineTo(1000, lineY);
      ctx.stroke();
      
      const footerTextY = 1280;
      
      // Logo (Gauche)
      ctx.textAlign = 'left';
      ctx.font = 'bold 22px "Shrikhand", cursive';
      ctx.fillStyle = '#E00909';
      ctx.fillText('C I N E C H R O M A', 80, footerTextY);
      
      // URL (Droite)
      ctx.textAlign = 'right';
      ctx.font = '20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#636366';
      ctx.fillText('cinechroma.vercel.app', 1000, footerTextY);

      // Convert to blob properly wrapped in Promise
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });
      
      if (!blob) throw new Error('Le canvas n\'a pas pu générer le fichier (Tainted)');

      const filename = `cinechroma-${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
      
      // Try using the native Web Share API
      try {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title,
            text: 'Découvrez les couleurs de ce film sur CineChroma !'
          });
          return; // Stop here if share API worked
        }
      } catch (shareErr) {
        console.error('Share annulé ou échoué:', shareErr);
        if (shareErr.name === 'AbortError') return; // User cancelled
      }
      
      // Fallback download if share API is unavailable or failed
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error('Erreur génération carte:', err);
    showToast('Erreur lors de la génération de la carte');
  }
}

function renderModalPalette(palette) {
  dom.modalPalette.innerHTML = '';
  
  const validateBtn = $('#modal-palette-validate-btn');
  if (validateBtn) {
    validateBtn.hidden = (state.activeColors.length === 0);
    validateBtn.onclick = () => {
      closeModal();
      if (state.sort !== 'relevance') state.sort = 'relevance';
      applyFiltersAndRender();
      updateURL();
      syncUIFromState();
    };
  }

  for (const entry of palette) {
    const hex = (entry.hex||'').startsWith('#') ? entry.hex : `#${entry.hex}`;
    if (!hex || hex === '#') continue;
    const isActive = state.activeColors.includes(hex);

    const dot = document.createElement('div');
    dot.className = `modal-palette-dot${isActive ? ' filter-active' : ''}`;
    dot.style.background = hex;
    dot.title = hex;
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    dot.setAttribute('aria-label', `Sélectionner ${hex}`);

    const toggleColor = () => {
      const idx = state.activeColors.indexOf(hex);
      if (idx > -1) {
        state.activeColors.splice(idx, 1);
      } else {
        if (state.activeColors.length >= CONFIG.MAX_COLORS) {
          showToast(t('color_max'));
          return;
        }
        state.activeColors.push(hex);
      }
      renderModalPalette(palette);
      if (validateBtn) validateBtn.hidden = (state.activeColors.length === 0);
    };
    
    dot.addEventListener('click', toggleColor);
    dot.addEventListener('keydown', e => { if (e.key === 'Enter') toggleColor(); });
    dom.modalPalette.appendChild(dot);
  }
  
  // Save current palette for 3D toggle
  const newPaletteHex = palette.map(p => p.hex);
  const oldHexStr = JSON.stringify(state.currentPaletteHex || []);
  const newHexStr = JSON.stringify(newPaletteHex);
  
  state.currentPaletteHex = newPaletteHex;
  
  // If 3D is active and palette changed (e.g. user clicked another poster), update the 3D scene
  if (newHexStr !== oldHexStr && dom.modal3dCloud && dom.modal3dCloud.classList.contains('expanded')) {
    if (window.init3DCloud) {
      window.init3DCloud('modal-3d-cloud', state.currentPaletteHex);
    }
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
  const t = ((state.lang === 'ja' && film.titre_ja ? film.titre_ja : (state.lang === 'en' && film.titre_en ? film.titre_en : (film.titre || film.titre_original))) || 'x').toLowerCase().replace(/[^a-z0-9]/g,'_');
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

function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  let prevRow = new Array(s2.length + 1);
  let currRow = new Array(s2.length + 1);

  for (let j = 0; j <= s2.length; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    currRow[0] = i;
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,
        currRow[j - 1] + 1,
        prevRow[j - 1] + cost
      );
    }
    let temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[s2.length];
}

function fuzzyMatch(token, dbWords) {
  const len = token.length;
  if (len <= 0) return false;

  let maxDist = 0;
  if (len === 4 || len === 5) maxDist = 1;
  else if (len > 5) maxDist = 2;

  for (const word of dbWords) {
    if (!word) continue;
    if (word.includes(token)) return true;

    if (maxDist > 0) {
      if (Math.abs(word.length - len) <= maxDist) {
        if (levenshteinDistance(token, word) <= maxDist) {
          return true;
        }
      }
    }
  }
  return false;
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
    dom.langSwitch.addEventListener('change', (e) => { applyLang(e.target.value); });
  }

  // Profile Header Trigger
  dom.userProfileTrigger.addEventListener('click', () => {
    if (state.user) window.location.href = './profile.html';
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
    dom.heroCtaSignup.addEventListener('click', () => {
      window.location.href = './register.html';
    });
  }

  // Drawer Language Switch (legacy select - kept for URL compat)
  if (dom.langSwitchDrawer) {
    dom.langSwitchDrawer.addEventListener('change', (e) => { applyLang(e.target.value); });
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
      window.location.href = './profile.html?tab=likes';
    });
  }
  if (dom.navLinkCollections) {
    dom.navLinkCollections.addEventListener('click', (e) => {
      e.preventDefault();
      closeNavMenu();
      window.location.href = './profile.html?tab=collections';
    });
  }
  if (dom.navLinkProfile) {
    dom.navLinkProfile.addEventListener('click', (e) => {
      e.preventDefault();
      closeNavMenu();
      if (state.user) window.location.href = './profile.html';
      else openAuthModal('login');
    });
  }
  if (dom.navLinkLogout) {
    dom.navLinkLogout.addEventListener('click', (e) => {
      e.preventDefault();
      closeNavMenu();
      logoutUser();
    });
  }

  // Auth Modal Actions
  dom.authModalClose.addEventListener('click', closeAuthModal);
  dom.authModalBackdrop.addEventListener('click', closeAuthModal);
  if (dom.authTabLogin) dom.authTabLogin.addEventListener('click', () => switchAuthTab('login'));
  if (dom.authTabRegister) dom.authTabRegister.addEventListener('click', () => switchAuthTab('register'));
  dom.authFormLogin.addEventListener('submit', handleLogin);
  if (dom.authFormRegister) dom.authFormRegister.addEventListener('submit', handleRegister);

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

  // Collection Chooser Modal Actions
  if (dom.colChooserClose) dom.colChooserClose.addEventListener('click', closeCollectionChooser);
  if (dom.colChooserBackdrop) dom.colChooserBackdrop.addEventListener('click', closeCollectionChooser);
  if (dom.colChooserBtnClose) dom.colChooserBtnClose.addEventListener('click', closeCollectionChooser);
  if (dom.colChooserBtnCreate) {
    dom.colChooserBtnCreate.addEventListener('click', () => {
      closeCollectionChooser();
      openCreateCollectionModal();
    });
  }

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

  $$('.drawer-toggle-btn, .drawer-mode-btn').forEach(btn => {
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
    // Reset poster styles to default (textless only)
    state.activePosterStyles = new Set(['textless']);
    buildPosterStyleChips();
    buildDrawerLanguageChips();
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

  // 3D Toggle
  if (dom.modal3dToggle && dom.modal3dCloud) {
    dom.modal3dToggle.addEventListener('click', () => {
      const isExpanded = dom.modal3dCloud.classList.contains('expanded');
      if (!isExpanded) {
        dom.modal3dCloud.classList.add('expanded');
        dom.modal3dToggle.classList.add('active');
        if (window.init3DCloud && state.currentPaletteHex) {
          // Wait for CSS transition (0.4s) before initializing canvas size
          setTimeout(() => {
            window.init3DCloud('modal-3d-cloud', state.currentPaletteHex);
          }, 400);
        }
      } else {
        dom.modal3dCloud.classList.remove('expanded');
        dom.modal3dToggle.classList.remove('active');
        if (window.cleanup3DCloud) {
          window.cleanup3DCloud();
        }
      }
    });
  }

  // Poster Lightbox
  if (dom.modalPosterImg && dom.lightbox) {
    dom.modalPosterImg.addEventListener('click', () => {
      if (!dom.modalPosterImg.src) return;
      dom.lightboxImg.src = dom.modalPosterImg.src;
      
      const glowColor = dom.modalAmbientGlow.style.getPropertyValue('--modal-glow-color');
      if (glowColor && dom.lightboxGlow) {
        dom.lightboxGlow.style.setProperty('--modal-glow-color', glowColor);
      }
      
      dom.lightbox.removeAttribute('hidden');
      // Force reflow to start transition
      void dom.lightbox.offsetWidth;
      dom.lightbox.classList.add('active');
    });

    dom.lightbox.addEventListener('click', () => {
      dom.lightbox.classList.remove('active');
      setTimeout(() => {
        dom.lightbox.setAttribute('hidden', '');
        dom.lightboxImg.src = '';
        if (dom.lightboxGlow) dom.lightboxGlow.style.removeProperty('--modal-glow-color');
      }, 400);
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (dom.lightbox && !dom.lightbox.hasAttribute('hidden')) {
        dom.lightbox.classList.remove('active');
        setTimeout(() => dom.lightbox.setAttribute('hidden', ''), 400);
      }
      else if (!dom.authModal.hasAttribute('hidden')) closeAuthModal();
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
        if (next !== idx) {
          const nextFilm = state.sorted[next];
          const nextPosterUrl = getMatchingPosterUrl(nextFilm);
          const affiches = nextFilm.affiches || [];
          const nextPosterIndex = Math.max(0, affiches.findIndex(a => (a.affiche_w500 || a.affiche_original) === nextPosterUrl));
          openModal(nextFilm, nextPosterIndex);
        }
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
  resetImageModal();
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
    const dataURL = e.target.result;

    // Phase 1: Show extraction state with image preview
    if (dom.imageDropzoneState) dom.imageDropzoneState.hidden = true;
    if (dom.imageExtractionState) {
      dom.imageExtractionState.hidden = false;
      if (dom.extractionPreviewImg) dom.extractionPreviewImg.src = dataURL;
      if (dom.extractionColors) dom.extractionColors.innerHTML = '';
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64; canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 64, 64);

      const imgData = ctx.getImageData(0, 0, 64, 64).data;
      const pixels = [];
      for (let i = 0; i < imgData.length; i += 4) {
        if (imgData[i+3] < 128) continue;
        pixels.push({ r: imgData[i], g: imgData[i+1], b: imgData[i+2] });
      }

      if (pixels.length === 0) {
        showToast(state.lang === 'en' ? 'Invalid image' : 'Image invalide');
        resetImageModal();
        return;
      }

      const centroids = performKMeans(pixels, 3);
      const hexColors = centroids.map(c => rgbToHex(c).toUpperCase());

      // Phase 2: Reveal colors one by one with animation
      hexColors.forEach((hex, i) => {
        setTimeout(() => {
          const dot = document.createElement('div');
          dot.className = 'extraction-color-reveal';
          dot.style.cssText = `background:${hex}; animation-delay:0ms`;
          if (dom.extractionColors) dom.extractionColors.appendChild(dot);

          // Phase 3: After all colors shown, apply and close
          if (i === hexColors.length - 1) {
            setTimeout(() => {
              state.activeImageSrc = dataURL;
              state.activeColors = hexColors;
              if (state.sort !== 'relevance') state.sort = 'relevance';

              // Smooth close then redirect
              closeImageSearchModal();
              applyFiltersAndRender();
              updateURL();

              // Scroll to gallery section
              const main = document.getElementById('app-main');
              if (main) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 900);
          }
        }, i * 380);
      });
    };
    img.src = dataURL;
  };
  reader.readAsDataURL(file);
}

function resetImageModal() {
  if (dom.imageDropzoneState) dom.imageDropzoneState.hidden = false;
  if (dom.imageExtractionState) dom.imageExtractionState.hidden = true;
  if (dom.extractionColors) dom.extractionColors.innerHTML = '';
  if (dom.imageFileInput) dom.imageFileInput.value = '';
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
  setupPageTransitions();

  // Listen to system theme updates
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('cinechroma_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Open profile modal / auth redirection
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('profile') === 'open') {
    window.location.href = './profile.html';
  }
  if (urlParams.get('auth') === 'open') {
    setTimeout(() => {
      openAuthModal('login');
    }, 200);
  }
})();

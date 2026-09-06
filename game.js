/**
 * CineChroma — game.js v2.1
 * Hub de jeux : CouleurQuiz, PalettePure, ChronoChroma
 * Version auto-contenue protégée contre les collisions de scopes globaux.
 */

(function() {
  'use strict';

  // ─── DATA ─────────────────────────────────────────────────────
  let allFilms = [];
  let tiers = { tier1: [], tier2: [], tier3: [] };
  let animFilms = [];
  let dataLoaded = false;

  // ─── GAME CONFIG ──────────────────────────────────────────────
  let gameConfig = {
    game: null,        // 'couleurquiz' | 'palettepure' | 'chronochroma'
    difficulty: 'easy',
    universe: 'all',
    rounds: 5,
    time: 60
  };

  // ─── GAME STATE ───────────────────────────────────────────────
  let gameState = {};

  // ─── CHRONO ───────────────────────────────────────────────────
  let chronoInterval = null;

  // ─── ANIMATION FRAME (swatch entrance) ───────────────────────
  let swatchAnimTimeout = null;

  // ─── DOM CACHE ────────────────────────────────────────────────
  const D = {};

  document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    bindEvents();
    loadData();
  });

  function cacheDOM() {
    // Screens
    D.hub        = document.getElementById('screen-hub');
    D.config     = document.getElementById('screen-config');
    D.cq         = document.getElementById('screen-cq');
    D.pp         = document.getElementById('screen-pp');
    D.cc         = document.getElementById('screen-cc');
    D.end        = document.getElementById('screen-end');

    // Background
    D.bgPoster   = document.getElementById('game-bg-poster');
    D.bgContainer = document.getElementById('game-bg-container');

    // Hub
    D.hubCards   = document.querySelectorAll('.hub-card');

    // Config
    D.configBackBtn   = document.getElementById('config-back-btn');
    D.configGameName  = document.getElementById('config-game-name');
    D.configStartBtn  = document.getElementById('config-start-btn');
    D.configDiff      = document.getElementById('config-difficulty');
    D.configUniverse  = document.getElementById('config-universe');
    D.configRounds    = document.getElementById('config-rounds');
    D.configTime      = document.getElementById('config-time');
    D.configSectionRounds = document.getElementById('config-section-rounds');
    D.configSectionTime   = document.getElementById('config-section-time');

    // CouleurQuiz
    D.cqRound     = document.getElementById('cq-round-current');
    D.cqRoundTot  = document.getElementById('cq-round-total');
    D.cqScore     = document.getElementById('cq-score');
    D.cqProgress  = document.getElementById('cq-progress-bar');
    D.cqPalette   = document.getElementById('cq-palette');
    D.cqDifficulty= document.getElementById('cq-difficulty');
    D.cqHintBtn   = document.getElementById('cq-hint-btn');
    D.cqHintsUsed = document.getElementById('cq-hints-used');
    D.cqHintDisplay = document.getElementById('cq-hint-display');
    D.cqHintsSection = document.getElementById('cq-hints-section');
    D.cqRevealInfo = document.getElementById('cq-reveal-info');
    D.cqRevealTitle = document.getElementById('cq-reveal-title');
    D.cqRevealMeta  = document.getElementById('cq-reveal-meta');
    D.cqChoices   = document.getElementById('cq-choices');
    D.cqNextBtn   = document.getElementById('cq-next-btn');

    // PalettePure
    D.ppRound     = document.getElementById('pp-round-current');
    D.ppRoundTot  = document.getElementById('pp-round-total');
    D.ppScore     = document.getElementById('pp-score');
    D.ppProgress  = document.getElementById('pp-progress-bar');
    D.ppFilmName  = document.getElementById('pp-film-name');
    D.ppKnownSwatches = document.getElementById('pp-known-swatches');
    D.ppColorChoices  = document.getElementById('pp-color-choices');
    D.ppFeedback  = document.getElementById('pp-feedback');
    D.ppNextBtn   = document.getElementById('pp-next-btn');

    // ChronoChroma
    D.ccTimeDisplay = document.getElementById('cc-time-display');
    D.ccChronoBar   = document.getElementById('cc-chrono-bar');
    D.ccScore       = document.getElementById('cc-score');
    D.ccTotal       = document.getElementById('cc-total');
    D.ccPalette     = document.getElementById('cc-palette');
    D.ccChoices     = document.getElementById('cc-choices');
    D.ccFeedback    = document.getElementById('cc-feedback');

    // End screen
    D.endTitle      = document.getElementById('end-title');
    D.endBadge      = document.getElementById('end-game-badge');
    D.endStatsGrid  = document.getElementById('end-stats-grid');
    D.endRecapList  = document.getElementById('end-recap-list');
    D.endReplayBtn  = document.getElementById('end-replay-btn');
    D.endHubBtn     = document.getElementById('end-hub-btn');

    D.toast         = document.getElementById('toast');
  }

  function bindEvents() {
    // Hub cards → Config
    D.hubCards.forEach(card => {
      card.addEventListener('click', () => {
        gameConfig.game = card.dataset.game;
        showConfig();
      });
    });

    // Config back
    D.configBackBtn.addEventListener('click', showHub);

    // Config option buttons
    setupOptGroup(D.configDiff, val => { gameConfig.difficulty = val; });
    setupOptGroup(D.configUniverse, val => { gameConfig.universe = val; });
    setupOptGroup(D.configRounds, val => { gameConfig.rounds = parseInt(val); });
    setupOptGroup(D.configTime, val => { gameConfig.time = parseInt(val); });

    // Config start
    D.configStartBtn.addEventListener('click', startGame);

    // CouleurQuiz events
    D.cqNextBtn.addEventListener('click', cqHandleNext);
    D.cqHintBtn.addEventListener('click', cqUseHint);

    // PalettePure events
    D.ppNextBtn.addEventListener('click', ppHandleNext);

    // End screen
    D.endReplayBtn.addEventListener('click', startGame);
    D.endHubBtn.addEventListener('click', showHub);

    // Initialise le lettrage interactif sur le titre du Hub
    const hubTitle = document.querySelector('.hub-title');
    if (hubTitle) {
      applyInteractiveLettering(hubTitle, hubTitle.textContent.trim());
    }
  }

  function setupOptGroup(container, onChange) {
    container.querySelectorAll('.config-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.config-opt-btn').forEach(b => b.classList.remove('config-opt-btn--active'));
        btn.classList.add('config-opt-btn--active');
        onChange(btn.dataset.val);
      });
    });
  }

  // ─── DATA LOADING ─────────────────────────────────────────────
  async function loadData() {
    if (D.hubCards) {
      D.hubCards.forEach(card => {
        card.disabled = true;
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
      });
    }

    try {
      const urls = ['./films_part1.json', './films_part2.json', './films_part3.json'];
      const responses = await Promise.all(urls.map(url => fetch(url)));
      const dataParts = await Promise.all(responses.map(res => res.json()));
      const data = dataParts.flat();

      data.forEach(f => {
        if (!f.affiches && f.affiches_globales) f.affiches = f.affiches_globales;
      });

      const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/;
      const validFilms = data.filter(f =>
        f.affiches && f.affiches.length > 0 &&
        f.affiches[0].palette && f.affiches[0].palette.length === 5 &&
        !cjkRegex.test(f.titre || f.titre_original)
      );

      validFilms.sort((a, b) => (parseFloat(b.popularity) || 0) - (parseFloat(a.popularity) || 0));

      tiers.tier1 = validFilms.slice(0, 50);
      tiers.tier2 = validFilms.slice(50, 200);
      tiers.tier3 = validFilms.slice(200);

      animFilms = validFilms.filter(f =>
        f.genres && f.genres.some(g => /anim/i.test(g))
      );

      allFilms = validFilms;
      dataLoaded = true;

      if (D.hubCards) {
        D.hubCards.forEach(card => {
          card.disabled = false;
          card.style.opacity = '';
          card.style.pointerEvents = '';
        });
      }

      setRandomBg();
      showHub();
    } catch (err) {
      console.error('Erreur chargement films :', err);
    }
  }

  function getPool() {
    let pool = [];
    const univ = gameConfig.universe;

    if (univ === 'animation') {
      pool = animFilms.length > 20 ? animFilms : allFilms;
    } else if (univ === 'popular') {
      pool = tiers.tier1;
    } else {
      pool = allFilms;
    }

    // Difficulty sub-filter
    const diff = gameConfig.difficulty;
    // Easy = top 30 films les plus mainstream et célèbres
    if (diff === 'easy')   return pool.slice(0, Math.min(30, pool.length));
    if (diff === 'medium') return pool.slice(0, Math.min(120, pool.length));
    if (diff === 'hard')   return pool.slice(Math.min(150, Math.floor(pool.length * 0.25)));
    return pool;
  }

  function getRandom(pool, excludeIds = []) {
    let attempts = 0;
    while (attempts < 100) {
      const f = pool[Math.floor(Math.random() * pool.length)];
      if (f && !excludeIds.includes(f.id)) return f;
      attempts++;
    }
    return pool[0];
  }

  // Génération intelligente des mauvais choix pour simplifier le mode facile
  function getWrongChoices(film, pool, count) {
    const wrong = [];
    const isEasy = gameConfig.difficulty === 'easy';
    const targetGenres = film.genres || [];

    let attempts = 0;
    while (wrong.length < count && attempts < 300) {
      attempts++;
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (!candidate || candidate.id === film.id || wrong.some(w => w.id === candidate.id)) continue;

      if (isEasy) {
        // En mode facile, on s'assure d'exclure les films partageant des genres avec la cible
        // afin que la bonne réponse soit évidente par élimination
        const candidateGenres = candidate.genres || [];
        const hasCommonGenre = candidateGenres.some(g => targetGenres.includes(g));
        if (hasCommonGenre && attempts < 200) continue;
      }
      wrong.push(candidate);
    }

    // Sécurité de remplissage
    while (wrong.length < count) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (candidate && candidate.id !== film.id && !wrong.some(w => w.id === candidate.id)) {
        wrong.push(candidate);
      }
    }

    return wrong;
  }

  // ─── SCREEN MANAGEMENT ────────────────────────────────────────
  const ALL_SCREENS = ['hub', 'config', 'cq', 'pp', 'cc', 'end'];

  function showScreen(name) {
    ALL_SCREENS.forEach(s => {
      const el = D[s];
      if (!el) return;
      if (s === name) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });
  }

  function showHub() {
    stopChrono();
    setRandomBg(true);
    showScreen('hub');

    const hubTitle = document.querySelector('.hub-title');
    if (hubTitle) {
      applyInteractiveLettering(hubTitle, t('game_hub_title'));
    }
  }

  function showConfig() {
    const gameNames = {
      couleurquiz:   t('game_cq_name'),
      palettepure:   t('game_pp_name'),
      chronochroma:  t('game_cc_name'),
    };
    
    // Titre de config interactif
    applyInteractiveLettering(D.configGameName, gameNames[gameConfig.game] || '');

    if (gameConfig.game === 'chronochroma') {
      D.configSectionRounds.setAttribute('hidden', '');
      D.configSectionTime.removeAttribute('hidden');
    } else {
      D.configSectionRounds.removeAttribute('hidden');
      D.configSectionTime.setAttribute('hidden', '');
    }

    showScreen('config');
  }

  // ─── START GAME ───────────────────────────────────────────────
  function startGame() {
    if (!dataLoaded || !allFilms.length) {
      showToast('Chargement en cours...');
      return;
    }
    stopChrono();
    const g = gameConfig.game;
    if (g === 'couleurquiz')  startCouleurQuiz();
    else if (g === 'palettepure') startPalettePure();
    else if (g === 'chronochroma') startChronoChroma();
  }

  // ─── BACKGROUND ───────────────────────────────────────────────
  function setRandomBg(blurred = false) {
    if (!allFilms.length) return;
    const f = allFilms[Math.floor(Math.random() * Math.min(200, allFilms.length))];
    if (f && f.affiches && f.affiches[0]) {
      D.bgPoster.src = f.affiches[0].affiche_original || f.affiches[0].affiche_w500;
      D.bgContainer.classList.remove('revealed', 'hint-3-active');
      D.bgPoster.style.setProperty('filter', 'blur(40px) brightness(0.3)', 'important');
    }
  }

  function setBgFilm(film, revealed = false) {
    if (!film || !film.affiches || !film.affiches[0]) return;
    D.bgPoster.src = film.affiches[0].affiche_original || film.affiches[0].affiche_w500;
    D.bgContainer.classList.remove('revealed', 'hint-3-active');
    if (revealed) {
      D.bgPoster.style.setProperty('filter', 'blur(0px) brightness(0.85)', 'important');
      D.bgContainer.classList.add('revealed');
    } else {
      D.bgPoster.style.setProperty('filter', 'blur(40px) brightness(0.3)', 'important');
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  GAME 1 — COULEURQUIZ
  // ─────────────────────────────────────────────────────────────
  let cqState = {};

  function startCouleurQuiz() {
    cqState = {
      round: 1,
      totalRounds: gameConfig.rounds,
      score: 0,
      history: [],
      currentFilm: null,
      currentChoices: [],
      hintsUsed: 0,
      isAnswered: false,
      usedIds: []
    };
    D.cqRoundTot.textContent = gameConfig.rounds;
    
    // Grand titre interactif
    applyInteractiveLettering(document.querySelector('#screen-cq .game-screen-title'), t('game_cq_name'));
    
    showScreen('cq');
    cqInitRound();
  }

  function cqInitRound() {
    cqState.isAnswered = false;

    const pool = getPool();
    cqState.currentFilm = getRandom(pool, cqState.usedIds);
    cqState.usedIds.push(cqState.currentFilm.id);
    const film = cqState.currentFilm;

    setBgFilm(film, false);

    D.cqRound.textContent = cqState.round;
    D.cqScore.textContent = cqState.score;
    D.cqProgress.style.width = `${((cqState.round - 1) / cqState.totalRounds) * 100}%`;
    cqUpdateDifficultyBadge();

    D.cqHintBtn.disabled = false;
    D.cqRevealInfo.setAttribute('hidden', '');
    D.cqNextBtn.setAttribute('hidden', '');

    // Simplification : En mode facile, donner d'emblée l'indice 1
    if (gameConfig.difficulty === 'easy') {
      cqState.hintsUsed = 1;
      D.cqHintsUsed.textContent = '1';
      D.cqHintDisplay.removeAttribute('hidden');
      const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : t('profile_unknown_year');
      const dir = film.realisateur || t('profile_unknown_director');
      const hintText = state.lang === 'ja' ? `${year}年公開 • 監督: ${dir}` :
                       state.lang === 'en' ? `Released in ${year} • Director: ${dir}` :
                       `Sorti en ${year} • Réalisateur : ${dir}`;
      D.cqHintDisplay.innerHTML = `<div><b>${t('game_hint_prefix')} 1 :</b> ${hintText}</div>`;
    } else {
      cqState.hintsUsed = 0;
      D.cqHintsUsed.textContent = '0';
      D.cqHintDisplay.setAttribute('hidden', '');
      D.cqHintDisplay.innerHTML = '';
    }

    D.cqHintsSection.style.display = 'flex';

    // Palette
    D.cqPalette.innerHTML = '';
    film.affiches[0].palette.forEach((p, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'game-swatch';
      swatch.style.backgroundColor = p.hex.startsWith('#') ? p.hex : '#' + p.hex;
      swatch.style.animationDelay = `${i * 0.08}s`;
      swatch.classList.add('swatch-enter');
      D.cqPalette.appendChild(swatch);
    });

    // Choix (mauvais choix générés de façon intelligente)
    const wrongChoices = getWrongChoices(film, pool, 3);
    cqState.currentChoices = [film, ...wrongChoices].sort(() => Math.random() - 0.5);
    
    D.cqChoices.innerHTML = '';
    cqState.currentChoices.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'game-choice-btn';
      btn.textContent = getFilmTitle(f);
      btn.addEventListener('click', () => cqHandleAnswer(btn, f));
      D.cqChoices.appendChild(btn);
    });
  }

  function cqUpdateDifficultyBadge() {
    const ratio = cqState.round / cqState.totalRounds;
    const diff = gameConfig.difficulty;
    let label = '';
    if (diff === 'mixed') {
      if (ratio <= 0.4) label = t('game_diff_easy');
      else if (ratio <= 0.8) label = t('game_diff_medium');
      else label = t('game_diff_hard');
    } else {
      label = t('game_diff_' + diff);
    }
    D.cqDifficulty.textContent = label;
  }

  function cqHandleAnswer(btnEl, chosen) {
    if (cqState.isAnswered) return;
    cqState.isAnswered = true;

    const correct = chosen.id === cqState.currentFilm.id;
    if (correct) cqState.score++;

    cqState.history.push({ film: cqState.currentFilm, isCorrect: correct, hints: cqState.hintsUsed });

    document.querySelectorAll('#cq-choices .game-choice-btn').forEach(btn => {
      btn.disabled = true;
      const title = getFilmTitle(cqState.currentFilm);
      if (btn.textContent === title) {
        btn.classList.add('correct');
      } else if (btn === btnEl && !correct) {
        btn.classList.add('wrong');
      } else {
        btn.style.opacity = '0.35';
      }
    });

    D.cqScore.textContent = cqState.score;
    D.cqProgress.style.width = `${(cqState.round / cqState.totalRounds) * 100}%`;
    D.cqHintsSection.style.display = 'none';

    setBgFilm(cqState.currentFilm, true);
    D.cqRevealTitle.textContent = getFilmTitle(cqState.currentFilm);
    const year = cqState.currentFilm.date_sortie ? new Date(cqState.currentFilm.date_sortie).getFullYear() : t('profile_unknown_year');
    D.cqRevealMeta.textContent = `${cqState.currentFilm.realisateur || t('profile_unknown_director')} • ${year}`;
    D.cqRevealInfo.removeAttribute('hidden');

    D.cqNextBtn.textContent = cqState.round < cqState.totalRounds ? t('game_next_round') : t('game_see_results');
    D.cqNextBtn.removeAttribute('hidden');
  }

  function cqHandleNext() {
    if (cqState.round < cqState.totalRounds) {
      cqState.round++;
      cqInitRound();
    } else {
      showEndScreen('couleurquiz', cqState.score, cqState.totalRounds, cqState.history);
    }
  }

  function cqUseHint() {
    if (cqState.hintsUsed >= 3 || cqState.isAnswered) return;
    cqState.hintsUsed++;
    D.cqHintsUsed.textContent = cqState.hintsUsed;
    D.cqHintDisplay.removeAttribute('hidden');

    const film = cqState.currentFilm;
    const prefix = `${t('game_hint_prefix')} ${cqState.hintsUsed} :`;

    if (cqState.hintsUsed === 1) {
      const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : t('profile_unknown_year');
      const dir = film.realisateur || t('profile_unknown_director');
      const hintText = state.lang === 'ja' ? `${year}年公開 • 監督: ${dir}` :
                       state.lang === 'en' ? `Released in ${year} • Director: ${dir}` :
                       `Sorti en ${year} • Réalisateur : ${dir}`;
      D.cqHintDisplay.innerHTML += `<div><b>${prefix}</b> ${hintText}</div>`;
    } else if (cqState.hintsUsed === 2) {
      const genres = film.genres ? film.genres.map(g => translateGenre(g, state.lang)).join(', ') : 'Mystère';
      const hintText = state.lang === 'ja' ? `ジャンル: ${genres}` :
                       state.lang === 'en' ? `Genres: ${genres}` :
                       `Genres : ${genres}`;
      D.cqHintDisplay.innerHTML += `<div><b>${prefix}</b> ${hintText}</div>`;
    } else if (cqState.hintsUsed === 3) {
      D.cqHintBtn.disabled = true;
      D.cqHintDisplay.innerHTML += `<div><b>${prefix}</b> ${t('game_hint_3_text')}</div>`;
      D.bgPoster.style.setProperty('filter', 'blur(6px) brightness(0.65)', 'important');
      D.bgContainer.classList.add('hint-3-active');
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  GAME 2 — PALETTE PURE
  // ─────────────────────────────────────────────────────────────
  let ppState = {};

  function startPalettePure() {
    ppState = {
      round: 1,
      totalRounds: gameConfig.rounds,
      score: 0,
      history: [],
      currentFilm: null,
      missingIndex: 0,
      isAnswered: false,
      usedIds: []
    };
    D.ppRoundTot.textContent = gameConfig.rounds;

    // Grand titre interactif
    applyInteractiveLettering(document.querySelector('#screen-pp .game-screen-title'), t('game_pp_name'));

    showScreen('pp');
    ppInitRound();
  }

  function ppInitRound() {
    ppState.isAnswered = false;

    const pool = getPool();
    ppState.currentFilm = getRandom(pool, ppState.usedIds);
    ppState.usedIds.push(ppState.currentFilm.id);
    const film = ppState.currentFilm;

    setBgFilm(film, false);

    D.ppRound.textContent = ppState.round;
    D.ppScore.textContent = ppState.score;
    D.ppProgress.style.width = `${((ppState.round - 1) / ppState.totalRounds) * 100}%`;
    D.ppFilmName.textContent = getFilmTitle(film);
    D.ppFeedback.setAttribute('hidden', '');
    D.ppNextBtn.setAttribute('hidden', '');

    const palette = film.affiches[0].palette;
    ppState.missingIndex = Math.floor(Math.random() * 5);
    const correctColor = palette[ppState.missingIndex];

    // Swatches connus (Mystery swatch "?" avec un look de pointillés gris)
    D.ppKnownSwatches.innerHTML = '';
    palette.forEach((p, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'pp-swatch';
      if (i === ppState.missingIndex) {
        swatch.classList.add('pp-swatch--mystery');
        swatch.innerHTML = '?';
      } else {
        swatch.style.backgroundColor = p.hex.startsWith('#') ? p.hex : '#' + p.hex;
      }
      D.ppKnownSwatches.appendChild(swatch);
    });

    // Distracteurs de couleurs facilités en mode facile
    const decoys = generateColorDecoys(correctColor, palette, pool);
    const allChoices = [correctColor, ...decoys].sort(() => Math.random() - 0.5);
    ppState.correctColor = correctColor;

    D.ppColorChoices.innerHTML = '';
    allChoices.forEach(color => {
      const hex = color.hex.startsWith('#') ? color.hex : '#' + color.hex;
      const btn = document.createElement('button');
      btn.className = 'pp-color-choice';
      btn.style.backgroundColor = hex;
      btn.dataset.hex = hex;
      btn.addEventListener('click', () => ppHandleAnswer(btn, color, correctColor));
      D.ppColorChoices.appendChild(btn);
    });
  }

  function generateColorDecoys(correctColor, fullPalette, pool) {
    const decoys = [];
    const correctHex = (correctColor.hex.startsWith('#') ? correctColor.hex : '#' + correctColor.hex).toLowerCase();
    const isEasy = gameConfig.difficulty === 'easy';

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    }
    
    function colorDistance(c1, c2) {
      return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
    }
    
    const rgbCorrect = hexToRgb(correctHex);

    let attempts = 0;
    while (decoys.length < 3 && attempts < 300) {
      attempts++;
      const f = pool[Math.floor(Math.random() * pool.length)];
      if (!f || !f.affiches || !f.affiches[0] || !f.affiches[0].palette) continue;
      const p = f.affiches[0].palette[Math.floor(Math.random() * 5)];
      if (!p) continue;
      const hex = (p.hex.startsWith('#') ? p.hex : '#' + p.hex).toLowerCase();
      
      const palHexes = fullPalette.map(pp => (pp.hex.startsWith('#') ? pp.hex : '#' + pp.hex).toLowerCase());
      if (hex !== correctHex && !decoys.some(d => (d.hex.startsWith('#') ? d.hex : '#' + d.hex).toLowerCase() === hex) && !palHexes.includes(hex)) {
        if (isEasy) {
          // Si facile, rejeter si la couleur proposée est trop proche de la bonne couleur
          const rgbCand = hexToRgb(hex);
          const dist = colorDistance(rgbCorrect, rgbCand);
          if (dist < 100 && attempts < 200) continue;
        }
        decoys.push(p);
      }
    }

    // Remplissage de secours avec des variations très marquées en facile
    while (decoys.length < 3) {
      const r = isEasy ? Math.floor(Math.random() * 256) : parseInt(correctHex.slice(1, 3), 16);
      const g = isEasy ? Math.floor(Math.random() * 256) : parseInt(correctHex.slice(3, 5), 16);
      const b = isEasy ? Math.floor(Math.random() * 256) : parseInt(correctHex.slice(5, 7), 16);
      const vari = isEasy ? 100 : (40 + Math.floor(Math.random() * 60));
      const sign = Math.random() > 0.5 ? 1 : -1;
      const nr = Math.max(0, Math.min(255, r + sign * vari));
      const ng = Math.max(0, Math.min(255, g + Math.floor(Math.random() * 40 - 20)));
      const nb = Math.max(0, Math.min(255, b + (sign * -1) * vari));
      decoys.push({ hex: `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}` });
    }

    return decoys;
  }

  function ppHandleAnswer(btnEl, chosen, correct) {
    if (ppState.isAnswered) return;
    ppState.isAnswered = true;

    const chosenHex = (chosen.hex.startsWith('#') ? chosen.hex : '#' + chosen.hex).toLowerCase();
    const correctHex = (correct.hex.startsWith('#') ? correct.hex : '#' + correct.hex).toLowerCase();
    const isCorrect = chosenHex === correctHex;

    if (isCorrect) ppState.score++;

    ppState.history.push({ film: ppState.currentFilm, isCorrect });

    // Révèle le swatch mystère
    const swatches = D.ppKnownSwatches.querySelectorAll('.pp-swatch');
    swatches.forEach((sw, i) => {
      if (i === ppState.missingIndex) {
        sw.classList.remove('pp-swatch--mystery');
        sw.innerHTML = '';
        sw.style.backgroundColor = correctHex;
        sw.classList.add('pp-swatch--revealed');
      }
    });

    document.querySelectorAll('.pp-color-choice').forEach(btn => {
      btn.disabled = true;
      const btnHex = btn.dataset.hex.toLowerCase();
      if (btnHex === correctHex) {
        btn.classList.add('pp-choice--correct');
      } else if (btn === btnEl && !isCorrect) {
        btn.classList.add('pp-choice--wrong');
      } else {
        btn.style.opacity = '0.3';
      }
    });

    D.ppScore.textContent = ppState.score;
    D.ppProgress.style.width = `${(ppState.round / ppState.totalRounds) * 100}%`;

    D.ppFeedback.textContent = isCorrect ? t('game_pp_correct') : t('game_pp_wrong');
    D.ppFeedback.className = 'pp-feedback ' + (isCorrect ? 'pp-feedback--correct' : 'pp-feedback--wrong');
    D.ppFeedback.removeAttribute('hidden');

    setBgFilm(ppState.currentFilm, true);

    D.ppNextBtn.textContent = ppState.round < ppState.totalRounds ? t('game_next_round') : t('game_see_results');
    D.ppNextBtn.removeAttribute('hidden');
  }

  function ppHandleNext() {
    if (ppState.round < ppState.totalRounds) {
      ppState.round++;
      ppInitRound();
    } else {
      showEndScreen('palettepure', ppState.score, ppState.totalRounds, ppState.history);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  GAME 3 — CHRONOCHROMA
  // ─────────────────────────────────────────────────────────────
  let ccState = {};

  function startChronoChroma() {
    ccState = {
      score: 0,
      total: 0,
      timeLeft: gameConfig.time,
      maxTime: gameConfig.time,
      isAnswered: false,
      currentFilm: null,
      history: [],
      usedIds: [],
      running: true
    };

    // Grand titre interactif
    applyInteractiveLettering(document.querySelector('#screen-cc .game-screen-title'), t('game_cc_name'));

    showScreen('cc');
    ccInitQuestion();
    startChrono();
  }

  function ccInitQuestion() {
    ccState.isAnswered = false;

    const pool = getPool();
    ccState.currentFilm = getRandom(pool, ccState.usedIds);
    if (ccState.usedIds.length > pool.length * 0.7) ccState.usedIds = []; 
    ccState.usedIds.push(ccState.currentFilm.id);
    const film = ccState.currentFilm;

    setBgFilm(film, false);

    // Palette
    D.ccPalette.innerHTML = '';
    film.affiches[0].palette.forEach((p, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'game-swatch';
      swatch.style.backgroundColor = p.hex.startsWith('#') ? p.hex : '#' + p.hex;
      D.ccPalette.appendChild(swatch);
    });

    // Boutons de choix (mauvais choix générés de façon intelligente)
    const wrongChoices = getWrongChoices(film, pool, 3);
    const choices = [film, ...wrongChoices].sort(() => Math.random() - 0.5);

    D.ccChoices.innerHTML = '';
    choices.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'game-choice-btn';
      btn.textContent = getFilmTitle(f);
      btn.addEventListener('click', () => ccHandleAnswer(btn, f));
      D.ccChoices.appendChild(btn);
    });

    D.ccFeedback.setAttribute('hidden', '');
  }

  function ccHandleAnswer(btnEl, chosen) {
    if (ccState.isAnswered || !ccState.running) return;
    ccState.isAnswered = true;
    ccState.total++;

    const correct = chosen.id === ccState.currentFilm.id;
    if (correct) ccState.score++;

    ccState.history.push({ film: ccState.currentFilm, isCorrect: correct, hints: 0 });

    D.ccFeedback.textContent = correct ? '✓' : '✗';
    D.ccFeedback.className = 'cc-feedback ' + (correct ? 'cc-feedback--correct' : 'cc-feedback--wrong');
    D.ccFeedback.removeAttribute('hidden');

    document.querySelectorAll('#cc-choices .game-choice-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === getFilmTitle(ccState.currentFilm)) btn.classList.add('correct');
      else if (btn === btnEl && !correct) btn.classList.add('wrong');
      else btn.style.opacity = '0.3';
    });

    D.ccScore.textContent = ccState.score;
    D.ccTotal.textContent = ccState.total;

    setTimeout(() => {
      if (ccState.running) ccInitQuestion();
    }, 600);
  }

  function startChrono() {
    stopChrono();
    updateChronoUI();

    chronoInterval = setInterval(() => {
      ccState.timeLeft--;
      updateChronoUI();
      if (ccState.timeLeft <= 0) {
        stopChrono();
        ccState.running = false;
        showEndScreen('chronochroma', ccState.score, ccState.total, ccState.history);
      }
    }, 1000);
  }

  function stopChrono() {
    if (chronoInterval) {
      clearInterval(chronoInterval);
      chronoInterval = null;
    }
    ccState.running = false;
  }

  function updateChronoUI() {
    if (!D.ccTimeDisplay) return;
    D.ccTimeDisplay.textContent = ccState.timeLeft;

    const pct = (ccState.timeLeft / ccState.maxTime) * 100;
    D.ccChronoBar.style.width = pct + '%';

    if (pct > 50) {
      D.ccChronoBar.style.background = 'rgba(255,255,255,0.7)';
    } else if (pct > 25) {
      D.ccChronoBar.style.background = 'rgba(255, 200, 80, 0.85)';
    } else {
      D.ccChronoBar.style.background = 'rgba(231, 76, 60, 0.9)';
    }

    if (ccState.timeLeft <= 10) {
      D.ccTimeDisplay.classList.add('cc-time--urgent');
    } else {
      D.ccTimeDisplay.classList.remove('cc-time--urgent');
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  END SCREEN
  // ─────────────────────────────────────────────────────────────
  function showEndScreen(game, score, total, history) {
    stopChrono();
    setRandomBg(true);

    const gameNames = {
      couleurquiz:  t('game_cq_name'),
      palettepure:  t('game_pp_name'),
      chronochroma: t('game_cc_name')
    };

    D.endBadge.textContent = gameNames[game] || game;
    
    // Titre interactif fluide à la fin
    applyInteractiveLettering(D.endTitle, game === 'chronochroma' ? t('game_cc_end_title') : t('game_end_title'));

    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const totalHints = history.reduce((acc, r) => acc + (r.hints || 0), 0);

    const statsData = game === 'chronochroma' ? [
      { label: t('game_cc_end_score').replace(':', ''), val: score },
      { label: t('game_cc_films_done'), val: total },
      { label: t('game_accuracy'), val: accuracy + '%' }
    ] : [
      { label: t('game_end_score').replace(':', ''), val: `${score} / ${total}` },
      { label: t('game_accuracy'), val: accuracy + '%' },
      { label: t('game_hints_total'), val: totalHints }
    ];

    D.endStatsGrid.innerHTML = statsData.map(s => `
      <div class="end-stat-item">
        <div class="end-stat-val">${s.val}</div>
        <div class="end-stat-lbl">${s.label}</div>
      </div>
    `).join('');

    D.endRecapList.innerHTML = '';
    if (game !== 'chronochroma') {
      history.slice(0, 20).forEach((round, index) => {
        const item = document.createElement('div');
        item.className = 'game-recap-item';
        item.style.animationDelay = `${index * 0.06}s`;

        const statusClass = round.isCorrect ? 'recap-correct' : 'recap-wrong';
        const posterSrc = round.film.affiches[0].affiche_w500 || round.film.affiches[0].affiche_original;
        const title = getFilmTitle(round.film);
        let paletteHtml = '';
        round.film.affiches[0].palette.forEach(p => {
          paletteHtml += `<div class="recap-swatch" style="background-color:${p.hex.startsWith('#') ? p.hex : '#' + p.hex}"></div>`;
        });

        item.innerHTML = `
          <div class="recap-index">${index + 1}</div>
          <img src="${posterSrc}" alt="Affiche" class="recap-poster" />
          <div class="recap-info">
            <div class="recap-title ${statusClass}">${title}</div>
            <div class="recap-palette">${paletteHtml}</div>
            ${game === 'couleurquiz' ? `<div class="recap-hints">${t('game_hints_used_label')}${round.hints}</div>` : ''}
          </div>
        `;
        D.endRecapList.appendChild(item);
      });
    }

    showScreen('end');
  }

  // ─────────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────────
  function getFilmTitle(film) {
    if (!film) return '';
    if (state.lang === 'ja' && film.titre_ja) return film.titre_ja;
    if (state.lang === 'en' && film.titre_en) return film.titre_en;
    return film.titre || film.titre_original || 'Film inconnu';
  }

  let _gameToastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_gameToastTimer);
    _gameToastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  const GENRE_I18N_GAME = {
    'Science-Fiction': { fr: 'Science-Fiction', en: 'Sci-Fi', ja: 'SF' },
    'Action':          { fr: 'Action',          en: 'Action',        ja: 'アクション' },
    'Thriller':        { fr: 'Thriller',        en: 'Thriller',      ja: 'スリラー' },
    'Drame':           { fr: 'Drame',           en: 'Drama',         ja: 'ドラマ' },
    'Aventure':        { fr: 'Aventure',        en: 'Adventure',     ja: 'アドベンチャー' },
    'Crime':           { fr: 'Crime',           en: 'Crime',         ja: '犯罪' },
    'Comédie':         { fr: 'Comédie',         en: 'Comedy',        ja: 'コメディ' },
    'Animation':       { fr: 'Animation',       en: 'Animation',     ja: 'アニメーション' },
    'Horreur':         { fr: 'Horreur',         en: 'Horror',        ja: 'ホラー' },
    'Mystère':         { fr: 'Mystère',         en: 'Mystery',       ja: 'ミステリー' },
    'Fantastique':     { fr: 'Fantastique',     en: 'Fantasy',       ja: 'ファンタジー' },
    'Romance':         { fr: 'Romance',         en: 'Romance',       ja: 'ロマンス' },
    'Famille':         { fr: 'Famille',         en: 'Family',        ja: 'ファミリー' },
    'Western':         { fr: 'Western',         en: 'Western',       ja: '西部劇' },
    'Guerre':          { fr: 'Guerre',          en: 'War',           ja: '戦争' },
    'Histoire':        { fr: 'Histoire',        en: 'History',       ja: 'historie' },
  };

  function translateGenre(g, lang) {
    if (GENRE_I18N_GAME[g]) return GENRE_I18N_GAME[g][lang] || g;
    return g;
  }

  // ─────────────────────────────────────────────────────────────
  //  FLUID LETTERING EFFECT
  // ─────────────────────────────────────────────────────────────
  function applyInteractiveLettering(element, text) {
    if (!element) return;
    const COLORS = [
      '#FF3B30', '#FF9500', '#FFCC00', '#34C759',
      '#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#00D2FF'
    ];

    const words = text.split(/\s+/);
    element.innerHTML = words.map(word => {
      const letters = word.split('').map(ch =>
        `<span class="game-title-letter">${ch === ' ' ? '&nbsp;' : ch}</span>`
      ).join('');
      return `<span class="game-title-word">${letters}</span>`;
    }).join('<span class="game-title-space">&nbsp;</span>');

    element.querySelectorAll('.game-title-letter').forEach(letter => {
      letter.addEventListener('mouseenter', () => {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        letter.style.color = color;
        letter.style.textShadow = `0 0 18px ${color}55`;
        letter.style.transform = 'scale(1.15) translateY(-3px)';
        letter.style.transition = 'color 0.05s, text-shadow 0.05s, transform 0.05s';
      });
      letter.addEventListener('mouseleave', () => {
        letter.style.color = '';
        letter.style.textShadow = '';
        letter.style.transform = '';
        letter.style.transition = 'color 0.4s, text-shadow 0.4s, transform 0.4s';
      });
    });
  }

  // Compatibilité avec l'ancienne fonction appelée
  function initHubTitleLetters() {
    const hubTitle = document.querySelector('.hub-title');
    if (hubTitle) {
      applyInteractiveLettering(hubTitle, hubTitle.textContent.trim());
    }
  }

})();

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
  let disneyFilms = [];
  let marvelFilms = [];
  let dcFilms = [];
  let animeFilms = [];
  let horreurFilms = [];
  let scifiFilms = [];
  let seriesFilms = [];
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

  // ─── 8-BIT RETRO SOUND SYNTHESIZER ───────────────────────────
  const RetroAudio = (function() {
    let ctx = null;
    let enabled = true;

    function getContext() {
      if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      return ctx;
    }

    return {
      isEnabled: () => enabled,
      toggle: function() {
        enabled = !enabled;
        return enabled;
      },
      // Subtle 8-bit UI select blip
      playBlip: function() {
        if (!enabled) return;
        const ac = getContext();
        if (!ac) return;
        try {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ac.currentTime + 0.04);
          gain.gain.setValueAtTime(0.04, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start();
          osc.stop(ac.currentTime + 0.04);
        } catch(e) {}
      },
      // Mario Coin sound (B5 -> E6)
      playCoin: function() {
        if (!enabled) return;
        const ac = getContext();
        if (!ac) return;
        try {
          const t = ac.currentTime;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(987.77, t); // B5
          osc.frequency.setValueAtTime(1318.51, t + 0.07); // E6
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.setValueAtTime(0.12, t + 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + 0.4);
        } catch(e) {}
      },
      // Coin Insert sound (clink-ching!)
      playCoinInsert: function() {
        if (!enabled) return;
        const ac = getContext();
        if (!ac) return;
        try {
          const t = ac.currentTime;
          const osc1 = ac.createOscillator();
          const osc2 = ac.createOscillator();
          const gain = ac.createGain();
          osc1.type = 'square';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(659.25, t);
          osc1.frequency.setValueAtTime(1318.51, t + 0.06);
          osc2.frequency.setValueAtTime(329.63, t);
          osc2.frequency.setValueAtTime(987.77, t + 0.06);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ac.destination);
          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + 0.35);
          osc2.stop(t + 0.35);
        } catch(e) {}
      },
      // 8-bit Power Up Arpeggio (Konami code / Level up)
      playPowerUp: function() {
        if (!enabled) return;
        const ac = getContext();
        if (!ac) return;
        try {
          const t = ac.currentTime;
          const notes = [330, 392, 659, 523, 587, 784, 1046];
          const dur = 0.06;
          notes.forEach((freq, idx) => {
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t + idx * dur);
            gain.gain.setValueAtTime(0.1, t + idx * dur);
            gain.gain.exponentialRampToValueAtTime(0.001, t + (idx + 1) * dur + 0.03);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(t + idx * dur);
            osc.stop(t + (idx + 1) * dur + 0.04);
          });
        } catch(e) {}
      },
      // Game Launch Warp Sweep
      playGameStart: function() {
        if (!enabled) return;
        const ac = getContext();
        if (!ac) return;
        try {
          const t = ac.currentTime;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, t);
          osc.frequency.exponentialRampToValueAtTime(1100, t + 0.25);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + 0.28);
        } catch(e) {}
      },
      // 8-bit Crash / Explosion Sound
      playCrash: function() {
        if (!enabled) return;
        const ac = getContext();
        if (!ac) return;
        try {
          const t = ac.currentTime;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + 0.38);
        } catch(e) {}
      }
    };
  })();

  // ─── DOM CACHE ────────────────────────────────────────────────
  const D = {};

  document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    bindEvents();
    initRetroStarsCanvas();
    initKonamiCode();
    initChromaBall();
    loadData();
  });

  function initRetroStarsCanvas() {
    const canvas = document.getElementById('arc-stars-canvas') || document.getElementById('cn-dust-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    const colors = ['#00f0ff', '#ff2a85', '#ffeb3b', '#ffffff', '#a855f7'];
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.floor(Math.random() * 3) + 1, // 1, 2 or 3 px
      isCross: Math.random() > 0.65,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.04 + 0.015,
      phase: Math.random() * Math.PI * 2
    }));

    function render() {
      if (!document.body.classList.contains('hub-active')) {
        requestAnimationFrame(render);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      stars.forEach(s => {
        s.phase += s.speed;
        const a = Math.max(0.1, Math.min(1, s.alpha + Math.sin(s.phase) * 0.35));

        ctx.globalAlpha = a;
        ctx.fillStyle = s.color;
        ctx.shadowBlur = s.size * 3;
        ctx.shadowColor = s.color;

        if (s.isCross) {
          // Pixel cross (+)
          const arm = s.size + 1;
          ctx.fillRect(Math.floor(s.x), Math.floor(s.y - arm), 2, arm * 2 + 2);
          ctx.fillRect(Math.floor(s.x - arm), Math.floor(s.y), arm * 2 + 2, 2);
        } else {
          // Pixel square
          ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size * 2, s.size * 2);
        }
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      requestAnimationFrame(render);
    }
    render();
  }

  function cacheDOM() {
    // Screens
    D.hub        = document.getElementById('screen-hub');
    D.config     = document.getElementById('screen-config');
    D.cq         = document.getElementById('screen-cq');
    D.pp         = document.getElementById('screen-pp');
    D.cc         = document.getElementById('screen-cc');
    D.af         = document.getElementById('screen-af');
    D.end        = document.getElementById('screen-end');

    // Background
    D.bgPoster   = document.getElementById('game-bg-poster');
    D.bgContainer = document.getElementById('game-bg-container');

    // Hub
    D.hubCards   = document.querySelectorAll('.hub-bento-card');

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

    // AfficheFlou
    D.afRound        = document.getElementById('af-round-current');
    D.afRoundTot     = document.getElementById('af-round-total');
    D.afScore        = document.getElementById('af-score');
    D.afProgress     = document.getElementById('af-progress-bar');
    D.afDifficulty   = document.getElementById('af-difficulty');
    D.afPosterImg    = document.getElementById('af-poster-img');
    D.afPosterContainer = document.getElementById('af-poster-container');
    D.afRevealBadge  = document.getElementById('af-reveal-badge');
    D.afRevealTitle  = document.getElementById('af-reveal-title');
    D.afRevealMeta   = document.getElementById('af-reveal-meta');
    D.afBlurLevel    = document.getElementById('af-blur-level');
    D.afHintBtn      = document.getElementById('af-hint-btn');
    D.afHintDisplay  = document.getElementById('af-hint-display');
    D.afHintsSection = document.getElementById('af-hints-section');
    D.afRevealInfo   = document.getElementById('af-reveal-info');
    D.afFilmTitle    = document.getElementById('af-film-title');
    D.afFilmMeta     = document.getElementById('af-film-meta');
    D.afChoices      = document.getElementById('af-choices');
    D.afNextBtn      = document.getElementById('af-next-btn');

    D.toast         = document.getElementById('toast');
  }

  function bindEvents() {
    // Hub cards → Config or Direct Quick Play
    D.hubCards = document.querySelectorAll('.hub-bento-card');
    D.hubCards.forEach(card => {
      const selectGame = () => {
        if (!dataLoaded) return;
        if (card.dataset.quick === 'true') {
          gameConfig = {
            game: 'couleurquiz',
            difficulty: 'easy',
            universe: 'popular',
            rounds: 5,
            time: 60
          };
          startGame();
          return;
        }
        gameConfig.game = card.dataset.game;
        showConfig();
      };

      card.addEventListener('click', selectGame);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectGame();
        }
      });

      // Optical glass specular reflection & 3D tilt tracking
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const tiltX = ((y - 50) / 50) * -3.5;
        const tiltY = ((x - 50) / 50) * 3.5;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // SFX on card hover
    D.hubCards.forEach(card => {
      card.addEventListener('mouseenter', () => RetroAudio.playBlip());
    });

    // ─── EASTER EGG 1 : MARIO ? BLOCK ──────────────────────────
    const marioBlock = document.getElementById('arc-mario-qblock');
    const oneUpVal = document.getElementById('arc-1up-val');
    let currentScore = 0;
    if (marioBlock) {
      marioBlock.addEventListener('click', (e) => {
        e.stopPropagation();
        RetroAudio.playCoin();
        marioBlock.classList.remove('hit');
        void marioBlock.offsetWidth; // trigger reflow
        marioBlock.classList.add('hit');

        // Increment 1UP
        currentScore += 200;
        if (oneUpVal) {
          oneUpVal.textContent = String(currentScore).padStart(6, '0');
          oneUpVal.style.color = '#ffeb3b';
          setTimeout(() => { oneUpVal.style.color = '#ffffff'; }, 300);
        }

        // Spawn floating coin
        const rect = marioBlock.getBoundingClientRect();
        const coin = document.createElement('div');
        coin.className = 'arc-floating-coin';
        coin.textContent = '+200 🪙';
        coin.style.left = `${rect.left + rect.width / 2 - 20}px`;
        coin.style.top = `${rect.top - 10}px`;
        document.body.appendChild(coin);
        setTimeout(() => coin.remove(), 800);
      });
    }

    // ─── EASTER EGG 2 : CREDITS INSERT COIN ─────────────────────
    const creditsSlot = document.getElementById('arc-credits-slot');
    const creditsVal = document.getElementById('arc-credits-val');
    let currentCredits = 3;
    if (creditsSlot) {
      creditsSlot.addEventListener('click', () => {
        RetroAudio.playCoinInsert();
        currentCredits++;
        if (creditsVal) {
          creditsVal.textContent = String(currentCredits).padStart(2, '0');
          creditsVal.style.transform = 'scale(1.3)';
          setTimeout(() => { creditsVal.style.transform = 'scale(1)'; }, 200);
        }
        // Floating insert coin text
        const rect = creditsSlot.getBoundingClientRect();
        const coin = document.createElement('div');
        coin.className = 'arc-floating-coin';
        coin.textContent = 'INSERT COIN 🪙';
        coin.style.left = `${rect.left - 20}px`;
        coin.style.top = `${rect.top + 30}px`;
        document.body.appendChild(coin);
        setTimeout(() => coin.remove(), 800);
      });
    }

    // ─── EASTER EGG 3 : 1UP SCORE CLICKER ───────────────────────
    const oneUpSlot = document.getElementById('arc-1up-slot');
    if (oneUpSlot) {
      oneUpSlot.addEventListener('click', () => {
        RetroAudio.playCoin();
        currentScore += 1000;
        if (oneUpVal) {
          oneUpVal.textContent = String(currentScore).padStart(6, '0');
        }
      });
    }

    // ─── SFX TOGGLE ─────────────────────────────────────────────
    const sfxBtn = document.getElementById('arc-sfx-toggle');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        const isMuted = !RetroAudio.toggle();
        sfxBtn.classList.toggle('muted', isMuted);
        const icon = sfxBtn.querySelector('.arc-sfx-icon');
        const text = sfxBtn.querySelector('.arc-sfx-text');
        if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
        if (text) text.textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
        if (!isMuted) RetroAudio.playBlip();
      });
    }

    // Config back
    D.configBackBtn.addEventListener('click', showHub);

    // Config option buttons
    setupOptGroup(D.configDiff, val => { gameConfig.difficulty = val; });
    setupOptGroup(D.configUniverse, val => { gameConfig.universe = val; });
    setupOptGroup(D.configRounds, val => { gameConfig.rounds = parseInt(val); });
    setupOptGroup(D.configTime, val => { gameConfig.time = parseInt(val); });

    // Config start
    D.configStartBtn.addEventListener('click', () => {
      RetroAudio.playGameStart();
      startGame();
    });

    // CouleurQuiz events
    D.cqNextBtn.addEventListener('click', cqHandleNext);
    D.cqHintBtn.addEventListener('click', cqUseHint);

    // PalettePure events
    D.ppNextBtn.addEventListener('click', ppHandleNext);

    // AfficheFlou events
    D.afNextBtn.addEventListener('click', afHandleNext);
    D.afHintBtn.addEventListener('click', afRevealMore);

    // End screen
    D.endReplayBtn.addEventListener('click', () => {
      RetroAudio.playGameStart();
      startGame();
    });
    D.endHubBtn.addEventListener('click', showHub);
  }

  // ─── KONAMI CODE (↑ ↑ ↓ ↓ ← → ← → B A) ──────────────────────
  function initKonamiCode() {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIdx = 0;

    window.addEventListener('keydown', (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const target = konamiSequence[konamiIdx].toLowerCase();

      if (key === target) {
        konamiIdx++;
        if (konamiIdx === konamiSequence.length) {
          konamiIdx = 0;
          triggerKonamiEasterEgg();
        }
      } else {
        konamiIdx = (key === 'arrowup') ? 1 : 0;
      }
    });
  }

  function triggerKonamiEasterEgg() {
    RetroAudio.playPowerUp();

    // Max out credits & 1UP
    const creditsVal = document.getElementById('arc-credits-val');
    const oneUpVal = document.getElementById('arc-1up-val');
    if (creditsVal) creditsVal.textContent = '99';
    if (oneUpVal) oneUpVal.textContent = '999999';

    // Show retro modal banner
    let banner = document.querySelector('.konami-toast');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'konami-toast';
      banner.innerHTML = `
        <div class="konami-toast-title">★ KONAMI CODE ACTIVATED ★</div>
        <div class="konami-toast-body">
          30 LIVES GRANTED<br/>
          CREDITS MAXED: 99<br/>
          ★ GOD MODE UNLOCKED ★
        </div>
      `;
      document.body.appendChild(banner);
    }
    banner.classList.add('show');
    setTimeout(() => {
      banner.classList.remove('show');
    }, 4000);
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

      // Calcul d'un score de notoriété combinant popularité et nombre de votes
      function calcPopularityScore(f) {
        const pop = parseFloat(f.popularite || f.popularity || 0) || 0;
        const votes = parseFloat(f.nombre_votes || f.vote_count || 0) || 0;
        return pop * (1 + Math.sqrt(votes));
      }

      validFilms.sort((a, b) => calcPopularityScore(b) - calcPopularityScore(a));

      tiers.tier1 = validFilms.slice(0, 80);
      tiers.tier2 = validFilms.slice(80, 300);
      tiers.tier3 = validFilms.slice(300);

      animFilms = validFilms.filter(f =>
        f.genres && f.genres.some(g => /anim/i.test(g))
      );

      // Studio & genre-based universe pools
      function studioMatch(f, keyword) {
        const haystack = [...(f.studios || []), ...(f.reseaux || [])].join(' ').toLowerCase();
        return haystack.includes(keyword);
      }

      disneyFilms = validFilms.filter(f => studioMatch(f, 'disney'));
      marvelFilms = validFilms.filter(f => studioMatch(f, 'marvel'));
      dcFilms     = validFilms.filter(f =>
        studioMatch(f, 'dc comics') ||
        studioMatch(f, 'warner bros') ||
        [...(f.studios || [])].some(s => s.toLowerCase() === 'dc')
      );
      animeFilms  = validFilms.filter(f => f.est_anime === true);
      horreurFilms = validFilms.filter(f =>
        (f.genres || []).some(g => /horreur|horror/i.test(g))
      );
      scifiFilms  = validFilms.filter(f =>
        (f.genres || []).some(g => /science-fiction|sci-fi/i.test(g))
      );
      seriesFilms = validFilms.filter(f => f.est_serie === true);

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
    const isEasy = gameConfig.difficulty === 'easy';

    const MIN = 8; // minimum pool size before falling back to allFilms

    if (univ === 'animation') {
      pool = animFilms.length > MIN ? animFilms : allFilms;
    } else if (univ === 'popular') {
      pool = tiers.tier1;
    } else if (univ === 'disney') {
      pool = disneyFilms.length > MIN ? disneyFilms : allFilms;
    } else if (univ === 'marvel') {
      pool = marvelFilms.length > MIN ? marvelFilms : allFilms;
    } else if (univ === 'dc') {
      pool = dcFilms.length > MIN ? dcFilms : allFilms;
    } else if (univ === 'anime') {
      pool = animeFilms.length > MIN ? animeFilms : allFilms;
    } else if (univ === 'horreur') {
      pool = horreurFilms.length > MIN ? horreurFilms : allFilms;
    } else if (univ === 'scifi') {
      pool = scifiFilms.length > MIN ? scifiFilms : allFilms;
    } else if (univ === 'series') {
      pool = seriesFilms.length > MIN ? seriesFilms : allFilms;
    } else {
      // En mode "Tous", privilégier les grands films ultra-connus en mode facile
      if (isEasy) {
        const moviesOnly = allFilms.filter(f => !f.est_serie);
        pool = moviesOnly.length >= 40 ? moviesOnly : allFilms;
      } else {
        pool = allFilms;
      }
    }

    // Difficulty sub-filter
    const diff = gameConfig.difficulty;
    if (diff === 'easy') {
      // En mode facile, on restreint strictement aux œuvres les plus cultes et reconnaissables
      return pool.slice(0, Math.min(35, pool.length));
    }
    if (diff === 'medium') return pool.slice(0, Math.min(120, pool.length));
    if (diff === 'hard')   return pool.length > 8 ? pool.slice(Math.floor(pool.length * 0.25)) : pool;
    return pool;
  }

  function getRandom(pool, excludeIds = []) {
    const p = (pool && pool.length) ? pool : allFilms;
    let attempts = 0;
    while (attempts < 100) {
      const f = p[Math.floor(Math.random() * p.length)];
      if (f && !excludeIds.includes(f.id)) return f;
      attempts++;
    }
    if (p.length) return p[Math.floor(Math.random() * p.length)];
    return allFilms[0];
  }

  // Génération intelligente des mauvais choix pour simplifier le mode facile
  function getWrongChoices(film, pool, count) {
    const wrong = [];
    const isEasy = gameConfig.difficulty === 'easy';
    const targetGenres = film.genres || [];
    const sourcePool = (pool && pool.length > count + 1) ? pool : allFilms;

    let attempts = 0;
    while (wrong.length < count && attempts < 300) {
      attempts++;
      const candidate = sourcePool[Math.floor(Math.random() * sourcePool.length)];
      if (!candidate || candidate.id === film.id || wrong.some(w => w.id === candidate.id)) continue;

      if (isEasy) {
        // En mode facile, on exclut strictement les films partageant un genre avec la cible
        // afin que la bonne réponse saute immédiatement aux yeux par élimination évidente
        const candidateGenres = candidate.genres || [];
        const hasCommonGenre = candidateGenres.some(g => targetGenres.includes(g));
        if (hasCommonGenre && attempts < 240) continue;
      }
      wrong.push(candidate);
    }

    // Sécurité de remplissage
    let fallbackAttempts = 0;
    while (wrong.length < count && fallbackAttempts < 200) {
      fallbackAttempts++;
      const candidate = allFilms[Math.floor(Math.random() * allFilms.length)];
      if (candidate && candidate.id !== film.id && !wrong.some(w => w.id === candidate.id)) {
        wrong.push(candidate);
      }
    }

    return wrong;
  }

  // ─── SCREEN MANAGEMENT ────────────────────────────────────────
  const ALL_SCREENS = ['hub', 'config', 'cq', 'pp', 'cc', 'af', 'end'];

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
    document.body.classList.add('hub-active');
    const hubTitle = document.querySelector('.cn-title-main') || document.querySelector('.arc-title-main');
    if (hubTitle) {
      hubTitle.textContent = t('game_hub_title');
    }
  }

  function showConfig() {
    document.body.classList.remove('hub-active');
    const gameNames = {
      couleurquiz:   t('game_cq_name'),
      palettepure:   t('game_pp_name'),
      chronochroma:  t('game_cc_name'),
      afficheflou:   t('game_af_name'),
    };
    
    if (D.configGameName) {
      D.configGameName.textContent = gameNames[gameConfig.game] || '';
    }

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
    document.body.classList.remove('hub-active');
    stopChrono();
    const g = gameConfig.game;
    if (g === 'couleurquiz')   startCouleurQuiz();
    else if (g === 'palettepure')   startPalettePure();
    else if (g === 'chronochroma')  startChronoChroma();
    else if (g === 'afficheflou')   startAfficheFlou();
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
    const titleEl = document.querySelector('#screen-cq .game-screen-title');
    if (titleEl) titleEl.textContent = t('game_cq_name');
    
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

    // Simplification : En mode facile, donner d'emblée un indice riche (Genre + Année + Réalisateur)
    if (gameConfig.difficulty === 'easy') {
      cqState.hintsUsed = 1;
      D.cqHintsUsed.textContent = '1';
      D.cqHintDisplay.removeAttribute('hidden');
      const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : '';
      const genres = film.genres ? film.genres.slice(0, 2).map(g => translateGenre(g, state.lang)).join(', ') : '';
      const dir = film.realisateur ? (state.lang === 'ja' ? `監督: ${film.realisateur}` : state.lang === 'en' ? `Dir: ${film.realisateur}` : `Réal : ${film.realisateur}`) : '';
      const hintText = [genres, year ? `(${year})` : '', dir].filter(Boolean).join(' • ');
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
      swatch.innerHTML = `<span class="swatch-idx">0${i + 1}</span><span class="swatch-shine"></span>`;
      D.cqPalette.appendChild(swatch);
    });

    // Choix : 2 mauvais choix en Facile (3 propositions au total), 3 en Moyen/Expert (4 propositions)
    const choiceCount = (gameConfig.difficulty === 'easy') ? 2 : 3;
    const wrongChoices = getWrongChoices(film, pool, choiceCount);
    cqState.currentChoices = [film, ...wrongChoices].sort(() => Math.random() - 0.5);
    
    D.cqChoices.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    cqState.currentChoices.forEach((f, idx) => {
      const btn = document.createElement('button');
      btn.className = 'game-choice-btn';
      const title = getFilmTitle(f);
      btn.dataset.filmId = f.id;
      btn.dataset.title = title;
      btn.innerHTML = `<span class="choice-key" aria-hidden="true">${letters[idx] || (idx + 1)}</span><span class="choice-text">${title}</span><span class="choice-status-icon" aria-hidden="true"></span>`;
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
      const isMatch = (btn.dataset.filmId === String(cqState.currentFilm.id)) || (btn.dataset.title === title) || (btn.textContent.trim() === title);
      if (isMatch) {
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
    const titleEl = document.querySelector('#screen-pp .game-screen-title');
    if (titleEl) titleEl.textContent = t('game_pp_name');

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

    // Swatches connus (Mystery swatch avec effet prisme holographique)
    D.ppKnownSwatches.innerHTML = '';
    palette.forEach((p, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'pp-swatch';
      if (i === ppState.missingIndex) {
        swatch.classList.add('pp-swatch--mystery');
        swatch.innerHTML = '<span class="pp-mystery-question">?</span><span class="pp-mystery-glow"></span>';
      } else {
        swatch.style.backgroundColor = p.hex.startsWith('#') ? p.hex : '#' + p.hex;
        swatch.innerHTML = `<span class="swatch-idx">0${i + 1}</span>`;
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
      btn.innerHTML = '<span class="color-choice-sheen" aria-hidden="true"></span>';
      btn.addEventListener('click', () => ppHandleAnswer(btn, color, correctColor));
      D.ppColorChoices.appendChild(btn);
    });
  }

  function generateColorDecoys(correctColor, fullPalette, pool) {
    const decoys = [];
    const correctHex = (correctColor.hex.startsWith('#') ? correctColor.hex : '#' + correctColor.hex).toLowerCase();
    const isEasy = gameConfig.difficulty === 'easy';
    const targetCount = isEasy ? 2 : 3;

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
    while (decoys.length < targetCount && attempts < 300) {
      attempts++;
      const f = pool[Math.floor(Math.random() * pool.length)];
      if (!f || !f.affiches || !f.affiches[0] || !f.affiches[0].palette) continue;
      const p = f.affiches[0].palette[Math.floor(Math.random() * 5)];
      if (!p) continue;
      const hex = (p.hex.startsWith('#') ? p.hex : '#' + p.hex).toLowerCase();
      
      const palHexes = fullPalette.map(pp => (pp.hex.startsWith('#') ? pp.hex : '#' + pp.hex).toLowerCase());
      if (hex !== correctHex && !decoys.some(d => (d.hex.startsWith('#') ? d.hex : '#' + d.hex).toLowerCase() === hex) && !palHexes.includes(hex)) {
        if (isEasy) {
          // En facile, la couleur doit être nettement contrastée (> 140 de distance)
          const rgbCand = hexToRgb(hex);
          const dist = colorDistance(rgbCorrect, rgbCand);
          if (dist < 140 && attempts < 220) continue;
        }
        decoys.push(p);
      }
    }

    // Remplissage de secours avec des teintes très distinctes en facile
    while (decoys.length < targetCount) {
      const r = isEasy ? (rgbCorrect.r > 128 ? 30 : 220) : parseInt(correctHex.slice(1, 3), 16);
      const g = isEasy ? (rgbCorrect.g > 128 ? 40 : 210) : parseInt(correctHex.slice(3, 5), 16);
      const b = isEasy ? (rgbCorrect.b > 128 ? 200 : 40) : parseInt(correctHex.slice(5, 7), 16);
      const vari = isEasy ? 120 : (40 + Math.floor(Math.random() * 60));
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

    // Boutons de choix (2 mauvais choix en Facile = 3 boutons, 3 en Moyen/Expert)
    const choiceCount = (gameConfig.difficulty === 'easy') ? 2 : 3;
    const wrongChoices = getWrongChoices(film, pool, choiceCount);
    const choices = [film, ...wrongChoices].sort(() => Math.random() - 0.5);

    D.ccChoices.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    choices.forEach((f, idx) => {
      const btn = document.createElement('button');
      btn.className = 'game-choice-btn';
      const title = getFilmTitle(f);
      btn.dataset.filmId = f.id;
      btn.dataset.title = title;
      btn.innerHTML = `<span class="choice-key" aria-hidden="true">${letters[idx] || (idx + 1)}</span><span class="choice-text">${title}</span><span class="choice-status-icon" aria-hidden="true"></span>`;
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
      const title = getFilmTitle(ccState.currentFilm);
      const isMatch = (btn.dataset.filmId === String(ccState.currentFilm.id)) || (btn.dataset.title === title) || (btn.textContent.trim() === title);
      if (isMatch) btn.classList.add('correct');
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
  //  GAME 4 — AFFICHE FLOU
  // ─────────────────────────────────────────────────────────────
  let afState = {};

  // Blur levels (px): highest → lowest as you reveal
  const AF_BLUR_LEVELS = [28, 14, 4, 0];

  function startAfficheFlou() {
    afState = {
      round: 1,
      totalRounds: gameConfig.rounds,
      score: 0,
      history: [],
      currentFilm: null,
      currentChoices: [],
      blurStep: 0,   // 0 = max blur, 3 = revealed
      isAnswered: false,
      usedIds: []
    };
    D.afRoundTot.textContent = gameConfig.rounds;
    const titleEl = document.querySelector('#screen-af .game-screen-title');
    if (titleEl) titleEl.textContent = t('game_af_name');

    showScreen('af');
    afInitRound();
  }

  function afInitRound() {
    afState.isAnswered = false;
    afState.blurStep = 0;

    const pool = getPool();
    // Filter films that have a poster image
    const posterPool = pool.filter(f => f.affiches && f.affiches[0] && (f.affiches[0].affiche_w500 || f.affiches[0].affiche_original));
    const sourcePool = posterPool.length >= 10 ? posterPool : pool;

    afState.currentFilm = getRandom(sourcePool, afState.usedIds);
    afState.usedIds.push(afState.currentFilm.id);
    const film = afState.currentFilm;

    // Set background (blurred)
    setBgFilm(film, false);

    // Update HUD
    D.afRound.textContent = afState.round;
    D.afScore.textContent = afState.score;
    D.afProgress.style.width = `${((afState.round - 1) / afState.totalRounds) * 100}%`;
    D.afDifficulty.textContent = t('game_diff_' + (gameConfig.difficulty === 'mixed' ? 'easy' : gameConfig.difficulty)) || '';

    // Reset hint area
    D.afHintBtn.disabled = false;
    D.afHintBtn.style.opacity = '1';
    D.afHintsSection.style.display = '';
    D.afRevealInfo.setAttribute('hidden', '');
    D.afNextBtn.setAttribute('hidden', '');
    D.afHintDisplay.setAttribute('hidden', '');
    D.afHintDisplay.innerHTML = '';
    D.afRevealBadge.setAttribute('hidden', '');

    // Show poster with blur (doux en Facile = 10px, sinon 28px)
    const blurLevels = (gameConfig.difficulty === 'easy') ? [10, 4, 1, 0] : AF_BLUR_LEVELS;
    afState.blurLevels = blurLevels;
    const posterSrc = film.affiches[0].affiche_w500 || film.affiches[0].affiche_original;
    D.afPosterImg.src = posterSrc;
    afApplyBlur(blurLevels[0]);
    afUpdateBlurPips();

    // Build choices : 2 mauvais choix en Facile (3 propositions), 3 sinon (4 propositions max)
    const choiceCount = (gameConfig.difficulty === 'easy') ? 2 : 3;
    const wrongChoices = getWrongChoices(film, sourcePool, choiceCount);
    afState.currentChoices = [film, ...wrongChoices].sort(() => Math.random() - 0.5);

    D.afChoices.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    afState.currentChoices.forEach((f, idx) => {
      const btn = document.createElement('button');
      btn.className = 'game-choice-btn';
      const title = getFilmTitle(f);
      btn.dataset.filmId = f.id;
      btn.dataset.title = title;
      btn.innerHTML = `<span class="choice-key" aria-hidden="true">${letters[idx] || (idx + 1)}</span><span class="choice-text">${title}</span><span class="choice-status-icon" aria-hidden="true"></span>`;
      btn.addEventListener('click', () => afHandleAnswer(btn, f));
      D.afChoices.appendChild(btn);
    });
  }

  function afApplyBlur(px) {
    D.afPosterImg.style.filter = `blur(${px}px) saturate(${px === 0 ? 1 : 0.75})`;
    D.afPosterImg.style.transition = 'filter 0.5s cubic-bezier(0.4,0,0.2,1)';
  }

  function afUpdateBlurPips() {
    const pips = D.afBlurLevel.querySelectorAll('.af-blur-pip');
    pips.forEach((pip, i) => {
      pip.classList.toggle('af-blur-pip--active', i <= afState.blurStep);
      pip.classList.toggle('af-blur-pip--current', i === afState.blurStep);
    });
    // Update tip text
    const tip = D.afBlurLevel.querySelector('.af-blur-tip, #af-blur-tip') || document.getElementById('af-blur-tip');
    if (tip) {
      if (afState.blurStep === 0) tip.textContent = t('game_af_blur_tip_1') || 'Flou maximum';
      else if (afState.blurStep === 1) tip.textContent = t('game_af_blur_tip_2') || 'Flou modéré';
      else if (afState.blurStep === 2) tip.textContent = t('game_af_blur_tip_3') || 'Flou léger';
      else tip.textContent = t('game_af_blur_tip_4') || 'Affiche révélée';
    }
  }

  function afRevealMore() {
    if (afState.isAnswered) return;
    if (afState.blurStep >= 2) {
      D.afHintBtn.disabled = true;
      D.afHintBtn.style.opacity = '0.4';
      return;
    }
    afState.blurStep++;
    const levels = afState.blurLevels || AF_BLUR_LEVELS;
    afApplyBlur(levels[afState.blurStep]);
    afUpdateBlurPips();

    // Show textual clues
    if (afState.blurStep === 1) {
      const film = afState.currentFilm;
      const genres = film.genres ? film.genres.slice(0, 2).map(g => translateGenre(g, state.lang)).join(', ') : '';
      D.afHintDisplay.removeAttribute('hidden');
      D.afHintDisplay.innerHTML = `<div><b>${t('game_hint_prefix') || 'Indice'} :</b> ${genres}</div>`;
    } else if (afState.blurStep === 2) {
      const film = afState.currentFilm;
      const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : '';
      D.afHintDisplay.removeAttribute('hidden');
      const extra = year ? `<div><b>${t('game_hint_prefix') || 'Indice'} :</b> ${year} • ${film.realisateur || ''}</div>` : '';
      D.afHintDisplay.innerHTML += extra;
      D.afHintBtn.disabled = true;
      D.afHintBtn.style.opacity = '0.4';
    }
  }

  function afHandleAnswer(btnEl, chosen) {
    if (afState.isAnswered) return;
    afState.isAnswered = true;

    const correct = chosen.id === afState.currentFilm.id;
    if (correct) {
      afState.score++;
    }

    afState.history.push({
      film: afState.currentFilm,
      isCorrect: correct,
      blurStep: afState.blurStep
    });

    // Fully reveal poster
    afState.blurStep = 3;
    afApplyBlur(AF_BLUR_LEVELS[3]);
    afUpdateBlurPips();

    // Highlight choices
    document.querySelectorAll('#af-choices .game-choice-btn').forEach(btn => {
      btn.disabled = true;
      const title = getFilmTitle(afState.currentFilm);
      const isMatch = (btn.dataset.filmId === String(afState.currentFilm.id)) || (btn.dataset.title === title) || (btn.textContent.trim() === title);
      if (isMatch) {
        btn.classList.add('correct');
      } else if (btn === btnEl && !correct) {
        btn.classList.add('wrong');
      } else {
        btn.style.opacity = '0.35';
      }
    });

    D.afScore.textContent = afState.score;
    D.afProgress.style.width = `${(afState.round / afState.totalRounds) * 100}%`;
    D.afHintsSection.style.display = 'none';

    // Show film name on the poster
    D.afRevealTitle.textContent = getFilmTitle(afState.currentFilm);
    const year = afState.currentFilm.date_sortie ? new Date(afState.currentFilm.date_sortie).getFullYear() : '';
    D.afRevealMeta.textContent = year ? `${afState.currentFilm.realisateur || ''} • ${year}` : (afState.currentFilm.realisateur || '');
    D.afRevealBadge.removeAttribute('hidden');

    // Also show reveal info below
    D.afFilmTitle.textContent = getFilmTitle(afState.currentFilm);
    D.afFilmMeta.textContent = D.afRevealMeta.textContent;
    D.afRevealInfo.removeAttribute('hidden');

    setBgFilm(afState.currentFilm, true);

    D.afNextBtn.textContent = afState.round < afState.totalRounds ? t('game_next_round') : t('game_see_results');
    D.afNextBtn.removeAttribute('hidden');
  }

  function afHandleNext() {
    D.afHintsSection.style.display = '';
    if (afState.round < afState.totalRounds) {
      afState.round++;
      afInitRound();
    } else {
      showEndScreen('afficheflou', afState.score, afState.totalRounds, afState.history);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  END SCREEN
  // ─────────────────────────────────────────────────────────────
  function showEndScreen(game, score, total, history) {
    stopChrono();
    setRandomBg(true);
    document.body.classList.remove('hub-active');

    try {
      const gameNames = {
        couleurquiz:  t('game_cq_name'),
        palettepure:  t('game_pp_name'),
        chronochroma: t('game_cc_name'),
        afficheflou:  t('game_af_name'),
      };

      if (D.endBadge) D.endBadge.textContent = gameNames[game] || game;
      
      // Titre interactif fluide à la fin
      if (typeof applyInteractiveLettering === 'function' && D.endTitle) {
        applyInteractiveLettering(D.endTitle, game === 'chronochroma' ? t('game_cc_end_title') : t('game_end_title'));
      } else if (D.endTitle) {
        D.endTitle.textContent = game === 'chronochroma' ? t('game_cc_end_title') : t('game_end_title');
      }

      const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
      const totalHints = (history || []).reduce((acc, r) => acc + ((game === 'afficheflou' ? r.blurStep : r.hints) || 0), 0);

      const statsData = game === 'chronochroma' ? [
        { label: t('game_cc_end_score').replace(':', ''), val: score },
        { label: t('game_cc_films_done'), val: total },
        { label: t('game_accuracy'), val: accuracy + '%' }
      ] : [
        { label: t('game_end_score').replace(':', ''), val: `${score} / ${total}` },
        { label: t('game_accuracy'), val: accuracy + '%' },
        { label: game === 'afficheflou' ? (t('game_hints_total') || 'Indices') : t('game_hints_total'), val: totalHints }
      ];

      if (D.endStatsGrid) {
        D.endStatsGrid.innerHTML = statsData.map(s => `
          <div class="end-stat-item">
            <div class="end-stat-val">${s.val}</div>
            <div class="end-stat-lbl">${s.label}</div>
          </div>
        `).join('');
      }

      if (D.endRecapList) {
        D.endRecapList.innerHTML = '';
        if (game !== 'chronochroma' && Array.isArray(history)) {
          const currentLang = (typeof state !== 'undefined' && state && state.lang) || localStorage.getItem('cinechroma_lang') || 'fr';
          history.slice(0, 20).forEach((round, index) => {
            if (!round || !round.film) return;
            const item = document.createElement('div');
            item.className = 'game-recap-item';
            item.style.animationDelay = `${index * 0.06}s`;

            const statusClass = round.isCorrect ? 'recap-correct' : 'recap-wrong';
            const posterSrc = (round.film.affiches && round.film.affiches[0] && (round.film.affiches[0].affiche_w500 || round.film.affiches[0].affiche_original)) || '';
            const title = getFilmTitle(round.film);

            let extraHtml = '';
            if (game === 'couleurquiz') {
              extraHtml = `<div class="recap-hints">${t('game_hints_used_label')}${round.hints || 0}</div>`;
            } else if (game === 'afficheflou') {
              const stepsLabel = currentLang === 'ja' ? `${round.blurStep || 0}回ヒント使用` :
                                 currentLang === 'en' ? `${round.blurStep || 0} reveal${(round.blurStep || 0) !== 1 ? 's' : ''} used` :
                                 `${round.blurStep || 0} révélation${(round.blurStep || 0) !== 1 ? 's' : ''} utilisée${(round.blurStep || 0) !== 1 ? 's' : ''}`;
              extraHtml = `<div class="recap-hints">${stepsLabel}</div>`;
            }

            let paletteHtml = '';
            if (game !== 'afficheflou' && round.film.affiches && round.film.affiches[0] && Array.isArray(round.film.affiches[0].palette)) {
              round.film.affiches[0].palette.forEach(p => {
                if (!p || !p.hex) return;
                const hex = p.hex.startsWith('#') ? p.hex : '#' + p.hex;
                paletteHtml += `<div class="recap-swatch" style="background-color:${hex}"></div>`;
              });
            }

            item.innerHTML = `
              <div class="recap-index">${index + 1}</div>
              ${posterSrc ? `<img src="${posterSrc}" alt="Affiche" class="recap-poster${game === 'afficheflou' ? ' recap-poster--af' : ''}" />` : ''}
              <div class="recap-info">
                <div class="recap-title ${statusClass}">${title}</div>
                ${paletteHtml ? `<div class="recap-palette">${paletteHtml}</div>` : ''}
                ${extraHtml}
              </div>
            `;
            D.endRecapList.appendChild(item);
          });
        }
      }
    } catch (err) {
      console.error('Erreur affichage écran de fin :', err);
    }

    showScreen('end');
  }

  // ─────────────────────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────────────────────
  function getFilmTitle(film) {
    if (!film) return '';
    const currentLang = (typeof state !== 'undefined' && state && state.lang) || localStorage.getItem('cinechroma_lang') || 'fr';
    if (currentLang === 'ja' && film.titre_ja) return film.titre_ja;
    if (currentLang === 'en' && film.titre_en) return film.titre_en;
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

    const words = (text || element.textContent || '').trim().split(/\s+/);
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

  // ═══════════════════════════════════════════════════════════════
  // CHROMA BALL — BALADE CHROMATIQUE CHILL & ZEN
  // ═══════════════════════════════════════════════════════════════
  function initChromaBall() {
    const fabBtn = document.getElementById('chroma-ball-fab');
    const overlay = document.getElementById('chroma-ball-overlay');
    const canvas = document.getElementById('chroma-ball-canvas');
    if (!fabBtn || !overlay || !canvas) return;

    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('cb-score-val');
    const hiscoreEl = document.getElementById('cb-hiscore-val');
    const comboBadge = document.getElementById('cb-combo-badge');
    const comboVal = document.getElementById('cb-combo-val');
    const energyFill = document.getElementById('cb-energy-fill');
    const muteBtn = document.getElementById('cb-mute-btn');
    const muteIcon = document.getElementById('cb-mute-icon');
    const quitBtn = document.getElementById('cb-quit-btn');
    const gameOverCard = document.getElementById('cb-gameover-card');
    const gameOverScore = document.getElementById('cb-gameover-score');
    const newRecordTag = document.getElementById('cb-gameover-newrecord');
    const retryBtn = document.getElementById('cb-retry-btn');
    const exitBtn = document.getElementById('cb-exit-btn');

    // ── Zen Web Audio Synthesizer & Retro Synthwave Music Engine ──
    // Inspired by "Euan Ellis — Where It Leads" (B A D L A N D S Vol. 1 at 25:00)
    // 100 BPM Chillsynth / Galactic Dreamwave in F# Minor with 80s Drums, Pumping Bass & Echo Lead
    const ZenAudio = (function() {
      let audioCtx = null;
      let masterGain = null;
      let musicGain = null;
      let fxGain = null;
      let musicFilter = null;
      let noiseBuffer = null;
      let isMuted = false;
      try {
        isMuted = localStorage.getItem('cinechroma_audio_muted') === '1';
      } catch(e) {}
      let isMusicPlaying = false;
      let musicInterval = null;
      let currentStep = 0;

      function getContext() {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }
        return audioCtx;
      }

      function getNoiseBuffer(ac) {
        if (noiseBuffer) return noiseBuffer;
        const bufferSize = ac.sampleRate * 2; // 2s white noise
        noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
      }

      function initGraph() {
        const ac = getContext();
        if (!ac || masterGain) return;

        masterGain = ac.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : 1, ac.currentTime);
        masterGain.gain.value = isMuted ? 0 : 1;
        masterGain.connect(ac.destination);

        fxGain = ac.createGain();
        fxGain.gain.setValueAtTime(0.85, ac.currentTime);
        fxGain.gain.value = 0.85;
        fxGain.connect(masterGain);

        // Warm 80s tape lowpass filter (analog synthesizer tone)
        musicFilter = ac.createBiquadFilter();
        musicFilter.type = 'lowpass';
        musicFilter.frequency.setValueAtTime(3200, ac.currentTime);
        musicFilter.Q.setValueAtTime(0.9, ac.currentTime);
        musicFilter.connect(masterGain);

        musicGain = ac.createGain();
        musicGain.gain.setValueAtTime(0.58, ac.currentTime);
        musicGain.gain.value = 0.58;
        musicGain.connect(musicFilter);
      }

      // ─── 80s Retrowave Drums ──────────────────────────────────────
      function playKick(ac, t0) {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(145, t0);
        osc.frequency.exponentialRampToValueAtTime(42, t0 + 0.08);

        gain.gain.setValueAtTime(0.24, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.24);

        osc.connect(gain);
        gain.connect(musicGain);
        osc.start(t0);
        osc.stop(t0 + 0.25);
      }

      function playSnare(ac, t0) {
        // Tonal punch
        const osc = ac.createOscillator();
        const oscGain = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190, t0);
        osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.07);
        oscGain.gain.setValueAtTime(0.12, t0);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
        osc.connect(oscGain);
        oscGain.connect(musicGain);
        osc.start(t0);
        osc.stop(t0 + 0.13);

        // Gated 80s reverb noise body
        const nb = getNoiseBuffer(ac);
        const noise = ac.createBufferSource();
        noise.buffer = nb;
        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, t0);
        filter.Q.setValueAtTime(1.4, t0);

        const noiseGain = ac.createGain();
        noiseGain.gain.setValueAtTime(0.16, t0);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.20);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(musicGain);
        noise.start(t0);
        noise.stop(t0 + 0.21);
      }

      function playHiHat(ac, t0, open) {
        const nb = getNoiseBuffer(ac);
        const noise = ac.createBufferSource();
        noise.buffer = nb;
        const filter = ac.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7500, t0);

        const gain = ac.createGain();
        const dur = open ? 0.14 : 0.042;
        const vol = open ? 0.065 : 0.048;
        gain.gain.setValueAtTime(vol, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(musicGain);
        noise.start(t0);
        noise.stop(t0 + dur + 0.01);
      }

      // ─── Pumping Synthwave Bass ────────────────────────────────────
      function playBass(ac, freq, t0, dur) {
        const osc1 = ac.createOscillator();
        const osc2 = ac.createOscillator();
        const filter = ac.createBiquadFilter();
        const gain = ac.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, t0);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq, t0);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, t0);
        filter.frequency.exponentialRampToValueAtTime(220, t0 + dur);
        filter.Q.setValueAtTime(2.2, t0);

        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.17, t0 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(musicGain);

        osc1.start(t0);
        osc2.start(t0);
        osc1.stop(t0 + dur + 0.02);
        osc2.stop(t0 + dur + 0.02);
      }

      // ─── Warm Analog Juno Pad ──────────────────────────────────────
      function playPad(ac, chordNotes, t0, dur) {
        chordNotes.forEach((freq, idx) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t0);
          osc.detune.setValueAtTime(idx % 2 === 0 ? -6 : 6, t0);

          gain.gain.setValueAtTime(0.0001, t0);
          gain.gain.linearRampToValueAtTime(0.075, t0 + 0.16);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

          osc.connect(gain);
          gain.connect(musicGain);
          osc.start(t0);
          osc.stop(t0 + dur + 0.05);
        });
      }

      // ─── Galactic Dreamwave Melodic Lead with Tape Echo ────────────
      function playLead(ac, freq, t0, dur) {
        if (!freq) return;
        const osc = ac.createOscillator();
        const filter = ac.createBiquadFilter();
        const gain = ac.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t0);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, t0);
        filter.Q.setValueAtTime(1.5, t0);

        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.15, t0 + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(musicGain);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);

        // Atmospheric Space Delay Echo
        const echoOsc = ac.createOscillator();
        const echoFilter = ac.createBiquadFilter();
        const echoGain = ac.createGain();
        const echoTime = t0 + 0.22;

        echoOsc.type = 'triangle';
        echoOsc.frequency.setValueAtTime(freq, echoTime);
        echoFilter.type = 'lowpass';
        echoFilter.frequency.setValueAtTime(1400, echoTime);

        echoGain.gain.setValueAtTime(0.0001, echoTime);
        echoGain.gain.linearRampToValueAtTime(0.065, echoTime + 0.02);
        echoGain.gain.exponentialRampToValueAtTime(0.0001, echoTime + dur * 0.9);

        echoOsc.connect(echoFilter);
        echoFilter.connect(echoGain);
        echoGain.connect(musicGain);
        echoOsc.start(echoTime);
        echoOsc.stop(echoTime + dur + 0.03);
      }

      // ─── 4-Bar Chillsynth Progression (F#m — Dmaj7 — A — E/C#m) ───
      const CHORDS_FSHARP = [
        {
          root: 46.25, // F#1
          rootHigh: 92.50, // F#2
          pad: [185.00, 220.00, 277.18, 329.63] // F#3, A3, C#4, E4 (F#m7)
        },
        {
          root: 36.71, // D1
          rootHigh: 73.42, // D2
          pad: [185.00, 220.00, 277.18, 293.66] // F#3, A3, C#4, D4 (Dmaj7)
        },
        {
          root: 55.00, // A1
          rootHigh: 110.00, // A2
          pad: [164.81, 220.00, 277.18, 329.63] // E3, A3, C#4, E4 (A)
        },
        {
          root: 41.20, // E1
          rootHigh: 82.41, // E2
          pad: [164.81, 207.65, 246.94, 329.63] // E3, G#3, B3, E4 (E / C#m7)
        }
      ];

      // Soaring Euan Ellis style lead melody across 64 steps (4 bars of 16)
      const LEAD_PATTERN = [
        // Bar 0: F#m7
        554.37, null, null, 440.00, null, null, 493.88, null, 554.37, null, null, 659.25, null, 554.37, null, null,
        // Bar 1: Dmaj7
        440.00, null, null, null, 369.99, null, null, null, 440.00, null, null, 493.88, null, 440.00, null, null,
        // Bar 2: A
        659.25, null, null, null, 554.37, null, null, 493.88, null, 440.00, null, null, 493.88, null, null, null,
        // Bar 3: E / C#m7
        415.30, null, null, null, 329.63, null, null, null, 369.99, null, null, null, 415.30, null, 440.00, null
      ];

      function playNextStep() {
        if (!isMusicPlaying) return;
        const ac = getContext();
        if (!ac) return;

        if (ac.state === 'suspended') {
          ac.resume().catch(() => {});
          return;
        }

        const step = currentStep;
        currentStep = (currentStep + 1) % 64; // 64 steps loop

        if (isMuted) return; // Zero audio generation when muted

        try {
          const t0 = ac.currentTime + 0.025; // 25ms safety lookahead
          const barIdx = Math.floor(step / 16) % 4;
          const stepInBar = step % 16;
          const chord = CHORDS_FSHARP[barIdx];
          const stepDur = 0.15; // 150ms per step = 100 BPM

          // 1. Retro 80s Drum Beat
          // Kick: beats 1 & 3 with syncopated 16th hits
          if (stepInBar === 0 || stepInBar === 6 || stepInBar === 8 || stepInBar === 10) {
            playKick(ac, t0);
          }
          // Snare: gated 80s backbeat on 2 & 4
          if (stepInBar === 4 || stepInBar === 12) {
            playSnare(ac, t0);
          }
          // Hi-Hat: steady 8th-note pulse (open on step 14 transition)
          if (stepInBar % 2 === 0) {
            playHiHat(ac, t0, stepInBar === 14);
          }

          // 2. Pumping Chillsynth Bass (8th-note drive with octave bounces)
          if (stepInBar % 2 === 0) {
            const isOctaveHop = (stepInBar === 10 || stepInBar === 14);
            const bassFreq = isOctaveHop ? chord.rootHigh : chord.root;
            playBass(ac, bassFreq, t0, 0.22);
          }

          // 3. Warm Juno Analog Pad (every 16 steps = start of each bar)
          if (stepInBar === 0) {
            playPad(ac, chord.pad, t0, 2.3);
          }

          // 4. Emotive Dreamwave Melodic Lead
          const leadFreq = LEAD_PATTERN[step];
          if (leadFreq) {
            playLead(ac, leadFreq, t0, 0.26);
          }

        } catch(err) {
          console.warn('ZenAudio step warning:', err);
        }
      }

      // Pentatonic notes for stardust floating pickups in F#m
      const pentatonic = [369.99, 440.00, 493.88, 554.37, 659.25, 739.99]; // F#4, A4, B4, C#5, E5, F#5
      let noteIdx = 0;

      return {
        // Toggle sound mute/unmute
        toggleMute: function() {
          initGraph();
          isMuted = !isMuted;
          try {
            localStorage.setItem('cinechroma_audio_muted', isMuted ? '1' : '0');
          } catch(e) {}

          const ac = getContext();
          if (masterGain && ac) {
            const t = ac.currentTime;
            masterGain.gain.cancelScheduledValues(t);
            masterGain.gain.setValueAtTime(isMuted ? 0 : 1, t);
            masterGain.gain.value = isMuted ? 0 : 1;
          }
          return isMuted;
        },
        isMuted: () => isMuted,

        // Background retro synthwave music control (100 BPM = 150ms per step)
        startMusic: function() {
          initGraph();
          const ac = getContext();
          if (ac && ac.state === 'suspended') {
            ac.resume().then(() => {
              if (isMusicPlaying && !musicInterval) {
                musicInterval = setInterval(playNextStep, 150);
                playNextStep();
              }
            }).catch(() => {});
          }
          if (isMusicPlaying) return;
          isMusicPlaying = true;
          currentStep = 0;
          if (musicGain && ac) {
            musicGain.gain.cancelScheduledValues(ac.currentTime);
            musicGain.gain.setValueAtTime(0.58, ac.currentTime);
            musicGain.gain.value = 0.58;
          }
          if (musicInterval) clearInterval(musicInterval);
          musicInterval = setInterval(playNextStep, 150);
          playNextStep();
        },
        stopMusic: function() {
          isMusicPlaying = false;
          if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
          }
        },

        // Dynamic Star Pickup Chime per star type
        playStarPickup: function(type) {
          if (isMuted) return;
          initGraph();
          const ac = getContext();
          if (!ac || !fxGain) return;
          try {
            const t0 = ac.currentTime + 0.005;

            if (type === 'gold') {
              // High bright chime (pentatonic)
              const osc = ac.createOscillator();
              const gain = ac.createGain();
              const freq = pentatonic[noteIdx % pentatonic.length];
              noteIdx++;
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, t0);
              gain.gain.setValueAtTime(0.0001, t0);
              gain.gain.linearRampToValueAtTime(0.13, t0 + 0.01);
              gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
              osc.connect(gain);
              gain.connect(fxGain);
              osc.start(t0);
              osc.stop(t0 + 0.58);
            } else if (type === 'diamond') {
              // Crystalline dual octave chime (cyan diamond)
              [739.99, 1479.98].forEach((f, i) => {
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, t0 + i * 0.03);
                gain.gain.setValueAtTime(0.0001, t0 + i * 0.03);
                gain.gain.linearRampToValueAtTime(0.12, t0 + i * 0.03 + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.03 + 0.65);
                osc.connect(gain);
                gain.connect(fxGain);
                osc.start(t0 + i * 0.03);
                osc.stop(t0 + i * 0.03 + 0.68);
              });
            } else if (type === 'heart') {
              // Warm major healing chord
              [440.00, 554.37, 659.25].forEach((f, i) => {
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                osc.type = 'triangle';
                const st = t0 + i * 0.04;
                osc.frequency.setValueAtTime(f, st);
                gain.gain.setValueAtTime(0.0001, st);
                gain.gain.linearRampToValueAtTime(0.12, st + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.7);
                osc.connect(gain);
                gain.connect(fxGain);
                osc.start(st);
                osc.stop(st + 0.72);
              });
            } else if (type === 'rainbow') {
              // Ascending 4-note hyper arpeggio
              [369.99, 440.00, 554.37, 739.99].forEach((f, i) => {
                const osc = ac.createOscillator();
                const gain = ac.createGain();
                osc.type = 'sawtooth';
                const st = t0 + i * 0.045;
                osc.frequency.setValueAtTime(f, st);
                const filter = ac.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2200, st);
                gain.gain.setValueAtTime(0.0001, st);
                gain.gain.linearRampToValueAtTime(0.11, st + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.6);
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(fxGain);
                osc.start(st);
                osc.stop(st + 0.62);
              });
            } else if (type === 'comet') {
              // Shimmering rapid glide
              const osc = ac.createOscillator();
              const gain = ac.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(987.77, t0);
              osc.frequency.exponentialRampToValueAtTime(493.88, t0 + 0.25);
              gain.gain.setValueAtTime(0.0001, t0);
              gain.gain.linearRampToValueAtTime(0.14, t0 + 0.01);
              gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
              osc.connect(gain);
              gain.connect(fxGain);
              osc.start(t0);
              osc.stop(t0 + 0.48);
            } else {
              // Mote / Starlight ping
              const osc = ac.createOscillator();
              const gain = ac.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880.00, t0);
              gain.gain.setValueAtTime(0.0001, t0);
              gain.gain.linearRampToValueAtTime(0.09, t0 + 0.008);
              gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
              osc.connect(gain);
              gain.connect(fxGain);
              osc.start(t0);
              osc.stop(t0 + 0.28);
            }
          } catch(e) {}
        },

        // Soft crystal chime on stardust pickup (tuned to F#m pentatonic)
        playChime: function() {
          this.playStarPickup('gold');
        },

        // Celestial ring resonance (harmonic octave bell chord in C#)
        playRingPass: function() {
          if (isMuted) return;
          initGraph();
          const ac = getContext();
          if (!ac || !fxGain) return;
          try {
            const t0 = ac.currentTime + 0.005;
            [554.37, 1108.73].forEach(freq => {
              const osc = ac.createOscillator();
              const gain = ac.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, t0);
              gain.gain.setValueAtTime(0.0001, t0);
              gain.gain.linearRampToValueAtTime(0.11, t0 + 0.015);
              gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.85);
              osc.connect(gain);
              gain.connect(fxGain);
              osc.start(t0);
              osc.stop(t0 + 0.9);
            });
          } catch(e) {}
        },

        // Deep crunch impact on asteroid collision
        playAsteroidHit: function() {
          if (isMuted) return;
          initGraph();
          const ac = getContext();
          if (!ac || !fxGain) return;
          try {
            const t0 = ac.currentTime + 0.005;
            // Low rumble body
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(130, t0);
            osc.frequency.exponentialRampToValueAtTime(32, t0 + 0.35);
            const filter = ac.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, t0);
            filter.frequency.exponentialRampToValueAtTime(80, t0 + 0.35);

            gain.gain.setValueAtTime(0.0001, t0);
            gain.gain.linearRampToValueAtTime(0.22, t0 + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.38);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(fxGain);
            osc.start(t0);
            osc.stop(t0 + 0.4);

            // Rock crunch noise
            const nb = getNoiseBuffer(ac);
            const noise = ac.createBufferSource();
            noise.buffer = nb;
            const noiseFilter = ac.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(600, t0);
            noiseFilter.Q.setValueAtTime(2.0, t0);

            const noiseGain = ac.createGain();
            noiseGain.gain.setValueAtTime(0.18, t0);
            noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(fxGain);
            noise.start(t0);
            noise.stop(t0 + 0.26);
          } catch(e) {}
        },

        // Gentle soft bump on shadow obstacle (alias)
        playObstacleBump: function() {
          this.playAsteroidHit();
        },

        // Voyage launch soft chime (F#m arpeggio)
        playStart: function() {
          if (isMuted) return;
          initGraph();
          const ac = getContext();
          if (!ac || !fxGain) return;
          try {
            const t0 = ac.currentTime + 0.005;
            [369.99, 440.00, 554.37, 659.25].forEach((freq, idx) => {
              const osc = ac.createOscillator();
              const gain = ac.createGain();
              osc.type = 'sine';
              const st = t0 + idx * 0.08;
              osc.frequency.setValueAtTime(freq, st);
              gain.gain.setValueAtTime(0.0001, st);
              gain.gain.linearRampToValueAtTime(0.12, st + 0.01);
              gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.65);
              osc.connect(gain);
              gain.connect(fxGain);
              osc.start(st);
              osc.stop(st + 0.7);
            });
          } catch(e) {}
        }
      };
    })();

    let animId = null;
    let isRunning = false;
    let isGameOver = false;
    let score = 0;
    let hiScore = parseInt(localStorage.getItem('cinechroma_ball_hiscore') || '0', 10);
    let harmonie = 100;
    let combo = 1;
    let lastComboTime = 0;
    let lastScoreTick = 0;
    let lastRingSpawn = 0;
    let lastStarSpawn = 0;
    let lastObstacleSpawn = 0;
    let shakeTimer = 0;
    let shakeIntensity = 0;
    let width = 0;
    let height = 0;

    // Keys state for keyboard steering
    const keys = {
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
      KeyW: false, KeyS: false, KeyA: false, KeyD: false
    };

    // Player Space Rocket object (fluid floating glide with banking tilt)
    const player = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      vx: 0,
      vy: 0,
      radius: 14,
      angle: 0,
      invulnerableTimer: 0,
      trail: [],
      particles: [],
      hue: 180
    };

    // Game objects arrays
    let rings = [];       // Celestial Light Rings
    let stars = [];       // Stardust & Crystals
    let obstacles = [];   // Dark Cosmic Crystals
    let floatingTexts = [];

    function updateHiScoreDisplay() {
      if (hiscoreEl) hiscoreEl.textContent = String(hiScore).padStart(6, '0');
    }
    updateHiScoreDisplay();

    function updateMuteUI(muted) {
      if (!muteBtn) return;
      if (muted) {
        muteBtn.classList.add('muted');
        if (muteIcon) muteIcon.textContent = '🔇';
        muteBtn.title = 'Activer le son (M)';
        muteBtn.setAttribute('aria-label', 'Activer le son');
      } else {
        muteBtn.classList.remove('muted');
        if (muteIcon) muteIcon.textContent = '🔊';
        muteBtn.title = 'Couper le son (M)';
        muteBtn.setAttribute('aria-label', 'Couper le son');
      }
    }
    updateMuteUI(ZenAudio.isMuted());

    function handleMute(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const muted = ZenAudio.toggleMute();
      updateMuteUI(muted);
    }

    function updateHarmonie(val) {
      harmonie = Math.max(0, Math.min(100, val));
      if (energyFill) {
        energyFill.style.width = harmonie + '%';
        if (harmonie <= 25) energyFill.classList.add('low');
        else energyFill.classList.remove('low');
      }
      if (harmonie <= 0 && !isGameOver) {
        triggerGameOver();
      }
    }

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (player.x === 0 && player.y === 0) {
        player.x = player.targetX = width / 2;
        player.y = player.targetY = height * 0.72;
      }
    }

    // ── Input Listeners ──────────────────────────────────────────
    function onPointerMove(e) {
      if (!isRunning || isGameOver) return;
      player.targetX = Math.max(player.radius + 15, Math.min(width - player.radius - 15, e.clientX));
      player.targetY = Math.max(player.radius + 60, Math.min(height - player.radius - 20, e.clientY));
    }

    function onTouchMove(e) {
      if (!isRunning || isGameOver || !e.touches || !e.touches[0]) return;
      player.targetX = Math.max(player.radius + 15, Math.min(width - player.radius - 15, e.touches[0].clientX));
      player.targetY = Math.max(player.radius + 60, Math.min(height - player.radius - 20, e.touches[0].clientY));
    }

    function onKeyDown(e) {
      if (e.code in keys) {
        keys[e.code] = true;
      }
      if ((e.code === 'KeyM' || e.key === 'm' || e.key === 'M') && (isRunning || (overlay && !overlay.hasAttribute('hidden')))) {
        e.preventDefault();
        handleMute(e);
      }
      if (e.code === 'Escape' && isRunning) {
        e.preventDefault();
        exitChromaBall();
      }
      if (e.code === 'Space' && isGameOver) {
        e.preventDefault();
        startGame();
      }
    }

    function onKeyUp(e) {
      if (e.code in keys) {
        keys[e.code] = false;
      }
    }

    // ── Launching & Exiting ────────────────────────────────────────
    function launchChromaBall() {
      ZenAudio.playStart();
      ZenAudio.startMusic();
      updateMuteUI(ZenAudio.isMuted());
      document.body.classList.add('chroma-ball-active');
      overlay.removeAttribute('hidden');
      if (gameOverCard) gameOverCard.hidden = true;

      setTimeout(() => {
        resizeCanvas();
        startGame();
      }, 750);
    }

    function exitChromaBall() {
      ZenAudio.playChime();
      ZenAudio.stopMusic();
      isRunning = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      overlay.setAttribute('hidden', '');
      if (gameOverCard) gameOverCard.hidden = true;
      document.body.classList.remove('chroma-ball-active');
    }

    // ── Pixel Art Retro Rocket Renderer ───────────────────────────
    function drawPlayerRocket(c, p, now) {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.angle);

      // 1. Invulnerability Cyber Shield Bubble
      if (p.invulnerableTimer > 0) {
        const shieldAlpha = 0.5 + Math.sin(now * 0.03) * 0.35;
        c.save();
        c.strokeStyle = `rgba(0, 240, 255, ${shieldAlpha})`;
        c.lineWidth = 2.5;
        c.shadowColor = '#00f0ff';
        c.shadowBlur = 18;
        c.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (a * Math.PI) / 3;
          const rx = Math.cos(ang) * 25;
          const ry = Math.sin(ang) * 25;
          if (a === 0) c.moveTo(rx, ry);
          else c.lineTo(rx, ry);
        }
        c.closePath();
        c.stroke();
        c.restore();
      }

      // 2. Thruster Flame (dual-color animated retro flicker scaled dynamically with speed)
      const currentSpeed = Math.hypot(p.vx, p.vy);
      const thrustScale = Math.min(1.85, 0.82 + currentSpeed * 0.14);
      const flameLen = (11 + Math.sin(now * 0.08) * 5 + Math.random() * 4) * thrustScale;
      // Outer plume (magenta / hot neon orange)
      c.fillStyle = '#ff2a85';
      c.shadowColor = '#ff2a85';
      c.shadowBlur = 14;
      c.beginPath();
      c.moveTo(-5, 14);
      c.lineTo(5, 14);
      c.lineTo(0, 14 + flameLen);
      c.closePath();
      c.fill();

      // Inner core flame (bright yellow)
      c.fillStyle = '#ffe600';
      c.shadowColor = '#ffe600';
      c.shadowBlur = 8;
      c.beginPath();
      c.moveTo(-2.5, 14);
      c.lineTo(2.5, 14);
      c.lineTo(0, 14 + flameLen * 0.65);
      c.closePath();
      c.fill();

      // 3. Delta Wings (Cyber Dark Navy with Neon Cyan Piping)
      c.shadowColor = '#00f0ff';
      c.shadowBlur = 10;
      // Left Wing
      c.fillStyle = '#0b1329';
      c.strokeStyle = '#00f0ff';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(-6, 2);
      c.lineTo(-19, 14);
      c.lineTo(-6, 12);
      c.closePath();
      c.fill();
      c.stroke();

      // Right Wing
      c.beginPath();
      c.moveTo(6, 2);
      c.lineTo(19, 14);
      c.lineTo(6, 12);
      c.closePath();
      c.fill();
      c.stroke();

      // Wingtip strobe beacons
      const blink = Math.sin(now * 0.016) > 0;
      c.fillStyle = blink ? '#ff2a85' : '#00f0ff';
      c.shadowColor = c.fillStyle;
      c.shadowBlur = 8;
      c.fillRect(-20, 13, 3, 3);
      c.fillStyle = blink ? '#00f0ff' : '#ffe600';
      c.shadowColor = c.fillStyle;
      c.fillRect(17, 13, 3, 3);

      // 4. Main Fuselage (Stepped Titanium Hull)
      c.shadowColor = '#00f0ff';
      c.shadowBlur = 12;
      c.fillStyle = '#f8fafc';
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, -19);
      c.lineTo(4, -11);
      c.lineTo(6, 0);
      c.lineTo(6, 14);
      c.lineTo(-6, 14);
      c.lineTo(-6, 0);
      c.lineTo(-4, -11);
      c.closePath();
      c.fill();
      c.stroke();

      // Central Cyber Racing Stripe (Magenta #ff2a85)
      c.fillStyle = '#ff2a85';
      c.fillRect(-2, -13, 4, 27);

      // 5. Cockpit Glass Canopy (Glowing Cyan Gem Dome)
      c.shadowColor = '#00f0ff';
      c.shadowBlur = 8;
      c.fillStyle = '#00f0ff';
      c.beginPath();
      c.ellipse(0, -3, 3.5, 7, 0, 0, Math.PI * 2);
      c.fill();

      // Cockpit glare / reflection (white pixel glint)
      c.fillStyle = '#ffffff';
      c.fillRect(-1.5, -7, 2.5, 3);

      // 6. Engine Exhaust Nozzle Rim
      c.fillStyle = '#475569';
      c.fillRect(-5, 13, 10, 2);

      c.restore();
    }

    // ── Procedural Retro Pixel Art Asteroid Generator ────────────
    function createRetroPixelAsteroid(radius, veinType) {
      const pixelSize = radius > 60 ? 4 : 3;
      const gridRadius = Math.ceil(radius / pixelSize);
      const padding = 3;
      const gridW = (gridRadius + padding) * 2;
      const gridH = (gridRadius + padding) * 2;
      const cx = gridW / 2;
      const cy = gridH / 2;

      const offCanvas = document.createElement('canvas');
      offCanvas.width = gridW * pixelSize;
      offCanvas.height = gridH * pixelSize;
      const ctxOff = offCanvas.getContext('2d');
      ctxOff.imageSmoothingEnabled = false;

      // 1. Angular profile with craggy notches
      const numSlices = 14 + Math.floor(Math.random() * 6);
      const profile = [];
      for (let s = 0; s < numSlices; s++) {
        const variation = (Math.random() - 0.5) * (gridRadius * 0.44);
        const cleft = Math.random() < 0.28 ? (Math.random() - 0.5) * (gridRadius * 0.35) : 0;
        profile.push(Math.max(gridRadius * 0.64, gridRadius + variation + cleft));
      }

      function getRadAt(ang) {
        const norm = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const frac = (norm / (Math.PI * 2)) * numSlices;
        const idx1 = Math.floor(frac) % numSlices;
        const idx2 = (idx1 + 1) % numSlices;
        const t = frac - Math.floor(frac);
        const smoothT = t * t * (3 - 2 * t);
        return profile[idx1] * (1 - smoothT) + profile[idx2] * smoothT;
      }

      // 2. Impact craters
      const craterCount = radius > 60 ? Math.floor(Math.random() * 3) + 3 : (Math.floor(Math.random() * 2) + 2);
      const craters = [];
      for (let k = 0; k < craterCount; k++) {
        const cang = Math.random() * Math.PI * 2;
        const cdist = Math.random() * (gridRadius * 0.52);
        const crRadius = Math.max(2, Math.round(gridRadius * (Math.random() * 0.16 + 0.15)));
        craters.push({
          x: cx + Math.cos(cang) * cdist,
          y: cy + Math.sin(cang) * cdist,
          r: crRadius
        });
      }

      // 3. Glowing Mineral Vein clusters
      const veinPoints = [];
      if (veinType !== 'none') {
        const veinClusterCount = radius > 60 ? 2 : 1;
        for (let vc = 0; vc < veinClusterCount; vc++) {
          const vang = Math.random() * Math.PI * 2;
          const vdist = Math.random() * (gridRadius * 0.45);
          const vcx = Math.round(cx + Math.cos(vang) * vdist);
          const vcy = Math.round(cy + Math.sin(vang) * vdist);
          veinPoints.push({ x: (vcx - cx) * pixelSize, y: (vcy - cy) * pixelSize, gridX: vcx, gridY: vcy });
        }
      }

      // 4. Rasterize onto grid buffer
      const grid = new Uint8Array(gridW * gridH);
      for (let gy = 0; gy < gridH; gy++) {
        for (let gx = 0; gx < gridW; gx++) {
          const dx = gx - cx;
          const dy = gy - cy;
          const dist = Math.hypot(dx, dy);
          const ang = Math.atan2(dy, dx);
          const maxR = getRadAt(ang);
          if (dist <= maxR) {
            grid[gy * gridW + gx] = 1;
          }
        }
      }

      // 5. Detect outline pixels
      const isOutline = new Uint8Array(gridW * gridH);
      for (let gy = 0; gy < gridH; gy++) {
        for (let gx = 0; gx < gridW; gx++) {
          if (grid[gy * gridW + gx] === 1) {
            let edge = false;
            if (gx === 0 || gx === gridW - 1 || gy === 0 || gy === gridH - 1) {
              edge = true;
            } else {
              if (grid[gy * gridW + (gx - 1)] === 0 ||
                  grid[gy * gridW + (gx + 1)] === 0 ||
                  grid[(gy - 1) * gridW + gx] === 0 ||
                  grid[(gy + 1) * gridW + gx] === 0) {
                edge = true;
              }
            }
            if (edge) isOutline[gy * gridW + gx] = 1;
          }
        }
      }

      // 6. Retro 16-bit Palette
      const PALETTE = {
        outline: '#020617',
        highlightRim: '#94a3b8',
        specular: '#e2e8f0',
        highlight: '#94a3b8',
        midtone: '#475569',
        midtoneDark: '#334155',
        shadow: '#1e293b',
        deepShadow: '#090d16',
        craterFloor: '#070a12',
        craterRimLit: '#cbd5e1',
        craterRimShadow: '#020617'
      };

      const VEIN_COLORS = {
        cyan:    { core: '#ffffff', main: '#00f0ff', dark: '#0284c7', glow: '#00f0ff' },
        magma:   { core: '#fff1f2', main: '#ff2a85', dark: '#be185d', glow: '#ff2a85' },
        aurum:   { core: '#ffffff', main: '#ffe600', dark: '#d97706', glow: '#ffe600' },
        emerald: { core: '#f0fdf4', main: '#10b981', dark: '#047857', glow: '#10b981' }
      };

      const lx = -0.707;
      const ly = -0.707;

      for (let gy = 0; gy < gridH; gy++) {
        for (let gx = 0; gx < gridW; gx++) {
          const idx = gy * gridW + gx;
          if (grid[idx] === 0) continue;

          const dx = gx - cx;
          const dy = gy - cy;
          const dist = Math.hypot(dx, dy) || 0.001;
          const normX = dx / dist;
          const normY = dy / dist;
          const dot = -(normX * lx + normY * ly);

          // Outline
          if (isOutline[idx] === 1) {
            if (normX + normY < -0.35 && dot > 0.3) {
              ctxOff.fillStyle = PALETTE.highlightRim;
            } else {
              ctxOff.fillStyle = PALETTE.outline;
            }
            ctxOff.fillRect(gx * pixelSize, gy * pixelSize, pixelSize, pixelSize);
            continue;
          }

          // Crater check
          let inCrater = false;
          let craterDepth = 0;
          let isCraterRimLit = false;
          let isCraterRimShadow = false;

          for (let k = 0; k < craters.length; k++) {
            const cr = craters[k];
            const cdx = gx - cr.x;
            const cdy = gy - cr.y;
            const cdist = Math.hypot(cdx, cdy);
            if (cdist < cr.r) {
              inCrater = true;
              craterDepth = 1 - cdist / cr.r;
              if (cdist >= cr.r - 1.2) {
                if (cdy > 0 || cdx > 0) isCraterRimLit = true;
                else isCraterRimShadow = true;
              }
              break;
            }
          }

          if (inCrater) {
            if (isCraterRimLit) {
              ctxOff.fillStyle = PALETTE.craterRimLit;
            } else if (isCraterRimShadow) {
              ctxOff.fillStyle = PALETTE.craterRimShadow;
            } else if (craterDepth > 0.4) {
              ctxOff.fillStyle = PALETTE.craterFloor;
            } else {
              ctxOff.fillStyle = PALETTE.deepShadow;
            }
            ctxOff.fillRect(gx * pixelSize, gy * pixelSize, pixelSize, pixelSize);
            continue;
          }

          // Mineral Vein check
          let isVein = false;
          let isVeinCore = false;
          if (veinType !== 'none' && VEIN_COLORS[veinType]) {
            for (let vc = 0; vc < veinPoints.length; vc++) {
              const vp = veinPoints[vc];
              const vdx = Math.abs(gx - vp.gridX);
              const vdy = Math.abs(gy - vp.gridY);
              if (vdx === 0 && vdy === 0) {
                isVeinCore = true;
                isVein = true;
                break;
              } else if ((vdx <= 1 && vdy <= 1) || (vdx === 2 && vdy === 0) || (vdx === 0 && vdy === 2)) {
                if (Math.sin(gx * 7 + gy * 13) > -0.2) {
                  isVein = true;
                  break;
                }
              }
            }
          }

          if (isVein) {
            const vcols = VEIN_COLORS[veinType];
            ctxOff.fillStyle = isVeinCore ? vcols.core : (Math.random() > 0.3 ? vcols.main : vcols.dark);
            ctxOff.fillRect(gx * pixelSize, gy * pixelSize, pixelSize, pixelSize);
            continue;
          }

          // Shading & Dithering
          const dither = (gx + gy) % 2 === 0;
          let col = PALETTE.midtone;

          if (dot > 0.5) {
            col = (dot > 0.72 && dither) ? PALETTE.specular : PALETTE.highlight;
          } else if (dot > 0.22) {
            col = dither ? PALETTE.highlight : PALETTE.midtone;
          } else if (dot > -0.15) {
            const noise = (Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453) % 1;
            if (noise > 0.8) col = PALETTE.midtoneDark;
            else if (noise < -0.8) col = PALETTE.highlight;
            else col = PALETTE.midtone;
          } else if (dot > -0.45) {
            col = dither ? PALETTE.midtone : PALETTE.shadow;
          } else {
            col = (dot < -0.7 && dither) ? PALETTE.deepShadow : PALETTE.shadow;
          }

          ctxOff.fillStyle = col;
          ctxOff.fillRect(gx * pixelSize, gy * pixelSize, pixelSize, pixelSize);
        }
      }

      const veinColor = (veinType !== 'none' && VEIN_COLORS[veinType]) ? VEIN_COLORS[veinType].glow : null;

      return {
        spriteCanvas: offCanvas,
        spriteWidth: offCanvas.width,
        spriteHeight: offCanvas.height,
        pixelSize: pixelSize,
        veinPoints: veinPoints,
        veinColor: veinColor
      };
    }

    // ── Pixel Art Asteroid Renderer ───────────────────────────────
    function drawAsteroid(c, obs, now) {
      c.save();
      c.translate(obs.x, obs.y);
      c.rotate(obs.rotation);

      // 1. Atmosphere / Mineral Glow
      if (obs.vein !== 'none' && obs.veinColor) {
        const glowPulse = Math.sin(now * 0.005 + obs.pulse) * 4 + 14;
        c.shadowColor = obs.veinColor;
        c.shadowBlur = glowPulse;
      } else {
        c.shadowColor = 'rgba(0, 0, 0, 0.75)';
        c.shadowBlur = 12;
      }

      // 2. Draw Pre-rendered Pixel Art Sprite Canvas (Crisp Retro Nearest-Neighbor)
      c.imageSmoothingEnabled = false;
      c.drawImage(obs.spriteCanvas, -obs.spriteWidth / 2, -obs.spriteHeight / 2);

      // 3. Animated Retro Twinkle Glint on Mineral Vein
      if (obs.vein !== 'none' && obs.veinPoints && obs.veinPoints.length > 0) {
        const twinkle = Math.sin(now * 0.008 + obs.pulse * 3);
        if (twinkle > 0.45) {
          c.save();
          c.fillStyle = '#ffffff';
          c.shadowColor = obs.veinColor;
          c.shadowBlur = 8;
          const vp = obs.veinPoints[0];
          const px = vp.x;
          const py = vp.y;
          const ps = obs.pixelSize || 3;
          c.fillRect(px - ps, py, ps * 3, ps);
          c.fillRect(px, py - ps, ps, ps * 3);
          c.restore();
        }
      }

      c.restore();
    }

    // ── Pixel Art Celestial Collectibles (6 Star Types) ───────────
    function drawPixelStar(c, s, now) {
      c.save();
      c.translate(s.x, s.y);
      const pulse = Math.sin(now * 0.006 + s.phase) * 0.15 + 1.0;

      if (s.type === 'gold') {
        // ⭐ 1. Gold Star (8-bit Classic)
        c.shadowColor = '#ffe600';
        c.shadowBlur = 16;
        c.fillStyle = '#ffe600';
        c.scale(pulse, pulse);
        c.beginPath();
        for (let k = 0; k < 8; k++) {
          const a = (k * Math.PI) / 4;
          const r = (k % 2 === 0) ? s.radius : s.radius * 0.42;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (k === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.closePath();
        c.fill();

        // White pixel spark center
        c.fillStyle = '#ffffff';
        c.fillRect(-2, -2, 4, 4);

      } else if (s.type === 'diamond') {
        // 💎 2. Cyan Diamond (Faceted Octahedron)
        c.shadowColor = '#00f0ff';
        c.shadowBlur = 18;
        c.scale(pulse, pulse);

        c.fillStyle = '#00f0ff';
        c.beginPath();
        c.moveTo(0, -s.radius * 1.15);
        c.lineTo(s.radius * 0.95, 0);
        c.lineTo(0, s.radius * 1.15);
        c.lineTo(-s.radius * 0.95, 0);
        c.closePath();
        c.fill();

        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(0, -s.radius * 1.15);
        c.lineTo(0, s.radius * 1.15);
        c.moveTo(-s.radius * 0.95, 0);
        c.lineTo(s.radius * 0.95, 0);
        c.stroke();

        c.fillStyle = '#ffffff';
        c.fillRect(-2, -5, 3, 3);

      } else if (s.type === 'heart') {
        // 💖 3. Starlight Heart (8-bit Pixel Heart with Heal Pulse)
        c.shadowColor = '#ff2a85';
        c.shadowBlur = 18;
        const heartPulse = Math.sin(now * 0.01 + s.phase) * 0.18 + 1.0;
        c.scale(heartPulse, heartPulse);

        c.fillStyle = '#ff2a85';
        const pz = 2.4;
        const heartPixels = [
          [-2, -3], [-1, -3], [1, -3], [2, -3],
          [-3, -2], [-2, -2], [-1, -2], [0, -2], [1, -2], [2, -2], [3, -2],
          [-3, -1], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1],
          [-2, 0],  [-1, 0],  [0, 0],  [1, 0],  [2, 0],
          [-1, 1],  [0, 1],   [1, 1],
          [0, 2]
        ];
        heartPixels.forEach(([hx, hy]) => {
          c.fillRect(hx * pz, hy * pz, pz, pz);
        });

        // White reflection dot
        c.fillStyle = '#ffffff';
        c.fillRect(-2 * pz, -2 * pz, pz, pz);

      } else if (s.type === 'rainbow') {
        // 🌈 4. Hyper-Nova Prismatique (Rotating 8-Ray Star)
        const rainbowHue = (now * 0.25) % 360;
        const rainCol = `hsl(${rainbowHue}, 100%, 65%)`;
        c.shadowColor = rainCol;
        c.shadowBlur = 24;
        c.rotate(now * 0.003);

        for (let r = 0; r < 8; r++) {
          const ra = (r * Math.PI) / 4;
          const rayHue = (rainbowHue + r * 45) % 360;
          c.fillStyle = `hsl(${rayHue}, 100%, 70%)`;
          c.save();
          c.rotate(ra);
          c.fillRect(-2, -s.radius * 1.3, 4, s.radius * 1.3);
          c.restore();
        }

        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(0, 0, 4.5, 0, Math.PI * 2);
        c.fill();

      } else if (s.type === 'comet') {
        // ☄️ 5. Shooting Sapphire Comet (Fast drift with tail)
        c.shadowColor = '#38bdf8';
        c.shadowBlur = 18;

        // Crystal head
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(0, -s.radius);
        c.lineTo(s.radius * 0.7, 0);
        c.lineTo(0, s.radius * 1.2);
        c.lineTo(-s.radius * 0.7, 0);
        c.closePath();
        c.fill();

        c.fillStyle = '#00f0ff';
        c.fillRect(-2, -2, 4, 4);

        // Streaming tail particles backwards
        c.fillStyle = 'rgba(56, 189, 248, 0.75)';
        c.fillRect(-2, -s.radius - 5, 4, 6);
        c.fillStyle = 'rgba(0, 240, 255, 0.45)';
        c.fillRect(-1.5, -s.radius - 11, 3, 5);

      } else if (s.type === 'mote') {
        // ✨ 6. Fairy Starlight Mote (Cluster Spark)
        c.shadowColor = '#c084fc';
        c.shadowBlur = 12;
        c.fillStyle = '#e879f9';
        c.scale(pulse, pulse);

        c.fillRect(-4, -1, 8, 2);
        c.fillRect(-1, -4, 2, 8);
        c.fillStyle = '#ffffff';
        c.fillRect(-1, -1, 2, 2);
      }

      c.restore();
    }

    function startGame() {
      isRunning = true;
      isGameOver = false;
      score = 0;
      combo = 1;
      harmonie = 100;
      updateHarmonie(100);
      updateMuteUI(ZenAudio.isMuted());
      ZenAudio.startMusic();

      lastComboTime = performance.now();
      lastScoreTick = performance.now();
      lastRingSpawn = performance.now();
      lastStarSpawn = performance.now();
      lastObstacleSpawn = performance.now();
      shakeTimer = 0;
      shakeIntensity = 0;

      resizeCanvas();
      player.x = width / 2;
      player.y = height * 0.75;
      player.targetX = player.x;
      player.targetY = player.y;
      player.vx = 0;
      player.vy = 0;
      player.angle = 0;
      player.invulnerableTimer = 0;
      player.trail = [];
      player.particles = [];

      rings = [];
      stars = [];
      obstacles = [];
      floatingTexts = [];

      // Spawn a few initial friendly stars ahead
      for (let i = 0; i < 4; i++) {
        const initType = i % 2 === 0 ? 'gold' : 'diamond';
        stars.push({
          type: initType,
          x: Math.random() * (width - 140) + 70,
          y: Math.random() * (height * 0.45),
          radius: initType === 'diamond' ? 14 : 13,
          speed: 1.15,
          phase: Math.random() * Math.PI * 2,
          color: initType === 'diamond' ? '#00f0ff' : '#ffe600'
        });
      }

      if (scoreEl) scoreEl.textContent = '000000';
      if (comboBadge) comboBadge.hidden = true;
      if (gameOverCard) gameOverCard.hidden = true;
      updateHiScoreDisplay();

      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(gameLoop);
    }

    // ── Game Over Trigger (Cosmic Vessel Dissolution) ─────────────
    function triggerGameOver() {
      isGameOver = true;
      ZenAudio.playAsteroidHit();
      ZenAudio.stopMusic();

      // Space rocket explodes into glowing starship debris and pixel sparks
      for (let i = 0; i < 42; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5 + 1.5;
        player.particles.push({
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 5 + 3,
          color: ['#00f0ff', '#ff2a85', '#ffe600', '#ffffff', '#38bdf8'][Math.floor(Math.random() * 5)],
          life: 1.0,
          decay: Math.random() * 0.016 + 0.008
        });
      }

      const isNewRecord = score > hiScore;
      if (isNewRecord) {
        hiScore = score;
        localStorage.setItem('cinechroma_ball_hiscore', String(hiScore));
        updateHiScoreDisplay();
        ZenAudio.playRingPass();
      }

      if (gameOverScore) {
        gameOverScore.textContent = String(score).padStart(6, '0');
      }
      if (newRecordTag) {
        newRecordTag.hidden = !isNewRecord;
      }

      setTimeout(() => {
        if (gameOverCard && isGameOver) {
          gameOverCard.hidden = false;
        }
      }, 700);
    }

    // ── Spawners for the Chill Balade ─────────────────────────────
    // 1. Anneaux de Lumière (Celestial Rings to glide through)
    function spawnRing() {
      const radius = 54;
      rings.push({
        x: Math.random() * (width - radius * 2 - 80) + radius + 40,
        y: -radius - 20,
        radius: radius,
        innerRadius: 40,
        speed: 1.15,
        rotation: 0,
        rotSpeed: 0.01,
        passed: false,
        pulse: 0
      });
    }

    // 2. Étoiles & Joyaux Célestes (6 Star Types)
    function spawnStar() {
      const roll = Math.random();
      let type = 'gold';
      if (roll < 0.36) {
        type = 'gold';       // ⭐ Étoile Dorée classique (36%)
      } else if (roll < 0.56) {
        type = 'diamond';    // 💎 Diamant cybernétique (20%)
      } else if (roll < 0.69) {
        type = 'heart';      // 💖 Cœur stellaire soin (13%)
      } else if (roll < 0.77) {
        type = 'rainbow';    // 🌈 Hyper-Nova prismatique (8%)
      } else if (roll < 0.89) {
        type = 'comet';      // ☄️ Comète filante bleue (12%)
      } else {
        type = 'mote';       // ✨ Trio de poussières d'étoiles (11%)
      }

      if (type === 'mote') {
        // Spawn cluster of 3 dancing fairy motes
        const cx = Math.random() * (width - 160) + 80;
        const cy = -35;
        const offsets = [
          { ox: -16, oy: 0 },
          { ox: 16, oy: -10 },
          { ox: 0, oy: -22 }
        ];
        offsets.forEach(off => {
          stars.push({
            type: 'mote',
            x: cx + off.ox,
            y: cy + off.oy,
            radius: 9,
            speed: 1.35,
            phase: Math.random() * Math.PI * 2,
            color: '#c084fc'
          });
        });
        return;
      }

      let color = '#ffe600';
      let radius = 13;
      let speed = 1.25;

      if (type === 'diamond') {
        color = '#00f0ff';
        radius = 14;
        speed = 1.2;
      } else if (type === 'heart') {
        color = '#ff2a85';
        radius = 14;
        speed = 1.15;
      } else if (type === 'rainbow') {
        color = '#ffffff';
        radius = 16;
        speed = 1.1;
      } else if (type === 'comet') {
        color = '#38bdf8';
        radius = 13;
        speed = 1.8;
      }

      stars.push({
        type: type,
        x: Math.random() * (width - 120) + 60,
        y: -30,
        radius: radius,
        speed: speed,
        phase: Math.random() * Math.PI * 2,
        color: color
      });
    }

    // 3. Astéroïdes Pixel Art Rétro (Tailles Épiques & Cratères)
    function spawnObstacle() {
      const tierRoll = Math.random();
      let baseRadius = 32;
      let speedMult = 1.0;

      if (tierRoll < 0.32) {
        // Météore rapide craggy (élargi et plus massif)
        baseRadius = Math.random() * 8 + 30; // 30-38px (diamètre 60-76px)
        speedMult = 1.25;
      } else if (tierRoll < 0.80) {
        // Astéroïde moyen classique cratérisé
        baseRadius = Math.random() * 12 + 46; // 46-58px (diamètre 92-116px)
        speedMult = 1.0;
      } else {
        // Monolithe / Grand rocher cosmique géant
        baseRadius = Math.random() * 16 + 68; // 68-84px (diamètre 136-168px)
        speedMult = 0.76;
      }

      // Veine de minerai cyber / magma / aurum / émeraude
      const veinRoll = Math.random();
      let vein = 'none';
      if (veinRoll < 0.30) vein = 'cyan';
      else if (veinRoll < 0.55) vein = 'magma';
      else if (veinRoll < 0.75) vein = 'aurum';
      else if (veinRoll < 0.90) vein = 'emerald';

      // Génération de la texture sprite pixel-art procédurale rétro
      const spriteData = createRetroPixelAsteroid(baseRadius, vein);

      obstacles.push({
        x: Math.random() * (width - baseRadius * 2 - 100) + baseRadius + 50,
        y: -baseRadius * 2 - 40,
        radius: baseRadius,
        spriteCanvas: spriteData.spriteCanvas,
        spriteWidth: spriteData.spriteWidth,
        spriteHeight: spriteData.spriteHeight,
        pixelSize: spriteData.pixelSize,
        veinPoints: spriteData.veinPoints,
        veinColor: spriteData.veinColor,
        vein: vein,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.016,
        speedY: (1.1 + Math.random() * 0.3) * speedMult,
        speedX: (Math.random() - 0.5) * 0.35,
        pulse: Math.random() * Math.PI * 2
      });
    }

    // ── Main Update & Render Loop ─────────────────────────────────
    function gameLoop(now) {
      if (!isRunning) return;

      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        resizeCanvas();
      }

      // Calm, relaxed spawn cadence
      if (!isGameOver) {
        if (now - lastRingSpawn > 4200) {
          spawnRing();
          lastRingSpawn = now;
        }
        if (now - lastStarSpawn > 1800) {
          spawnStar();
          lastStarSpawn = now;
        }
        if (now - lastObstacleSpawn > 3200) {
          spawnObstacle();
          lastObstacleSpawn = now;
        }

        // Distance & score tick (calm steady progression)
        if (now - lastScoreTick > 120) {
          score += 5 * combo;
          if (scoreEl) scoreEl.textContent = String(score).padStart(6, '0');
          lastScoreTick = now;
        }

        // Élan decay (resets to 1 after 6 seconds of calm)
        if (combo > 1 && now - lastComboTime > 6000) {
          combo = 1;
          if (comboBadge) comboBadge.hidden = true;
        }

        // Keyboard steering
        const kbSpeed = 7.5;
        if (keys.ArrowUp || keys.KeyW)    player.targetY -= kbSpeed;
        if (keys.ArrowDown || keys.KeyS)  player.targetY += kbSpeed;
        if (keys.ArrowLeft || keys.KeyA)  player.targetX -= kbSpeed;
        if (keys.ArrowRight || keys.KeyD) player.targetX += kbSpeed;

        player.targetX = Math.max(player.radius + 15, Math.min(width - player.radius - 15, player.targetX));
        player.targetY = Math.max(player.radius + 60, Math.min(height - player.radius - 20, player.targetY));

        // Weightless floating lerp (dreamy and responsive)
        player.vx = (player.targetX - player.x) * 0.12;
        player.vy = (player.targetY - player.y) * 0.12;
        player.x += player.vx;
        player.y += player.vy;

        // Dynamic fluid orientation based on steering direction
        const speed = Math.hypot(player.vx, player.vy);
        const distToTarget = Math.hypot(player.targetX - player.x, player.targetY - player.y);
        let targetAngle = 0;

        if (distToTarget > 4 && speed > 0.22) {
          // Dynamic steering direction with natural forward cosmic flight bias
          const forwardBias = Math.max(0, 1.8 * (1 - speed / 4.8));
          const dirX = player.vx;
          const dirY = player.vy - forwardBias;
          targetAngle = Math.atan2(dirX, -dirY);
        } else {
          // Idle hovering: gently re-align upright with subtle cosmic sway
          targetAngle = Math.sin(now * 0.0018) * 0.035;
        }

        // Shortest-arc angular interpolation (never spins 360 when wrapping)
        let diff = targetAngle - player.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        // Consistent turn direction if facing exactly opposite
        if (Math.abs(Math.abs(diff) - Math.PI) < 0.05) {
          diff = (player.vx >= 0 ? 1 : -1) * (Math.PI - 0.02);
        }

        // Adaptive natural turn rate (snappy and responsive on input, smooth damping into alignment)
        const turnSpeed = speed > 0.4 ? Math.min(0.20, 0.11 + speed * 0.012) : 0.085;
        player.angle += diff * turnSpeed;

        if (player.invulnerableTimer > 0) {
          player.invulnerableTimer--;
        }

        // Animated rocket thruster sparks emitted at the engine nozzle
        const flameDist = 15;
        const tailDirX = -Math.sin(player.angle);
        const tailDirY = Math.cos(player.angle);
        const lateralX = -tailDirY;
        const lateralY = tailDirX;

        const exhaustX = player.x + tailDirX * flameDist;
        const exhaustY = player.y + tailDirY * flameDist;

        const flameSpeed = Math.random() * 2.6 + 2.4;
        const spread = (Math.random() - 0.5) * 1.5;

        player.particles.push({
          x: exhaustX + lateralX * spread * 2,
          y: exhaustY + lateralY * spread * 2,
          vx: tailDirX * flameSpeed + lateralX * spread - player.vx * 0.12,
          vy: tailDirY * flameSpeed + lateralY * spread - player.vy * 0.12,
          size: Math.random() * 2.8 + 2.0,
          color: Math.random() > 0.4 ? '#00f0ff' : (Math.random() > 0.5 ? '#ffe600' : '#ff2a85'),
          life: 0.75,
          decay: 0.045
        });

        // Soft cosmic stardust trail trailing behind engine
        player.hue = (player.hue + 1.5) % 360;
        player.trail.push({
          x: exhaustX + lateralX * (Math.random() - 0.5) * 4,
          y: exhaustY + lateralY * (Math.random() - 0.5) * 4,
          size: player.radius * 0.65,
          alpha: 0.5,
          color: `hsl(${player.hue}, 90%, 65%)`
        });
        if (player.trail.length > 20) player.trail.shift();
      }

      // ── Rendering & Canvas Clearing ─────────────────────────────
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Subtle screen ripple on bump
      if (shakeTimer > 0) {
        const sx = (Math.random() - 0.5) * shakeIntensity;
        const sy = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(sx, sy);
        shakeTimer--;
        shakeIntensity *= 0.88;
      }

      // 1. Draw Player Soft Stardust Trail
      for (let i = 0; i < player.trail.length; i++) {
        const t = player.trail[i];
        const progress = i / player.trail.length;
        ctx.save();
        ctx.globalAlpha = t.alpha * progress * 0.5;
        ctx.fillStyle = t.color;
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 14 * progress;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * progress, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Draw & Update Anneaux de Lumière (Celestial Rings)
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.y += r.speed;
        r.rotation += r.rotSpeed;
        r.pulse = (r.pulse + 0.04) % (Math.PI * 2);

        // Check player passing through the center of the ring
        if (!isGameOver && !r.passed) {
          const dist = Math.hypot(player.x - r.x, player.y - r.y);
          if (dist < r.innerRadius) {
            r.passed = true;
            combo = Math.min(combo + 1, 6);
            lastComboTime = now;
            const pts = 180 * combo;
            score += pts;
            updateHarmonie(harmonie + 12);
            ZenAudio.playRingPass();

            if (comboBadge && comboVal) {
              comboBadge.hidden = false;
              comboVal.textContent = combo;
            }

            // Expanding ring burst
            for (let p = 0; p < 18; p++) {
              const a = (p * Math.PI * 2) / 18;
              player.particles.push({
                x: r.x,
                y: r.y,
                vx: Math.cos(a) * 3,
                vy: Math.sin(a) * 3,
                size: 3.5,
                color: '#00f0ff',
                life: 1.0,
                decay: 0.02
              });
            }

            floatingTexts.push({
              x: player.x,
              y: player.y - 30,
              text: `+${pts} ANNEAU CÉLESTE`,
              color: '#00f0ff',
              alpha: 1.0,
              vy: -1.4
            });
          }
        }

        // Draw Celestial Ring
        ctx.save();
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rotation);

        const ringPulseSize = r.radius + Math.sin(r.pulse) * 3;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = r.passed ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 240, 255, 0.85)';
        ctx.lineWidth = 3;

        // Outer glow circle
        ctx.beginPath();
        ctx.arc(0, 0, ringPulseSize, 0, Math.PI * 2);
        ctx.stroke();

        // Inner fine golden ring
        ctx.strokeStyle = r.passed ? 'rgba(255, 230, 0, 0.2)' : 'rgba(255, 230, 0, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r.innerRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Luminous nodes on the ring
        if (!r.passed) {
          ctx.fillStyle = '#ffffff';
          for (let k = 0; k < 4; k++) {
            const na = (k * Math.PI) / 2;
            ctx.beginPath();
            ctx.arc(Math.cos(na) * ringPulseSize, Math.sin(na) * ringPulseSize, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();

        if (r.y > height + 80) rings.splice(i, 1);
      }

      // 3. Draw & Update Étoiles & Joyaux Célestes (6 Star Types with Magnetic Pull)
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.y += s.speed;
        s.x += Math.sin((now * 0.003) + s.phase) * 0.85;

        // Soft magnetic attraction towards player rocket when nearby
        if (!isGameOver) {
          const dx = player.x - s.x;
          const dy = player.y - s.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 100 && dist > 1) {
            s.x += (dx / dist) * 3.0;
            s.y += (dy / dist) * 3.0;
          }

          // Collection check
          if (dist < player.radius + s.radius) {
            ZenAudio.playStarPickup(s.type);

            let pts = 100 * combo;
            let starText = `+${pts} ★`;
            let txtColor = s.color || '#ffe600';

            if (s.type === 'gold') {
              combo = Math.min(combo + 1, 6);
              lastComboTime = now;
              pts = 100 * combo;
              score += pts;
              updateHarmonie(harmonie + 4);
              starText = `+${pts} ★ ÉTOILE`;
              txtColor = '#ffe600';
            } else if (s.type === 'diamond') {
              combo = Math.min(combo + 1, 6);
              lastComboTime = now;
              pts = 250 * combo;
              score += pts;
              updateHarmonie(harmonie + 6);
              starText = `+${pts} 💎 CRISTAL`;
              txtColor = '#00f0ff';
            } else if (s.type === 'heart') {
              combo = Math.min(combo + 1, 6);
              lastComboTime = now;
              pts = 150 * combo;
              score += pts;
              updateHarmonie(harmonie + 22);
              starText = `+${pts} 💖 COEUR +22%`;
              txtColor = '#ff2a85';
            } else if (s.type === 'rainbow') {
              combo = Math.min(combo + 2, 6); // Extra combo boost!
              lastComboTime = now;
              pts = 500 * combo;
              score += pts;
              updateHarmonie(harmonie + 15);
              player.invulnerableTimer = 90; // Temporary invulnerability
              starText = `+${pts} 🌈 HYPERNOVA! x${combo}`;
              txtColor = '#00f0ff';
            } else if (s.type === 'comet') {
              combo = Math.min(combo + 1, 6);
              lastComboTime = now;
              pts = 300 * combo;
              score += pts;
              updateHarmonie(harmonie + 8);
              starText = `+${pts} ☄️ COMÈTE`;
              txtColor = '#38bdf8';
            } else if (s.type === 'mote') {
              pts = 60 * combo;
              score += pts;
              updateHarmonie(harmonie + 2);
              starText = `+${pts} ✨ POUSSIÈRE`;
              txtColor = '#c084fc';
            }

            if (comboBadge && comboVal) {
              comboBadge.hidden = false;
              comboVal.textContent = combo;
            }

            // Burst particles matching star type
            const pCount = s.type === 'rainbow' ? 22 : (s.type === 'mote' ? 6 : 12);
            for (let p = 0; p < pCount; p++) {
              const a = Math.random() * Math.PI * 2;
              const sp = Math.random() * 3.5 + 1;
              player.particles.push({
                x: s.x,
                y: s.y,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp,
                size: Math.random() * 3 + 2,
                color: s.type === 'rainbow' ? ['#00f0ff', '#ffe600', '#ff2a85', '#a855f7'][Math.floor(Math.random() * 4)] : txtColor,
                life: 1.0,
                decay: 0.03
              });
            }

            floatingTexts.push({
              x: s.x,
              y: s.y - 18,
              text: starText,
              color: txtColor,
              alpha: 1.0,
              vy: -1.3
            });

            stars.splice(i, 1);
            continue;
          }
        }

        // Draw Pixel Star
        drawPixelStar(ctx, s, now);

        if (s.y > height + 40) stars.splice(i, 1);
      }

      // 4. Draw & Update Astéroïdes (Craggy Pixel-Art Asteroids with Craters & Veins)
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.y += obs.speedY;
        obs.x += obs.speedX;
        obs.rotation += obs.rotSpeed;
        obs.pulse = (obs.pulse + 0.03) % (Math.PI * 2);

        // Occasional retro cosmic dust shedding from large asteroids
        if (obs.radius > 50 && Math.random() < 0.15) {
          player.particles.push({
            x: obs.x + (Math.random() - 0.5) * (obs.radius * 0.8),
            y: obs.y - obs.radius * 0.5,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -Math.random() * 0.8 - 0.2,
            size: Math.random() * 2.0 + 1.5,
            color: '#475569',
            life: 0.6,
            decay: 0.04
          });
        }

        // Collision check with player rocket (scaled to craggy hitbox)
        if (!isGameOver) {
          const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
          if (dist < player.radius + obs.radius * 0.76 && player.invulnerableTimer <= 0) {
            updateHarmonie(harmonie - 25);
            player.invulnerableTimer = 65; // ~1.1s invulnerability with soft shield blink
            shakeTimer = obs.radius > 60 ? 14 : 10;
            shakeIntensity = obs.radius > 60 ? 12 : 8;
            ZenAudio.playAsteroidHit();

            // Soft pushback proportional to rock mass
            const angle = Math.atan2(player.y - obs.y, player.x - obs.x);
            const pushDist = obs.radius > 60 ? 55 : 40;
            player.targetX += Math.cos(angle) * pushDist;
            player.targetY += Math.sin(angle) * pushDist;

            // Explode jagged rocky pixel debris from the asteroid
            const debrisCount = obs.radius > 60 ? 24 : 16;
            const debrisColors = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'];
            if (obs.veinColor) debrisColors.push(obs.veinColor, '#ffffff');

            for (let rk = 0; rk < debrisCount; rk++) {
              const ra = Math.random() * Math.PI * 2;
              const rspd = Math.random() * 5.0 + 1.5;
              player.particles.push({
                x: obs.x,
                y: obs.y,
                vx: Math.cos(ra) * rspd,
                vy: Math.sin(ra) * rspd,
                size: Math.random() * 4.5 + 2.5,
                color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
                life: 0.9,
                decay: 0.035
              });
            }

            floatingTexts.push({
              x: player.x,
              y: player.y - 25,
              text: `-25% ASTÉROÏDE`,
              color: obs.veinColor || '#ff2a85',
              alpha: 1.0,
              vy: -1.2
            });
          }
        }

        // Draw Pixel Asteroid
        drawAsteroid(ctx, obs, now);

        if (obs.y > height + obs.radius * 2 + 50) obstacles.splice(i, 1);
      }

      // 5. Draw Player Space Rocket (Retro Pixel Ship with Delta Wings, Thrusters & Shield)
      if (!isGameOver) {
        drawPlayerRocket(ctx, player, now);
      }

      // 6. Draw & Update Particle Sparks
      for (let i = player.particles.length - 1; i >= 0; i--) {
        const p = player.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          player.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
      }

      // 7. Draw Floating Score / Chime Texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.02;

        if (ft.alpha <= 0) {
          floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(gameLoop);
    }

    // ── Bind Events ───────────────────────────────────────────────
    fabBtn.addEventListener('click', launchChromaBall);
    if (muteBtn) {
      muteBtn.addEventListener('click', handleMute);
      muteBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      muteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
      muteBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        handleMute(e);
      }, { passive: false });
    }
    if (quitBtn) {
      quitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exitChromaBall();
      });
      quitBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
      quitBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    }
    if (exitBtn) exitBtn.addEventListener('click', exitChromaBall);
    if (retryBtn) retryBtn.addEventListener('click', startGame);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

})();

/**
 * CineChroma - game.js
 * Logique métier autonome pour le mini-jeu "Devine le film"
 */

let allFilms = [];
let tiers = { tier1: [], tier2: [], tier3: [] };

let gameState = {
  currentRound: 1,
  totalRounds: 5,
  score: 0,
  history: [], // { film, isCorrect, hints }
  currentFilm: null,
  currentChoices: [],
  hintsUsed: 0,
  isAnswered: false
};

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  bindGameEvents();
  loadData();
});

function cacheDOM() {
  dom.bgPoster = document.getElementById('game-bg-poster');
  dom.roundCurrent = document.getElementById('game-round-current');
  dom.scoreCurrent = document.getElementById('game-score-current');
  dom.progressBar = document.getElementById('game-progress-bar');
  dom.palette = document.getElementById('game-palette');
  dom.hintBtn = document.getElementById('game-hint-btn');
  dom.hintsUsed = document.getElementById('game-hints-used');
  dom.hintDisplay = document.getElementById('game-hint-display');
  dom.revealInfo = document.getElementById('game-reveal-info');
  dom.revealTitle = document.getElementById('game-reveal-title');
  dom.revealMeta = document.getElementById('game-reveal-meta');
  dom.choices = document.getElementById('game-choices');
  dom.nextBtn = document.getElementById('game-next-btn');
  dom.difficulty = document.getElementById('game-difficulty');
  dom.hintsContainer = document.querySelector('.game-hints-section');
  
  dom.startScreen = document.getElementById('game-start-screen');
  dom.startBtn = document.getElementById('game-start-btn');
  
  dom.activeScreen = document.getElementById('game-active-screen');
  dom.endScreen = document.getElementById('game-end-screen');
  dom.endScoreVal = document.getElementById('game-end-score-val');
  dom.recapList = document.getElementById('game-recap-list');
  dom.replayBtn = document.getElementById('game-replay-btn');
  dom.toast = document.getElementById('toast');
}

function bindGameEvents() {
  dom.startBtn.addEventListener('click', startGameRound1);
  dom.nextBtn.addEventListener('click', handleNextRound);
  dom.hintBtn.addEventListener('click', useHint);
  dom.replayBtn.addEventListener('click', initGame);
}

async function loadData() {
  try {
    const urls = ['./films_part1.json', './films_part2.json', './films_part3.json'];
    const responses = await Promise.all(urls.map(url => fetch(url)));
    const dataParts = await Promise.all(responses.map(res => res.json()));
    const data = dataParts.flat();
    
    // Map affiches_globales to affiches for compatibility first!
    data.forEach(f => {
      if (!f.affiches && f.affiches_globales) {
        f.affiches = f.affiches_globales;
      }
    });

    // Filtrer les films valides avec une palette de 5 couleurs et une affiche, sans caractères asiatiques
    const cjkRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/;
    const validFilms = data.filter(f => 
      f.affiches && f.affiches.length > 0 && 
      f.affiches[0].palette && f.affiches[0].palette.length === 5 &&
      !cjkRegex.test(f.titre || f.titre_original)
    );

    // Trier par popularité descendante
    validFilms.sort((a, b) => (parseFloat(b.popularity) || 0) - (parseFloat(a.popularity) || 0));

    const total = validFilms.length;

    tiers.tier1 = validFilms.slice(0, 50); // Top 50 : Très facile / Populaire
    tiers.tier2 = validFilms.slice(50, 200); // 50-200 : Moyen
    tiers.tier3 = validFilms.slice(200); // 200+ : Difficile

    allFilms = validFilms;
    
    initGame();
  } catch (err) {
    console.error("Erreur de chargement des films :", err);
  }
}

function initGame() {
  if (!allFilms || allFilms.length === 0) {
    console.error('Aucune donnée film');
    return;
  }
  
  // Set a random background poster for the start screen
  const popularFilms = allFilms.filter(f => parseFloat(f.popularity) > 50);
  const randomBgFilm = popularFilms[Math.floor(Math.random() * popularFilms.length)] || allFilms[0];
  if (randomBgFilm && randomBgFilm.affiches && randomBgFilm.affiches.length > 0) {
    dom.bgPoster.src = randomBgFilm.affiches[0].affiche_original || randomBgFilm.affiches[0].affiche_w500;
    dom.bgPoster.style.setProperty('filter', 'blur(40px) brightness(0.4)', 'important');
  }

  dom.startScreen.style.opacity = '1';
  dom.startScreen.hidden = false;
  dom.activeScreen.hidden = true;
  dom.endScreen.hidden = true;
}

function startGameRound1() {
  dom.startScreen.style.transition = 'opacity 0.4s ease';
  dom.startScreen.style.opacity = '0';
  
  setTimeout(() => {
    dom.startScreen.hidden = true;
    dom.activeScreen.style.opacity = '0';
    dom.activeScreen.style.animation = 'fadeIn 0.5s ease forwards';
    dom.activeScreen.hidden = false;
    
    gameState = {
      score: 0,
      currentRound: 1,
      totalRounds: 5,
      history: [],
      hintsUsed: 0,
      currentFilm: null,
      currentChoices: [],
      isAnswered: false
    };
    
    initRound();
  }, 400);
}

function initRound() {
  gameState.isAnswered = false;
  gameState.hintsUsed = 0;
  
  // Sélectionner le film selon la manche
  let pool = [];
  if (gameState.currentRound <= 2) pool = tiers.tier1;
  else if (gameState.currentRound <= 4) pool = tiers.tier2;
  else pool = tiers.tier3;
  
  gameState.currentFilm = getRandomFilm(pool);
  const film = gameState.currentFilm;
  
  // UI Reset
  dom.bgPoster.src = film.affiches[0].affiche_original || film.affiches[0].affiche_w500;
  dom.bgPoster.style.filter = 'blur(40px) brightness(0.4)';
  document.querySelector('.game-bg-container').classList.remove('revealed');
  
  dom.hintBtn.disabled = false;
  dom.hintsUsed.textContent = '0';
  dom.hintDisplay.hidden = true;
  dom.hintDisplay.innerHTML = '';
  dom.hintsContainer.style.display = 'flex';
  
  dom.revealInfo.hidden = true;
  dom.nextBtn.hidden = true;
  
  updateTopBar();
  
  // Remplir la palette
  dom.palette.innerHTML = '';
  gameState.currentFilm.affiches[0].palette.forEach(p => {
    const swatch = document.createElement('div');
    swatch.className = 'game-swatch';
    swatch.style.backgroundColor = p.hex.startsWith('#') ? p.hex : '#' + p.hex;
    dom.palette.appendChild(swatch);
  });
  
  // Sélectionner 3 mauvais choix selon la difficulté
  const wrongChoices = [];
  let choicePool = allFilms;
  if (gameState.currentRound <= 2) choicePool = tiers.tier1;
  else if (gameState.currentRound <= 4) choicePool = [...tiers.tier1, ...tiers.tier2];
  
  while(wrongChoices.length < 3) {
    const r = getRandomFilm(choicePool);
    if (r.id !== gameState.currentFilm.id && !wrongChoices.includes(r)) {
      wrongChoices.push(r);
    }
  }
  
  gameState.currentChoices = [gameState.currentFilm, ...wrongChoices].sort(() => Math.random() - 0.5);
  
  // Afficher les boutons
  dom.choices.innerHTML = '';
  gameState.currentChoices.forEach(film => {
    const btn = document.createElement('button');
    btn.className = 'game-choice-btn';
    btn.textContent = film.titre || film.titre_original || 'Film inconnu';
    btn.onclick = () => handleAnswer(btn, film);
    dom.choices.appendChild(btn);
  });
}

function getRandomFilm(pool) {
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function updateTopBar() {
  dom.roundCurrent.textContent = gameState.currentRound;
  dom.scoreCurrent.textContent = gameState.score;
  
  if (gameState.currentRound <= 2) {
    dom.difficulty.textContent = t('game_difficulty_easy');
  } else if (gameState.currentRound <= 4) {
    dom.difficulty.textContent = t('game_difficulty_medium');
  } else {
    dom.difficulty.textContent = t('game_difficulty_hard');
  }
  
  const progress = ((gameState.currentRound - 1) / gameState.totalRounds) * 100;
  dom.progressBar.style.width = `${progress}%`;
}

function useHint() {
  if (gameState.hintsUsed >= 3 || gameState.isAnswered) return;
  
  gameState.hintsUsed++;
  dom.hintsUsed.textContent = gameState.hintsUsed;
  dom.hintDisplay.hidden = false;
  
  const film = gameState.currentFilm;
  
  const prefix = t('game_hint_prefix') + ` ${gameState.hintsUsed} :`;
  
  if (gameState.hintsUsed === 1) {
    const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : t('profile_unknown_year');
    const dir = film.realisateur || t('profile_unknown_director');
    
    let hintText = '';
    if (state.lang === 'ja') {
      hintText = `${year}年公開 • 監督: ${dir}`;
    } else if (state.lang === 'en') {
      hintText = `Released in ${year} • Directed by: ${dir}`;
    } else {
      hintText = `Sorti en ${year} • De : ${dir}`;
    }
    
    dom.hintDisplay.innerHTML += `<div><b>${prefix}</b> ${hintText}</div>`;
  }
  else if (gameState.hintsUsed === 2) {
    const genres = film.genres ? film.genres.map(g => translateGenre(g, state.lang)).join(', ') : (state.lang === 'ja' ? 'ミステリー映画' : 'Mystère');
    
    let hintText = '';
    if (state.lang === 'ja') {
      hintText = `ジャンル: ${genres}`;
    } else if (state.lang === 'en') {
      hintText = `Genres: ${genres}`;
    } else {
      hintText = `Genres : ${genres}`;
    }
    
    dom.hintDisplay.innerHTML += `<div><b>${prefix}</b> ${hintText}</div>`;
  }
  else if (gameState.hintsUsed === 3) {
    dom.hintBtn.disabled = true;
    dom.hintDisplay.innerHTML += `<div><b>${prefix}</b> ${t('game_hint_3_text')}</div>`;
    dom.bgPoster.style.setProperty('filter', 'blur(6px) brightness(0.7)', 'important');
  }
}

function handleAnswer(btnElement, chosenFilm) {
  if (gameState.isAnswered) return;
  gameState.isAnswered = true;
  
  const isCorrect = (chosenFilm.id === gameState.currentFilm.id);
  
  if (isCorrect) gameState.score++;
  
  // Enregistrer l'historique
  gameState.history.push({
    film: gameState.currentFilm,
    isCorrect: isCorrect,
    hints: gameState.hintsUsed
  });
  
  // Désactiver boutons
  const buttons = document.querySelectorAll('.game-choice-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === (gameState.currentFilm.titre || gameState.currentFilm.titre_original)) {
      btn.classList.add('correct');
    } else if (btn === btnElement && !isCorrect) {
      btn.classList.add('wrong');
    } else {
      btn.style.opacity = '0.4';
    }
  });
  
  // Mettre à jour l'UI (score + barre)
  dom.scoreCurrent.textContent = gameState.score;
  dom.progressBar.style.width = `${(gameState.currentRound / gameState.totalRounds) * 100}%`;
  
  // Cacher les indices pour faire de la place
  dom.hintsContainer.style.display = 'none';
  
  // Révéler le film
  const film = gameState.currentFilm;
  dom.bgPoster.src = film.affiches[0].affiche_original || film.affiches[0].affiche_w500;
  dom.bgPoster.style.setProperty('filter', 'blur(0px) brightness(0.9)', 'important');
  document.querySelector('.game-bg-container').classList.add('revealed');
  
  dom.revealTitle.textContent = film.titre || film.titre_original || t('profile_unknown_title');
  const year = film.date_sortie ? new Date(film.date_sortie).getFullYear() : t('profile_unknown_year');
  dom.revealMeta.textContent = `${film.realisateur || t('profile_unknown_director')} • ${year}`;
  dom.revealInfo.hidden = false;
  
  // Bouton suivant (ou terminer)
  if (gameState.currentRound < gameState.totalRounds) {
    dom.nextBtn.textContent = t('game_next_round');
  } else {
    dom.nextBtn.textContent = t('game_see_results');
  }
  dom.nextBtn.hidden = false;
}

function handleNextRound() {
  if (gameState.currentRound < gameState.totalRounds) {
    gameState.currentRound++;
    initRound();
  } else {
    showEndScreen();
  }
}

function showEndScreen() {
  dom.activeScreen.style.transition = 'opacity 0.4s ease';
  dom.activeScreen.style.opacity = '0';
  setTimeout(() => {
    dom.activeScreen.hidden = true;
    dom.endScreen.style.opacity = '0';
    dom.endScreen.style.animation = 'fadeIn 0.5s ease forwards';
    dom.endScreen.hidden = false;
    
    document.querySelector('.game-bg-container').classList.remove('revealed');
  
  dom.endScoreVal.textContent = gameState.score;
  dom.recapList.innerHTML = '';
  
  gameState.history.forEach((round, index) => {
    const item = document.createElement('div');
    item.className = 'game-recap-item';
    
    const statusClass = round.isCorrect ? 'recap-correct' : 'recap-wrong';
    
    const posterSrc = round.film.affiches[0].affiche_w500 || round.film.affiches[0].affiche_original;
    const title = round.film.titre || round.film.titre_original;
    
    let paletteHtml = '';
    round.film.affiches[0].palette.forEach(p => {
      paletteHtml += `<div class="recap-swatch" style="background-color: ${p.hex.startsWith('#')?p.hex:'#'+p.hex}"></div>`;
    });
    
    item.innerHTML = `
      <div class="recap-index">${index + 1}</div>
      <img src="${posterSrc}" alt="Affiche" class="recap-poster" />
      <div class="recap-info">
        <div class="recap-title ${statusClass}">${title}</div>
        <div class="recap-palette">${paletteHtml}</div>
        <div class="recap-hints">${t('game_hints_used_label')}${round.hints}</div>
      </div>
    `;
    
    dom.recapList.appendChild(item);
  });
  }, 400);
}





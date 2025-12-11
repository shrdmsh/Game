import { db, ref, push, onValue, update } from "./firebase.js";

let gameKey = null;
let questions = [];
let qIndex = -1;
let players = {};

async function loadQuestions() {
  const res = await fetch('questions.json');
  questions = await res.json();
}
await loadQuestions();

const playersList = document.getElementById('playersList');
const startBtn = document.getElementById('startBtn');
const nextQ = document.getElementById('nextQ');
const gameLinkEl = document.getElementById('gameLink');
const regen = document.getElementById('regen');
const currentQuestion = document.getElementById('currentQuestion');
const answersSummary = document.getElementById('answersSummary');
const leaderboardEl = document.getElementById('leaderboard');
const podium = document.getElementById('podium');

function genGame() {
  const gamesRef = ref(db, 'games');
  const newGameRef = push(gamesRef);
  gameKey = newGameRef.key;
  set(ref(db, `games/${gameKey}`), {
    created: Date.now(),
    state: 'lobby',
    questionIndex: -1
  });
  const url = `${location.origin}${location.pathname.replace(/index\.html$/,'') || '/'}player.html?game=${gameKey}`;
  gameLinkEl.textContent = url;
  drawQR(url);
  listenPlayers();
  listenGame();
}

regen.onclick = () => {
  // remove old and create new
  if (gameKey) {
    set(ref(db, `games/${gameKey}/closed`), true);
  }
  genGame();
};

function drawQR(text) {
  // use Google Chart API to draw qr on canvas
  const canvas = document.getElementById('qr');
  const size = 180;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(text)}`;
  img.onload = () => {
    ctx.fillStyle = "#0d0f12";
    ctx.fillRect(0,0,size,size);
    ctx.drawImage(img,0,0,size,size);
  };
}

function listenPlayers() {
  const playersRef = ref(db, `games/${gameKey}/players`);
  onValue(playersRef, snap => {
    players = snap.val() || {};
    renderPlayers();
  });
}

function renderPlayers() {
  playersList.innerHTML = '';
  Object.keys(players).forEach(pid => {
    const li = document.createElement('li');
    li.textContent = `${players[pid].name} — ${players[pid].score||0}`;
    playersList.appendChild(li);
  });
}

startBtn.onclick = async () => {
  if (!gameKey) return alert('Generate game first');
  await set(ref(db, `games/${gameKey}/state`), 'running');
  qIndex = -1;
  nextQuestion();
};

nextQ.onclick = () => nextQuestion();

async function nextQuestion() {
  qIndex++;
  if (qIndex >= questions.length) {
    finishGame();
    return;
  }
  const q = questions[qIndex];
  await set(ref(db, `games/${gameKey}/current`), {
    index: qIndex,
    text: q.text,
    choices: q.choices,
    startedAt: Date.now(),
    correct: q.answer
  });
  // clear previous answers
  await set(ref(db, `games/${gameKey}/answers`), {});
  // enable next button only after host processes results
  nextQ.disabled = true;
  currentQuestion.innerHTML = `<strong>${q.text}</strong>`;
  answersSummary.innerHTML = `Waiting for answers...`;
  // listen answers
  const answersRef = ref(db, `games/${gameKey}/answers`);
  onValue(answersRef, snap => {
    const a = snap.val() || {};
    answersSummary.innerHTML = `Answers: ${Object.keys(a).length}`;
  });
  // auto-finish question after 12s
  setTimeout(() => processAnswers(qIndex), 12000);
}

async function processAnswers(index) {
  // read answers and give points
  const dbRef = ref(db);
  const snap = await get(child(dbRef, `games/${gameKey}/answers`));
  const ans = snap.val() || {};
  // compute scoring: correct = 1000 - timeDelta (faster->more)
  for (const pid in players) {
    const p = players[pid];
    let add = 0;
    const myAns = ans[pid];
    if (myAns && myAns.choice === questions[index].answer) {
      // faster is better
      const dt = myAns.took || 5000;
      add = Math.max(50, 500 - Math.floor(dt/10));
    }
    await update(ref(db, `games/${gameKey}/players/${pid}`), { score: (p.score||0) + add });
  }
  // show summary
  const correct = questions[index].answer;
  answersSummary.innerHTML = `Processed. Correct: ${questions[index].choices[correct]}.`;
  nextQ.disabled = false;
  // update leaderboard
  updateLeaderboard();
}

async function updateLeaderboard() {
  const snap = await get(ref(db, `games/${gameKey}/players`));
  const data = snap.val() || {};
  const arr = Object.keys(data).map(k => ({ id: k, name: data[k].name, score: data[k].score||0 }));
  arr.sort((a,b) => b.score - a.score);
  leaderboardEl.innerHTML = '';
  arr.slice(0,10).forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.name} — ${p.score}`;
    leaderboardEl.appendChild(li);
  });
}

async function finishGame() {
  // mark finished
  await set(ref(db, `games/${gameKey}/state`), 'finished');
  // show podium
  const snap = await get(ref(db, `games/${gameKey}/players`));
  const data = snap.val() || {};
  const arr = Object.keys(data).map(k => ({ id: k, name: data[k].name, score: data[k].score||0 }));
  arr.sort((a,b) => b.score - a.score);
  document.getElementById('podium').classList.remove('hidden');
  leaderboardEl.innerHTML = '';
  arr.slice(0,10).forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.name} — ${p.score}`;
    leaderboardEl.appendChild(li);
  });
  // cleanup: close game after a while
}

function listenGame() {
  onValue(ref(db, `games/${gameKey}/players`), snap => {
    players = snap.val() || {};
    renderPlayers();
  });
}

document.getElementById('restart').onclick = () => {
  // regenerate full new game for next round
  genGame();
};

genGame();


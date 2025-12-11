// script-player.js
import { db } from './firebase.js';
import { ref, push, set, onValue, update, get, child } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const params = new URLSearchParams(location.search);
const gameId = params.get('game');

const joinBox = document.getElementById('joinBox');
const playerNameInput = document.getElementById('playerName');
const joinBtn = document.getElementById('joinBtn');
const joinStatus = document.getElementById('joinStatus');
const gameBox = document.getElementById('gameBox');
const questionText = document.getElementById('questionText');
const choicesDiv = document.getElementById('choices');
const roundInfo = document.getElementById('roundInfo');
const youStatus = document.getElementById('youStatus');
const finished = document.getElementById('finished');
const yourScore = document.getElementById('yourScore');

if (!gameId) {
  joinStatus.innerText = 'No game id in URL. Ask host to show QR.';
  joinBtn.disabled = true;
}

let myId = null;
let myName = null;

joinBtn.onclick = async () => {
  myName = (playerNameInput.value || '').trim();
  if (!myName) return joinStatus.innerText = 'Enter name';
  const playerRef = push(ref(db, `games/${gameId}/players`));
  myId = playerRef.key;
  await set(playerRef, { name: myName, score: 0 });
  joinStatus.innerText = 'Joined. Waiting...';
  joinBox.classList.add('hidden');
  gameBox.classList.remove('hidden');
  listenCurrent();
  listenLeaderboard();
};

function listenCurrent() {
  onValue(ref(db, `games/${gameId}/current`), snap => {
    const cur = snap.val();
    if (!cur) {
      questionText.innerText = 'Wait for host...';
      choicesDiv.innerHTML = '';
      return;
    }
    roundInfo.innerText = `Question ${cur.index+1}`;
    questionText.innerText = cur.text;
    choicesDiv.innerHTML = '';
    cur.choices.forEach((c,i) => {
      const b = document.createElement('button');
      b.classList.add('choice');
      b.textContent = c;
      b.onclick = () => submitAnswer(i);
      choicesDiv.appendChild(b);
    });
  });

  onValue(ref(db, `games/${gameId}/state`), snap => {
    const s = snap.val();
    if (s === 'finished') {
      gameBox.classList.add('hidden');
      finished.classList.remove('hidden');
      // show final score
      get(ref(db, `games/${gameId}/players/${myId}/score`)).then(snap => {
        yourScore.innerText = `Your score: ${snap.val() || 0}`;
      });
    }
  });
}

async function submitAnswer(choice) {
  const t0 = Date.now();
  // write answer
  await set(ref(db, `games/${gameId}/answers/${myId}`), { choice, time: Date.now(), took: 0 });
  youStatus.innerText = 'Answer sent';
  // update took value after small delay
  const curSnap = await get(ref(db, `games/${gameId}/current`));
  const cur = curSnap.val();
  const took = Date.now() - (cur.startedAt || Date.now());
  await update(ref(db, `games/${gameId}/answers/${myId}`), { took });
}

function listenLeaderboard() {
  onValue(ref(db, `games/${gameId}/players`), snap => {
    const p = snap.val() || {};
    if (myId && p[myId]) {
      youStatus.innerText = `Score: ${p[myId].score||0}`;
    }
  });
}

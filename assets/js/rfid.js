const firebaseConfig = {
  apiKey: "AIzaSyDteBUQcuTNazDitdmJ7i0lyiq6axCBD1A",
  authDomain: "itfest-solo.firebaseapp.com",
  databaseURL: "https://itfest-solo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "itfest-solo",
  storageBucket: "itfest-solo.firebasestorage.app",
  messagingSenderId: "131177808138",
  appId: "1:131177808138:web:b9eb392ee8c0ad16b07af3",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const rfidRef = database.ref("/pembacaan_rfid/huruf_terakhir");

const questions = [
  {
    q: "Siapakah Nabi terakhir yang diutus oleh Allah SWT sekaligus penutup para Nabi?",
    options: { A: "Nabi Ibrahim AS", B: "Nabi Musa AS", C: "Nabi Muhammad SAW", D: "Nabi Isa AS", E: "Nabi Nuh AS", F: "Nabi Adam AS" },
    ans: "C",
  },
  {
    q: "Ada berapakah jumlah Rukun Islam yang wajib diketahui oleh umat Muslim?",
    options: { A: "3 Perkara", B: "4 Perkara", C: "5 Perkara", D: "6 Perkara", E: "7 Perkara", F: "10 Perkara" },
    ans: "C",
  },
  {
    q: "Kitab suci Al-Qur'an diturunkan kepada Nabi Muhammad SAW melalui perantara malaikat...",
    options: { A: "Malaikat Mikail", B: "Malaikat Jibril", C: "Malaikat Israfil", D: "Malaikat Izrail", E: "Malaikat Munkar", F: "Malaikat Ridwan" },
    ans: "B",
  },
  {
    q: " Shalat wajib yang dilaksanakan pada waktu fajar sebelum matahari terbit adalah shalat...",
    options: { A: "Shalat Dzuhur", B: "Shalat Ashar", C: "Shalat Maghrib", D: "Shalat Isya", E: "Shalat Subuh", F: "Shalat Dhuha" },
    ans: "E",
  },
  {
    q: "Disebut apakah arah kiblat umat Muslim saat melaksanakan ibadah shalat?",
    options: { A: "Masjid Nabawi", B: "Masjid Al-Aqsa", C: "Masjid Kubah Batu", D: "Masjidil Haram (Ka'bah)", E: "Masjid Istiqlal", F: "Baitul Maqdis" },
    ans: "D",
  },
];

// Tambahkan properti history untuk menyimpan riwayat jawaban
let players = { 
    p1: { name: "", score: 0, history: [] }, 
    p2: { name: "", score: 0, history: [] } 
};
let currentTurn = "p1";
let questionIndex = 0;
let isGameOver = false;

function startGame() {
  players.p1.name = document.getElementById("p1-name").value || "Pemain 1";
  players.p2.name = document.getElementById("p2-name").value || "Pemain 2";
  document.getElementById("setup-container").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  showQuestion();
}

function showQuestion() {
  if (questionIndex >= questions.length * 2) {
    showResults();
    return;
  }

  const qData = questions[Math.floor(questionIndex / 2)];
  document.getElementById("current-player-name").innerText = players[currentTurn].name;
  document.getElementById("question-text").innerText = qData.q;

  let optionsHtml = "";
  for (let key in qData.options) {
    optionsHtml += `<li><strong>${key}:</strong> ${qData.options[key]}</li>`;
  }
  document.getElementById("options-list").innerHTML = optionsHtml;
}

rfidRef.on("value", (snapshot) => {
  const rfidInput = snapshot.val();

  if (!rfidInput || rfidInput === "") return;

  if (isGameOver || document.getElementById("quiz-container").style.display === "none") return;

  const qData = questions[Math.floor(questionIndex / 2)];

  // Reset database agar bisa menerima input yang sama lagi
  database.ref("/pembacaan_rfid/huruf_terakhir").set("");

  // Logika pengecekan dan penyimpanan riwayat
  const isCorrect = rfidInput === qData.ans;
  players[currentTurn].history.push({
    question: qData.q,
    playerAns: rfidInput,
    correctAns: qData.ans,
    status: isCorrect
  });

  if (isCorrect) {
    players[currentTurn].score += 20;
  }

  Swal.fire({
    title: "Jawaban Terkunci!",
    text: `Terima kasih ${players[currentTurn].name}, giliran berikutnya...`,
    icon: "info",
    timer: 1000,
    showConfirmButton: false,
    background: "#1e3c72",
    color: "#fff",
  }).then(() => {
    nextTurn();
  });
});

function nextTurn() {
  currentTurn = currentTurn === "p1" ? "p2" : "p1";
  questionIndex++;
  showQuestion();
}

function showResults() {
  isGameOver = true;
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("result-container").style.display = "block";

  const winner = players.p1.score > players.p2.score ? players.p1.name : players.p2.name;
  const isDraw = players.p1.score === players.p2.score;

  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

  // Generate tabel review jawaban untuk hasil akhir
  let reviewHtml = `<h3 style="margin-top:30px; color:#00d2ff;">Review Jawaban</h3>`;
  [players.p1, players.p2].forEach(p => {
    reviewHtml += `
      <div style="margin-bottom: 20px; text-align: left;">
        <h4 style="border-left: 4px solid #f1c40f; padding-left: 10px;">${p.name}</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-top: 10px;">
    `;
    p.history.forEach((h, i) => {
      reviewHtml += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <td style="padding: 8px;">S${i+1}</td>
          <td style="padding: 8px;">Pilih: ${h.playerAns}</td>
          <td style="padding: 8px; text-align: right;">${h.status ? '✅' : '❌ (Kunci: ' + h.correctAns + ')'}</td>
        </tr>`;
    });
    reviewHtml += `</table></div>`;
  });

  document.getElementById("final-scores").innerHTML = `
        <div style="font-size: 1.5rem; margin-bottom: 20px;">
            <p>${players.p1.name}: <span style="color:#00d2ff">${players.p1.score}</span></p>
            <p>${players.p2.name}: <span style="color:#00d2ff">${players.p2.score}</span></p>
        </div>
        <hr style="border: 0.5px solid rgba(255,255,255,0.2)">
        <h2 style="margin-top: 20px; color: #f1c40f;">
            ${isDraw ? "HASIL SERI!" : "🏆 PEMENANG: " + winner}
        </h2>
        <div style="max-height: 300px; overflow-y: auto; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 10px;">
            ${reviewHtml}
        </div>
    `;
}
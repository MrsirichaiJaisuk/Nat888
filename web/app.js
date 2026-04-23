// ===== DATA =====

const ITEMS = [
  { id: 1, name: "SKIN", sub: "SKIN",                  gem: "",   rarity: "common",    emoji: "🎮", img: "image/1.jpg", chance: 40.0 },
  { id: 2, name: "SKIN", sub: "SKIN",                  gem: "🥇", rarity: "uncommon",  emoji: "💪", img: "image/2.jpg", chance: 25.0 },
  { id: 3, name: "SKIN", sub: "SKIN",                  gem: "💎", rarity: "rare",      emoji: "💎", img: "image/3.jpg", chance: 15.0 },
  { id: 4, name: "SKIN", sub: "SKIN",                  gem: "💎", rarity: "common",    emoji: "💎", img: "image/4.jpg", chance: 8.0  },
  { id: 5, name: "SKIN", sub: "SKIN",                  gem: "💎", rarity: "epic",      emoji: "💎", img: "image/5.png", chance: 4.0  },
  { id: 6, name: "SKIN", sub: "SKIN",                  gem: "⭐", rarity: "legendary", emoji: "👑", img: "image/6.png", chance: 2.0  },
  { id: 7, name: "SKIN", sub: "SKIN",                  gem: "💎", rarity: "legendary", emoji: "💎", img: "image/7.png", chance: 0.8  },
  { id: 8, name: "SKIN", sub: "ไอดี Limited Edition",  gem: "🔥", rarity: "legendary", emoji: "🔥", img: "image/8.png", chance: 0.7  },
];

const RECENT_WINNERS = [
  { name: "ผู้ใช้ 8***2", prize: "💎 เพชร 68",      time: "17 ม.ค. 2568 เวลา 20:30" },
  { name: "ผู้ใช้ 1***5", prize: "💎 เพชร 172",     time: "13 ม.ค. 2568 เวลา 13:15" },
  { name: "ผู้ใช้ 3***9", prize: "💎 เพชร 310",     time: "17 ม.ค. 2568 เวลา 20:09" },
  { name: "ผู้ใช้ 7***1", prize: "ไอนัทเเปลงร่าง 🥇", time: "16 ม.ค. 2568 เวลา 18:44" },
  { name: "ผู้ใช้ 5***3", prize: "โดนบิดคมๆ 🥊",   time: "15 ม.ค. 2568 เวลา 11:20" },
];

// ===== CSGO CASE TRACK =====

const CARD_WIDTH = 146; // 140px + 6px gap
const VISIBLE_CARDS = 7; // จำนวนการ์ดที่เห็นในหน้าต่าง
const SPIN_CARD_COUNT = 60; // จำนวนการ์ดทั้งหมดใน track ตอน spin

function createCaseItem(item) {
  const el = document.createElement("div");
  el.className = "case-item";
  el.dataset.rarity = item.rarity;
  el.innerHTML = `
    <div class="case-item-box">
      <div class="box-bottom"></div>
      <img class="skin-img" src="${item.img}" alt="${item.name}" />
      <div class="box-lid"></div>
      <span class="rarity-badge rarity-${item.rarity}">${item.rarity}</span>
      <div class="case-item-label">${item.name}</div>
    </div>
  `;
  return el;
}

function buildTrack(winnerItem) {
  const track = document.getElementById("caseTrack");
  track.innerHTML = "";
  track.style.transform = "translateX(0px)";

  // สร้างการ์ดสุ่มเต็ม track + การ์ดผู้ชนะอยู่ตำแหน่งที่กำหนด
  const winnerIndex = SPIN_CARD_COUNT - 8; // หยุดใกล้ท้าย

  for (let i = 0; i < SPIN_CARD_COUNT; i++) {
    let item;
    if (i === winnerIndex) {
      item = winnerItem;
    } else {
      item = weightedRandom(ITEMS);
    }
    track.appendChild(createCaseItem(item));
  }

  return winnerIndex;
}

// ===== SOUND (Web Audio API — ไม่ต้องมีไฟล์เสียง) =====

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTick() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.06);
}

function playWin() {
  // เสียงชนะ — โน้ตขึ้น 3 ตัว
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
    gain.gain.setValueAtTime(0.0, audioCtx.currentTime + i * 0.15);
    gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + i * 0.15 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.4);
    osc.start(audioCtx.currentTime + i * 0.15);
    osc.stop(audioCtx.currentTime + i * 0.15 + 0.4);
  });
}

function resumeAudio() {
  if (audioCtx.state === "suspended") audioCtx.resume();
}



function weightedRandom(items) {
  const total = items.reduce((sum, i) => sum + i.chance, 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.chance;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

// ===== SPIN (CS:GO style) =====

let isSpinning = false;

function spin() {
  if (isSpinning) return;
  isSpinning = true;
  resumeAudio();

  const btn = document.getElementById("spinBtn");
  btn.disabled = true;
  btn.textContent = "🎰 กำลังสุ่ม...";

  const result = weightedRandom(ITEMS);
  const winnerIndex = buildTrack(result);

  const track = document.getElementById("caseTrack");

  const viewportWidth = track.parentElement.offsetWidth;
  const centerOffset = viewportWidth / 2 - CARD_WIDTH / 2;
  const jitter = (Math.random() - 0.5) * 80;
  const targetX = -(winnerIndex * CARD_WIDTH - centerOffset + jitter);

  const duration = 5000;
  const startTime = performance.now();
  const startX = 0;

  // ติดตามตำแหน่งการ์ดล่าสุดที่ผ่านกลาง (สำหรับเสียงติ๊ก)
  let lastCardIndex = -1;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animate(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(t);
    const currentX = startX + (targetX - startX) * eased;

    track.style.transform = `translateX(${currentX}px)`;

    // เสียงติ๊กทุกครั้งที่การ์ดใหม่ผ่านกลาง
    const centerCardIndex = Math.floor((-currentX + viewportWidth / 2) / CARD_WIDTH);
    if (centerCardIndex !== lastCardIndex) {
      lastCardIndex = centerCardIndex;
      // ยิ่งใกล้จบยิ่งเสียงต่ำลง (ช้าลง)
      if (t < 0.95) playTick();
    }

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      const cards = track.querySelectorAll(".case-item");
      const winnerCard = cards[winnerIndex];

      if (winnerCard) {
        // step 1: highlight กล่อง
        winnerCard.classList.add("winner");
        playWin();

        // step 2: หลัง 600ms ฝากล่องเปิด + สกินเด้งออก (CSS transition จัดการ)
        // step 3: หลัง 1800ms แสดง modal
        setTimeout(() => {
          showModal(result);
          addWinner(result);
          btn.disabled = false;
          btn.textContent = "🎰 สุ่มสินค้า";
          isSpinning = false;
        }, 1800);
      } else {
        playWin();
        setTimeout(() => {
          showModal(result);
          addWinner(result);
          btn.disabled = false;
          btn.textContent = "🎰 สุ่มสินค้า";
          isSpinning = false;
        }, 800);
      }
    }
  }

  requestAnimationFrame(animate);
}

document.getElementById("spinBtn").addEventListener("click", spin);

// ===== RENDER PRIZES =====

function getChanceClass(chance) {
  if (chance >= 30) return "chance-high";
  if (chance >= 10) return "chance-mid";
  if (chance >= 3)  return "chance-low";
  return "chance-rare";
}

function renderPrizes() {
  const grid = document.getElementById("prizesGrid");
  grid.innerHTML = "";
  ITEMS.forEach(item => {
    const row = document.createElement("div");
    row.className = "prize-row";
    row.innerHTML = `
      <div class="prize-img"><img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" /></div>
      <div class="prize-info">
        <div class="prize-name">${item.gem} ${item.name} ${item.gem}</div>
        <div class="prize-date">อัพเดทล่าสุด: 17 มกราคม 2568</div>
      </div>
      <div class="prize-chance ${getChanceClass(item.chance)}">${item.chance}%</div>
    `;
    grid.appendChild(row);
  });
}

// ===== RENDER WINNERS =====

function renderWinners() {
  const list = document.getElementById("winnersList");
  list.innerHTML = "";
  RECENT_WINNERS.forEach(w => {
    const row = document.createElement("div");
    row.className = "winner-row";
    row.innerHTML = `
      <div class="winner-avatar"><img src="image/10.png" alt="user" /></div>
      <div>
        <div class="winner-name">${w.name}</div>
        <div class="winner-prize">ได้รับ: ${w.prize}</div>
      </div>
      <div class="winner-time">${w.time}</div>
    `;
    list.appendChild(row);
  });
}

// ===== MODAL =====

function showModal(item) {
  document.getElementById("modalImg").src = item.img;
  document.getElementById("modalPrize").textContent = `${item.emoji} ${item.name}`;
  document.getElementById("modalOverlay").classList.add("show");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("show");
}

document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// ===== ADD WINNER =====

function addWinner(item) {
  const list = document.getElementById("winnersList");
  const now = new Date();
  const timeStr = `${now.getDate()} ม.ค. ${now.getFullYear() + 543} เวลา ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const row = document.createElement("div");
  row.className = "winner-row";
  row.innerHTML = `
    <div class="winner-avatar"><img src="image/10.png" alt="user" /></div>
    <div>
      <div class="winner-name">คุณ (ผู้เล่น)</div>
      <div class="winner-prize">ได้รับ: ${item.emoji} ${item.name}</div>
    </div>
    <div class="winner-time">${timeStr}</div>
  `;
  list.insertBefore(row, list.firstChild);
}

// ===== FAKE ACTIVITY =====

const FAKE_NAMES = [
  "ผู้ใช้ 2***4", "ผู้ใช้ 9***1", "ผู้ใช้ 6***7", "ผู้ใช้ 4***8",
  "ผู้ใช้ 3***2", "ผู้ใช้ 7***5", "ผู้ใช้ 1***9", "ผู้ใช้ 8***3",
  "ผู้ใช้ 5***6", "ผู้ใช้ 0***4", "ผู้ใช้ k***z", "ผู้ใช้ n***8",
  "ผู้ใช้ p***x", "ผู้ใช้ m***2", "ผู้ใช้ t***9", "ผู้ใช้ r***1",
  "ผู้ใช้ s***5", "ผู้ใช้ j***7", "ผู้ใช้ a***3", "ผู้ใช้ b***6",
];

function addFakeWinner() {
  const list = document.getElementById("winnersList");
  const fakeName = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
  const fakeItem = weightedRandom(ITEMS);
  const now = new Date();
  const timeStr = `${now.getDate()} ม.ค. ${now.getFullYear() + 543} เวลา ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const row = document.createElement("div");
  row.className = "winner-row";
  row.innerHTML = `
    <div class="winner-avatar"><img src="image/10.png" alt="user" /></div>
    <div>
      <div class="winner-name">${fakeName}</div>
      <div class="winner-prize">ได้รับ: ${fakeItem.emoji} ${fakeItem.name}</div>
    </div>
    <div class="winner-time">${timeStr}</div>
  `;
  list.insertBefore(row, list.firstChild);
  while (list.children.length > 15) list.removeChild(list.lastChild);
}

function scheduleFakeActivity() {
  const delay = Math.random() * 8000 + 4000;
  setTimeout(() => {
    addFakeWinner();
    scheduleFakeActivity();
  }, delay);
}

// ===== INIT =====

renderPrizes();
renderWinners();

// สร้าง track เริ่มต้น (แสดงการ์ดก่อนกด spin)
(function initTrack() {
  const track = document.getElementById("caseTrack");
  for (let i = 0; i < VISIBLE_CARDS + 2; i++) {
    track.appendChild(createCaseItem(weightedRandom(ITEMS)));
  }
})();

scheduleFakeActivity();

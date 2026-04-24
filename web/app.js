// ===== DATA =====

const ITEMS = [
  { id: 0, name: "พลาด!",          rarity: "empty",     emoji: "💨", img: "image/11.jpg", chance: 30.0, empty: true,  price: 0    },
  { id: 1, name: "SKIN Common",    rarity: "common",    emoji: "🎮", img: "image/1.jpg",  chance: 28.0, price: 29   },
  { id: 2, name: "SKIN Uncommon",  rarity: "uncommon",  emoji: "💪", img: "image/2.jpg",  chance: 18.0, price: 59   },
  { id: 3, name: "SKIN Rare",      rarity: "rare",      emoji: "💎", img: "image/3.jpg",  chance: 10.0, price: 99   },
  { id: 4, name: "SKIN Rare+",     rarity: "common",    emoji: "💎", img: "image/4.jpg",  chance: 6.0,  price: 149  },
  { id: 5, name: "SKIN Epic",      rarity: "epic",      emoji: "💎", img: "image/5.png",  chance: 4.0,  price: 299  },
  { id: 6, name: "SKIN Legendary", rarity: "legendary", emoji: "👑", img: "image/6.png",  chance: 2.0,  price: 599  },
  { id: 7, name: "SKIN Legend+",   rarity: "legendary", emoji: "💎", img: "image/7.png",  chance: 1.3,  price: 999  },
  { id: 8, name: "Limited Edition",rarity: "legendary", emoji: "🔥", img: "image/8.png",  chance: 0.7,  price: 1990 },
];

const RECENT_WINNERS = [
  { name: "นายสมชาย ใจดี",    prize: "💎 เพชร 68",         time: "17 ม.ค. 2568 เวลา 20:30" },
  { name: "น.ส.มินตรา สวยงาม", prize: "💎 เพชร 172",        time: "13 ม.ค. 2568 เวลา 13:15" },
  { name: "นายปิยะ โชคดี",    prize: "💎 เพชร 310",        time: "17 ม.ค. 2568 เวลา 20:09" },
  { name: "น.ส.แพรวา มีสุข",  prize: "ไอนัทแปลงร่าง 🥇",  time: "16 ม.ค. 2568 เวลา 18:44" },
  { name: "นายกิตติ เก่งมาก", prize: "โดนบิดคมๆ 🥊",      time: "15 ม.ค. 2568 เวลา 11:20" },
];

// ===== CSGO CASE TRACK =====

const CARD_WIDTH = 146; // 140px + 6px gap
const VISIBLE_CARDS = 7; // จำนวนการ์ดที่เห็นในหน้าต่าง
const SPIN_CARD_COUNT = 60; // จำนวนการ์ดทั้งหมดใน track ตอน spin

function createCaseItem(item) {
  const el = document.createElement("div");
  el.className = "case-item" + (item.empty ? " case-item-empty" : "");
  el.dataset.rarity = item.rarity;
  el.innerHTML = `
    <div class="case-item-box">
      <div class="box-bottom"></div>
      <img class="skin-img" src="${item.img}" alt="${item.name}" />
      <div class="box-lid"></div>
      <span class="rarity-badge rarity-${item.rarity}">${item.empty ? "MISS" : item.rarity}</span>
      <div class="case-item-label">${item.empty ? "💨 พลาด" : item.name}</div>
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
const SPIN_COST = 10;

function spin() {
  if (isSpinning) return;

  // เช็ค login
  const session = Auth.getSession();
  if (!session) {
    alert("กรุณาเข้าสู่ระบบก่อนสุ่มสินค้า");
    return;
  }

  // เช็คเครดิต
  const balance = Auth.getBalance(session.userId);
  if (balance < SPIN_COST) {
    alert(`เครดิตไม่พอ! ต้องการ ${SPIN_COST} เครดิต (คุณมี ${balance} เครดิต)\n\nกดปุ่ม "เติมเครดิต" ด้านล่าง`);
    return;
  }

  // หักเครดิต
  if (!Auth.deductCredits(session.userId, SPIN_COST)) {
    alert("เกิดข้อผิดพลาดในการหักเครดิต");
    return;
  }

  // อัปเดตแสดงผล
  if (typeof updateCreditsDisplay === "function") updateCreditsDisplay();

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
        if (result.empty) {
          winnerCard.classList.add("winner-empty");
          // เสียงพลาด — โน้ตลง
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.type = "sine"; osc.frequency.setValueAtTime(300, audioCtx.currentTime);
          osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.4);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.5);
        } else {
          playWin();
        }

        // step 2: หลัง 600ms ฝากล่องเปิด + สกินเด้งออก (CSS transition จัดการ)
        // step 3: หลัง 1800ms แสดง modal
        setTimeout(() => {
          showModal(result);
          addWinner(result);
          // บันทึกเข้ากระเป๋า
          if (!result.empty) {
            const s = Auth.getSession();
            if (s) {
              Auth.addToInventory(s.userId, result);
              updateInventoryBadge();
            }
          }
          btn.disabled = false;
          btn.textContent = "🎰 สุ่มสินค้า (10 เครดิต)";
          isSpinning = false;
          if (typeof updateCreditsDisplay === "function") updateCreditsDisplay();
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

// ===== INVENTORY BADGE =====
function updateInventoryBadge() {
  const s = Auth.getSession();
  if (!s) return;
  const count = Auth.getInventory(s.userId).length;
  const badge = document.getElementById("invBadge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

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
  ITEMS.filter(item => !item.empty).forEach(item => {
    const row = document.createElement("div");
    row.className = "prize-row";
    row.innerHTML = `
      <div class="prize-img"><img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" /></div>
      <div class="prize-info">
        <div class="prize-name">${item.emoji} ${item.name}</div>
        <div class="prize-rarity rarity-${item.rarity}">${item.rarity.toUpperCase()}</div>
      </div>
      <div class="prize-price-wrap">
        <div class="prize-price">฿${item.price.toLocaleString()}</div>
        <div class="prize-chance ${getChanceClass(item.chance)}">${item.chance}%</div>
      </div>
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
  if (item.empty) {
    // กล่องว่าง — แสดง modal พลาด
    document.getElementById("modalImg").src = "image/11.jpg";
    document.getElementById("modalImg").style.opacity = "0.35";
    document.getElementById("modalPrize").textContent = "💨 กล่องว่าง...";
    document.getElementById("modalPrize").style.color = "var(--muted)";
    document.querySelector(".modal-icon").textContent = "😢";
    document.querySelector(".modal-title").textContent = "พลาดแล้ว!";
    document.querySelector(".modal-title").style.color = "#ef5350";
    document.querySelector(".modal-sub").textContent = "โชคไม่ดีครั้งนี้ เอาใหม่นะ! 💪";
  } else {
    document.getElementById("modalImg").src = item.img;
    document.getElementById("modalImg").style.opacity = "1";
    document.getElementById("modalPrize").textContent = `${item.emoji} ${item.name}`;
    document.getElementById("modalPrize").style.color = "#fff";
    document.querySelector(".modal-icon").textContent = "🎉";
    document.querySelector(".modal-title").textContent = "ยินดีด้วย!";
    document.querySelector(".modal-title").style.color = "var(--gold)";
    document.querySelector(".modal-sub").textContent = "ติดต่อแอดมินเพื่อรับรางวัล";
  }
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
  if (item.empty) return; // ไม่บันทึกถ้าพลาด
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
  "นายวิชัย ทองดี",    "น.ส.ปาริชาต สดใส",  "นายธนกร มั่งมี",
  "น.ส.อรุณี แสงทอง",  "นายภูมิ ใจเย็น",    "น.ส.กานดา รักสนุก",
  "นายอนุชา โชคเลิศ",  "น.ส.นภา ฟ้าใส",    "นายสุรชัย เฮงๆ",
  "น.ส.มาลี หวานใจ",   "นายเอกชัย ดีงาม",   "น.ส.จิรา สุขสม",
  "นายพงษ์ศักดิ์ เด่น","น.ส.ลลิตา งามพร้อม","นายณัฐ ฉลาดเลิศ",
  "น.ส.ศิริพร มีโชค",  "นายกมล สบายดี",     "น.ส.วรรณา ยิ้มแย้ม",
  "นายประสิทธิ์ เก่ง", "น.ส.ดาว สว่างใจ",
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

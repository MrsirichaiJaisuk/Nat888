// ===== TOPUP PAGE JS =====

// Auth
const session = Auth.getSession();
if (session) {
  document.getElementById("navLogin").style.display = "none";
  document.getElementById("navRegister").style.display = "none";
  document.getElementById("userMenu").style.display = "flex";
  const nameEl = document.getElementById("userName");
  if (session.isAdmin) {
    nameEl.innerHTML = `${session.username} <span style="background:#e53935;color:#fff;font-size:10px;padding:1px 6px;border-radius:4px;font-weight:700;">ADMIN</span>`;
  } else {
    nameEl.textContent = session.username;
  }
  const bal = Auth.getBalance(session.userId);
  document.getElementById("userCredits").textContent = bal === Infinity ? "∞" : bal;

  // แสดง balance card
  const bc = document.getElementById("balanceCard");
  bc.style.display = "inline-flex";
  document.getElementById("balanceNum").textContent = bal === Infinity ? "∞" : bal;
}
document.getElementById("btnLogout")?.addEventListener("click", () => {
  Auth.logout(); location.href = "home.html";
});

// ===== PACKAGES =====
const PACKAGES = [
  { id: 1, icon: "💎",  credits: 10,   bonus: 0,  price: 10,  label: "Starter" },
  { id: 2, icon: "💎💎", credits: 50,  bonus: 5,  price: 45,  label: "Basic",   popular: false },
  { id: 3, icon: "👑",  credits: 100,  bonus: 20, price: 80,  label: "Popular", popular: true  },
  { id: 4, icon: "🔥",  credits: 200,  bonus: 50, price: 150, label: "Pro"      },
  { id: 5, icon: "⭐",  credits: 500,  bonus: 150,price: 350, label: "Elite"    },
  { id: 6, icon: "🏆",  credits: 1000, bonus: 400,price: 650, label: "Legend"   },
];

let selectedPkg = null;

function renderPackages() {
  const grid = document.getElementById("packagesGrid");
  grid.innerHTML = "";
  PACKAGES.forEach(pkg => {
    const total = pkg.credits + pkg.bonus;
    const card = document.createElement("div");
    card.className = "pkg-card";
    card.id = `pkg-${pkg.id}`;
    card.onclick = () => selectPackage(pkg);
    card.innerHTML = `
      ${pkg.popular ? '<div class="pkg-popular">🔥 ยอดนิยม</div>' : ""}
      <span class="pkg-icon">${pkg.icon}</span>
      <div class="pkg-credits">${total.toLocaleString()}</div>
      <div class="pkg-credits-label">เครดิต</div>
      ${pkg.bonus > 0 ? `<div class="pkg-bonus">+${pkg.bonus} โบนัส</div>` : '<div style="height:24px;margin-bottom:12px;"></div>'}
      <div class="pkg-price">฿${pkg.price}</div>
      <div class="pkg-price-label">${pkg.label}</div>
      <button class="pkg-select-btn">เลือกแพ็กเกจนี้</button>
    `;
    grid.appendChild(card);
  });
}

function selectPackage(pkg) {
  // reset
  document.querySelectorAll(".pkg-card").forEach(c => c.classList.remove("selected"));
  document.getElementById(`pkg-${pkg.id}`).classList.add("selected");
  selectedPkg = pkg;

  // แสดง payment section
  const paySection = document.getElementById("paymentSection");
  paySection.style.display = "block";
  paySection.scrollIntoView({ behavior: "smooth", block: "start" });

  // อัปเดต selected summary
  const total = pkg.credits + pkg.bonus;
  document.getElementById("selectedPkg").innerHTML = `
    <div class="selected-pkg-info">
      <span class="selected-pkg-icon">${pkg.icon}</span>
      <div>
        <div class="selected-pkg-name">${pkg.label} Package</div>
        <div class="selected-pkg-credits">💎 ${total.toLocaleString()} เครดิต${pkg.bonus > 0 ? ` (รวมโบนัส +${pkg.bonus})` : ""}</div>
      </div>
    </div>
    <div class="selected-pkg-price">฿${pkg.price}</div>
  `;

  // อัปเดต QR amount
  document.getElementById("qrAmount").textContent = `฿${pkg.price}`;
  generateQR(pkg.price);
}

// ===== QR CODE (simple pixel art — ไม่ต้องใช้ library) =====
function generateQR(amount) {
  const canvas = document.getElementById("qrCanvas");
  const ctx = canvas.getContext("2d");
  const size = 200;
  canvas.width = size;
  canvas.height = size;

  // วาด QR placeholder สวยๆ
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // corner squares
  const drawCorner = (x, y) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(x, y, 50, 50);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x+7, y+7, 36, 36);
    ctx.fillStyle = "#000";
    ctx.fillRect(x+14, y+14, 22, 22);
  };
  drawCorner(10, 10);
  drawCorner(140, 10);
  drawCorner(10, 140);

  // random dots (simulate QR data)
  ctx.fillStyle = "#000";
  const seed = amount * 7;
  for (let i = 0; i < 300; i++) {
    const rx = ((seed * (i+1) * 1103515245 + 12345) & 0x7fffffff) % 140 + 30;
    const ry = ((seed * (i+2) * 1664525 + 1013904223) & 0x7fffffff) % 140 + 30;
    if (rx > 70 || ry > 70) {
      ctx.fillRect(Math.floor(rx/7)*7, Math.floor(ry/7)*7, 6, 6);
    }
  }

  // NAT888 text กลาง
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(70, 80, 60, 40);
  ctx.fillStyle = "#e53935";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NAT888", 100, 96);
  ctx.fillStyle = "#555";
  ctx.font = "9px sans-serif";
  ctx.fillText(`฿${amount}`, 100, 110);
}

// ===== TABS =====
function switchTab(tab) {
  document.querySelectorAll(".pay-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".pay-content").forEach(c => c.style.display = "none");
  document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
  document.getElementById(`tab-${tab}`).style.display = "block";
}

// ===== SLIP PREVIEW =====
function previewSlip(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("slipPlaceholder").style.display = "none";
    const img = document.getElementById("slipPreview");
    img.src = ev.target.result;
    img.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// ===== CONFIRM PAYMENT =====
function confirmPayment() {
  if (!selectedPkg) {
    alert("กรุณาเลือกแพ็กเกจก่อน");
    return;
  }
  if (!session) {
    alert("กรุณาเข้าสู่ระบบก่อน");
    window.location.href = "login.html";
    return;
  }

  // Demo: เติมเครดิตทันที
  const total = selectedPkg.credits + selectedPkg.bonus;
  Auth.addCredits(session.userId, total);

  // อัปเดต balance แสดงผล
  const newBal = Auth.getBalance(session.userId);
  document.getElementById("userCredits").textContent = newBal === Infinity ? "∞" : newBal;
  document.getElementById("balanceNum").textContent = newBal === Infinity ? "∞" : newBal;

  // แสดง success modal
  document.getElementById("successOverlay").classList.add("show");

  // reset
  selectedPkg = null;
  document.querySelectorAll(".pkg-card").forEach(c => c.classList.remove("selected"));
  document.getElementById("paymentSection").style.display = "none";
  document.getElementById("slipPlaceholder").style.display = "flex";
  document.getElementById("slipPreview").style.display = "none";
  document.getElementById("slipPreview").src = "";
}

// ===== INIT =====
renderPackages();
generateQR(0);

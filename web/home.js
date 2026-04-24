// ===== HOME PAGE JS =====

// Auth check
const session = Auth.getSession();
if (session) {
  document.querySelector(".btn-login").style.display = "none";
  document.querySelector(".btn-register").style.display = "none";
  document.getElementById("userMenu").style.display = "flex";
  document.getElementById("userName").textContent = session.username;
}
document.getElementById("btnLogout")?.addEventListener("click", () => {
  Auth.logout();
  location.reload();
});

// ===== PRODUCTS DATA =====
const PRODUCTS = [
  { id: 1, name: "SKIN Common",    img: "image/1.jpg", rarity: "common",    chance: 28.0, price: 29   },
  { id: 2, name: "SKIN Uncommon",  img: "image/2.jpg", rarity: "uncommon",  chance: 18.0, price: 59   },
  { id: 3, name: "SKIN Rare",      img: "image/3.jpg", rarity: "rare",      chance: 10.0, price: 99   },
  { id: 4, name: "SKIN Rare+",     img: "image/4.jpg", rarity: "common",    chance: 6.0,  price: 149  },
  { id: 5, name: "SKIN Epic",      img: "image/5.png", rarity: "epic",      chance: 4.0,  price: 299  },
  { id: 6, name: "SKIN Legendary", img: "image/6.png", rarity: "legendary", chance: 2.0,  price: 599  },
  { id: 7, name: "SKIN Legend+",   img: "image/7.png", rarity: "legendary", chance: 1.3,  price: 999  },
  { id: 8, name: "Limited Edition",img: "image/8.png", rarity: "legendary", chance: 0.7,  price: 1990 },
];

const RARITY_COLOR = {
  common:    "#aaa",
  uncommon:  "#81c784",
  rare:      "#64b5f6",
  epic:      "#ce93d8",
  legendary: "#ffd700",
};

// ===== RENDER PRODUCTS =====
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  PRODUCTS.forEach(item => {
    const card = document.createElement("a");
    card.href = "index.html";
    card.className = "product-card";
    card.innerHTML = `
      <img class="product-img" src="${item.img}" alt="${item.name}" />
      <div class="product-body">
        <div class="product-rarity" style="color:${RARITY_COLOR[item.rarity]}">${item.rarity.toUpperCase()}</div>
        <div class="product-name">${item.name}</div>
        <div class="product-footer">
          <span class="product-price">฿${item.price.toLocaleString()}</span>
          <span class="product-chance">${item.chance}%</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll(".hero-stat-num").forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1800;
    const start = performance.now();
    function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (t < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(update);
  });
}

// ===== PARTICLES =====
function createParticles() {
  const container = document.getElementById("heroParticles");
  if (!container) return;
  const colors = ["#e53935", "#ffd700", "#ff9800", "#ce93d8", "#64b5f6"];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.className = "hero-particle";
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}

// ===== INTERSECTION OBSERVER (animate on scroll) =====
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".cat-card, .product-card, .step-card, .review-card").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
  });
}

// ===== INIT =====
renderProducts();
createParticles();
setupScrollAnimations();

// counter เริ่มเมื่อ hero เข้า viewport
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateCounters();
    heroObserver.disconnect();
  }
}, { threshold: 0.3 });
const heroEl = document.querySelector(".hero-stats");
if (heroEl) heroObserver.observe(heroEl);

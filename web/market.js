// ===== MARKET JS =====

const RARITY_COLOR = {
  common: '#aaa', uncommon: '#81c784', rare: '#64b5f6',
  epic: '#ce93d8', legendary: '#ffd700', empty: '#ef5350',
};

let currentTab = 'sale';
let sellType = 'sale';
let selectedInvItem = null;
let pendingLid = null;
let acceptRid = null;

// ===== AUTH INIT =====
const session = Auth.getSession();
if (session) {
  document.getElementById('navLogin').style.display = 'none';
  document.getElementById('navRegister').style.display = 'none';
  document.getElementById('userMenu').style.display = 'flex';
  const nameEl = document.getElementById('userName');
  if (session.isAdmin) {
    nameEl.innerHTML = `${session.username} <span style="background:#e53935;color:#fff;font-size:10px;padding:1px 6px;border-radius:4px;font-weight:700;">ADMIN</span>`;
  } else {
    nameEl.textContent = session.username;
  }
  const bal = Auth.getBalance(session.userId);
  document.getElementById('userCredits').textContent = bal === Infinity ? '∞' : bal;
}
document.getElementById('btnLogout')?.addEventListener('click', () => {
  Auth.logout(); location.href = 'home.html';
});

// ===== TABS =====
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.market-tab').forEach((t, i) => {
    t.classList.toggle('active', ['sale','mine','inbox','sent'][i] === tab);
  });
  renderContent();
}

function renderContent() {
  if (currentTab === 'sale')  renderListings();
  if (currentTab === 'mine')  renderMyListings();
  if (currentTab === 'inbox') renderInbox();
  if (currentTab === 'sent')  renderSent();
}

function emptyState(icon, text, sub) {
  return `<div class="market-empty"><div class="market-empty-icon">${icon}</div><div class="market-empty-text">${text}</div><div class="market-empty-sub">${sub}</div></div>`;
}

// ===== RENDER SALE LISTINGS =====
function renderListings() {
  const container = document.getElementById('listingsContainer');
  const items = Auth.getListings().filter(l => l.type === 'sale');
  if (items.length === 0) { container.innerHTML = emptyState('🏪', 'ยังไม่มีสินค้าในตลาด', 'มาเป็นคนแรกที่วางขายสิ!'); return; }
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'listings-grid';
  items.forEach(listing => {
    const isMine = session && listing.sellerId === session.userId;
    const d = new Date(listing.listedAt);
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <img class="listing-img" src="${listing.item.img}" alt="${listing.item.name}" />
      <div class="listing-body">
        <div class="listing-rarity" style="color:${RARITY_COLOR[listing.item.rarity]}">${listing.item.rarity.toUpperCase()}</div>
        <div class="listing-name">${listing.item.emoji} ${listing.item.name}</div>
        <div class="listing-seller">โดย ${listing.sellerName} · ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()+543}</div>
        <div class="listing-footer">
          <div class="listing-price">฿${listing.price.toLocaleString()}</div>
          ${isMine
            ? `<button class="btn-cancel-listing" onclick="cancelListing('${listing.lid}')">ยกเลิก</button>`
            : `<button class="btn-buy" onclick="openBuyModal('${listing.lid}')">ซื้อ</button>`}
        </div>
      </div>`;
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

// ===== RENDER MY LISTINGS =====
function renderMyListings() {
  const container = document.getElementById('listingsContainer');
  if (!session) { container.innerHTML = emptyState('🔒', 'กรุณาเข้าสู่ระบบ', ''); return; }
  const items = Auth.getListings().filter(l => l.sellerId === session.userId);
  if (items.length === 0) { container.innerHTML = emptyState('📦', 'ยังไม่มีสินค้าที่วางขาย', 'กดปุ่ม "วางขาย / แลก" เพื่อเริ่มต้น'); return; }
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'listings-grid';
  items.forEach(listing => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <img class="listing-img" src="${listing.item.img}" alt="${listing.item.name}" />
      <div class="listing-body">
        <div class="listing-rarity" style="color:${RARITY_COLOR[listing.item.rarity]}">${listing.item.rarity.toUpperCase()}</div>
        <div class="listing-name">${listing.item.emoji} ${listing.item.name}</div>
        <div class="listing-footer">
          <div class="listing-price">฿${listing.price.toLocaleString()}</div>
          <button class="btn-cancel-listing" onclick="cancelListing('${listing.lid}')">ยกเลิก</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

// ===== RENDER INBOX =====
function renderInbox() {
  const container = document.getElementById('listingsContainer');
  if (!session) { container.innerHTML = emptyState('🔒', 'กรุณาเข้าสู่ระบบ', ''); return; }
  const reqs = Auth.getTradeRequests(session.userId).filter(r => r.status === 'pending');
  if (reqs.length === 0) { container.innerHTML = emptyState('📬', 'ไม่มีคำขอแลกที่รอดำเนินการ', ''); return; }
  container.innerHTML = '';
  const list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column;gap:14px;';
  reqs.forEach(req => {
    const card = document.createElement('div');
    card.className = 'trade-req-card';
    card.innerHTML = `
      <div class="trade-req-from">
        <div class="trade-req-avatar">👤</div>
        <div>
          <div class="trade-req-name">${req.fromUsername}</div>
          <div class="trade-req-sub">ต้องการแลกกับคุณ</div>
        </div>
      </div>
      <div class="trade-req-items">
        <div class="trade-req-item">
          <img src="${req.fromItem.img}" alt="${req.fromItem.name}" />
          <div>${req.fromItem.emoji} ${req.fromItem.name}</div>
          <div style="font-size:10px;color:${RARITY_COLOR[req.fromItem.rarity]}">${req.fromItem.rarity.toUpperCase()}</div>
          <div style="font-size:11px;color:var(--muted);">${req.fromUsername} ส่งให้คุณ</div>
        </div>
      </div>
      <div class="trade-req-actions">
        <button class="btn-cancel-listing" onclick="rejectTrade('${req.rid}')">❌ ปฏิเสธ</button>
        <button class="btn-trade-accept" onclick="acceptTrade('${req.rid}')">✅ รับสกิน</button>
      </div>`;
    list.appendChild(card);
  });
  container.appendChild(list);
}

// ===== RENDER SENT =====
function renderSent() {
  const container = document.getElementById('listingsContainer');
  if (!session) { container.innerHTML = emptyState('🔒', 'กรุณาเข้าสู่ระบบ', ''); return; }
  const reqs = Auth.getSentRequests(session.userId);
  if (reqs.length === 0) { container.innerHTML = emptyState('📤', 'ยังไม่มีคำขอที่ส่งไป', ''); return; }
  container.innerHTML = '';
  const list = document.createElement('div');
  list.style.cssText = 'display:flex;flex-direction:column;gap:14px;';
  const statusMap = {
    pending:   { label: '⏳ รอการตอบรับ', color: '#ffa726' },
    accepted:  { label: '✅ ยอมรับแล้ว',  color: '#66bb6a' },
    rejected:  { label: '❌ ถูกปฏิเสธ',   color: '#ef5350' },
    cancelled: { label: '🚫 ยกเลิกแล้ว',  color: 'var(--muted)' },
  };
  reqs.forEach(req => {
    const st = statusMap[req.status] || statusMap.pending;
    const card = document.createElement('div');
    card.className = 'trade-req-card';
    card.innerHTML = `
      <div class="trade-req-from">
        <div class="trade-req-avatar">📤</div>
        <div>
          <div class="trade-req-name">ส่งถึง ${req.toUsername}</div>
          <div class="trade-req-sub" style="color:${st.color}">${st.label}</div>
        </div>
      </div>
      <div class="trade-req-items">
        <div class="trade-req-item">
          <img src="${req.fromItem.img}" alt="${req.fromItem.name}" />
          <div>${req.fromItem.emoji} ${req.fromItem.name}</div>
          <div style="font-size:11px;color:var(--muted);">สกินที่คุณส่งให้ ${req.toUsername}</div>
        </div>
      </div>
      ${req.status === 'pending' ? `<div class="trade-req-actions"><button class="btn-cancel-listing" onclick="cancelSentTrade('${req.rid}')">🚫 ยกเลิกคำขอ</button></div>` : ''}`;
    list.appendChild(card);
  });
  container.appendChild(list);
}

// ===== SELL MODAL =====
function openSellModal() {
  if (!session) { alert('กรุณาเข้าสู่ระบบก่อน'); return; }
  selectedInvItem = null;
  document.getElementById('sellPrice').value = '';
  document.getElementById('toUsername').value = '';
  document.getElementById('sellerGetPreview').textContent = '0';
  setSellType('sale');
  renderInvPicker('invPickerGrid');
  document.getElementById('sellOverlay').classList.add('show');
}
function closeSellModal() { document.getElementById('sellOverlay').classList.remove('show'); }

function setSellType(type) {
  sellType = type;
  document.getElementById('typeSale').classList.toggle('active', type === 'sale');
  document.getElementById('typeTrade').classList.toggle('active', type === 'trade');
  document.getElementById('saleFields').style.display = type === 'sale' ? 'block' : 'none';
  document.getElementById('tradeFields').style.display = type === 'trade' ? 'block' : 'none';
}

function renderInvPicker(gridId) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';
  if (!session) return;
  const inv = Auth.getInventory(session.userId);
  if (inv.length === 0) {
    grid.innerHTML = '<div style="color:var(--muted);font-size:13px;grid-column:1/-1;padding:12px;">กระเป๋าว่างเปล่า</div>';
    return;
  }
  inv.forEach(item => {
    const el = document.createElement('div');
    el.className = 'inv-picker-item';
    el.dataset.uid = item.uid;
    el.innerHTML = `<img src="${item.img}" alt="${item.name}" /><div class="picker-name">${item.name}</div>`;
    el.onclick = () => {
      grid.querySelectorAll('.inv-picker-item').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedInvItem = item;
    };
    grid.appendChild(el);
  });
}

document.getElementById('sellPrice').addEventListener('input', function() {
  const price = parseInt(this.value) || 0;
  document.getElementById('sellerGetPreview').textContent = (price - Math.floor(price * 0.05)).toLocaleString();
});

function confirmList() {
  if (!session) return;
  if (!selectedInvItem) { alert('กรุณาเลือกสกินก่อน'); return; }

  if (sellType === 'sale') {
    const price = parseInt(document.getElementById('sellPrice').value);
    if (!price || price < 1) { alert('กรุณาใส่ราคา'); return; }
    Auth.listForSale(session.userId, session.username, selectedInvItem, price);
    closeSellModal();
    switchTab('sale');
    alert(`✅ วางขาย "${selectedInvItem.name}" ราคา ${price} เครดิตแล้ว!`);
  } else {
    const toUser = document.getElementById('toUsername').value.trim();
    if (!toUser) { alert('กรุณาระบุชื่อผู้ใช้ที่ต้องการส่งสกินให้'); return; }
    const result = Auth.sendTradeRequest(session.userId, session.username, selectedInvItem, toUser);
    closeSellModal();
    if (result.success) {
      switchTab('sent');
      alert(`📤 ส่งสกิน "${selectedInvItem.name}" ให้ "${toUser}" แล้ว!\nรอให้เขายืนยันรับนะครับ`);
    } else {
      alert('❌ ' + result.message);
    }
  }
}

// ===== BUY MODAL =====
function openBuyModal(lid) {
  if (!session) { alert('กรุณาเข้าสู่ระบบก่อน'); return; }
  const listing = Auth.getListings().find(l => l.lid === lid);
  if (!listing) return;
  const bal = Auth.getBalance(session.userId);
  document.getElementById('buyIcon').textContent = '🛒';
  document.getElementById('buyTitle').textContent = 'ยืนยันการซื้อ';
  document.getElementById('buyTitle').style.color = 'var(--gold)';
  document.getElementById('buyContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;background:var(--dark3);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:16px;">
      <img src="${listing.item.img}" style="width:60px;height:60px;object-fit:cover;border-radius:10px;" />
      <div>
        <div style="font-size:15px;font-weight:700;color:#fff;">${listing.item.emoji} ${listing.item.name}</div>
        <div style="font-size:12px;color:${RARITY_COLOR[listing.item.rarity]};text-transform:uppercase;font-weight:700;">${listing.item.rarity}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px;">ขายโดย ${listing.sellerName}</div>
      </div>
    </div>
    <div style="font-size:14px;color:var(--muted);line-height:2.2;">
      ราคา: <strong style="color:var(--gold);font-size:18px;">฿${listing.price.toLocaleString()}</strong><br/>
      เครดิตของคุณ: <strong style="color:#fff;">${bal === Infinity ? '∞' : bal.toLocaleString()}</strong><br/>
      เครดิตหลังซื้อ: <strong style="color:${bal < listing.price ? '#ef5350' : '#66bb6a'};">${bal === Infinity ? '∞' : (bal - listing.price).toLocaleString()}</strong>
    </div>
    ${bal < listing.price ? '<div style="color:#ef5350;font-size:13px;margin-top:8px;">⚠️ เครดิตไม่พอ</div>' : ''}`;
  pendingLid = lid;
  const btn = document.getElementById('buyConfirmBtn');
  btn.textContent = `ซื้อเลย ฿${listing.price}`;
  btn.disabled = bal < listing.price;
  btn.onclick = () => executeBuy(lid);
  document.getElementById('buyOverlay').classList.add('show');
}
function closeBuyModal() { document.getElementById('buyOverlay').classList.remove('show'); pendingLid = null; }
function executeBuy(lid) {
  const result = Auth.buyListing(session.userId, session.username, lid);
  closeBuyModal();
  if (result.success) {
    const newBal = Auth.getBalance(session.userId);
    document.getElementById('userCredits').textContent = newBal === Infinity ? '∞' : newBal;
    renderListings();
    alert(`🎉 ซื้อสำเร็จ! ได้รับ "${result.item.name}"\nผู้ขายได้รับ ${result.sellerGet} เครดิต (หัก ${result.fee} ค่าธรรมเนียม 5%)`);
  } else {
    alert('❌ ' + result.message);
  }
}

// ===== ACCEPT TRADE =====
function acceptTrade(rid) {
  const req = Auth.getTradeRequests(session.userId).find(r => r.rid === rid);
  if (!req) return;
  if (!confirm(`รับสกิน "${req.fromItem.name}" จาก ${req.fromUsername}?`)) return;
  const result = Auth.acceptTradeRequest(session.userId, rid);
  if (result.success) {
    switchTab('inbox');
    alert(`✅ รับสกิน "${result.gotItem.name}" จาก ${req.fromUsername} แล้ว!\nสกินอยู่ในกระเป๋าของคุณแล้ว 🎒`);
  } else {
    alert('❌ ' + result.message);
  }
}

function rejectTrade(rid) {
  if (!confirm('ปฏิเสธคำขอแลกนี้?')) return;
  Auth.rejectTradeRequest(session.userId, rid);
  renderInbox();
  alert('❌ ปฏิเสธแล้ว สกินถูกคืนให้ผู้ส่ง');
}
function cancelSentTrade(rid) {
  if (!confirm('ยกเลิกคำขอแลกนี้? สกินจะกลับมาในกระเป๋าของคุณ')) return;
  Auth.cancelTradeRequest(session.userId, rid);
  renderSent();
  alert('✅ ยกเลิกแล้ว สกินกลับมาในกระเป๋าของคุณ');
}
function cancelListing(lid) {
  if (!confirm('ยกเลิกการวางขาย? สกินจะกลับมาในกระเป๋าของคุณ')) return;
  const ok = Auth.cancelListing(session.userId, lid);
  if (ok) { renderContent(); alert('✅ ยกเลิกแล้ว'); }
}

// ===== INIT =====
renderContent();

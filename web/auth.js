// ===== AUTH SYSTEM =====
// เก็บข้อมูลใน localStorage

// ===== ADMIN CONFIG =====
const ADMIN_ACCOUNTS = [
  { username: "admin", password: "1234", email: "admin@nat888.com" },
];

const Auth = {

  // เช็คว่าเป็น admin ไหม
  isAdmin(identifier) {
    return ADMIN_ACCOUNTS.some(a =>
      a.username.toLowerCase() === identifier?.toLowerCase() ||
      a.email.toLowerCase() === identifier?.toLowerCase()
    );
  },

  // เช็ค session ปัจจุบันว่าเป็น admin ไหม
  isAdminSession() {
    const s = this.getSession();
    return s?.isAdmin === true;
  },

  // ดึง users ทั้งหมด
  getUsers() {
    return JSON.parse(localStorage.getItem("nat888_users") || "[]");
  },

  // บันทึก users
  saveUsers(users) {
    localStorage.setItem("nat888_users", JSON.stringify(users));
  },

  // ดึง session ปัจจุบัน
  getSession() {
    return JSON.parse(localStorage.getItem("nat888_session") || "null");
  },

  // บันทึก session
  saveSession(user, isAdmin = false) {
    const session = {
      userId:   user.id,
      username: user.username,
      email:    user.email,
      isAdmin:  isAdmin,
      loginAt:  Date.now(),
    };
    localStorage.setItem("nat888_session", JSON.stringify(session));
    return session;
  },

  // ออกจากระบบ
  logout() {
    localStorage.removeItem("nat888_session");
  },

  // สมัครสมาชิก
  register({ username, email, phone, password }) {
    if (!username || username.length < 4) {
      return { success: false, message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร" };
    }
    if (username.length > 20) {
      return { success: false, message: "ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร" };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "รูปแบบอีเมลไม่ถูกต้อง" };
    }
    if (!password || password.length < 6) {
      return { success: false, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
    }

    const users = this.getUsers();

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: "ชื่อผู้ใช้นี้ถูกใช้แล้ว" };
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "อีเมลนี้ถูกใช้แล้ว" };
    }

    const newUser = {
      id:         Date.now().toString(),
      username,
      email,
      phone:      phone || "",
      password:   btoa(password), // encode อย่างง่าย (ไม่ใช่ hash จริง)
      createdAt:  Date.now(),
      balance:    0,
      spinCount:  0,
    };

    users.push(newUser);
    this.saveUsers(users);
    this.saveSession(newUser, false);

    return { success: true, user: newUser };
  },

  // เข้าสู่ระบบ
  login(identifier, password) {
    if (!identifier || !password) {
      return { success: false, message: "กรุณากรอกข้อมูลให้ครบ" };
    }

    // เช็ค admin ก่อน
    const adminMatch = ADMIN_ACCOUNTS.find(a =>
      (a.username.toLowerCase() === identifier.toLowerCase() ||
       a.email.toLowerCase() === identifier.toLowerCase()) &&
      a.password === password
    );
    if (adminMatch) {
      const adminUser = {
        id:       "admin",
        username: adminMatch.username,
        email:    adminMatch.email,
        balance:  Infinity,
      };
      this.saveSession(adminUser, true);
      return { success: true, user: adminUser, isAdmin: true };
    }

    const users = this.getUsers();
    const user = users.find(u =>
      u.username.toLowerCase() === identifier.toLowerCase() ||
      u.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      return { success: false, message: "ไม่พบบัญชีผู้ใช้นี้" };
    }
    if (user.password !== btoa(password)) {
      return { success: false, message: "รหัสผ่านไม่ถูกต้อง" };
    }

    this.saveSession(user, false);
    return { success: true, user };
  },

  // อัพเดทข้อมูล user
  updateUser(userId, data) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    users[index] = { ...users[index], ...data };
    this.saveUsers(users);
    return true;
  },

  // ดึง balance ของ user
  getBalance(userId) {
    if (this.isAdminSession()) return Infinity;
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    return user ? (user.balance || 0) : 0;
  },

  // หักเครดิต (คืน true ถ้าสำเร็จ)
  deductCredits(userId, amount) {
    if (this.isAdminSession()) return true; // admin ไม่หักเครดิต
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    if ((users[index].balance || 0) < amount) return false;
    users[index].balance -= amount;
    this.saveUsers(users);
    const session = this.getSession();
    if (session && session.userId === userId) {
      localStorage.setItem("nat888_session", JSON.stringify(session));
    }
    return true;
  },

  // เพิ่มเครดิต
  addCredits(userId, amount) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    users[index].balance = (users[index].balance || 0) + amount;
    this.saveUsers(users);
    return true;
  },

  // เพิ่ม spin count
  addSpin(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.spinCount = (user.spinCount || 0) + 1;
      this.saveUsers(users);
    }
  },

  // ===== INVENTORY =====
  getInventory(userId) {
    const key = `nat888_inv_${userId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },

  addToInventory(userId, item) {
    const key = `nat888_inv_${userId}`;
    const inv = this.getInventory(userId);
    inv.unshift({
      uid:      Date.now().toString(),
      id:       item.id,
      name:     item.name,
      img:      item.img,
      rarity:   item.rarity,
      emoji:    item.emoji,
      obtainAt: Date.now(),
    });
    localStorage.setItem(key, JSON.stringify(inv));
  },

  removeFromInventory(userId, uid) {
    const key = `nat888_inv_${userId}`;
    const inv = this.getInventory(userId).filter(i => i.uid !== uid);
    localStorage.setItem(key, JSON.stringify(inv));
  },

  // ===== TRADE REQUESTS (ส่งตรงถึง user) =====
  getTradeRequests(userId) {
    const key = `nat888_trades_${userId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },

  saveTradeRequests(userId, trades) {
    const key = `nat888_trades_${userId}`;
    localStorage.setItem(key, JSON.stringify(trades));
  },

  // ส่งสกินให้ user โดยตรง (รอยืนยัน)
  sendTradeRequest(fromId, fromUsername, fromItem, toUsername) {
    const users = this.getUsers();
    let toUser = users.find(u => u.username.toLowerCase() === toUsername.toLowerCase());

    // รองรับ admin account ที่ไม่ได้เก็บใน localStorage
    if (!toUser) {
      const adminAcc = ADMIN_ACCOUNTS.find(a => a.username.toLowerCase() === toUsername.toLowerCase());
      if (adminAcc) toUser = { id: "admin", username: adminAcc.username };
    }

    if (!toUser) return { success: false, message: `ไม่พบผู้ใช้ "${toUsername}"` };
    if (toUser.id === fromId) return { success: false, message: "ไม่สามารถส่งให้ตัวเองได้" };

    // ลบ item ออกจาก inventory ผู้ส่ง (hold ไว้)
    this.removeFromInventory(fromId, fromItem.uid);

    const req = {
      rid:          Date.now().toString(),
      fromId,
      fromUsername,
      fromItem:     { ...fromItem },
      toId:         toUser.id,
      toUsername:   toUser.username,
      status:       "pending",
      createdAt:    Date.now(),
    };

    // บันทึกใน inbox ของผู้รับ
    const inbox = this.getTradeRequests(toUser.id);
    inbox.unshift(req);
    this.saveTradeRequests(toUser.id, inbox);

    // บันทึกใน sent ของผู้ส่ง
    const sent = this.getSentRequests(fromId);
    sent.unshift(req);
    localStorage.setItem(`nat888_trades_${fromId}_sent`, JSON.stringify(sent));

    return { success: true, req };
  },

  getSentRequests(userId) {
    return JSON.parse(localStorage.getItem(`nat888_trades_${userId}_sent`) || "[]");
  },

  // ยอมรับ — รับสกินเข้า inventory เลย
  acceptTradeRequest(toId, rid) {
    const inbox = this.getTradeRequests(toId);
    const idx = inbox.findIndex(r => r.rid === rid && r.status === "pending");
    if (idx === -1) return { success: false, message: "ไม่พบคำขอนี้" };
    const req = inbox[idx];

    // โอน item ให้ผู้รับ
    this.addToInventory(toId, req.fromItem);

    // อัปเดตสถานะ
    inbox[idx].status = "accepted";
    this.saveTradeRequests(toId, inbox);

    // อัปเดต sent ของผู้ส่ง
    const sent = this.getSentRequests(req.fromId);
    const si = sent.findIndex(r => r.rid === rid);
    if (si !== -1) {
      sent[si].status = "accepted";
      localStorage.setItem(`nat888_trades_${req.fromId}_sent`, JSON.stringify(sent));
    }

    return { success: true, gotItem: req.fromItem };
  },

  // ปฏิเสธคำขอแลก
  rejectTradeRequest(toId, rid) {
    const inbox = this.getTradeRequests(toId);
    const idx = inbox.findIndex(r => r.rid === rid && r.status === "pending");
    if (idx === -1) return false;
    const req = inbox[idx];

    // คืน item ให้ผู้ส่ง
    this.addToInventory(req.fromId, req.fromItem);
    inbox[idx].status = "rejected";
    this.saveTradeRequests(toId, inbox);

    const sent = this.getSentRequests(req.fromId);
    const si = sent.findIndex(r => r.rid === rid);
    if (si !== -1) { sent[si].status = "rejected"; localStorage.setItem(`nat888_trades_${req.fromId}_sent`, JSON.stringify(sent)); }

    return true;
  },

  // ยกเลิกคำขอที่ส่งไป
  cancelTradeRequest(fromId, rid) {
    const sent = this.getSentRequests(fromId);
    const idx = sent.findIndex(r => r.rid === rid && r.status === "pending");
    if (idx === -1) return false;
    const req = sent[idx];

    // คืน item ให้ผู้ส่ง
    this.addToInventory(fromId, req.fromItem);
    sent[idx].status = "cancelled";
    localStorage.setItem(`nat888_trades_${fromId}_sent`, JSON.stringify(sent));

    // ลบออกจาก inbox ผู้รับ
    const inbox = this.getTradeRequests(req.toId);
    const ii = inbox.findIndex(r => r.rid === rid);
    if (ii !== -1) { inbox[ii].status = "cancelled"; this.saveTradeRequests(req.toId, inbox); }

    return true;
  },

  getListings() {
    return JSON.parse(localStorage.getItem("nat888_market") || "[]");
  },

  saveListings(listings) {
    localStorage.setItem("nat888_market", JSON.stringify(listings));
  },

  // วางขาย
  listForSale(userId, username, invItem, price) {
    const listings = this.getListings();
    // ลบออกจาก inventory ก่อน
    this.removeFromInventory(userId, invItem.uid);
    const listing = {
      lid:       Date.now().toString(),
      sellerId:  userId,
      sellerName: username,
      item:      { ...invItem },
      price:     price,
      type:      "sale",
      listedAt:  Date.now(),
    };
    listings.unshift(listing);
    this.saveListings(listings);
    return listing;
  },

  // ซื้อสินค้า
  buyListing(buyerId, buyerUsername, lid) {
    const listings = this.getListings();
    const idx = listings.findIndex(l => l.lid === lid && l.type === "sale");
    if (idx === -1) return { success: false, message: "ไม่พบสินค้านี้แล้ว" };
    const listing = listings[idx];
    if (listing.sellerId === buyerId) return { success: false, message: "ไม่สามารถซื้อสินค้าของตัวเองได้" };

    const bal = this.getBalance(buyerId);
    if (bal < listing.price) return { success: false, message: `เครดิตไม่พอ (ต้องการ ${listing.price} เครดิต)` };

    // หักเงินผู้ซื้อ
    this.deductCredits(buyerId, listing.price);
    // โอนเงินให้ผู้ขาย (หัก 5%)
    const fee = Math.floor(listing.price * this.MARKET_FEE);
    const sellerGet = listing.price - fee;
    this.addCredits(listing.sellerId, sellerGet);
    // โอน item ให้ผู้ซื้อ
    this.addToInventory(buyerId, listing.item);
    // ลบ listing
    listings.splice(idx, 1);
    this.saveListings(listings);
    return { success: true, item: listing.item, fee, sellerGet };
  },

  // ยกเลิกการขาย (คืน item)
  cancelListing(userId, lid) {
    const listings = this.getListings();
    const idx = listings.findIndex(l => l.lid === lid && l.sellerId === userId);
    if (idx === -1) return false;
    const listing = listings[idx];
    this.addToInventory(userId, listing.item);
    listings.splice(idx, 1);
    this.saveListings(listings);
    return true;
  },

  // วางแลก
  listForTrade(userId, username, invItem, wantItemName) {
    const listings = this.getListings();
    this.removeFromInventory(userId, invItem.uid);
    const listing = {
      lid:       Date.now().toString(),
      sellerId:  userId,
      sellerName: username,
      item:      { ...invItem },
      wantItem:  wantItemName,
      type:      "trade",
      listedAt:  Date.now(),
    };
    listings.unshift(listing);
    this.saveListings(listings);
    return listing;
  },

  // แลกสินค้า
  acceptTrade(buyerId, buyerUsername, lid, buyerInvItem) {
    const listings = this.getListings();
    const idx = listings.findIndex(l => l.lid === lid && l.type === "trade");
    if (idx === -1) return { success: false, message: "ไม่พบรายการแลกนี้แล้ว" };
    const listing = listings[idx];
    if (listing.sellerId === buyerId) return { success: false, message: "ไม่สามารถแลกกับตัวเองได้" };

    // ลบ item ของผู้แลกออกจาก inventory
    this.removeFromInventory(buyerId, buyerInvItem.uid);
    // โอน item ข้ามกัน
    this.addToInventory(buyerId, listing.item);
    this.addToInventory(listing.sellerId, buyerInvItem);
    // ลบ listing
    listings.splice(idx, 1);
    this.saveListings(listings);
    return { success: true, gotItem: listing.item, gaveItem: buyerInvItem };
  },
};

// ===== ALERT HELPER =====
function showAlert(message, type = "error") {
  const el = document.getElementById("alert");
  if (!el) return;
  el.textContent = message;
  el.className = "alert show " + type;
  setTimeout(() => el.classList.remove("show"), 4000);
}

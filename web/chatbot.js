// ===== NAT888 CHATBOT =====

const BOT_NAME = "น้องนัท 🤖";

// ===== คำตอบ =====
const BOT_RESPONSES = [
  // ทักทาย
  {
    patterns: ["สวัสดี", "หวัดดี", "ดีครับ", "ดีค่ะ", "hello", "hi", "เฮ้", "หวัด"],
    reply: "สวัสดีครับ! ยินดีต้อนรับสู่ NAT888 🎉\nมีอะไรให้ช่วยไหมครับ?\n\n• สอบถามสินค้า\n• วิธีสุ่มกล่อง\n• วิธีเติมเครดิต\n• ติดต่อแอดมิน"
  },
  // สุ่ม / กล่อง
  {
    patterns: ["สุ่ม", "กล่อง", "หมุน", "วงล้อ", "spin", "เปิดกล่อง"],
    reply: "🎰 วิธีสุ่มกล่อง:\n1. สมัครสมาชิก / เข้าสู่ระบบ\n2. เติมเครดิต (10 เครดิต/ครั้ง)\n3. กดปุ่ม 'สุ่มสินค้า'\n\nโอกาสได้รางวัล:\n🥇 Common — 28%\n💎 Rare — 10%\n👑 Legendary — 4%\n💨 พลาด — 30%"
  },
  // เครดิต / เติมเงิน
  {
    patterns: ["เครดิต", "เติมเงิน", "เติม", "ชำระ", "จ่าย", "โอน", "ราคา", "เท่าไหร่", "กี่บาท"],
    reply: "💰 วิธีเติมเครดิต:\nติดต่อแอดมินผ่าน\n• Line: @nat888\n• Facebook: NAT888 Shop\n\nอัตราแลกเปลี่ยน:\n💵 10 บาท = 10 เครดิต\n💵 50 บาท = 55 เครดิต (+5 โบนัส)\n💵 100 บาท = 120 เครดิต (+20 โบนัส)"
  },
  // สมัครสมาชิก
  {
    patterns: ["สมัคร", "register", "สร้างบัญชี", "บัญชี"],
    reply: "📝 วิธีสมัครสมาชิก:\n1. กดปุ่ม 'สมัครสมาชิก' มุมขวาบน\n2. กรอกชื่อผู้ใช้ (4-20 ตัวอักษร)\n3. กรอกอีเมลและรหัสผ่าน\n4. กด 'สมัครสมาชิก'\n\nสมัครฟรี! ไม่มีค่าใช้จ่าย ✅"
  },
  // login
  {
    patterns: ["login", "เข้าสู่ระบบ", "ล็อกอิน", "sign in", "เข้าใช้"],
    reply: "🔑 วิธีเข้าสู่ระบบ:\n1. กดปุ่ม 'เข้าสู่ระบบ' มุมขวาบน\n2. กรอกชื่อผู้ใช้หรืออีเมล\n3. กรอกรหัสผ่าน\n4. กด 'เข้าสู่ระบบ'\n\nลืมรหัสผ่าน? ติดต่อแอดมินได้เลยครับ"
  },
  // สินค้า / ไอดี / สกิน
  {
    patterns: ["สินค้า", "ไอดี", "สกิน", "skin", "item", "รางวัล", "ของรางวัล"],
    reply: "🎁 สินค้าในร้าน NAT888:\n• สกิน Common (28%)\n• สกิน Uncommon (18%)\n• สกิน Rare (10%)\n• สกิน Epic (4%)\n• สกิน Legendary (2%)\n• ไอดี Limited Edition (0.7%)\n\nดูรายละเอียดได้ที่ตาราง Prizes ด้านล่างครับ 👇"
  },
  // ติดต่อ / แอดมิน
  {
    patterns: ["ติดต่อ", "แอดมิน", "admin", "line", "facebook", "fb", "ช่วย", "support"],
    reply: "📞 ติดต่อแอดมิน:\n• Line: @nat888\n• Facebook: NAT888 Shop\n\n⏰ ตอบทุกวัน 09:00 - 23:00 น.\nแอดมินตอบไวมากครับ! 😊"
  },
  // ปัญหา / ไม่ได้รับ
  {
    patterns: ["ปัญหา", "ไม่ได้", "หาย", "error", "ผิดพลาด", "bug", "แจ้ง"],
    reply: "😟 ขอโทษที่เกิดปัญหานะครับ\nกรุณาติดต่อแอดมินพร้อมแจ้ง:\n1. ชื่อผู้ใช้ของคุณ\n2. วันเวลาที่เกิดปัญหา\n3. รายละเอียดปัญหา\n\n📞 Line: @nat888\nแอดมินจะรีบแก้ไขให้ครับ!"
  },
  // ขอบคุณ
  {
    patterns: ["ขอบคุณ", "thanks", "thank you", "ขอบใจ", "โอเค", "ok", "เข้าใจ"],
    reply: "ยินดีครับ! 😊\nมีอะไรสงสัยเพิ่มเติมถามได้เลยนะครับ\nขอให้โชคดีในการสุ่ม! 🍀"
  },
  // ลาก่อน
  {
    patterns: ["ลาก่อน", "บาย", "bye", "แล้วเจอกัน", "ออกไปแล้ว"],
    reply: "ลาก่อนครับ! 👋\nขอบคุณที่ใช้บริการ NAT888\nกลับมาใหม่ได้เสมอนะครับ 😊"
  },
];

const BOT_DEFAULT = "ขอโทษครับ ไม่เข้าใจคำถาม 😅\nลองถามใหม่ได้เลย หรือติดต่อแอดมินโดยตรงที่\n📞 Line: @nat888";

// ===== QUICK REPLIES =====
const QUICK_REPLIES = [
  "วิธีสุ่มกล่อง",
  "เติมเครดิต",
  "ติดต่อแอดมิน",
  "สมัครสมาชิก",
];

// ===== BUILD UI =====
function buildChatbot() {
  const el = document.createElement("div");
  el.id = "chatbotWidget";
  el.innerHTML = `
    <!-- ปุ่มเปิด -->
    <button class="chat-toggle" id="chatToggle" aria-label="เปิด chatbot">
      <span class="chat-toggle-icon">💬</span>
      <span class="chat-toggle-close" style="display:none;">✕</span>
      <span class="chat-badge" id="chatBadge">1</span>
    </button>

    <!-- หน้าต่าง chat -->
    <div class="chat-window" id="chatWindow">
      <div class="chat-header">
        <div class="chat-header-avatar">🤖</div>
        <div class="chat-header-info">
          <div class="chat-header-name">${BOT_NAME}</div>
          <div class="chat-header-status">● ออนไลน์</div>
        </div>
        <button class="chat-header-close" id="chatClose">✕</button>
      </div>

      <div class="chat-messages" id="chatMessages"></div>

      <div class="chat-quick" id="chatQuick"></div>

      <div class="chat-input-wrap">
        <input
          type="text"
          class="chat-input"
          id="chatInput"
          placeholder="พิมพ์ข้อความ..."
          maxlength="200"
          autocomplete="off"
        />
        <button class="chat-send" id="chatSend">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  // events
  document.getElementById("chatToggle").addEventListener("click", toggleChat);
  document.getElementById("chatClose").addEventListener("click", closeChat);
  document.getElementById("chatSend").addEventListener("click", sendMessage);
  document.getElementById("chatInput").addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  renderQuickReplies();
  // ข้อความต้อนรับ
  setTimeout(() => addBotMessage("สวัสดีครับ! ผมน้องนัท ผู้ช่วยของ NAT888 🎉\nมีอะไรให้ช่วยไหมครับ?"), 600);
}

// ===== TOGGLE =====
let chatOpen = false;

function toggleChat() {
  chatOpen ? closeChat() : openChat();
}

function openChat() {
  chatOpen = true;
  document.getElementById("chatWindow").classList.add("open");
  document.getElementById("chatToggle").querySelector(".chat-toggle-icon").style.display = "none";
  document.getElementById("chatToggle").querySelector(".chat-toggle-close").style.display = "block";
  document.getElementById("chatBadge").style.display = "none";
  document.getElementById("chatInput").focus();
}

function closeChat() {
  chatOpen = false;
  document.getElementById("chatWindow").classList.remove("open");
  document.getElementById("chatToggle").querySelector(".chat-toggle-icon").style.display = "block";
  document.getElementById("chatToggle").querySelector(".chat-toggle-close").style.display = "none";
}

// ===== MESSAGES =====
function addBotMessage(text) {
  const msgs = document.getElementById("chatMessages");
  const wrap = document.createElement("div");
  wrap.className = "chat-msg chat-msg-bot";
  wrap.innerHTML = `
    <div class="chat-msg-avatar">🤖</div>
    <div class="chat-msg-bubble">${text.replace(/\n/g, "<br/>")}</div>
  `;
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function addUserMessage(text) {
  const msgs = document.getElementById("chatMessages");
  const wrap = document.createElement("div");
  wrap.className = "chat-msg chat-msg-user";
  wrap.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTyping() {
  const msgs = document.getElementById("chatMessages");
  const wrap = document.createElement("div");
  wrap.className = "chat-msg chat-msg-bot chat-typing";
  wrap.id = "chatTyping";
  wrap.innerHTML = `
    <div class="chat-msg-avatar">🤖</div>
    <div class="chat-msg-bubble">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  `;
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  document.getElementById("chatTyping")?.remove();
}

// ===== SEND =====
function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  addUserMessage(text);
  addTyping();

  setTimeout(() => {
    removeTyping();
    const reply = getReply(text);
    addBotMessage(reply);
  }, 800 + Math.random() * 400);
}

// ===== GET REPLY =====
function getReply(text) {
  const lower = text.toLowerCase();
  for (const item of BOT_RESPONSES) {
    if (item.patterns.some(p => lower.includes(p.toLowerCase()))) {
      return item.reply;
    }
  }
  return BOT_DEFAULT;
}

// ===== QUICK REPLIES =====
function renderQuickReplies() {
  const wrap = document.getElementById("chatQuick");
  wrap.innerHTML = "";
  QUICK_REPLIES.forEach(q => {
    const btn = document.createElement("button");
    btn.className = "chat-quick-btn";
    btn.textContent = q;
    btn.addEventListener("click", () => {
      document.getElementById("chatInput").value = q;
      sendMessage();
    });
    wrap.appendChild(btn);
  });
}

// ===== INIT =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", buildChatbot);
} else {
  buildChatbot();
}

// ===== NAV HELPER =====
// ถ้ารันบน localhost ใช้ .html, ถ้าบน Vercel ใช้ clean URL
const isLocal = location.hostname === '127.0.0.1' || location.hostname === 'localhost';

const NAV_LINKS = {
  home:     isLocal ? 'home.html'     : '/',
  spin:     isLocal ? 'index.html'    : '/spin',
  topup:    isLocal ? 'topup.html'    : '/topup',
  market:   isLocal ? 'market.html'   : '/market',
  login:    isLocal ? 'login.html'    : '/login',
  register: isLocal ? 'register.html' : '/register',
};

// แก้ลิงก์ทุกอันใน navbar อัตโนมัติ
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-nav]').forEach(el => {
    const key = el.dataset.nav;
    if (NAV_LINKS[key]) {
      if (el.tagName === 'A') el.href = NAV_LINKS[key];
      else el.onclick = () => location.href = NAV_LINKS[key];
    }
  });
});

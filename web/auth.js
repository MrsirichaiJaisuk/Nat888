// ===== AUTH SYSTEM =====
// เก็บข้อมูลใน localStorage

const Auth = {

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
  saveSession(user) {
    const session = {
      userId:   user.id,
      username: user.username,
      email:    user.email,
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
    this.saveSession(newUser);

    return { success: true, user: newUser };
  },

  // เข้าสู่ระบบ
  login(identifier, password) {
    if (!identifier || !password) {
      return { success: false, message: "กรุณากรอกข้อมูลให้ครบ" };
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

    this.saveSession(user);
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

  // เพิ่ม spin count
  addSpin(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.spinCount = (user.spinCount || 0) + 1;
      this.saveUsers(users);
    }
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

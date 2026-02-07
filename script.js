// ------------------------------
// КОНСТАНТЫ
// ------------------------------

// Секретное слово для входа как админ (на реальном проекте должно проверяться на сервере)
const ADMIN_KEY = "ADMIN123";

// ------------------------------
// DEFAULT MENU DATA
// ------------------------------
const DEFAULT_MENU = [
  { id: 1, name: "Classic Pancakes", category: "Sweet", price: 1500, image: "pancake.png" },
  { id: 2, name: "Chocolate Dream", category: "Sweet", price: 1800, image: "pancake.png" },
  { id: 3, name: "Strawberry Heaven", category: "Sweet", price: 1700, image: "pancake.png" },
  { id: 4, name: "Cheese & Ham", category: "Salty", price: 1900, image: "pancake.png" },
  { id: 5, name: "Vegan Berry Mix", category: "Vegan", price: 2000, image: "pancake.png" },
  { id: 6, name: "Banana Caramel", category: "Sweet", price: 1850, image: "pancake.png" }
];

// ------------------------------
// LOCALSTORAGE (MENU)
// ------------------------------

function loadMenu() {
  const raw = localStorage.getItem("qt_menu");
  if (!raw) return DEFAULT_MENU.slice();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MENU.slice();
    return parsed;
  } catch {
    return DEFAULT_MENU.slice();
  }
}

function saveMenu(menu) {
  localStorage.setItem("qt_menu", JSON.stringify(menu));
}

// ------------------------------
// LOCALSTORAGE (CURRENT USER)
// ------------------------------

function loadUser() {
  const raw = localStorage.getItem("qt_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("qt_user", JSON.stringify(user));
}

// ------------------------------
// LOCALSTORAGE (REGISTERED USERS)
// ------------------------------

function loadUsers() {
  const raw = localStorage.getItem("qt_users");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem("qt_users", JSON.stringify(users));
}

// ------------------------------
// THEME
// ------------------------------

function applyTheme(theme) {
  const value = theme === "dark" ? "dark" : "light";
  document.body.setAttribute("data-theme", value);
  localStorage.setItem("qt_theme", value);
}

function setupThemeToggle() {
  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  const saved = localStorage.getItem("qt_theme") || "light";
  applyTheme(saved);

  btn.addEventListener("click", () => {
    const current =
      document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(current);
  });
}

// ------------------------------
// HEADER USER PILL
// ------------------------------

function setHeaderUser() {
  const user = loadUser();
  const pill = document.querySelector(".user-pill");
  if (pill && user && user.name) {
    pill.textContent = user.name.toUpperCase();
  }
}

// ------------------------------
// MENU CARDS
// ------------------------------

function renderCards(items) {
  const grid = document.getElementById("cards-grid");
  const info = document.getElementById("results-info");
  if (!grid) return;

  grid.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "pancake-card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span class="pancake-name">${item.name}</span>
      <span class="pancake-category">${item.category}</span>
    `;
    grid.appendChild(card);
  });

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nothing found";
    grid.appendChild(empty);
  }

  if (info) {
    info.textContent = items.length + " item(s) shown";
  }
}

// ------------------------------
// MAIN PAGE
// ------------------------------

function applyFiltersMainPage(menu) {
  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");

  if (!searchInput || !filterSelect) {
    renderCards(menu);
    return;
  }

  const term = searchInput.value.trim().toLowerCase();
  const filterValue = filterSelect.value;

  const filtered = menu.filter((item) => {
    const matchesCategory = filterValue === "all" || item.category === filterValue;
    const matchesSearch = item.name.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  renderCards(filtered);
}

function setupMainPage() {
  const grid = document.getElementById("cards-grid");
  if (!grid) return;

  setHeaderUser();
  const menu = loadMenu();
  renderCards(menu);

  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");

  if (searchInput) {
    searchInput.addEventListener("input", () => applyFiltersMainPage(menu));
  }
  if (filterSelect) {
    filterSelect.addEventListener("change", () => applyFiltersMainPage(menu));
  }

  const profileButton = document.getElementById("profile-button");
  const panel = document.getElementById("profile-panel");
  const closeButton = document.getElementById("close-profile");

  if (panel && profileButton && closeButton) {
    const user = loadUser();
    if (user) {
      const nameEl = document.getElementById("profile-name");
      const phoneEl = document.getElementById("profile-phone");
      const emailEl = document.getElementById("profile-email");
      if (nameEl) nameEl.textContent = user.name || "User";
      if (phoneEl) phoneEl.textContent = user.phone || "-";
      if (emailEl) emailEl.textContent = user.email || "-";
    }
    profileButton.addEventListener("click", () => panel.classList.add("open"));
    closeButton.addEventListener("click", () => panel.classList.remove("open"));
  }

  const logo = document.querySelector(".top-center");
  if (logo) {
    logo.onclick = () => (window.location.href = "index.html");
  }
}

// ------------------------------
// MENU PAGE
// ------------------------------

function setupMenuPage() {
  const grid = document.getElementById("cards-grid");
  if (!grid) return;

  setHeaderUser();
  const menu = loadMenu();
  renderCards(menu);

  const logo = document.querySelector(".top-center");
  if (logo) {
    logo.onclick = () => (window.location.href = "index.html");
  }
}

// ------------------------------
// PASSWORD VALIDATION
// ------------------------------

function isValidPassword(password) {
  // хотя бы 8 символов, одна заглавная, одна цифра и один спецсимвол
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return regex.test(password);
}

// ------------------------------
// LOGIN + REGISTRATION
// ------------------------------

function setupLoginPage() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const registerSection = document.getElementById("register-section");
  const messageBox = document.getElementById("auth-message");
  const loginUserBtn = document.getElementById("login-user");
  const loginAdminBtn = document.getElementById("login-admin");
  const showRegisterBtn = document.getElementById("show-register");
  const adminKeyBlock = document.getElementById("admin-key-block");

  if (!loginForm || !registerForm || !registerSection) return;

  const loginEmailInput = document.getElementById("login-email");
  const loginPasswordInput = document.getElementById("login-password");
  const adminKeyInput = document.getElementById("admin-key");

  // Флаг: уже показали поле с ключом или нет
  let adminKeyVisible = false;

  /**
   * Общая функция логина.
   * role: "user" или "admin".
   */
  function handleLogin(role) {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!email || !password) {
      if (messageBox) {
        messageBox.textContent = "Please enter email and password.";
        messageBox.className = "auth-message error";
      }
      return;
    }

    // Для admin дополнительно проверяем keyword
    if (role === "admin") {
      const adminKey = adminKeyInput ? adminKeyInput.value.trim() : "";
      if (!adminKey || adminKey !== ADMIN_KEY) {
        if (messageBox) {
          messageBox.textContent = "Invalid admin keyword.";
          messageBox.className = "auth-message error";
        }
        return;
      }
    }

    const users = loadUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      if (messageBox) {
        messageBox.textContent = "User not found. Please register first.";
        messageBox.className = "auth-message error";
      }
      return;
    }

    // Сохраняем текущего пользователя (без пароля)
    saveUser({
      name: user.name,
      phone: user.phone,
      email: user.email,
      role
    });

    // Переход в нужную часть приложения
    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
  }

  // --- ЛОГИН КАК USER ---

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin("user");
  });

  if (loginUserBtn) {
    loginUserBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogin("user");
    });
  }

  // --- ЛОГИН КАК ADMIN (двойной клик) ---

  if (loginAdminBtn) {
    loginAdminBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Первый клик: показываем поле для ключа и просим ввести
      if (!adminKeyVisible) {
        adminKeyVisible = true;
        if (adminKeyBlock) {
          adminKeyBlock.classList.remove("hidden");
        }
        if (messageBox) {
          messageBox.textContent =
            "Enter admin keyword and press \"Login as admin\" again.";
          messageBox.className = "auth-message";
        }
        // Никакой попытки логина пока не делаем
        return;
      }

      // Второй (и последующие) клики: пробуем логиниться как admin
      handleLogin("admin");
    });
  }

  // --- ОТКРЫТИЕ РЕГИСТРАЦИИ ---

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", () => {
      registerSection.classList.remove("hidden");
      registerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // --- РЕГИСТРАЦИЯ ---

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value.trim();
    const surname = document.getElementById("reg-surname").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const address = document.getElementById("reg-address").value.trim();
    const dob = document.getElementById("reg-dob").value;
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-password-confirm").value;

    if (password !== confirmPassword) {
      messageBox.textContent = "Passwords do not match.";
      messageBox.className = "auth-message error";
      return;
    }

    if (!isValidPassword(password)) {
      messageBox.textContent =
        "Password must be at least 8 characters, include an uppercase letter, a number and a special symbol.";
      messageBox.className = "auth-message error";
      return;
    }

    const users = loadUsers();

    if (users.some((u) => u.email === email)) {
      messageBox.textContent = "User with this email already exists.";
      messageBox.className = "auth-message error";
      return;
    }

    users.push({
      name,
      surname,
      phone,
      address,
      dob,
      email,
      password // для демо; в реальном проекте пароль должен храниться только в зашифрованном виде на сервере
    });

    saveUsers(users);

    messageBox.textContent =
      "Registration successful. You can now log in using your email and password.";
    messageBox.className = "auth-message success";

    registerForm.reset();
  });

  const logo = document.querySelector(".top-center");
  if (logo) {
    logo.onclick = () => (window.location.href = "index.html");
  }
}

// ------------------------------
// PROFILE PAGE
// ------------------------------

function setupProfilePage() {
  const block = document.getElementById("profile-page-block");
  if (!block) return;

  const user = loadUser();
  const nameEl = document.getElementById("profile-page-name");
  const phoneEl = document.getElementById("profile-page-phone");
  const emailEl = document.getElementById("profile-page-email");
  const roleEl = document.getElementById("profile-page-role");
  const adminBtn = document.getElementById("admin-page-btn");

  if (user) {
    if (nameEl) nameEl.textContent = user.name || "User";
    if (phoneEl) phoneEl.textContent = user.phone || "-";
    if (emailEl) emailEl.textContent = user.email || "-";
    if (roleEl) roleEl.textContent = user.role === "admin" ? "Admin" : "User";
  }

  // Кнопка Admin page видна только если текущий пользователь — admin
  if (adminBtn) {
    if (user && user.role === "admin") {
      adminBtn.style.display = "inline-block";
    } else {
      adminBtn.style.display = "none";
    }
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("qt_user");
      window.location.href = "login.html";
    });
  }

  const logo = document.querySelector(".top-center");
  if (logo) {
    logo.onclick = () => (window.location.href = "index.html");
  }
}

// ------------------------------
// ADMIN PAGE
// ------------------------------

function renderAdminTable(menu) {
  const tbody = document.getElementById("admin-menu-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  menu.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${item.price}</td>
      <td>
        <div class="admin-actions">
          <button class="admin-btn secondary" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function makeMenuReport(menu) {
  const reportBox = document.getElementById("report-box");
  if (!reportBox) return;

  const total = menu.length;
  const byCategory = {};
  menu.forEach((item) => {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  });

  const parts = Object.keys(byCategory).map((key) => `${key}: ${byCategory[key]}`);
  reportBox.textContent = `Total pancakes: ${total} | ${parts.join(" | ")}`;
}

function setupAdminPage() {
  const tbody = document.getElementById("admin-menu-body");
  if (!tbody) return;

  setHeaderUser();
  let menu = loadMenu();

  renderAdminTable(menu);
  makeMenuReport(menu);

  const nameInput = document.getElementById("admin-name");
  const priceInput = document.getElementById("admin-price");
  const categorySelect = document.getElementById("admin-category");
  const addBtn = document.getElementById("admin-add");
  const reportBtn = document.getElementById("admin-report");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const name = nameInput.value.trim();
      const price = Number(priceInput.value.trim());
      const category = categorySelect.value;
      if (!name || !price || price <= 0) return;

      const nextId = menu.length ? Math.max(...menu.map((m) => m.id)) + 1 : 1;
      menu.push({ id: nextId, name, category, price, image: "pancake.png" });

      saveMenu(menu);
      renderAdminTable(menu);
      makeMenuReport(menu);

      nameInput.value = "";
      priceInput.value = "";
    });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = Number(btn.getAttribute("data-id"));
      menu = menu.filter((item) => item.id !== id);
      saveMenu(menu);
      renderAdminTable(menu);
      makeMenuReport(menu);
    });
  }

  if (reportBtn) {
    reportBtn.addEventListener("click", () => makeMenuReport(menu));
  }

  const logo = document.querySelector(".top-center");
  if (logo) {
    logo.onclick = () => (window.location.href = "index.html");
  }
}

// ------------------------------
// DELIVERY PAGE
// ------------------------------

function setupDeliveryPage() {
  const form = document.getElementById("delivery-form");
  if (!form) return;

  const nameInput = document.getElementById("delivery-name");
  const phoneInput = document.getElementById("delivery-phone");
  const addressInput = document.getElementById("delivery-address");
  const apartmentInput = document.getElementById("delivery-apartment");
  const commentInput = document.getElementById("delivery-comment");
  const messageBox = document.getElementById("delivery-message");

  const user = loadUser();
  if (user) {
    if (nameInput && !nameInput.value) nameInput.value = user.name || "";
    if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (
      !nameInput.value.trim() ||
      !phoneInput.value.trim() ||
      !addressInput.value.trim()
    ) {
      if (messageBox) {
        messageBox.textContent = "Please fill in name, phone and address.";
        messageBox.className = "delivery-message";
      }
      return;
    }

    const payload = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim(),
      apartment: apartmentInput.value.trim(),
      comment: commentInput.value.trim()
    };

    localStorage.setItem("qt_last_delivery", JSON.stringify(payload));

    if (messageBox) {
      messageBox.textContent =
        "Delivery request saved. Our courier will contact you soon.";
      messageBox.className = "delivery-message";
    }

    form.reset();
  });

  const logo = document.querySelector(".top-center");
  if (logo) {
    logo.onclick = () => (window.location.href = "index.html");
  }
}

// ------------------------------
// ENTRY POINT
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();

  const page = document.body.getAttribute("data-page");
  if (page === "main") setupMainPage();
  if (page === "menu") setupMenuPage();
  if (page === "login") setupLoginPage();
  if (page === "profile") setupProfilePage();
  if (page === "admin") setupAdminPage();
  if (page === "delivery") setupDeliveryPage();
});

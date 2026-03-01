// ------------------------------
// Константы
// ------------------------------

const ADMIN_KEY = "ADMIN123";

// Данные меню по умолчанию (fallback, если сервер не отвечает)
let DEFAULT_MENU = [
  {
    id: 1,
    name: "Classic Pancakes",
    category: "Sweet",
    price: 1500,
    description: "Classic pancakes with butter and syrup",
    available: true,
    image: "pancake.png"
  },
  {
    id: 2,
    name: "Chocolate Dream",
    category: "Sweet",
    price: 1800,
    description: "Chocolate pancakes with cocoa cream",
    available: true,
    image: "pancake.png"
  },
  {
    id: 3,
    name: "Strawberry Heaven",
    category: "Sweet",
    price: 1700,
    description: "Pancakes with fresh strawberries and cream",
    available: true,
    image: "pancake.png"
  },
  {
    id: 4,
    name: "Cheese & Ham",
    category: "Salty",
    price: 1900,
    description: "Savory pancakes with cheese and ham",
    available: true,
    image: "pancake.png"
  },
  {
    id: 5,
    name: "Vegan Berry Mix",
    category: "Vegan",
    price: 2000,
    description: "Vegan pancakes with mix of berries",
    available: true,
    image: "pancake.png"
  },
  {
    id: 6,
    name: "Banana Caramel",
    category: "Sweet",
    price: 1850,
    description: "Pancakes with banana and caramel sauce",
    available: true,
    image: "pancake.png"
  }
];

// ------------------------------
// API helpers
// ------------------------------

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body || {})
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok || !data || data.ok !== true) {
    const msg = (data && data.error) ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

async function apiGet(url) {
  const res = await fetch(url, { credentials: "same-origin" });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok || !data || data.ok !== true) {
    const msg = (data && data.error) ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// ------------------------------
// MENU: local fallback
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

// MENU: загрузка из БД через API
async function getMenuFromServer() {
  try {
    const response = await fetch("./api/menu.php", { credentials: "same-origin" });
    const data = await response.json();

    if (data.ok && Array.isArray(data.menu) && data.menu.length > 0) {
      return data.menu.map((item) => ({
        id: item.menu_id,
        name: item.food_name,
        category: item.food_type,
        price: Number(item.price),
        description: item.description || "",
        available: item.available === "yes",
        image: item.image ? `Image/${item.image}` : "Image/pancake.png"
      }));
    }
  } catch (e) {
    console.error("Server error:", e);
  }

  // если вдруг сервер упал — используем локальные данные
  return loadMenu();
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
    const current = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(current);
  });
}

// ------------------------------
// AUTH helpers
// ------------------------------

async function getSessionUser() {
  try {
    const data = await apiGet("./api/me.php");
    return data.user || null;
  } catch {
    return null;
  }
}

async function setHeaderUser() {
  const user = await getSessionUser();
  const pill = document.querySelector(".user-pill");
  if (pill && user && user.name) {
    pill.textContent = user.name.toUpperCase();
  }
}

// ------------------------------
// MENU cards
// ------------------------------

function renderCards(items) {
  const grid = document.getElementById("cards-grid");
  const info = document.getElementById("results-info");
  if (!grid) return;

  grid.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "pancake-card";

    const priceText = Number.isFinite(item.price) ? item.price + " ₸" : "";
    const availText = item.available ? "Available" : "Not available";

    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <span class="pancake-name">${item.name}</span>
      <span class="pancake-category">${item.category}</span>
      <span class="pancake-price">${priceText}</span>
      ${item.description ? `<span class="pancake-desc">${item.description}</span>` : ""}
      <span class="pancake-availability ${item.available ? "ok" : "no"}">${availText}</span>
    `;
    grid.appendChild(card);
  });

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nothing found";
    grid.appendChild(empty);
  }

  if (info) info.textContent = items.length + " item(s) shown";
}

// общий фильтр + сортировка (используем и на main, и на menu)
function applyFiltersAndSort(menu) {
  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");
  const sortSelect = document.getElementById("sort-select");

  const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const filterValue = filterSelect ? filterSelect.value : "all";
  const sortValue = sortSelect ? sortSelect.value : "default";

  let items = menu.filter((item) => {
    const matchesCategory = filterValue === "all" || item.category === filterValue;
    const matchesSearch = !term || item.name.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  if (sortValue === "price-asc") {
    items = items.slice().sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-desc") {
    items = items.slice().sort((a, b) => b.price - a.price);
  } else if (sortValue === "name-asc") {
    items = items.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  renderCards(items);
}

// ------------------------------
// MAIN PAGE
// ------------------------------

async function setupMainPage() {
  const grid = document.getElementById("cards-grid");
  if (!grid) return;

  await setHeaderUser();

  const menu = await getMenuFromServer();
  renderCards(menu);

  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-select");
  const sortSelect = document.getElementById("sort-select");

  if (searchInput) searchInput.addEventListener("input", () => applyFiltersAndSort(menu));
  if (filterSelect) filterSelect.addEventListener("change", () => applyFiltersAndSort(menu));
  if (sortSelect) sortSelect.addEventListener("change", () => applyFiltersAndSort(menu));

  const profileButton = document.getElementById("profile-button");
  const panel = document.getElementById("profile-panel");
  const closeButton = document.getElementById("close-profile");

  if (panel && profileButton && closeButton) {
    const user = await getSessionUser();
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
  if (logo) logo.onclick = () => (window.location.href = "index.html");
}

// ------------------------------
// MENU PAGE
// ------------------------------

async function setupMenuPage() {
  const grid = document.getElementById("cards-grid");
  if (!grid) return;

  await setHeaderUser();
  const menu = await getMenuFromServer();
  renderCards(menu);

  const filterSelect = document.getElementById("filter-select");
  const sortSelect = document.getElementById("sort-select");

  if (filterSelect) filterSelect.addEventListener("change", () => applyFiltersAndSort(menu));
  if (sortSelect) sortSelect.addEventListener("change", () => applyFiltersAndSort(menu));

  const logo = document.querySelector(".top-center");
  if (logo) logo.onclick = () => (window.location.href = "index.html");
}

// ------------------------------
// PASSWORD VALIDATION
// ------------------------------

function isValidPassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return regex.test(password);
}

// ------------------------------
// LOGIN + REGISTRATION
// ------------------------------

// LOGIN + REGISTRATION + CHANGE PASSWORD
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

  // элементы смены пароля
  const toggleChangeBtn = document.getElementById("toggle-change-password");
  const changeBlock = document.getElementById("change-password-block");
  const changeBtn = document.getElementById("change-password-btn");
  const cpSecretInput = document.getElementById("cp-secret");
  const cpNewPassInput = document.getElementById("cp-new-password");
  const cpNewPassConfirmInput = document.getElementById("cp-new-password-confirm");

  let adminKeyVisible = false;

  function showMessage(text, type) {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = "auth-message" + (type ? " " + type : "");
  }

  async function handleLogin(role) {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (!email || !password) {
      showMessage("Please enter email and password.", "error");
      return;
    }

    const payload = { email, password, role };

    if (role === "admin") {
      const adminKey = adminKeyInput ? adminKeyInput.value.trim() : "";
      if (!adminKey) {
        showMessage("Enter admin keyword.", "error");
        return;
      }
      payload.adminKey = adminKey;
    }

    try {
      await apiPost("./api/login.php", payload);
      window.location.href = role === "admin" ? "admin.html" : "index.html";
    } catch (e) {
      showMessage(e.message || "Login failed.", "error");
    }
  }

  // login user
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

  // login admin
  if (loginAdminBtn) {
    loginAdminBtn.addEventListener("click", (e) => {
      e.preventDefault();

      if (!adminKeyVisible) {
        adminKeyVisible = true;
        if (adminKeyBlock) adminKeyBlock.classList.remove("hidden");
        showMessage('Enter admin keyword and press "Login as admin" again.');
        return;
      }

      handleLogin("admin");
    });
  }

  // show register block
  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", () => {
      registerSection.classList.remove("hidden");
      registerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // REGISTER
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value.trim();
    const surname = document.getElementById("reg-surname").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const address = document.getElementById("reg-address").value.trim();
    const dob = document.getElementById("reg-dob").value;
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-password-confirm").value;
    const secret = document.getElementById("reg-secret").value.trim();

    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    if (!isValidPassword(password)) {
      showMessage(
        "Password must be at least 8 characters, include an uppercase letter, a number and a special symbol.",
        "error"
      );
      return;
    }

    if (!secret) {
      showMessage("Please enter a secret word for password reset.", "error");
      return;
    }

    try {
      await apiPost("./api/register.php", {
        name,
        surname,
        phone,
        address,
        dob,
        email,
        password,
        secret,
      });

      showMessage("Registration successful. You can now log in.", "success");
      registerForm.reset();
    } catch (e2) {
      showMessage(e2.message || "Registration failed.", "error");
    }
  });

  // CHANGE PASSWORD
  if (toggleChangeBtn && changeBlock) {
    toggleChangeBtn.addEventListener("click", () => {
      changeBlock.classList.toggle("hidden");
      if (!changeBlock.classList.contains("hidden")) {
        changeBlock.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  if (changeBtn) {
    changeBtn.addEventListener("click", async () => {
      const email = loginEmailInput.value.trim();
      const secret = cpSecretInput.value.trim();
      const newPass = cpNewPassInput.value;
      const newPassConfirm = cpNewPassConfirmInput.value;

      if (!email || !secret || !newPass || !newPassConfirm) {
        showMessage("Fill email, secret word and new password.", "error");
        return;
      }

      if (newPass !== newPassConfirm) {
        showMessage("New passwords do not match.", "error");
        return;
      }

      if (!isValidPassword(newPass)) {
        showMessage(
          "New password is too weak. It must be at least 8 characters, include an uppercase letter, a number and a special symbol.",
          "error"
        );
        return;
      }

      try {
        await apiPost("./api/change_password.php", {
          email,
          secret,
          password: newPass,
        });
        showMessage("Password changed successfully. You can log in with a new password.", "success");
        cpSecretInput.value = "";
        cpNewPassInput.value = "";
        cpNewPassConfirmInput.value = "";
        changeBlock.classList.add("hidden");
      } catch (e3) {
        showMessage(e3.message || "Password change failed.", "error");
      }
    });
  }

  const logo = document.querySelector(".top-center");
  if (logo) logo.onclick = () => (window.location.href = "index.html");
}

// ------------------------------
// PROFILE PAGE
// ------------------------------

async function setupProfilePage() {
  const block = document.getElementById("profile-page-block");
  if (!block) return;

  const nameEl = document.getElementById("profile-page-name");
  const phoneEl = document.getElementById("profile-page-phone");
  const emailEl = document.getElementById("profile-page-email");
  const roleEl = document.getElementById("profile-page-role");
  const adminBtn = document.getElementById("admin-page-btn");

  const user = await getSessionUser();
  if (user) {
    if (nameEl) nameEl.textContent = user.name || "User";
    if (phoneEl) phoneEl.textContent = user.phone || "-";
    if (emailEl) emailEl.textContent = user.email || "-";
    if (roleEl) roleEl.textContent = user.role === "admin" ? "Admin" : "User";
  } else {
    window.location.href = "login.html";
    return;
  }

  if (adminBtn) {
    adminBtn.style.display = user.role === "admin" ? "inline-block" : "none";
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await apiPost("./api/logout.php", {});
      } catch {}
      window.location.href = "login.html";
    });
  }

  const logo = document.querySelector(".top-center");
  if (logo) logo.onclick = () => (window.location.href = "index.html");
}

// ------------------------------
// ADMIN PAGE (по-прежнему работает с локальным меню)
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

async function setupAdminPage() {
  const tbody = document.getElementById("admin-menu-body");
  if (!tbody) return;

  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    window.location.href = "login.html";
    return;
  }

  await setHeaderUser();

  // здесь используем fallback на локальное меню,
  // чтобы не ломать существующую логику добавления/удаления
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

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.getAttribute("data-id"));
    menu = menu.filter((item) => item.id !== id);
    saveMenu(menu);
    renderAdminTable(menu);
    makeMenuReport(menu);
  });

  if (reportBtn) {
    reportBtn.addEventListener("click", () => makeMenuReport(menu));
  }

  const logo = document.querySelector(".top-center");
  if (logo) logo.onclick = () => (window.location.href = "index.html");
}

// ------------------------------
// DELIVERY PAGE
// ------------------------------

async function setupDeliveryPage() {
  const form = document.getElementById("delivery-form");
  if (!form) return;

  const nameInput = document.getElementById("delivery-name");
  const phoneInput = document.getElementById("delivery-phone");
  const addressInput = document.getElementById("delivery-address");
  const apartmentInput = document.getElementById("delivery-apartment");
  const commentInput = document.getElementById("delivery-comment");
  const messageBox = document.getElementById("delivery-message");

  const user = await getSessionUser();
  if (user) {
    if (nameInput && !nameInput.value) nameInput.value = user.name || "";
    if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!nameInput.value.trim() || !phoneInput.value.trim() || !addressInput.value.trim()) {
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
      messageBox.textContent = "Delivery request saved. Our courier will contact you soon.";
      messageBox.className = "delivery-message";
    }

    form.reset();
  });

  const logo = document.querySelector(".top-center");
  if (logo) logo.onclick = () => (window.location.href = "index.html");
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
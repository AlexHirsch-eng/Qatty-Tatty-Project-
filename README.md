# 🍰 Qatty Tatty
**Qatty Tatty** is a frontend prototype of a dessert (pancake) web application.  
The project is based on a custom UI/UX design and implemented using pure **HTML, CSS, and JavaScript**.

It is intended both as a study project and as a realistic prototype that can be shown to a real client.
---
## ✨ Features

- 🥞 **Dessert catalog**
  - Pancake cards with category and price
  - Shared menu data between pages (stored in `localStorage`)

- 🔎  **Search & filter**
  - Live search by dessert name
  - Filter by category (Sweet / Salty / Vegan)

- 👤 **User account**
  - Registration form:
    - name, surname  
    - phone number  
    - address  
    - date of  birth  
    - email  
    - password + confirm password
  - Password validation:
    - at least **8 characters**
    - at least **one uppercase letter**
    - at least **one number**
    - at least **one special symbol**
  - Login by email + password
  - User data stored in `localStorage` (browser only)
  - Profile page with basic info

- 🛠 **Admin flow**
  - Separate **“Login as admin”** button
  - Two-step admin login:
    1. First click shows **Admin keyword** field  
    2. Second click checks keyword and credentials
  - Admin keyword (demo): `ADMIN123`
  - After successful admin login:
    - user role is saved as `admin`
    - profile page shows extra button **“Admin page”**
  - Admin panel:
    - add new pancakes (name, category, price)
    - delete items from menu
    - simple report: total items + count per category

- 🚚 **Delivery page**
  - Form for name, phone, address, apartment, comment
  - Auto-fill name and phone from logged user
  - Last delivery request stored in `localStorage`

- 🌗 **Theme switcher**
  - Light / dark mode toggle on all pages
  - Theme preference stored in `localStorage`

- 🌐 **UI elements**
  - Language selector (UI only, no real i18n yet)
  - Profile side panel on the main page
  - Responsive layout for desktop and mobile

---

## 📁 Project Structure

- `index.html` – Home page (search, filter, quick cards, profile side panel)
- `menu.html` – Full dessert menu
- `login.html` – Login + registration (user & admin flows)
- `profile.html` – User profile (shows **Admin page** button for admins)
- `admin.html` – Admin panel (manage menu, simple report)
- `delivery.html` – Delivery information form
- `style.css` – Global styles, layout, light/dark theme
- `script.js` – Application logic:
  - menu rendering and filtering  
  - login / registration  
  - admin keyword check  
  - profile & admin behaviour  
  - delivery form  
  - theme and localStorage helpers

---

## 🚀 How to Run

1. Download or clone the project  
2. Open `index.html` (or `login.html`) in a web browser  
3. No backend or server is required – everything works in the browser using `localStorage`

### Demo flows

- **Register & login as user**
  1. Open `login.html`
  2. Click **Register**, fill in the form
  3. Login using your email + password
  4. Check your data on `profile.html`

- **Login as admin**
  1. Go to `login.html`
  2. Enter email + password of an existing user
  3. Click **Login as admin** → the **Admin keyword** field appears
  4. Enter `ADMIN123`
  5. Click **Login as admin** again
  6. You will be redirected to the **Admin panel**, and in your profile you will see the **“Admin page”** button

---

## 🛠 Technologies

- **HTML5**  
- **CSS3** (Flexbox, Grid, custom theme variables)  
- **JavaScript (Vanilla)** – modular logic inside a single `script.js` file  
- **localStorage** – used as a simple in-browser “database” for demo

---

## 📌 Notes

- This is a **frontend-only prototype**:  
  - No real authentication, passwords are stored in `localStorage` just for demo.  
  - In a production version all sensitive logic (passwords, admin keyword, menu management) must be moved to a secure backend.

- The project can be extended with:
  - real backend API (Node.js / Django / etc.)  
  - secure authentication & roles  
  - order management and payment integration  
  - multi-language support (Kazakh / Russian / English)


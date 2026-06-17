![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![PWA](https://img.shields.io/badge/PWA-purple?style=for-the-badge&logo=pwa&logoColor=white) ![Netlify](https://img.shields.io/badge/Netlify-%2300C7B7.svg?style=for-the-badge&logo=netlify&logoColor=white)

# Mundial 2026 Prediction Web App — Frontend (losUrbinaFE)

![Predictions Mobile View](screenshots/predictions.png)
![Leaderboard Mobile View](screenshots/results.png)

This repository holds the user interface for **Mundial 2026 — losUrbina**, an interactive, mobile-first dashboard where friends can log predictions, view official scores, and check the live leaderboard.

## 📱 Features & Tech Stack
* **UI/UX Architecture:** Pure Semantic HTML5, CSS3 Custom Properties (Variables), and Modern Vanilla JavaScript (ES6+).
* **Responsive Design:** Custom Flexbox/Grid systems fully optimized to prevent viewport overflow on long strings (e.g., *Bosnia y Herzegovina*).
* **PWA Capabilities:** Service Worker integration (`sw.js`) and customized `manifest.json` for full standalone mobile app installation on Android and iOS.
* **Hosting Platform:** Netlify (Global CDN Network).

## 🛠️ Service Worker & Cache Management
The Progressive Web App architecture caches all static assets (`index.html`, `styles.css`, `app.js`, and PWA icons) locally on the device to guarantee instantaneous load times.

> ⚠️ **DevOps Note:** If you modify `styles.css` or `app.js`, you must increment the `CACHE_NAME` version string inside `sw.js` (e.g., from `mundial-v2` to `mundial-v3`) to force clients to **(**wipe out** / borrar)** old service worker instances and download the latest asset version.

## 💻 Local Development

1. **Clone the project:**
   ```bash
   git clone https://github.com/camiloederson/losUrbinaFE.git
   cd losUrbinaFE

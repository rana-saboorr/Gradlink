# Gradlink — Global Education & Consulting Platform 🌐

Gradlink is a modern, high-performance web application built for international education consulting, university admissions guidance, career counseling, and visa processing. It is powered by **React 19 + Vite** on the frontend and **Firebase (Firestore + Storage)** as the backend.

---

## 🚀 Key Features

- **Dynamic Homepage** — Live announcements & services pulled from Firebase Firestore, displayed in responsive glassmorphic cards.
- **Full Admin Portal (`/admin`)**:
  - Full CRUD for **Team Members**, **Announcements**, **Services**, **Job Postings**, **News**, and **Blog Posts**.
  - **Gallery Management** — Upload/delete images directly to Firebase Storage.
  - **Account Settings** — Change admin username, email, and password stored in Firestore.
  - **Smart Unique IDs** — Auto-generated IDs for announcements (e.g. `glk1`, `ann19`).
  - **Session Persistence** — Admin session remembered via `sessionStorage` + Redux.
- **Careers Page (`/careers`)** — Real-time job openings pulled from Firestore with a detail modal.
- **News Page (`/news`)** — Firestore-backed news feed with search, category filters, and detail modal.
- **Blogs Page (`/blogs`)** — Firestore-backed blog feed with search, tag filters, read-time estimate, and featured post.
- **Gallery Page (`/gallery`)** — Image gallery served from Firebase Storage.
- **Universities (`/universities`)** — Searchable, filterable university directory with country pills.
- **Theme Support** — Seamless Light & Dark mode via CSS variables.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router DOM v7 |
| **State Management** | Redux Toolkit, React Redux |
| **Backend / Database** | Firebase Firestore (NoSQL) |
| **File Storage** | Firebase Storage |
| **Styling** | Tailwind CSS v4, Glassmorphism, CSS Variables |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Forms & Validation** | React Hook Form, Zod |
| **Toasts** | React Hot Toast |

---

## 🔒 Security & Data Integrity

1. **Environment Variables** — All Firebase credentials are stored exclusively in `.env` using `VITE_FIREBASE_*` variables. No secrets are hardcoded in source code.
2. **Git-ignored Secrets** — `.env` is listed in `.gitignore` and is never committed to version control.
3. **Session Guards** — Protected admin state managed via Redux Toolkit + `sessionStorage`.
4. **Toast Confirmations** — Destructive actions (delete, bulk delete) use inline toast confirmations instead of native browser `alert`/`confirm` dialogs.

---

## 🔥 Firebase Setup

### Firestore Collections Required

| Collection | Purpose |
|---|---|
| `admins` | Admin credentials (username, email, password) |
| `team` | Team member profiles with photo URLs |
| `announcements` | Homepage announcements |
| `services` | Service offerings |
| `jobs` | Job postings for Careers page |
| `news` | News articles |
| `blogs` | Blog posts |
| `gallery` | Gallery image URLs + storage paths |

### Firebase Storage Buckets Required
- `team-images/` — Team member photos
- `gallery-images/` — Gallery uploads

---

## 💻 Environment Setup

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase project credentials (from Firebase Console → Project Settings → Your Apps):
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=1:your_sender_id:web:your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

> ⚠️ **Never commit your `.env` file.** It is already git-ignored.

---

## 🏃 Local Development

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
# → http://localhost:5173/
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

### Lint
```bash
npm run lint
```

---

## 📁 Project Structure

```
Gradlink/
├── public/
├── src/
│   ├── animations/       # Framer Motion variants
│   ├── assets/           # Static assets
│   ├── components/       # Shared UI components (Navbar, Footer, etc.)
│   │   └── ui/           # Loader, etc.
│   ├── context/          # ThemeContext
│   ├── data/             # Static JSON data (destinations, universities)
│   ├── layouts/          # MainLayout
│   ├── pages/            # Route-level pages
│   │   ├── Admin.jsx     # Full admin panel (all CRUD)
│   │   ├── Blogs.jsx     # Firestore-backed blog feed
│   │   ├── Careers.jsx   # Firestore-backed job listings
│   │   ├── Gallery.jsx   # Firebase Storage gallery
│   │   ├── Home.jsx      # Dynamic homepage
│   │   ├── News.jsx      # Firestore-backed news feed
│   │   ├── Universities.jsx # Searchable university directory
│   │   └── ...
│   ├── routes/           # AppRouter
│   ├── seo/              # SEO helpers
│   ├── store/            # Redux store + slices
│   │   └── slices/
│   │       ├── adminAuthSlice.js
│   │       └── dataSlice.js
│   └── utils/
│       └── firebaseClient.js  # Firebase init (reads from .env)
├── .env                  # ⚠️ Git-ignored — your real credentials
├── .env.example          # Safe template — commit this
├── .gitignore
└── package.json
```

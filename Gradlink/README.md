# Gradlink — Global Education & Consulting Platform 🌐

Gradlink is a modern, high-performance web application built for international education consulting, university admissions guidance, career counseling, and visa processing.

## 🚀 Key Features

- **Dynamic Homepage**: Live Announcements & Comprehensive Services pulled directly from Supabase DB in responsive glassmorphic cards.
- **Full Admin Portal (`/admin`)**:
  - Full CRUD operations for **Team Members**, **Announcements**, **Services**, and **Job Postings**.
  - **Account Settings**: Change Admin username, email, and password dynamically in Supabase.
  - **Smart Unique Announcement IDs**: Auto-generated 3-letter + 2-digit IDs (e.g. `glk1`, `ann19`).
  - **Image Uploads**: Upload profile pictures for Team Members directly to Supabase Storage with 2MB limits.
  - **Route Protection & Session Persistence**: Admin session remembered securely via `sessionStorage` and Redux.
- **Careers Page (`/careers`)**: Real-time job openings pulled live from Supabase.
- **Theme Support**: Seamless Light & Dark mode themes using Tailwind CSS v4 variables.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router DOM v7
- **State Management**: React Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Backend / Database**: Supabase (PostgreSQL, Storage, Row Level Security)
- **Styling**: Tailwind CSS v4, Glassmorphism, CSS Variables, Lucide React Icons
- **Animations**: Framer Motion
- **Form Handling & Validation**: React Hook Form, Zod

---

## 🔒 Security & Data Integrity

1. **Database Row Level Security (RLS)**: Enabled across all 5 tables (`admins`, `team`, `announcements`, `services`, `jobs`).
2. **Parameterized Queries**: Handled natively via `@supabase/supabase-js` ORM to completely eliminate SQL Injection vulnerabilities.
3. **Session Guards**: Protected route state managed via Redux Toolkit and `sessionStorage`.
4. **Environment Isolation**: Sensitive configuration managed cleanly via `.env`.

---

## 📋 Database Setup Instructions

To initialize or reset your Supabase database:

1. Open your Supabase Dashboard at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → **New Query**.
3. Copy and run the entire contents of [`database.sql`](./database.sql).

This script automatically creates:
- `admins`, `team`, `announcements`, `services`, `jobs` tables
- Storage bucket `team-images`
- RLS Policies and `GRANT` statements for anonymous role access
- Initial seed data

---

## 💻 Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🏃 Local Development & Production Build

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

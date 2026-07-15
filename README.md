# Verso

**Verso** is a minimalist, premium social platform and sanctuary for writers, poets, and thinkers. It provides a focused, canvas-like space to share short poetic texts, quotes, and snippets of stories without the clutter of traditional social media.

Designed with a dark academia aesthetic, Verso lets your words breathe, allowing readers to immerse themselves fully in the text.

---

## 🌟 Features

- **Minimalist Canvas Postings:** Write and share short literary pieces on custom-colored cards.
- **Dynamic Masonry Layout:** Explore public posts or your personal feed rendered in a responsive, fluid masonry grid.
- **Instant Follow System:** Seamlessly follow your favorite authors instantly to curate a personalized homepage timeline.
- **Interactive Comments & Likes:** Engage with posts through real-time likes and nested comments.
- **Profile Customization:** Personalize your literary persona with bios, display names, and a selection of curated preset avatars (from cozy reading pandas to dark academia rangers).
- **Progressive Web App (PWA):** Install Verso on your mobile device or desktop with support for offline caching, home screen shortcuts, and a seamless native feel.
- **Aesthetic Dark & Light Themes:** Toggle between a warm dark mode (featuring rich outlines and high-contrast styling) and a crisp light mode.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React)
- **Database:** PostgreSQL (Hosted on [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Google Provider, Database Session strategy)
- **Styling:** CSS Variables, Custom Vanilla CSS (with responsive grid layouts and rich glassmorphism/micro-animations)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have Node.js (v18+) and npm/yarn installed.

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Lostshayan/Literary-canvas.git
cd Literary-canvas
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
# Database connection (PostgreSQL)
DATABASE_URL="your-postgresql-connection-string"

# NextAuth secret & URL
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth credentials (for sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup

Run Prisma migrations to set up your database schema:

```bash
npx prisma db push
```

### 5. Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📦 Project Structure

```text
├── app/                  # Next.js App Router pages and API routes
│   ├── add/              # New post editor
│   ├── api/              # API endpoints (auth, posts, comments, profile, follow, notifications)
│   ├── explore/          # Public explore feed
│   ├── notifications/    # Follow & like notification panel
│   ├── post/[id]/        # Individual post page with comment section
│   ├── profile/          # Logged-in user's profile and settings
│   └── users/[id]/       # Profile pages of other authors
├── components/           # Reusable UI components (PostCard, Navbar, PWA prompts, etc.)
├── lib/                  # Library configurations (Prisma client, NextAuth options)
├── prisma/               # Database schema definitions
└── public/               # Static assets (avatars, SW, PWA icons)
```

---

## 📱 Progressive Web App (PWA)

Verso is fully PWA-compliant. When visiting the site on a mobile browser (Safari on iOS or Chrome on Android), you will be prompted with a custom, beautifully integrated dialog to **Add to Home Screen**. Once installed, it behaves like a standalone application with standalone display configuration, background sw, and an optimized mobile layout.

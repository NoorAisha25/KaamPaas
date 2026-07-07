<p align="center">
  <img src="frontend/public/logo.png" alt="KaamPaas logo" width="110" />
</p>

<h1 align="center">KaamPaas — Work Nearby. Hire Nearby.</h1>

<p align="center">
  <a href="https://kaampaas-beta.vercel.app/"><b>Live App</b></a> ·
</p>

A hyperlocal, voice-first hiring platform connecting daily-wage workers — plumbers, electricians, painters, masons, domestic help — with people who need to hire them nearby, today.

---

## The problem

India's informal, daily-wage labour workforce is enormous — hundreds of millions of people whose livelihood depends on finding work through word-of-mouth or standing at a street-corner labour chowk, regardless of weather or distance. Existing gig platforms like WorkIndia or Urban Company largely serve a more formal, literate, urban, app-comfortable segment. They assume the user can read a form, type in English or a well-supported language, and trust an anonymous online listing.

The people this project is actually built for often can't rely on any of those assumptions:

- **Low or no literacy** — a text-heavy form is a hard wall, not an inconvenience
- **Regional language, not English** — most existing platforms offer at best a thin translation layer
- **No digital trust signal** — a worker with years of reliable, honest work has no way to prove it to a stranger online
- **Distance matters enormously** — a job 15km away might not be worth the bus fare and travel time, but a city-wide or state-wide search doesn't know that


## The Solution

KaamPaas is a hyperlocal, voice-first marketplace where a plumber, painter, or domestic worker can register and find daily-wage work using their own voice in their own language — no typing required beyond a password. Hirers post jobs or search for workers within a real GPS radius (the same `$near` geospatial pattern Uber and Swiggy use), ranked not just by distance but by a transparent trust score built from completed jobs and two-sided ratings. Every job that finishes triggers a review from both sides, so reliable behaviour compounds into better visibility over time — the same mechanism that makes ride-hailing and food delivery trustworthy at scale, applied to informal daily-wage work instead.

---

## Core features

### Accessibility, built in from the start — not bolted on after
- **5-language support** (English, Hindi, Marathi, Tamil, Bengali) across every screen, not just a landing page banner
- **Voice input on every text field that matters** — name, phone, city, job title, job description, review comments — using the Web Speech API, listening in whichever language is selected
- **Spoken-number parsing** for phone numbers and rates, since browsers sometimes transcribe digits as number-words instead of numerals
- **Icon-first UI** for skill selection — a picture of a wrench, not just the word "Plumber" — so recognition doesn't depend on reading
- **Plain-language rating labels** ("Excellent", "Poor") alongside star ratings, so feedback doesn't rely purely on numeric literacy
- **No password required to speak** — deliberately excluded from voice input, since dictating a password aloud isn't private or reliable to transcribe

### Real hyperlocal matching, not city-wide search
- GPS-based **Find Workers** and **Find Jobs**, using MongoDB's `2dsphere` index and `$near` queries within a configurable radius
- Graceful fallback to city-name text search if location permission is denied
- Location search-as-you-type (Swiggy/Uber-style autocomplete) using OpenStreetMap's free Nominatim service — no paid API key required

### A trust system that actually changes outcomes, not just a decoration
- Every completed job triggers a **two-sided review** — hirer rates worker, worker rates hirer
- A transparent, explainable **trust score** (60% rating average + 30% completion rate + 10% verification bonus) — not a black-box model
- **Search results are ranked by trust score**, blended with proximity — a reliable worker slightly farther away can outrank an unreviewed one nearby
- Both sides build reputation — a hirer who reliably follows through also earns trust, not only workers

### Practical hiring workflow details
- **Per day / per hour / per month** rate options, for both worker profiles and job budgets
- **Call and WhatsApp buttons** (with a pre-filled message) on worker cards and job details — no manual number-copying
- **Profile photo upload**, via Cloudinary, so both sides can see who they're actually dealing with
- **Skill-pill filters** on both Find Workers and Find Jobs, so a worker can browse every nearby open job, not only ones matching their own registered skill

### Admin visibility
- A separate admin account (role-gated, not just hidden) with a dashboard of registered worker/hirer counts, job status breakdowns, and recent signups
- Honestly scoped: this reports **registered users and job activity**, not raw page-view traffic — that distinction is documented in the code, not glossed over

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), deployed on Vercel |
| Backend | Node.js + Express, deployed on Render |
| Database | MongoDB Atlas, with 2dsphere geospatial indexing |
| Auth | JWT (phone + password) |
| Image storage | Cloudinary (unsigned upload preset, browser-direct) |
| Location search | OpenStreetMap Nominatim (free, no API key) |
| Voice input | Browser Web Speech API |

## Architecture

```
┌─────────────────────┐        REST API (JSON)        ┌──────────────────────┐
│   React Frontend     │ ─────────────────────────────▶ │   Express Backend    │
│   (Vite, on Vercel)  │ ◀───────────────────────────── │   (Node.js, on Render)│
└──────────┬───────────┘                                └───────────┬──────────┘
           │                                                          │
           │  direct browser calls                     Mongoose ODM  │
           ▼                                                          ▼
  ┌─────────────────┐    ┌─────────────────┐              ┌────────────────────┐
  │   Cloudinary     │    │    Nominatim     │              │   MongoDB Atlas     │
  │ (photo storage)  │    │ (location search)│              │ (users, jobs,       │
  └─────────────────┘    └─────────────────┘              │  reviews)           │
                                                             └────────────────────┘
```

The frontend talks to Cloudinary and Nominatim **directly**, not through the backend — this keeps the server lightweight, since it never has to handle image bytes or proxy geocoding requests.

## Job lifecycle

```
   open ──▶ accepted ──▶ in_progress ──▶ completed
    │           │                            │
    ▼           ▼                            ▼
cancelled   cancelled              both sides review,
                                    trust scores recalculated
```

Status transitions are validated server-side against this exact state machine — a job can never jump from `open` straight to `completed`, or be reopened after `cancelled`.

## Project structure

```
kaampaas/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Job, Review schemas
│   ├── controllers/              # Business logic (auth, users, jobs, reviews, admin)
│   ├── routes/                   # Express route definitions
│   ├── middleware/auth.js        # JWT verification + role guards
│   ├── utils/
│   │   ├── matching.js           # Geospatial nearby-search logic
│   │   ├── trustScore.js         # Trust score formula
│   │   ├── seedDemoData.js       # Demo data seeding script
│   │   ├── updateAdminCredentials.js
│   │   └── deleteDemoData.js
│   └── server.js
└── frontend/
    ├── public/logo.png
    └── src/
        ├── pages/                # Landing, Login, Register, Dashboard, FindWorkers,
        │                         # FindJobs, PostJob, JobList, JobDetail, Profile, AdminDashboard
        ├── components/           # Navbar, SkillPicker, WorkerCard, MicButton,
        │                         # LocationInput, PhotoUpload, StarRatingInput, Icon
        ├── context/               # AuthContext, LanguageContext
        ├── i18n/translations.js  # All 5 languages, flat key-value pairs
        └── utils/                 # geolocation, cloudinary, whatsapp, resizeImage, etc.
```

## Setup (local development)

### 1. Clone and install
```bash
git clone https://github.com/NoorAisha25/KaamPaas.git
cd KaamPaas
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment variables

**`backend/.env`:**
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_string
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`:**
```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

### 3. Seed demo data
```bash
cd backend
npm run seed
```

### 4. Run both servers
```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

### Demo credentials
| Role | Phone | Password |
|---|---|---|
| Hirer | `8000000001` | `demo1234` |

## Deployment

- **Backend:** Render (root directory `backend`, build `npm install`, start `npm start`)
- **Frontend:** Vercel (root directory `frontend`, framework preset Vite)
- Environment variables set on each platform match the local `.env` files above, with `VITE_API_URL` pointing at the live Render URL and `CLIENT_URL` pointing at the live Vercel URL

## What's built vs. What's future work

- **Built:**
- full auth,
- two-sided review and trust-score system,
- real GPS-radius matching with city-name fallback,
- voice input across all major forms,
- 5-language UI, photo upload,
- admin stats dashboard,
- WhatsApp/call contact buttons
  
- **Not built (Future Work):**
  - True page-view analytics (the admin dashboard reports registered users and job activity, not anonymous visitor traffic — that needs a dedicated tracking tool)
  - OTP-based phone verification (currently phone + password)
  - In-app payments/escrow
  - A production-grade geocoding provider — Nominatim (free) is used instead of a paid service like Google Places, which trades off some address coverage and rate limits for zero cost

## Author

Built as One of Major project by [Noor Aisha](https://github.com/NoorAisha25).

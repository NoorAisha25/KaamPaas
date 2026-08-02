<p align="center">
  <img src="frontend/public/logo.png" alt="KaamPaas logo" width="110" />
</p>

<h1 align="center">KaamPaas — Work Nearby. Hire Nearby.</h1>

<p align="center">
  <a href="https://kaampaas-beta.vercel.app/"><b>Live App</b></a>
</p>

KaamPaas is a hyperlocal, voice-first hiring platform. It connects daily-wage workers — plumbers, electricians, painters, masons, domestic help — with people who need to hire them nearby, today.

---

## The Problem

India has a huge informal, daily-wage workforce — hundreds of millions of people who find work through word-of-mouth or by standing at a street-corner labour market, no matter the weather or distance involved. Most existing gig platforms, like WorkIndia or Urban Company, are built for a more literate, urban, app-comfortable user. They assume a person can read a form, type in English, and trust a stranger's profile online.

Many real workers cannot rely on any of these assumptions:

- **Low or no literacy** — a text-heavy form is a hard barrier, not just an inconvenience
- **Regional language, not English** — most platforms only offer a thin translation layer, if any
- **No way to prove reliability** — a worker with years of honest, reliable work has no way to show this to a stranger online
- **Distance matters a lot** — a job 15km away may not be worth the travel time or bus fare, but city-wide or state-wide search doesn't account for that

## The Solution

KaamPaas lets a plumber, painter, or domestic worker register and find work using their own voice, in their own language — no typing needed beyond a password. Hirers post jobs or search for workers within a real GPS radius. Results are ranked not just by distance, but by a transparent trust score built from completed jobs and two-sided ratings.

After every completed job, both sides review each other. This means reliable, honest work leads to better visibility over time — the same basic idea that makes ride-hailing and food-delivery apps trustworthy, applied here to informal daily-wage work.

---

## Core Features

### Accessibility, built in from the start
- **5 languages supported** (English, Hindi, Marathi, Tamil, Bengali) across every screen, not just the landing page
- **Voice input** on every important text field — name, phone, city, job title, job description, review comments — using the browser's Web Speech API, in whichever language the user selects
- **Spoken-number parsing** for phone numbers and rates, since browsers sometimes convert spoken digits into number-words instead of numerals
- **Icon-based skill selection** — a picture of a wrench, not just the word "Plumber" — so choosing a skill doesn't depend on reading
- **Plain-language rating labels** ("Excellent", "Poor") next to the star ratings, so feedback doesn't rely only on understanding numbers
- **No voice input on the password field** — this is intentional. Speaking a password out loud isn't private, and speech-to-text isn't reliable enough for something this important

### Real hyperlocal matching, not city-wide search
- GPS-based **Find Workers** and **Find Jobs** pages, using MongoDB's `2dsphere` index and `$near` queries within a set radius
- Falls back to simple city-name search if the user does not allow location access
- Location search-as-you-type, using OpenStreetMap's free Nominatim service — no paid API key needed

### A trust system that actually affects results
- Every completed job triggers a **two-sided review** — the hirer rates the worker, and the worker rates the hirer
- A clear, explainable **trust score** formula: 60% from average rating, 30% from job completion rate, 10% from verification status — not a black-box model
- **Search results are ranked using this trust score**, blended with distance — so a reliable worker slightly farther away can rank above an unreviewed worker who is closer
- Both sides build reputation. A hirer who reliably follows through on jobs also earns trust, not just workers

### Practical workflow details
- **Per day / per hour / per month** rate options, for both worker profiles and job budgets
- **Call and WhatsApp buttons** (with a ready-made message) on worker cards and job details — no need to copy phone numbers manually
- **Profile photo upload** through Cloudinary, so both sides can see who they are working with
- **Skill filters** on both Find Workers and Find Jobs, so a worker can browse all nearby open jobs, not only ones that match their own listed skill

### Admin visibility
- A separate, role-restricted admin account with a dashboard showing registered worker and hirer counts, job status breakdowns, and recent signups

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), deployed on Vercel |
| Backend | Node.js + Express, deployed on Render |
| Database | MongoDB Atlas, with 2dsphere geospatial indexing |
| Auth | JWT (phone number + password) |
| Image storage | Cloudinary (unsigned upload preset, uploaded directly from the browser) |
| Location search | OpenStreetMap Nominatim (free, no API key required) |
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

The frontend calls Cloudinary and Nominatim **directly**, without going through the backend. This keeps the server lightweight, since it never has to handle image files or forward location search requests.

## Job Lifecycle

```
   open ──▶ accepted ──▶ in_progress ──▶ completed
    │           │                            │
    ▼           ▼                            ▼
cancelled   cancelled              both sides leave a review,
                                    trust scores are recalculated
```

Every status change is checked on the backend against this exact set of rules. A job can never jump straight from "open" to "completed", and a cancelled job can never be reopened.

## Project Structure

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

## Setup (Local Development)

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

- **Backend:** Render (root directory `backend`, build command `npm install`, start command `npm start`)
- **Frontend:** Vercel (root directory `frontend`, framework preset: Vite)
- Environment variables are set separately on each platform, matching the local `.env` files above. `VITE_API_URL` points to the live Render URL, and `CLIENT_URL` points to the live Vercel URL

## What's Built vs. What's Future Work

Being clear about this distinction matters more than overstating what exists.

**Built:**
- Full authentication (JWT + bcrypt)
- Two-sided review and trust-score system
- Real GPS-radius matching, with a city-name fallback
- Voice input across all major forms
- 5-language interface
- Photo upload
- Admin stats dashboard
- WhatsApp and call contact buttons

**Not built yet (documented as future work):**
- True page-view analytics — the admin dashboard currently reports registered users and job activity, not anonymous visitor traffic. That would need a separate tracking tool
- OTP-based phone verification — the app currently uses phone number + password only
- In-app payments or escrow — no money moves through the platform yet
- A production-grade geocoding provider — Nominatim (free) is used instead of a paid option like Google Places. This trades off some address coverage and rate limits in exchange for zero cost

## Author

Built by [Noor Aisha](https://github.com/NoorAisha25) as a major academic project.

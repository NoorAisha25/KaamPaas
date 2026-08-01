<p align="center">
  <img src="frontend/public/logo.png" alt="KaamPaas logo" width="110" />
</p>

<h1 align="center">KaamPaas — Work Nearby. Hire Nearby.</h1>

<p align="center">
  <a href="https://kaampaas-beta.vercel.app/"><b>Live App</b></a>
</p>

KaamPaas is a hiring platform for daily-wage workers — plumbers, electricians, painters, masons, domestic help — built around voice input, local languages, and finding people who are actually nearby, not just somewhere in the same city.

---

## Why I built this

I kept coming back to one gap: most hiring apps assume the person using them can read comfortably, type in English, and trust a random profile online. That's a fine assumption for a lot of gig platforms, but it doesn't hold for a huge part of India's daily-wage workforce — people who've spent years learning a trade but not necessarily learning to read a form on a screen.

Existing platforms like WorkIndia or Urban Company are genuinely useful, but they're built for a more literate, more app-comfortable user. A worker who can't read English well, who speaks a regional language, who's never had a way to prove online that they show up and do good work — that person gets left out. And on the other side, distance actually matters a lot when you're deciding whether a job is worth taking. A 15km commute might eat half a day's earnings in bus fare, but a normal city-wide search doesn't care about that at all.

So that's what I tried to build KaamPaas around — not "another gig app," but one that actually works for someone who can't type much, doesn't read English, and cares a lot about how close a job actually is.

## What it actually does

A worker signs up mostly by speaking — name, phone number, what they do, all through the mic, in whichever of the 5 supported languages they pick. A hirer posts a job or searches for someone nearby, and the app finds real matches within a GPS radius, not just "somewhere in Delhi."

The part I think matters most is the trust system. After a job is done, both people rate each other. That rating feeds into a trust score, and that score actually changes who shows up higher in search results — it's not just a number sitting on a profile for decoration. A worker with a solid track record but a slightly farther location can still beat someone closer with no history. That's the same basic idea behind why you trust an Uber driver or a Swiggy delivery person you've never met — a visible track record, not just proximity.

## Features

**Built for people who can't rely on reading and typing:**
- 5 languages throughout the app — English, Hindi, Marathi, Tamil, Bengali
- Voice input on every important field — name, phone, job title, description, even review comments — using the browser's own speech recognition, listening in whatever language is selected
- Phone numbers and rates can be spoken instead of typed (with some fallback logic for when the browser transcribes "nine" as the word instead of the digit)
- Skills are picked by icon, not by reading a label — a wrench picture for "plumber," not just text
- Star ratings show a plain word next to them too, like "Excellent" or "Poor," so the rating isn't just an abstract number
- I left voice input off the password field on purpose — saying a password out loud isn't private, and speech-to-text just isn't reliable enough for that

**Actual GPS-based search, not city-wide:**
- Find Workers and Find Jobs both use MongoDB's geospatial features (`2dsphere` index, `$near` queries) to search within a real radius
- Falls back to a plain city-name search if someone doesn't allow location access — never just breaks
- Typing an address gets live suggestions through OpenStreetMap's free Nominatim service, no paid API key needed

**A trust score that's actually explainable:**
- 60% average rating, 30% job completion rate, 10% verification bonus — I wrote it as a plain formula on purpose instead of anything resembling machine learning, since with this little data, a model would just be guessing, and I'd rather have something I can actually explain to a worker if they ask why their score is what it is
- Both sides review each other after a job, and both sides' scores update — a hirer who flakes on jobs should also rank lower, not just workers

**Smaller things that made it feel more real:**
- Rates can be per day, per hour, or per month
- Call and WhatsApp buttons right on a worker's profile, WhatsApp even opens with a message already typed in
- Profile photos, uploaded through Cloudinary, so it's not just a name and a number
- A basic admin dashboard to see how many workers/hirers have signed up and how jobs are progressing

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), deployed on Vercel |
| Backend | Node.js + Express, deployed on Render |
| Database | MongoDB Atlas, with 2dsphere geospatial indexing |
| Auth | JWT (phone number + password) |
| Image storage | Cloudinary (unsigned upload preset, browser uploads directly) |
| Location search | OpenStreetMap Nominatim (free) |
| Voice input | Browser Web Speech API |

### Why these, and not the other obvious choices

None of these were the only option, so here's the actual reasoning, in case it comes up.

**React over Vue or Angular** — mostly familiarity and ecosystem size, honestly. Vite's dev server is also just fast, way faster than the old Create React App setup, which made the whole build-test-fix loop less annoying while I was iterating quickly.

**Node + Express over something like Django or Spring** — one language across the whole stack. Writing both the frontend and backend in JavaScript meant less context-switching, and for a REST API of this size, Express doesn't add much overhead or boilerplate compared to a heavier framework.

**MongoDB over a SQL database like PostgreSQL** — this one's the least arbitrary choice. The real reason is geospatial support. MongoDB has `$near` queries and 2dsphere indexes built in as a first-class feature. Doing the equivalent in PostgreSQL means bringing in PostGIS, a separate extension, which is more setup for the same result. On top of that, the shape of my data genuinely varies — a worker profile has fields a hirer profile doesn't need at all — and a flexible document model handles that more naturally than a rigid table with a bunch of nullable columns.

**JWT over server-side sessions** — stateless auth means I don't need to store session data anywhere on the server, which keeps things simpler and would scale more easily if the backend ever ran across multiple instances. The tradeoff is you can't instantly revoke a single token without extra work, but that wasn't a priority here.

**Cloudinary over rolling my own image storage with S3** — Cloudinary handles resizing and delivery out of the box, and with an unsigned upload preset, the browser can upload straight to it with zero backend involvement. Doing the same thing with S3 means building that pipeline myself — presigned URLs, a resize step, a CDN in front of it. Cloudinary's free tier just gets you there faster.

**Nominatim over Google Places** — Nominatim is free and needs no API key, which mattered a lot for a project with no budget. The tradeoff is real: it's less accurate and has stricter rate limits than a paid provider. For the scale this project runs at, that tradeoff made sense. It's the first thing I'd swap out if this ever needed to handle real production traffic.

## How it's put together

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

One thing worth pointing out — the frontend talks to Cloudinary and Nominatim directly, not through my backend. I did that on purpose so the server never has to touch image files or forward location searches. Keeps it lighter.

## How a job moves through the system

```
   open ──▶ accepted ──▶ in_progress ──▶ completed
    │           │                            │
    ▼           ▼                            ▼
cancelled   cancelled              both sides leave a review,
                                    trust scores recalculate
```

The backend checks every status change against this exact set of rules — a job can't jump straight from "open" to "completed," and once it's cancelled, it stays cancelled.

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

## Running it locally

```bash
git clone https://github.com/NoorAisha25/KaamPaas.git
cd KaamPaas
cd backend && npm install
cd ../frontend && npm install
```

You'll need a `.env` file in each folder.

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

Seed some demo data so the app isn't empty:
```bash
cd backend
npm run seed
```

Then run both sides:
```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev
```

Try it with the demo hirer login — phone `8000000001`, password `demo1234`.

## Deployment

Backend's on Render (root directory `backend`, `npm install` to build, `npm start` to run). Frontend's on Vercel (root directory `frontend`, Vite preset). Environment variables are set separately on each platform — `VITE_API_URL` points at the live Render URL, `CLIENT_URL` on the backend points back at the live Vercel URL.

## What's actually built vs. what isn't

I'd rather be upfront about this than let it come up as a surprise later.

**Actually built and working:** full auth, the two-sided review and trust-score system, real GPS-radius search with a city-name fallback, voice input across the major forms, all 5 languages, photo upload, an admin dashboard, WhatsApp/call buttons.

**Not built yet:**
- Real page-view analytics — the admin dashboard shows registered users and job activity, but it can't see anonymous visitors who never signed up. That needs a separate tool like Google Analytics
- OTP verification — right now it's just phone number + password
- Any actual payments — the per-day/hour/month rates are just labels, no money moves through the app
- A paid geocoding service — I used Nominatim because it's free, which means it's a bit less accurate and rate-limited compared to something like Google Places, but that felt like a fair tradeoff for a project at this scale

## Author

Built by [Noor Aisha](https://github.com/NoorAisha25) as a major academic project.

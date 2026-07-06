# KaamPaas — Work Nearby. Hire Nearby.

A hyperlocal, voice-first marketplace connecting daily-wage workers
(plumbers, electricians, painters, masons, cleaners, etc.) with local
hirers. Built as a final-year project, matched to the working demo
built on Emergent.

## Tech stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas)
- **Auth:** JWT (phone + password)
- **Voice input:** Browser Web Speech API

## Project structure

```
KaamPaas/
├── backend/
│   ├── config/db.js
│   ├── models/User.js, Job.js
│   ├── controllers/authController.js, userController.js, jobController.js
│   ├── routes/
│   ├── middleware/auth.js
│   ├── utils/skills.js, seedDemoData.js
│   └── server.js
└── frontend/
    ├── public/logo.png              # your real KaamPaas logo, cropped from the brand sheet
    └── src/
        ├── pages/                   # Landing, Login, Register, Dashboard, FindWorkers, PostJob, JobList, JobDetail, Profile
        ├── components/               # Navbar, SkillPicker, SkillPillBar, WorkerCard, MicButton
        ├── context/AuthContext.jsx
        ├── constants.js              # SKILLS list + LANGUAGES, matches the UI exactly
        └── api/api.js
```

## Setup

### 1. MongoDB Atlas
Create a free cluster at https://www.mongodb.com/cloud/atlas, create a
DB user, allow network access from anywhere for dev, copy the
connection string.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: paste MONGO_URI, set a random JWT_SECRET
npm run dev
```
Runs on `http://localhost:5000`.

### 3. Seed demo data (matches your Emergent demo exactly)
```bash
cd backend
npm run seed
```
This creates 6 demo workers (Ramesh Kumar the plumber, Suresh Verma
the mason, etc. — same names, rates, and ratings as your screenshots)
plus a demo hirer login: **phone `8000000001`, password `demo1234`**.

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. Click "Use demo hirer login" on the
login page to try it instantly.

## 7-day build plan (where we are / what's next)

- [x] **Day 1** — repo setup, MongoDB schemas, Express server, JWT auth
- [x] **Day 2** — Navbar, Dashboard, language switcher UI, Profile page
- [x] **Day 3** — Find Workers page: skill pills, city filter, worker cards
- [x] **Day 4** — Post a Job page: skill grid, mic-enabled title/description, budget/city, urgency pills
- [x] **Day 5** — Backend wiring: job creation, city+skill matching, My Jobs list
- [ ] **Day 6** — polish pass, mobile responsiveness, trust badges refinement, error states
- [ ] **Day 7** — deploy (Vercel + Render + Atlas), final demo-data seeding, README + report prep

## What's built vs. future scope (be upfront in your report)

**Built:** auth, worker/hirer profiles, icon-based skill grid, skill-pill
+ city-based worker search, job posting with voice input, job status
lifecycle (open → accepted → in_progress → completed/cancelled),
verified badges, ratings display, demo data seeding matching your
original Emergent prototype.

**Future scope (documented, not built):** true geolocation-based
distance search (current version matches by city text, not GPS
radius — easy upgrade later using MongoDB `$near`, same pattern
already proven in earlier prototypes), OTP-based phone verification,
in-app calling instead of raw `tel:` links, multilingual translation
(the language switcher UI exists but only English strings are wired
up), payments/escrow.

## Next steps once you're running locally

1. Run through the flow: register a hirer, register a worker (or use
   the seeded demo data), post a job, accept it, mark completed
2. Deploy to Vercel (frontend) + Render (backend) for a live demo link
3. I can help wire up geolocation-based search if you want it before Day 7

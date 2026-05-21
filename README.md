# DocAppoint — Server (Backend API)

Express.js REST API and **Better Auth** backend for **DocAppoint** (Doctor Appointment Manager). Handles authentication, doctors, appointments, and reviews with MongoDB.

## Repository

**GitHub:** [waliulnizu/doc-appoint-server](https://github.com/waliulnizu/doc-appoint-server)

## Live API

| | URL |
|--|-----|
| **API (Render)** | `https://your-service.onrender.com` ← replace after deploy |
| **Client** | Your frontend URL → set as `CLIENT_URL` |

Health check: `GET /` or `GET /health`

## Features (API)

1. **Better Auth** — Email/password register & login, session cookies, optional **Google OAuth**.
2. **Doctors** — List all doctors, get one doctor by id (safe ObjectId handling).
3. **Appointments** — Create, update, delete, and list appointments by user email.
4. **Reviews** — Post review after booking; one review per user per doctor; updates doctor average **rating**.
5. **CORS** — Credentialed requests from the Next.js client origin only.

## Tech stack

- [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) (native driver)
- [Better Auth](https://www.better-auth.com/) + [@better-auth/mongo-adapter](https://www.better-auth.com/docs/adapters/mongo)
- [dotenv](https://github.com/motdotla/dotenv)
- [cors](https://github.com/expressjs/cors)

## API routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` or `/health` | Health check |
| `*` | `/api/auth/*` | Better Auth (register, login, session, Google, etc.) |
| `GET` | `/api/doctors` | All doctors |
| `GET` | `/api/doctors/:id` | Single doctor |
| `POST` | `/api/doctors` | Add doctor (admin/seed) |
| `POST` | `/api/appointments` | Create appointment |
| `PUT` | `/api/appointments/:id` | Update appointment |
| `DELETE` | `/api/appointments/:id` | Delete appointment |
| `GET` | `/api/appointments/user/:email` | User’s appointments |
| `GET` | `/api/reviews/doctor/:doctorId` | Reviews for a doctor |
| `POST` | `/api/reviews` | Create review (requires prior appointment) |

### Appointment body (POST)

```json
{
  "patientName": "Rahim",
  "userEmail": "user@example.com",
  "gender": "Male",
  "phone": "01700000000",
  "appointmentDate": "2026-05-25",
  "appointmentTime": "10:30",
  "doctorId": "674abc...",
  "doctorName": "Dr. Karim"
}
```

`gender` must be `"Male"` or `"Female"`.

### Review body (POST)

```json
{
  "doctorId": "674abc...",
  "userEmail": "user@example.com",
  "userName": "Rahim",
  "rating": 5,
  "comment": "Great consultation"
}
```

## Environment variables

Copy `.env.example` to `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=docAppoint

BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-long-random-secret

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `DB_NAME` | Database name |
| `BETTER_AUTH_URL` | **Next.js app URL** (OAuth callback host, not server port) |
| `CLIENT_URL` | Frontend origin for CORS & `trustedOrigins` |
| `BETTER_AUTH_SECRET` | Secret for signing sessions (server only, never expose to client) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |

## Local setup

```bash
cd doc-appoint-server
npm install
cp .env.example .env
# Fill MONGO_URI, BETTER_AUTH_SECRET, and optional Google keys
npm run dev
```

Server runs at [http://localhost:5000](http://localhost:5000).

Start the **client** separately (`doc-appoint-client`).

## Google OAuth setup

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth client ID (Web).
2. **Authorized redirect URIs** (local):

   `http://localhost:3000/api/auth/callback/google`

   Use the **client** URL because Next.js rewrites `/api/auth` to this server.

3. Put Client ID and Secret in `.env`.
4. `mapProfileToUser` maps Google `picture` → user `image`.

Docs: [Better Auth — Google](https://www.better-auth.com/docs/authentication/google)

## MongoDB collections

| Collection | Purpose |
|------------|---------|
| `doctors` | Doctor profiles (name, specialty, fee, rating, image, etc.) |
| `appointments` | Bookings per user/doctor |
| `reviews` | Patient reviews; updates `doctors.rating` |
| Better Auth tables | Users, sessions, accounts (via mongo adapter) |

## Project structure

```
src/
├── config/       # db.js, auth.js (Better Auth)
├── controllers/  # doctor controller
├── models/       # appointment schema reference
├── routes/       # health, auth, doctors, appointments, reviews
├── app.js        # Express app + CORS + routes
└── server.js     # connectDB → initAuth → listen (used by Render)
```

## Deploy on Render (recommended)

Render runs a **normal Node server** (`npm start` → `server.js`). No serverless files required.

**Dashboard:** [https://dashboard.render.com](https://dashboard.render.com)  
**Docs:** [Deploy a Node Express app on Render](https://render.com/docs/deploy-node-express-app)

### Step 1 — Push latest code to GitHub

Repo: [github.com/waliulnizu/doc-appoint-server](https://github.com/waliulnizu/doc-appoint-server)

```bash
git add .
git commit -m "chore: configure server for Render deployment"
git push origin main
```

### Step 2 — Create Web Service on Render

1. Open [https://dashboard.render.com](https://dashboard.render.com) and sign in (GitHub login is easiest).
2. Click **New +** → **Web Service**.
3. Connect **GitHub** if asked, then select **`waliulnizu/doc-appoint-server`**.

### Step 3 — Service settings

| Field | Value |
|-------|--------|
| **Name** | `doc-appoint-api` (any name) |
| **Region** | Singapore (or closest) |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### Step 4 — Environment variables

In **Environment** → add (from `.env.example`):

| Key | Value |
|-----|--------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `DB_NAME` | `docappoint` |
| `BETTER_AUTH_SECRET` | long random secret |
| `CLIENT_URL` | frontend URL (e.g. `https://your-app.vercel.app`) |
| `BETTER_AUTH_URL` | **same as** `CLIENT_URL` |
| `GOOGLE_CLIENT_ID` | optional |
| `GOOGLE_CLIENT_SECRET` | optional |

Do **not** set `PORT` — Render sets it automatically.

Optional: **Health Check Path** → `/health`

### Step 5 — Deploy

Click **Create Web Service**. Wait until status is **Live**.

Your API URL looks like:

`https://doc-appoint-api.onrender.com`

Test in browser:

`https://doc-appoint-api.onrender.com/health`

### Step 6 — Connect frontend

Set on the **client** (Vercel or local):

```env
NEXT_PUBLIC_SERVER_URL=https://doc-appoint-api.onrender.com
```

Redeploy the client after changing env.

### Step 7 — Google OAuth (production)

Add redirect URI in Google Cloud Console:

`https://YOUR-CLIENT-DOMAIN/api/auth/callback/google`

### Free tier note

Inactive services **sleep**; the first request after sleep may take 30–60 seconds.

## CORS

Only `CLIENT_URL` is allowed, with `credentials: true` (required for auth cookies when calling API directly from the browser).

## Related repository

Frontend: **doc-appoint-client**

## Author

Programming Hero assignment — Doctor Appointment Manager (DocAppoint).

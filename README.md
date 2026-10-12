# DocAppoint — Server (Backend API) ⚙️

> **Robust Healthcare Appointment & Auth REST API**  
> Built with Express.js 5, Node.js 20+, MongoDB Native Driver, and Better Auth.

---

## 📋 Table of Contents

- [Live Deployment Links](#-live-deployment-links)
- [How the Backend Works](#-how-the-backend-works)
  - [System Architecture](#system-architecture)
  - [Authentication & Better Auth Integration](#authentication--better-auth-integration)
  - [Reverse Proxy & CORS Handling](#reverse-proxy--cors-handling)
  - [Doctor Directory & Rating Engine](#doctor-directory--rating-engine)
  - [Appointment Booking & Slot Logic](#appointment-booking--slot-logic)
  - [Review Submission & Aggregation](#review-submission--aggregation)
  - [Dynamic Content & Platform Statistics](#dynamic-content--platform-statistics)
- [API Reference & Endpoints](#-api-reference--endpoints)
  - [Request / Response Examples](#request--response-examples)
- [Database Schema & Collections](#-database-schema--collections)
- [Environment Variables](#-environment-variables)
- [Local Development Setup](#-local-development-setup)
- [Google OAuth Setup](#-google-oauth-setup)
- [Deployment Guide (Render)](#-deployment-guide-render)
- [Related Repositories](#-related-repositories)
- [Author & License](#-author--license)

---

## 🔗 Live Deployment Links

| Resource | Service | URL | Status |
|---|---|---|---|
| **Production API** | Render | [https://doc-appoint-server-mod0.onrender.com](https://doc-appoint-server-mod0.onrender.com) | ✅ Live |
| **API Health Check** | Render | [https://doc-appoint-server-mod0.onrender.com/health](https://doc-appoint-server-mod0.onrender.com/health) | ✅ Active |
| **All Doctors Endpoint** | Render | [https://doc-appoint-server-mod0.onrender.com/api/doctors](https://doc-appoint-server-mod0.onrender.com/api/doctors) | ✅ Active |
| **Frontend Web App** | Vercel | [https://doc-appoint-client-sepia.vercel.app](https://doc-appoint-client-sepia.vercel.app) | ✅ Live |
| **Server GitHub Repo** | GitHub | [https://github.com/waliulnizu/doc-appoint-server](https://github.com/waliulnizu/doc-appoint-server) | 📦 Repository |
| **Client GitHub Repo** | GitHub | [https://github.com/waliulnizu/doc-appoint-client](https://github.com/waliulnizu/doc-appoint-client) | 📦 Repository |

---

## 🧠 How the Backend Works

DocAppoint Server is a modular, event-driven REST API engineered with Express.js 5 and the native MongoDB driver. It serves as the single source of truth for patient identity, doctor profiles, availability schedules, booking operations, and patient reviews.

### System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATION                   │
│      (Vercel: https://doc-appoint-client-sepia.vercel.app)    │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTPS Requests & Proxy Rewrites
                            │
┌───────────────────────────▼────────────────────────────┐
│                  EXPRESS 5 APPLICATION                 │
│                 (src/app.js & server.js)               │
├────────────────────────────────────────────────────────┤
│  Middlewares:                                          │
│   • CORS (allowedOrigins, credentials: true)           │
│   • express.json() Body Parser                         │
├────────────────────────────────────────────────────────┤
│  Route Handlers:                                       │
│   • /health                     → Health monitoring    │
│   • /api/auth/*                 → Better Auth engine   │
│   • /api/doctors/*              → Doctor catalog       │
│   • /api/appointments/slots/*   → Availability slots   │
│   • /api/appointments/*         → Booking CRUD         │
│   • /api/reviews/*              → Rating & reviews     │
│   • /api/stats                  → Platform statistics  │
│   • /api/content/*              → Marketing content    │
└───────────────────────────┬────────────────────────────┘
                            │
               MongoDB Native Driver (Singleton)
                            │
┌───────────────────────────▼────────────────────────────┐
│                 MONGODB ATLAS DATABASE                 │
│ Collections: doctors, appointments, reviews, user,     │
│              session, account, verification            │
└────────────────────────────────────────────────────────┘
```

### Authentication & Better Auth Integration

DocAppoint uses **Better Auth** with `@better-auth/mongo-adapter`:
- **Database Adapter**: Automatically mounts required collections (`user`, `session`, `account`, `verification`) in your MongoDB database without requiring separate ORM overhead.
- **Node Handler Integration**: Mounted in `src/routes/auth.route.js` using `toNodeHandler(auth)`. It handles all auth routes under `/api/auth/*`:
  - `POST /api/auth/sign-up/email` — Email & password registration with password hashing.
  - `POST /api/auth/sign-in/email` — Credentials validation and session token generation.
  - `GET /api/auth/get-session` — Session validation and active user retrieval.
  - `POST /api/auth/sign-out` — Session revocation and cookie clearing.
  - `GET /api/auth/sign-in/social` & callback handlers for **Google OAuth 2.0**.
- **Session Security**: Session tokens are transmitted in HTTP-only, secure cookies, preventing client-side XSS token theft.

### Reverse Proxy & CORS Handling

Because the frontend is hosted on Vercel and the API on Render:
1. **Next.js API Rewrites**: The Next.js frontend proxies `/api/*` to the Render server.
2. **`CLIENT_URL` and `BETTER_AUTH_URL`**: Both variables point to the **frontend domain** (`https://doc-appoint-client-sepia.vercel.app`).
   - Why? When Google OAuth redirects the user back after authentication, it redirects to `${BETTER_AUTH_URL}/api/auth/callback/google` on the frontend domain.
   - The browser keeps cookies on the same origin domain.
3. **CORS Configuration (`src/app.js`)**: Dynamic origin validator matches both `localhost:3000` for local testing and `doc-appoint-client-sepia.vercel.app` for production, with `credentials: true`.

### Doctor Directory & Rating Engine

- **Doctor Records**: Profiles contain specialty, biography, visiting hospital location, consultation fee, available weekdays (`availableDays`), visiting time window (`availableTime`), and current average rating.
- **Search & Filter**: Doctors can be searched by name or specialty using case-insensitive regex or text matching.
- **Auto-Calculated Ratings**: Whenever a new review is posted, the server aggregates all reviews for that doctor and recalculates `doctor.rating` atomically.

### Appointment Booking & Slot Logic

- **Slot Availability (`slot.route.js`)**:
  - Registered before general appointment routes to avoid parameterized path conflicts.
  - Returns booked and remaining consultation slots for a doctor on a given date.
- **Validation**:
  - Enforces `patientName`, `userEmail`, `phone`, `gender` (`Male` | `Female`), `appointmentDate` (`YYYY-MM-DD`), and `appointmentTime` (`HH:mm`).
  - Verifies that the `doctorId` is a valid 24-character hexadecimal MongoDB `ObjectId`.
- **User Dashboard Queries**:
  - Patients query `/api/appointments/user/:email` to retrieve all bookings tied to their email.
  - Patients can update or delete their pending appointments.

### Review Submission & Aggregation

- **Integrity Checks**:
  - Verifies that the user submitted an appointment before leaving feedback.
  - Enforces one review per user per doctor to prevent rating manipulation.
- **Aggregation**:
  - Reviews store a rating between 1 and 5.
  - Computes the average score across all reviews for that doctor and updates the doctor document.

### Dynamic Content & Platform Statistics

- **`/api/stats`**: Aggregates total count of registered doctors, booked appointments, completed consultations, and active patients.
- **`/api/content`**: Supplies dynamic marketing content (departments, testimonials, FAQs, reasons, steps, geriatrics, blogs, slides) for the frontend landing page.

---

## 🗺️ API Reference & Endpoints

### Health & Auth
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Basic server ping (`DocAppoint API is running 🚀`) |
| `GET` | `/health` | Health verification (`{ "success": true, "message": "DocAppoint API is healthy" }`) |
| `*` | `/api/auth/*` | Better Auth handlers (register, login, logout, session, Google OAuth) |

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/doctors` | Retrieve all doctor profiles. Supports query params: `?search=` (name/specialty/hospital), `?specialty=` (exact match), `?sort=rating`, `?limit=` |
| `GET` | `/api/doctors/:id` | Retrieve single doctor by MongoDB ObjectId |
| `POST` | `/api/doctors` | Create new doctor profile (Admin / Seed) |

### Appointments & Slots
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/appointments/slots/:doctorId?date=` | Get available slots for doctor |
| `POST` | `/api/appointments` | Book a new doctor appointment |
| `GET` | `/api/appointments/user/:email` | Get all appointments for a patient |
| `PUT` | `/api/appointments/:id` | Update an existing appointment |
| `DELETE` | `/api/appointments/:id` | Cancel/delete an appointment |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reviews/doctor/:doctorId` | Get all patient reviews for a doctor |
| `POST` | `/api/reviews` | Submit patient review and update rating |

### Statistics & Content
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Platform statistics (totals for doctors, appointments, reviews, specialties, hospitals) |
| `GET` | `/api/content` | Landing page dynamic content (departments, testimonials, faqs, reasons, steps, geriatrics, posts, slides) |

---

### Request / Response Examples

#### 1. Book Appointment (`POST /api/appointments`)

**Request Body:**
```json
{
  "patientName": "Waliul Islam",
  "userEmail": "waliul@example.com",
  "gender": "Male",
  "phone": "01712345678",
  "appointmentDate": "2026-06-20",
  "appointmentTime": "10:30",
  "doctorId": "674abc123def456ghi789jkl",
  "doctorName": "Dr. Sarah Jenkins",
  "bookedFor": "self",
  "relation": ""
}
```

> `bookedFor` is `"self"` or `"family"` (family bookings also send `relation`, e.g. `"Spouse"`). The same doctor + date + time slot cannot be booked twice (`409`).

**Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "_id": "674def123abc456789012345",
    "patientName": "Waliul Islam",
    "userEmail": "waliul@example.com",
    "gender": "Male",
    "phone": "01712345678",
    "appointmentDate": "2026-06-20",
    "appointmentTime": "10:30",
    "doctorId": "674abc123def456ghi789jkl",
    "doctorName": "Dr. Sarah Jenkins",
    "bookedFor": "self",
    "relation": "",
    "createdAt": "2026-06-12T08:00:00.000Z"
  }
}
```

#### 2. Submit Review (`POST /api/reviews`)

**Request Body:**
```json
{
  "doctorId": "674abc123def456ghi789jkl",
  "userEmail": "waliul@example.com",
  "userName": "Waliul Islam",
  "rating": 5,
  "comment": "Exceptional doctor. Diagnosed my condition accurately and explained everything clearly!"
}
```

**Success Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "_id": "674rev1234567890abcdef12",
    "doctorId": "674abc123def456ghi789jkl",
    "userEmail": "waliul@example.com",
    "userName": "Waliul Islam",
    "rating": 5,
    "comment": "Exceptional doctor. Diagnosed my condition accurately...",
    "createdAt": "2026-06-20T12:00:00.000Z"
  }
}
```

---

## 🗄️ Database Schema & Collections

| Collection | Description | Key Fields |
|---|---|---|
| `doctors` | Doctor profiles & schedules | `name`, `specialty`, `fee`, `rating`, `image`, `location`, `description`, `availableDays`, `availableTime` |
| `appointments` | Booked appointments | `patientName`, `userEmail`, `gender`, `phone`, `appointmentDate`, `appointmentTime`, `doctorId`, `doctorName`, `bookedFor` (`self`/`family`), `relation`, `createdAt` |
| `reviews` | Patient feedback | `doctorId`, `userEmail`, `userName`, `rating`, `comment`, `createdAt` |
| `user` | Better Auth registered users | `name`, `email`, `emailVerified`, `image`, `createdAt` |
| `session` | Active user sessions | `userId`, `token`, `expiresAt`, `ipAddress`, `userAgent` |
| `account` | OAuth provider credentials | `providerId`, `accountId`, `userId`, `accessToken` |
| `verification` | Email tokens | `identifier`, `value`, `expiresAt` |

---

## 🔐 Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

### Complete Environment Specification

```env
# Server Configuration (Local only)
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0
DB_NAME=docappoint

# Better Auth Configuration (Set to Frontend Client URL)
BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Better Auth Secret (Min 32 characters)
BETTER_AUTH_SECRET=your-32-character-random-secret

# Google OAuth Credentials (Optional for Google Sign-In)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
```

### Variable Reference Table

| Variable | Required | Description | Example (Local) | Example (Production / Render) |
|---|---|---|---|---|
| `PORT` | ⚠️ Local Only | Port on which the Express server listens. | `5000` | **DO NOT SET on Render** (Render dynamically sets `PORT`) |
| `MONGO_URI` | ✅ Yes | MongoDB Atlas connection string with credentials. | `mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0` | `mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0` |
| `DB_NAME` | ✅ Yes | Database name in MongoDB cluster. | `docappoint` | `docappoint` |
| `BETTER_AUTH_URL` | ✅ Yes | Frontend base URL for auth redirects and OAuth callbacks. | `http://localhost:3000` | `https://doc-appoint-client-sepia.vercel.app` |
| `CLIENT_URL` | ✅ Yes | Allowed CORS origin and trusted origin in Better Auth. | `http://localhost:3000` | `https://doc-appoint-client-sepia.vercel.app` |
| `BETTER_AUTH_SECRET` | ✅ Yes | Cryptographic secret used by Better Auth to sign session cookies. | Generated with `openssl rand -base64 32` | Generated with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | ⭕ Optional | Google Cloud OAuth 2.0 Web Client ID. | `*.apps.googleusercontent.com` | `*.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | ⭕ Optional | Google Cloud OAuth 2.0 Client Secret. | `GOCSPX-*` | `GOCSPX-*` |

> 💡 **Why is `BETTER_AUTH_URL` set to the Client URL?**  
> Because the client proxies `/api/auth/*` through Next.js rewrites, the browser views authentication as happening on the client domain. Better Auth builds OAuth redirect URLs using `BETTER_AUTH_URL`. Therefore, setting it to the client domain ensures Google OAuth sends the user back to the correct client callback URL.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `pnpm` (this project uses `pnpm` — `pnpm-lock.yaml` is the lockfile)
- **MongoDB Atlas**: An active cluster (Free tier works perfectly)
- **OpenSSL**: For generating security secrets

### 2. Clone the Repository
```bash
git clone https://github.com/waliulnizu/doc-appoint-server.git
cd doc-appoint-server
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Create and Configure `.env`
```bash
cp .env.example .env
```
Generate your `BETTER_AUTH_SECRET`:
```bash
openssl rand -base64 32
```
Paste this value into `.env` along with your MongoDB URI.

### 5. Start Development Server
```bash
pnpm dev
```

The server starts on **[http://localhost:5000](http://localhost:5000)**.  
Verify health at **[http://localhost:5000/health](http://localhost:5000/health)**.

---

## 🔑 Google OAuth Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project → Go to **APIs & Services** → **Credentials**.
3. Click **Create Credentials** → **OAuth client ID** (Application type: **Web application**).
4. Under **Authorized redirect URIs**, add:
   - **Local Development**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - **Production**:
     ```
     https://doc-appoint-client-sepia.vercel.app/api/auth/callback/google
     ```
5. Copy the Client ID and Client Secret into your `.env` file under `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## 🚢 Deployment Guide (Render)

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: configure server for Render deployment"
git push origin main
```

### 2. Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select and connect your repository: `doc-appoint-server`.

### 3. Configure Service Settings
- **Name**: `doc-appoint-server-mod0`
- **Region**: Singapore (or region closest to your users)
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `pnpm install`
- **Start Command**: `pnpm start`
- **Instance Type**: `Free`

### 4. Set Environment Variables on Render
Add each environment variable:

| Key | Value (Production) |
|---|---|
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=Cluster0` |
| `DB_NAME` | `docappoint` |
| `BETTER_AUTH_SECRET` | *(Your 32+ character generated secret)* |
| `CLIENT_URL` | `https://doc-appoint-client-sepia.vercel.app` |
| `BETTER_AUTH_URL` | `https://doc-appoint-client-sepia.vercel.app` |
| `GOOGLE_CLIENT_ID` | *(Your Google OAuth client ID)* |
| `GOOGLE_CLIENT_SECRET` | *(Your Google OAuth client secret)* |

> ⚠️ **Crucial Notice**: Do **NOT** add `PORT` to the Render Environment Variables. Render automatically assigns and binds `PORT`.

### 5. Deploy & Verify
- Click **Create Web Service**.
- Once deployed, test the live health endpoint:
  ```
  https://doc-appoint-server-mod0.onrender.com/health
  ```
- Should return: `{"status":"ok"}`.

> ℹ️ **Render Free Tier Note**: Free instances spin down after 15 minutes of inactivity. When a request arrives after sleep, Render will automatically start the container (takes approximately 30–50 seconds for cold start).

---

## 🔗 Related Repositories

- **Backend Server**: [https://github.com/waliulnizu/doc-appoint-server](https://github.com/waliulnizu/doc-appoint-server)
- **Frontend Client**: [https://github.com/waliulnizu/doc-appoint-client](https://github.com/waliulnizu/doc-appoint-client)

---

## 👨‍💻 Author & License

**Waliul Islam Nizu**  
Full-Stack Web Developer  
- GitHub: [@waliulnizu](https://github.com/waliulnizu)

This project is open source and available under the [MIT License](LICENSE).
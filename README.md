# Erina Roadside Assistance (RSA) Ecosystem

Welcome to the **Erina Roadside Assistance** application ecosystem! This repository is organized as a high-performance, modular monorepo containing two main web applications that coordinate seamlessly to deliver rapid, secure, and intuitive roadside dispatch services.

---

## 🏗️ Monorepo Architecture

The repository is divided into two primary Next.js workspaces:
1. **`/frontend` (Customer Portal):** A customer-facing landing and booking platform where stranded motorists can request emergency assistance, upload vehicle/incident photos, and track their rescue timeline in real time.
2. **`/admin-panel` (Dispatcher Dashboard):** A back-office dispatcher board where operators monitor real-time aggregates, coordinate incoming rescues, assign available technicians, and review incident case details.

```
Erina-Assistance/
├── frontend/                  # Next.js customer application
│   ├── src/
│   │   ├── app/               # Booking pages, tracking interface, and API endpoints
│   │   ├── components/        # Glassmorphic user interface elements
│   │   ├── lib/               # Database helpers and Firebase authentication client
│   │   ├── models/            # Mongoose schemas (Booking, Testimonial)
│   │   └── store/             # Zustand state managers for session tracking
│   └── package.json
│
└── admin-panel/               # Next.js dispatcher board
    ├── src/
    │   ├── app/               # Dispatcher dashboards, analytics, and booking grids
    │   ├── frontend/          # Client-side stores, React Contexts, and Firebase hooks
    │   └── backend/           # Server-side Mongoose schemas and database clients
    └── package.json
```

---

## 🚀 Key Features

### 📡 Real-Time Customer Rescue Timeline
* **GET `/api/bookings/[id]` API:** Retrieves live case statuses from MongoDB Atlas.
* **Polled Timeline Integration:** Automatically polls the database every 8 seconds via client-side `setInterval` to advance the customer's timeline through four distinct states (`pending` ➔ `assigned` ➔ `in-progress` ➔ `completed`).
* **Active GPS Tracking:** Displays dispatch assignments including technician names, vehicle details, and active ratings in real time.

### ☁️ Serverless Cloudinary Media Uploads
* **Buffer Streaming API (`POST /api/upload`):** Bypasses read-only serverless filesystem constraints by accepting `FormData` streams and converting them directly into in-memory binary buffers before piping to Cloudinary.
* **Micro-Animated Console:** A drop-in vehicle incident photo console with fluid loaders, image size boundaries, and direct JSON syncing with the database request.

### 🚨 Production Hotline Quicklinks (+91 73400 66655)
* **Emergency Widget:** A globally integrated, pulsing glassmorphic calling dialer fixed on all pages linking directly to the official Hotline hotline `+91 73400 66655`.
* **WhatsApp Quicklinks:** Seamless one-tap mobile anchors that initialize instant chat support logs directly with operations.

### 📊 Dispatcher Control Panel
* **Live Aggregate Counters:** Computes metrics dynamically including revenue today, active emergency alerts, available technicians, and pending dispatch queues.
* **Immersive Zoom Overlay:** Backdrop-blurred (`backdrop-blur-md`) photo zoom modals let dispatchers inspect incident snapshots next to the license plates with escape-key support.

---

## 🛡️ Security Audit & Safeguards (No Data Breach)

To protect this application against modern threat vectors, parameter pollution, or database breaches, we have implemented the following production-grade security safeguards:

1. **Strict Payload Whitelisting & Destructuring:** Both booking creation API routes strictly destructure and whitelist incoming JSON variables, completely mitigating mass-assignment and prototype pollution vulnerabilities.
2. **Proactive Type-Sanitization (NoSQL Injection Blocker):** Custom type-sanitizers convert all incoming strings, numbers, and lat/lng values to safe flat types. Any malicious MongoDB query operators (e.g. `{ phone: { $gt: "" } }`) are neutralized and saved as literal text strings, making NoSQL bypass attempts useless.
3. **Environment Isolation & Git Protection:** All `.env` and `.env.local` files containing database connection strings, Cloudinary secret keys, or Firebase credentials are 100% untracked by Git. Sensitive parameters do not use the `NEXT_PUBLIC_` prefix to guarantee they are never bundled into client-side browser files.

---

## 🛠️ Getting Started & Local Setup

### 1. Prerequisites
Ensure you have the following installed on your system:
* Node.js (v18.x or later)
* npm (v9.x or later)
* A MongoDB Atlas Database Cluster
* A Cloudinary Developer Account

### 2. Environment Configurations
Create a `.env.local` file inside **both** the `/frontend` and `/admin-panel` directories.

#### For `/frontend/.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/erina-rsa?retryWrites=true&w=majority
CLOUDINARY_URL=cloudinary://<cloudinary_api_key>:<cloudinary_api_secret>@<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<auth_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project_id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storage_bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messaging_sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app_id>

# Base API endpoint targeting the backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### For `/admin-panel/.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/erina-rsa?retryWrites=true&w=majority

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<auth_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project_id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storage_bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messaging_sender_id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app_id>

# Base API endpoint targeting the backend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Running Locally
To launch both servers simultaneously:

#### Run Customer Frontend:
```bash
cd frontend
npm install
npm run dev # Starts on http://localhost:3000
```

#### Run Dispatcher Board:
```bash
cd admin-panel
npm install
npm run dev # Starts on http://localhost:3004
```

---

## 🧪 Testing & Quality Assurance

Both workspaces contain robust Jest test suites that verify schema modeling, route API handlers, component states, and Zustand store operations.

### Run Customer Frontend Tests:
```bash
cd frontend
npm test -- --no-cache
```

### Run Dispatcher Board Tests:
```bash
cd admin-panel
npm test
```

*Note: All Jest tests are configured with node-environment configurations and mock database providers to guarantee 100% successful test passes offline.*

---

## 🚀 Deployment

Both applications are configured for deployment on **Vercel**:
* **Frontend Production URL:** [https://www.erinaassistance.in](https://www.erinaassistance.in)
* **Admin Panel Production URL:** [https://admin-panel-psi-pearl.vercel.app](https://admin-panel-psi-pearl.vercel.app)

Deploy updates by running the following command in either folder:
```bash
npx vercel --prod --yes
```

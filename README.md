<<<<<<< HEAD
# 🛡️ CYBER SENTINEL AI SYSTEM

> **AI-Powered Multi-User Cybersecurity Threat Detection, Scam Prevention & Incident Management Platform**

Cyber Sentinel AI System is a modern, responsive full-stack web application designed to combat cybersecurity threats across different demographic groups and operational roles. It features dedicated portals for five distinct user roles, an AI/heuristic threat intelligence engine, automated case management, and complete administrative telemetry.

---

## 🚀 Key Features by User Role

### 1. 👤 Registered User (`registered_user`)
- **URL Threat Scanner**: Real-time evaluation of URLs for phishing, credential harvesting, disposable TLDs, raw IP hostnames, and malware payloads.
- **Scan History**: Filterable, searchable record of all historical scans with detailed indicator drawers.
- **Security Profile**: Credential and profile management.

### 2. 🎓 Student User (`student_user`)
- **Fake Job & Internship Scam Detector**: Multi-parameter verification assessing upfront fee demands, unverified recruiter domains (`@gmail.com`), Telegram/WhatsApp interview traps, and abnormal salaries.
- **Recruitment Message Verifier**: Paste-and-verify tool for SMS, WhatsApp, and LinkedIn recruitment pitches.
- **Scam Archive**: Community and personal report repository with red-flag advisories.

### 3. 👵 Senior Citizen User (`senior_citizen`)
- **Elder-Friendly Dashboard**: High-contrast, large-typography interface with simplified navigation.
- **Suspicious Phone Call Checker**: Detection of IRS/tax arrest threats, banking impersonation, tech support refund scams, and grandchild emergencies.
- **Emergency Family Contacts**: Store trusted family/guardian contacts.
- **One-Click Family Alert**: Instant simulated emergency SMS/email broadcast dispatch with audit trail.

### 4. 🔍 Cybersecurity Analyst (`cybersecurity_analyst`)
- **SOC Operations Queue**: Triage queue categorizing incidents by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and status.
- **Digital Forensics & Case Viewer**: Evidence viewer, reporter timeline, and threat metadata.
- **Investigation Log**: Append dated forensic notes and transition case states (`OPEN` ➔ `UNDER_REVIEW` ➔ `IN_PROGRESS` ➔ `RESOLVED`).

### 5. ⚙️ System Administrator (`administrator`)
- **Telemetry Console**: High-level system KPIs, threat distribution charts, and platform activity.
- **User Management (CRUD)**: Create, view, edit status (`ACTIVE`, `INACTIVE`, `SUSPENDED`), and remove users.
- **Global Incident Oversight**: Cross-platform tracking of all security submissions.
- **Tamper-Evident Audit Logs**: Comprehensive security trail logging user actions, IP addresses, and timestamps.

### 🚨 Common Incident Reporting (`/report-incident`)
Any authenticated user can submit an incident. The system automatically creates a linked SOC Case for analysts and logs an entry in `AuditLog`.

---

## 💻 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Next.js Server Components, API Route Handlers
- **Database**: SQLite (`prisma/dev.db`)
- **ORM**: Prisma ORM (v5.22.0)
- **Security & Auth**: JWT (`jose`), HTTP-only secure cookies, `bcryptjs` password hashing, RBAC middleware
- **Threat Engine**: Multi-vector heuristic detection engine (`AIThreatAnalysisService`)

---

## 📋 Pre-Seeded Demo Credentials

All accounts are pre-seeded with the password: **`password123`**

| Role | Email | Password | Dedicated Dashboard |
| :--- | :--- | :--- | :--- |
| **Registered User** | `user@sentinel.com` | `password123` | `/registered/dashboard` |
| **Student User** | `student@sentinel.com` | `password123` | `/student/dashboard` |
| **Senior Citizen** | `senior@sentinel.com` | `password123` | `/senior/dashboard` |
| **Cybersecurity Analyst** | `analyst@sentinel.com` | `password123` | `/analyst/dashboard` |
| **Administrator** | `admin@sentinel.com` | `password123` | `/admin/dashboard` |

*(The `/login` screen also provides 1-click demo credential autofill buttons).*

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="cyber-sentinel-super-secret-jwt-key-2026-secure-production-hash"
```

---

## 🛠️ Local Development & Production Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup & Seed
```bash
npx prisma db push
node scripts/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Production Build (Locally)
```bash
npm run build
npm start
```

### 5. Inspect Database (Prisma Studio)
```bash
npx prisma studio
```
Opens interactive GUI at [http://localhost:5555](http://localhost:5555).

---

## ☁️ Deployment Guide

### Deploying to Vercel (Recommended)
1. Push your repository to **GitHub**.
2. Sign in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In **Environment Variables**, add:
   - `JWT_SECRET`: your secret key (e.g. `cyber-sentinel-prod-secret-2026`)
   - `DATABASE_URL`: `file:./dev.db` (or a PostgreSQL connection string like Supabase/Neon for persistent cloud DB).
5. Click **Deploy**. Vercel will automatically build and provide a live production URL (e.g. `https://cyber-sentinel.vercel.app`).

### Deploying to Render / Railway (Docker/Node.js)
1. Create a **Web Service** on [Render](https://render.com/).
2. Build Command: `npm install && npx prisma db push && node scripts/seed.js && npm run build`
3. Start Command: `npm start`
4. Set Environment Variables: `JWT_SECRET` and `DATABASE_URL`.

---

## 🧪 Testing & Verification

Run the automated integration test suite:
```bash
node scripts/test-flows.js
```
Expected output: `🎉 ALL 5 MODULES & CROSS-ROLE FLOWS VERIFIED 100% WORKING!`
=======
# Cyber-sentinel-ai-system
AI-powered cybersecurity platform for threat detection, scam detection, incident reporting, and security guidance.
>>>>>>> 0c94a6bdee50aa32b8e0bb8553cb6391245a1dce

# Rewaj Corporate Limited — Unified Platform

A professional full-stack platform for Rewaj Corporate Limited, featuring a modern Next.js 14 frontend and a robust FastAPI backend. This platform manages industry insights, project tracking, services, and administrative communications.

---

## ✨ Features

### 🏢 Frontend (Next.js 14)
- **High Performance**: Built with App Router and Server Components.
- **Responsive Design**: Professional UI tailored for the oil and gas industry.
- **Dynamic Content**: Articles, projects, and services are fully dynamic.
- **Secure Admin Dashboard**: Glassmorphic UI for content management.

### ⚙️ Backend (FastAPI)
- **Unified API**: Manages blog, projects, services, and contact form.
- **Admin System**: Secure JWT authentication and role-based access.
- **Image Management**: Built-in file upload system to `/static/uploads`.
- **Newsletter Engine**: Subscriber management and bulk announcement tool.
- **Database agnostic**: Seamlessly switches between SQLite (Local) and PostgreSQL (Production).

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, React, Tailwind (where applicable), Lucide, framer-motion.
- **Backend**: FastAPI, SQLAlchemy (Async), Pydantic.
- **Database**: SQLite (Development) / PostgreSQL (Production).
- **Communication**: SendGrid for automated notifications.

---

## 🚀 Local Development

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows (CMD)
# OR source venv/bin/activate (Linux/macOS)

pip install -r requirements.txt
cp .env.example .env
# Set ADMIN_SEED_SECRET and other keys in .env
uvicorn app.main:app --reload
```
**Seed the Database:**
`python seed_content.py` (Creates admin: `admin@rewajcorporate.com` / `ChangeMe123!`)

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

---

## 🌐 Production Deployment (Recommended)

### **Frontend → Vercel**
1. Connect your repo to **Vercel**.
2. Set Root Directory to `frontend`.
3. Add Env Var: `NEXT_PUBLIC_API_URL` (Link to your Render API).

### **Backend → Render**
1. Connect your repo to **Render**.
2. Create a **Web Service**.
3. Set the Root Directory to `backend`.
4. Set Build Command: `pip install -r requirements.txt`.
5. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`.
6. **IMPORTANT**: Create a **PostgreSQL** instance on Render and paste its Internal DB URL into the `DATABASE_URL` environment variable.

### **Database Persistence**
The system is pre-configured to automatically handle Render's PostgreSQL connection strings. No code changes are required—just paste the URL in the Environment Variables!

---

## 📁 Repository Structure
```
rcl-website/
├── frontend/         # Next.js 14 codebase
├── backend/          # FastAPI codebase
│   ├── app/          # Core logic, models, and API routes
│   └── static/       # Uploaded images and assets
└── README.md         # You are here
```

---

Built with ❤️ for Rewaj Corporate Limited.

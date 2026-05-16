# FinTrack — Multi-Tenant Expense & Income Management SaaS

A production-grade full-stack SaaS built with Next.js, Express, Prisma, and PostgreSQL.

## 🚀 Live Demo

- **Frontend (Vercel)**: [https://expense-tracker-six-rouge-74.vercel.app/auth/login](https://expense-tracker-six-rouge-74.vercel.app/auth/login)
- **Backend API (Render)**: [https://expense-tracker-eyto.onrender.com/api](https://expense-tracker-eyto.onrender.com/api)

> **Test Account:**
> Email: `admin@test.com` | Password: `password123`

## Features

- 🔐 JWT authentication with refresh token rotation & reuse detection
- 🏢 Multi-tenant with strict data isolation at DB + API level
- 👥 Role-based access (Admin / Accountant / User)
- 💰 Transactions CRUD with financial consistency (DB transactions)
- 📊 Dashboard with aggregated analytics and charts
- 🔍 Filtering, pagination, and CSV export (streaming)
- 🛡️ Rate limiting, helmet security headers, Zod validation
- 📝 Structured logging with Pino
- 🚀 CI/CD via GitHub Actions → Vercel + Render

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+ (or Supabase)
- pnpm / npm

### 1. Clone and install

```bash
git clone https://github.com/your-org/expense-saas
cd expense-saas

# Backend
cd backend && cp .env.example .env
npm install

# Frontend
cd ../frontend && cp .env.example .env.local
npm install
```

### 2. Configure environment

**Backend `.env`:**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/expense_saas"
JWT_ACCESS_SECRET="min-32-char-random-secret"
JWT_REFRESH_SECRET="another-min-32-char-secret"
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Database setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open http://localhost:3000 — register your organization and start managing finances!

---

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register org + admin user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke all refresh tokens |
| GET | `/api/auth/me` | Get current user |

### Transactions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/transactions` | All | List with filters + pagination |
| GET | `/api/transactions/:id` | All | Get one |
| POST | `/api/transactions` | All | Create |
| PATCH | `/api/transactions/:id` | Admin/Accountant | Update |
| DELETE | `/api/transactions/:id` | Admin/Accountant | Soft delete |
| GET | `/api/transactions/export` | All | Stream CSV |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/summary` | Income/expense summary |
| GET | `/api/dashboard/trend` | Monthly trend data |

### Categories
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/categories` | All | List |
| POST | `/api/categories` | Admin/Accountant | Create |
| DELETE | `/api/categories/:id` | Admin | Delete |

---

## Deployment

### Backend → Render
1. Create a new Web Service on Render
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `npm install && npm run generate && npm run build`
4. Start command: `npm run migrate && npm start`
5. Add environment variables from `.env` (Ensure `NODE_ENV=production` and `DIRECT_URL` is set for Prisma migrations).

### Frontend → Vercel
1. Create a new Project on Vercel
2. Import the GitHub repo and select `frontend` as the Root Directory
3. Vercel will automatically use Next.js presets (`npm run build`).
4. Set the `NEXT_PUBLIC_API_URL` environment variable to `https://expense-tracker-eyto.onrender.com/api`.

### Database → Supabase
1. Create project at supabase.com
2. Copy the Transaction connection string (port 6543, pgbouncer=true) to `DATABASE_URL`
3. Copy the Session connection string (port 5432) to `DIRECT_URL`

---

## CI/CD Secrets (GitHub)

| Secret | Description |
|--------|-------------|
| `RENDER_DEPLOY_HOOK_URL` | Render deploy hook |
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_ORG_ID` | Vercel team/org ID |


# HMS Development Runbook

## 1. Prerequisites

Required versions (minimum):

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 16
- (Optional) Redis >= 7.0

Check with:

```bash
node --version && pnpm --version && psql --version
```

## 2. First-time setup

```bash
# 1. Clone and install
git clone <repo>
cd hms
pnpm install

# 2. Create environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit both files — at minimum set DATABASE_URL,
# JWT_SECRET, JWT_REFRESH_SECRET

# 3. Generate strong secrets
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
# Run twice — paste into JWT_SECRET and JWT_REFRESH_SECRET

# 4. Create database
createdb hms_dev
# Or via psql: CREATE DATABASE hms_dev;

# 5. Run migrations
cd apps/api
pnpm db:migrate

# 6. Create SQL views
pnpm db:views

# 7. Seed demo data
pnpm db:seed

# 8. Generate Prisma client
pnpm prisma generate
```

## 3. Running the development stack

```bash
# From repo root — starts both API and web concurrently:
pnpm dev

# Or individually:
pnpm --filter @hms/api dev      # API on :3001
pnpm --filter @hms/web dev      # Web on :3000

# API health check:
curl http://localhost:3001/api/v1/health
```

## 4. Running the smoke tests

```bash
# Requires running API + seeded database
cd apps/api
pnpm test:smoke

# With verbose output:
pnpm test:smoke:verbose

# Against a different base URL:
API_URL=https://staging.yourhms.com pnpm test:smoke
```

## 5. Database commands

```bash
pnpm db:setup      # first time: migrate + views + seed
pnpm db:fresh      # reset + re-seed (DESTROYS all data)
pnpm db:seed       # seed only (idempotent)
pnpm db:views      # recreate SQL views
pnpm db:migrate    # run pending migrations
pnpm db:studio     # open Prisma Studio at :5555
```

## 6. Demo login credentials

Organization code: **DEMO**

| Role             | Email                     | Password       |
|------------------|---------------------------|----------------|
| Super Admin      | superadmin@hms.com        | Admin@123456   |
| Org Admin        | admin@demo.com            | Admin@123456   |
| General Manager  | gm@demo.com               | Admin@123456   |
| Front Desk       | frontdesk@demo.com        | Admin@123456   |
| Accountant       | accounts@demo.com         | Admin@123456   |
| Housekeeping     | housekeeping@demo.com     | Admin@123456   |

## 7. Common issues

**"Cannot connect to database"**
→ Verify `DATABASE_URL` in `apps/api/.env`
→ Ensure PostgreSQL is running: `pg_ctl status`

**"JWT_SECRET is not defined"**
→ Copy `.env.example` to `.env` and fill secrets

**"View v_user_permissions does not exist"**
→ Run: `pnpm db:views`

**"Prisma Client not generated"**
→ Run: `pnpm prisma generate` (from `apps/api`)

**"Port 3001 already in use"**
→ `lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill`

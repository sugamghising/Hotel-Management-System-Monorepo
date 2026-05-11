# Hotel Management System Monorepo

Monorepo for the HMS platform, containing the backend API, frontend web app, and shared workspace packages.

## Workspace layout

```text
apps/
  api/   -> Node.js + Express + TypeScript backend
  web/   -> Next.js frontend

packages/
  schemas/ -> Shared Zod schemas
  types/   -> Shared TypeScript types
```

## Prerequisites

- Node.js `>= 20`
- pnpm `8.x` (workspace is configured with `packageManager: pnpm@8.0.0`)

## Setup

```bash
pnpm install
```

For API environment setup, see `apps/api/README.md` and create `apps/api/.env` from `apps/api/.env.example`.

## Development

Run all dev tasks in parallel:

```bash
pnpm dev
```

Run individual apps:

```bash
pnpm dev:api
pnpm dev:web
```

## Monorepo scripts

```bash
pnpm build
pnpm type-check
pnpm lint
pnpm clean
```

## App-specific documentation

- API docs and operational details: `apps/api/README.md`
- Web app docs: `apps/web/README.md`


# Ahar Server

TypeScript Express backend for the Ahar restaurant management system.

This backend follows the same broad structure as `ismailjosim/WellSpace-backend`:

- `src/app/config`
- `src/app/helpers`
- `src/app/middlewares`
- `src/app/modules`
- `src/app/routes`
- `src/app/shared`
- `src/app/utils`
- `prisma/schema`

## Setup

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

PostgreSQL is required. Configure `DATABASE_URL` in `.env` before running migrations or starting the server.

## Scripts

- `pnpm dev` - run the TypeScript server with watch mode.
- `pnpm build` - compile TypeScript to `dist`.
- `pnpm start` - run compiled server.
- `pnpm check` - type-check without emitting files.
- `pnpm prisma:generate` - generate Prisma client.
- `pnpm prisma:migrate` - run Prisma migration against PostgreSQL.
- `pnpm prisma:studio` - open Prisma Studio.

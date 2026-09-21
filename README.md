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

For Vercel, add the variables from `.env.example` in the project settings under Environment Variables. This includes a strong, private `BETTER_AUTH_SECRET`; `.env.local` and `.env` are not available in the deployed runtime. Add the variables to the Production environment and redeploy after saving them.

## Scripts

- `pnpm dev` - run the TypeScript server with watch mode.
- `pnpm build` - compile TypeScript to `dist`.
- `pnpm start` - run compiled server.
- `pnpm check` - type-check without emitting files.
- `pnpm prisma:generate` - generate Prisma client.
- `pnpm prisma:migrate` - run Prisma migration against PostgreSQL.
- `pnpm prisma:studio` - open Prisma Studio.

# Ahar Restaurant Server

Production-ready TypeScript and Express API for the Ahar restaurant management platform. The server provides restaurant operations, customer ordering, reservations, menu management, inventory, payments, staff administration, reporting, notifications, reviews, and settings.

## Features

- Menu and category management with images, pricing, availability, and filtering.
- Customer order creation, order tracking, order history, and staff status updates.
- Table reservations with customer cancellation and manager approval workflows.
- Inventory management for stock records and restaurant operations.
- Coupon creation, update, deletion, lookup, and application workflows.
- SSLCommerz payment initialization, validation, success, failure, cancellation, and IPN handling.
- Payment records and payment status management.
- Customer reviews linked to menu items.
- Staff invitations, role changes, activation/deactivation, and invite acceptance.
- Notifications with read and mark-all-as-read operations.
- Dashboard summaries, statistics, and CSV report export.
- Public and protected restaurant settings.
- Email notifications using EJS templates stored in `src/app/utils/templates`.
- PostgreSQL persistence through Prisma.
- Request validation with Zod, CORS configuration, security headers, request logging, rate limiting, and centralized error handling.

## Technology

- Node.js, TypeScript, Express 5
- PostgreSQL and Prisma
- Better Auth-compatible JWT verification through the frontend JWKS endpoint
- Zod validation
- Cloudinary and Multer for media uploads
- Nodemailer and EJS for email delivery
- SSLCommerz for online payments
- pnpm, ESLint, Prettier, Husky, and lint-staged

## Requirements

- Node.js 20 or newer
- pnpm 9 or newer
- PostgreSQL 14 or newer
- A frontend that exposes the Better Auth JWKS endpoint at `${FRONTEND_URL}/api/auth/jwks` when bearer-token authentication is used

## Quick Start

```bash
pnpm install
copy .env.example .env.local
pnpm generate
pnpm migrate
pnpm dev
```

The API starts on `http://localhost:8000` with the development configuration. The frontend origin defaults to `http://localhost:3000`.

On macOS or Linux, use `cp .env.example .env.local` instead of the Windows `copy` command.

## Environment Configuration

The server loads environment files in this order:

1. `.env.local`
2. `.env.<NODE_ENV>` such as `.env.development` or `.env.production`
3. `.env`

Earlier files take precedence because dotenv does not overwrite values already loaded. Vercel-provided environment variables are used in the deployed runtime; local `.env` files are not deployed automatically.

Copy `.env.example` to `.env.local` and replace the demo values before using external services. The application validates these required variables at startup:

| Group             | Variables                                                                                                                                                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime           | `PORT`, `NODE_ENV`, `FRONTEND_URL`                                                                                                                                                                                                                    |
| Database and auth | `DATABASE_URL`, `BETTER_AUTH_SECRET`                                                                                                                                                                                                                  |
| Cloudinary        | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`                                                                                                                                                                                |
| Email             | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`                                                                                                                                                                                       |
| Admin             | `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASS`                                                                                                                                                                                                               |
| SSLCommerz        | `SSL_STORE_ID`, `SSL_STORE_PASS`, `SSL_PAYMENT_API`, `SSL_VALIDATION_API`, `SSL_IPN_URL`, `SSL_SUCCESS_BACKEND_URL`, `SSL_FAIL_BACKEND_URL`, `SSL_CANCEL_BACKEND_URL`, `SSL_SUCCESS_FRONTEND_URL`, `SSL_FAIL_FRONTEND_URL`, `SSL_CANCEL_FRONTEND_URL` |
| Redis             | `REDIS_USERNAME`, `REDIS_PASSWORD`, `REDIS_HOST`, `REDIS_PORT`                                                                                                                                                                                        |

Never commit `.env.local`, `.env.development`, or `.env.production`. Use a long random value for `BETTER_AUTH_SECRET`, and use separate credentials for development and production.

## API

The API prefix is `/api/v1`. The health endpoint is available at `/health`, and the root endpoint is `/`.

| Resource      | Base path               | Main capabilities                                                    |
| ------------- | ----------------------- | -------------------------------------------------------------------- |
| Health        | `/health`               | Service health and runtime status                                    |
| Menu          | `/api/v1/menu`          | List, view, create, update, and delete menu items                    |
| Categories    | `/api/v1/category`      | List, view, create, update, delete, and demo category data           |
| Orders        | `/api/v1/orders`        | Create, track, list own orders, list all orders, and update status   |
| Reservations  | `/api/v1/reservations`  | Create, view, cancel, approve, update, delete, and list reservations |
| Payments      | `/api/v1/payments`      | Payment records, SSLCommerz initialization, and callbacks            |
| Inventory     | `/api/v1/inventory`     | Inventory listing, creation, update, and deletion                    |
| Coupons       | `/api/v1/coupons`       | Coupon listing, lookup, creation, update, and deletion               |
| Reviews       | `/api/v1/reviews`       | Menu-item reviews and review moderation                              |
| Notifications | `/api/v1/notifications` | List notifications and mark them read                                |
| Reports       | `/api/v1/reports`       | Summary, dashboard statistics, and CSV export                        |
| Settings      | `/api/v1/settings`      | Public settings and protected management                             |
| Staff         | `/api/v1/staff`         | Invitations, staff listing, roles, and active status                 |

### Authentication

Protected endpoints accept either:

- `Authorization: Bearer <token>`: verified against the frontend JWKS endpoint and its `/api/auth` issuer.
- Frontend proxy headers: `x-internal-secret` must match `BETTER_AUTH_SECRET`, together with `x-auth-user-id`.

Role checks are applied where required. The supported operational roles include `CASHIER`, `KITCHEN`, `MANAGER`, `OWNER`, and `SUPER_ADMIN`. Public customer flows include order creation, reservation creation, order lookup, reservation lookup, and public settings. Some customer endpoints require authentication to access the current user’s orders or reservations.

### SSLCommerz callbacks

The configured backend callback paths are:

```text
POST /api/v1/payments/sslcommerz/ipn
GET|POST /api/v1/payments/sslcommerz/success
GET|POST /api/v1/payments/sslcommerz/fail
GET|POST /api/v1/payments/sslcommerz/cancel
```

For production, use the live SSLCommerz endpoints and the deployed server URL. For development, use the sandbox endpoints and a publicly reachable HTTPS tunnel if SSLCommerz must call a local server.

## Database

Prisma schema files are organized under `prisma/schema`. The schema covers users, roles, menu items, categories, orders, reservations, payments, coupons, inventory, notifications, reviews, and settings.

Generate the client after dependency or schema changes:

```bash
pnpm generate
```

Create and apply a development migration:

```bash
pnpm migrate
```

Open Prisma Studio:

```bash
pnpm studio
```

The current migration history is stored under `prisma/schema/migrations`.

## Project Structure

```text
src/
 app/
  config/          Environment, Prisma, email, Cloudinary, and auth configuration
  helpers/         Application error helpers
  interfaces/      Shared TypeScript interfaces
  middlewares/     Auth, validation, logging, security, rate limiting, and errors
  modules/         Feature modules and route handlers
  routes/          API route composition
  seed/            Demo and administrator seed utilities
  shared/          Async handlers and response helpers
  utils/           Pagination, filtering, email, and templates
 server.ts          HTTP server entry point
 app.ts             Express application setup
prisma/
 schema/            Prisma schema files and migrations
```

Each feature module generally contains routes, controllers, services, validation, interfaces, and constants where needed.

## Scripts

| Command             | Purpose                                                                       |
| ------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`          | Run the server with `tsx` watch mode.                                         |
| `pnpm build`        | Generate Prisma, compile TypeScript, rewrite aliases, and copy EJS templates. |
| `pnpm vercel-build` | Run the production build used by Vercel.                                      |
| `pnpm start`        | Start the compiled server from `dist/server.js`.                              |
| `pnpm clean`        | Remove the `dist` directory.                                                  |
| `pnpm lint`         | Run ESLint.                                                                   |
| `pnpm lint:fix`     | Fix ESLint issues where possible.                                             |
| `pnpm format`       | Format supported project files with Prettier.                                 |
| `pnpm format:check` | Check formatting.                                                             |
| `pnpm generate`     | Generate the Prisma client.                                                   |
| `pnpm migrate`      | Run `prisma migrate dev`.                                                     |
| `pnpm studio`       | Open Prisma Studio.                                                           |

## Deployment

The production frontend is `https://ahar-restaurant-project.vercel.app` and the production server is `https://ahar-resturant-server.vercel.app`.

For Vercel:

1. Add every variable from `.env.production` to the Vercel project’s **Production** environment.
2. Set `NODE_ENV=production`.
3. Set `FRONTEND_URL=https://ahar-restaurant-project.vercel.app`.
4. Use a production PostgreSQL connection string and a strong `BETTER_AUTH_SECRET`.
5. Use live SSLCommerz credentials and the production callback URLs.
6. Redeploy after saving the variables.

`vercel.json` builds `dist/server.js` with `@vercel/node` and routes requests to the compiled Express server. The build also copies EJS templates into `dist/app/utils/templates`.

## Development Practices

- Keep secrets in ignored environment files or the deployment provider’s secret store.
- Validate request bodies with the existing Zod validation layer.
- Keep controllers thin and place business logic in services.
- Run `pnpm lint` and `pnpm build` before deployment.
- Add or update Prisma migrations when changing persisted data models.
- Do not use sandbox payment credentials in production.

## License

This project is private and intended for the Ahar restaurant management system.

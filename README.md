# Ahar Server

Backend API for the Ahar restaurant management system.

The server now uses a structured Express app with validation, centralized errors, request logging, and JSON-backed persistence. The JSON store is still temporary; the next backend milestone is a real database and authentication.

## Run

```bash
npm run dev
```

Default URL: `http://localhost:4000`

Copy environment defaults when needed:

```bash
cp .env.example .env
```

## Current Endpoints

- `GET /health`
- `GET /api/:collection`
- `POST /api/:collection`
- `GET /api/:collection/:id`
- `PATCH /api/:collection/:id`
- `DELETE /api/:collection/:id`

Supported collections:

- `menu`
- `orders`
- `reservations`
- `payments`
- `inventory`
- `settings`
- `notifications`

Data is stored in `data/db.json`, so changes survive server restarts. This scaffold is intentionally simple and should be replaced or extended with authentication, role-based access control, validation, and a production database before live use.

## Query Support

List endpoints support:

- `page`
- `pageSize`
- `search`
- `status`
- `category`

Example:

```text
GET /api/menu?page=1&pageSize=20&search=kacchi
```

## Response Shapes

List response:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

Single resource response:

```json
{
  "data": {}
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "fields": {}
  }
}
```

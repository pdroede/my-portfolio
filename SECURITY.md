# Security Roadmap

This document tracks the security posture of this project and outlines planned hardening measures for future iterations.

---

## Current Status

This is a **static frontend** (React + Vite). It can be served from **GitHub Pages** (workflow in `.github/workflows/`) or **Vercel** (`vercel.json` SPA fallback). The current attack surface is minimal:

- No backend server
- No database
- No user authentication
- No user-generated input
- No API keys in client-side code

The items below are planned for when the project evolves to include a backend, database, or authenticated features.

---

## Implemented

- [x] **SPA routing** — `vercel.json` rewrites all routes to `index.html` (Vercel). On **GitHub Pages**, the workflow copies `index.html` to `404.html` so deep links (e.g. `/trabalhos/:slug`) load the app.

- [x] **Dependency audit** — run `npm audit --audit-level=high` before releases; address high/critical issues (e.g. dev-server issues in Vite affect local `npm run dev`, not the static Pages output).

- [x] **`.gitignore` hygiene** — `.env`, secrets, raw trade data paths (`*.csv`, `public/data/`, etc.), and build artifacts excluded from version control

### Optional hardening (not required for a static portfolio now)

- **HTTP security headers** (CSP, `X-Frame-Options`, HSTS, etc.) are **not** set in this repo today. **Vercel** can add them via `vercel.json` headers; **GitHub Pages** does not support custom response headers on `*.github.io`. You can add headers later via a reverse proxy (e.g. Cloudflare) or by moving the host to Vercel/Netlify. **Recommendation:** treat this as **later** unless you need CSP for compliance; the site has no auth or user input.

- **Spline / third-party embeds** — the hero uses a public Spline scene URL (`prod.spline.design/...`). That is normal for embeds; it is not a secret key. If a scene must stay private, restrict publication in the Spline dashboard (product-side), not only in code.

---

## Planned — Backend / API Layer

> Applies when a Node.js / Python API is added.

- [ ] **Environment variables** — all secrets (API keys, tokens, DB credentials) stored in `.env` files, never hardcoded or committed. Use `dotenv` + server-side only access.

- [ ] **API key exposure prevention** — any third-party service key (market data providers, analytics, etc.) must be proxied through the backend. Keys never sent to the client.

- [ ] **Rate limiting** — implement per-IP and per-route rate limiting using a middleware (e.g., `express-rate-limit` for Node, `slowapi` for Python/FastAPI). Protect public endpoints from abuse and DDoS.
  ```
  Suggested limits:
  - Public endpoints:   100 req / 15 min / IP
  - Auth endpoints:     10  req / 15 min / IP
  - Data endpoints:     30  req / min  / user
  ```

- [ ] **Input sanitization & validation** — validate and sanitize all incoming data at the API boundary using a schema validation library (e.g., `zod`, `joi`, or `pydantic`). Never trust client-supplied data.
  - Reject unexpected fields
  - Enforce type, length, and format constraints
  - Escape output to prevent XSS if rendering user content

- [ ] **CORS policy** — restrict `Access-Control-Allow-Origin` to known domains only. No wildcard `*` on authenticated routes.

- [ ] **HTTP-only cookies** — if sessions or tokens are used, store them in `HttpOnly; Secure; SameSite=Strict` cookies. Never in `localStorage`.

---

## Planned — Database Layer

> Applies when a database (e.g., PostgreSQL / Supabase) is added.

- [ ] **Row Level Security (RLS)** — enable RLS on all tables in Supabase/PostgreSQL. Every query must pass through a policy that validates the requesting user's identity.
  ```sql
  -- Example policy: users can only read their own data
  CREATE POLICY "user_isolation" ON trades
    FOR SELECT USING (auth.uid() = user_id);
  ```

- [ ] **Principle of least privilege** — database roles scoped to minimum required permissions. Application user must not have `DROP`, `TRUNCATE`, or schema-level access.

- [ ] **Parameterized queries** — no raw string interpolation in SQL. Use ORM or parameterized statements to prevent SQL injection.

- [ ] **Audit logging** — log all write operations (INSERT, UPDATE, DELETE) with timestamp and user ID for traceability.

---

## Planned — Authentication

> Applies when user accounts are introduced.

- [ ] **Auth provider** — use a battle-tested provider (Supabase Auth, Auth0, Clerk) rather than rolling custom auth.

- [ ] **JWT validation** — verify signature, expiry, and audience on every protected request server-side.

- [ ] **Refresh token rotation** — short-lived access tokens (15 min) with rotating refresh tokens.

- [ ] **Brute-force protection** — lock account or require CAPTCHA after N failed login attempts.

---

## Dependency Audit Log

| Date       | Command         | Result                        |
|------------|-----------------|-------------------------------|
| 2026-04-04 | `npm audit`     | 0 high / 0 critical           |
| 2026-04-07 | `npm audit fix` | Vite updated; 0 high / 0 critical |

Run before each deployment:
```bash
npm audit --audit-level=high
```

---

## Reporting a Vulnerability

If you discover a security issue, please open a private GitHub issue or reach out directly. Do not disclose publicly before a fix is in place.

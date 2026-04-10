# ClubHub UVG — Hackathon Task Split

## Current state

| Area | Status |
|------|--------|
| Backend project structure (TS, Express, pg, JWT, bcrypt) | ✅ Done |
| DB schema (`backend/db/init.sql`) | ✅ Done |
| All route files registered with stubs | ✅ Done |
| Shared types, AppError, error middleware, auth middleware | ✅ Done |
| Frontend pages: clubs list, club detail, events list, event detail | ✅ Done |
| Frontend mock SDK (fully working with in-memory data) | ✅ Done |
| Frontend real HTTP client scaffold (`lib/sdk/api-client.ts`) | ✅ Done |
| **Backend route logic** | ❌ All stubs |
| **Frontend: create/edit/delete modals** | ❌ Missing |
| **Frontend: members page** | ❌ Missing |
| **Frontend: admin login page + auth** | ❌ Missing |
| **Frontend: swap mock → real API** | ❌ Pending |

---

## Running the project locally

### Backend
```bash
cd backend
npm install
cp .env.example .env   # edit DB credentials if needed
npm run dev            # tsx watch — no compilation step
```
> Needs a local Postgres instance. Quickest way: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=clubhub postgres:16-alpine`
> Then run `psql -h localhost -U postgres -d clubhub -f db/init.sql` once to create tables.

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```
> Currently uses the **mock SDK** — no backend needed. Switch to real API per the instructions in each person's section below.

---

## Person 1 — Backend: Members + Admin

**Files to work in:**
- `backend/src/routes/members.ts`
- `backend/src/routes/admin.ts`

### Members endpoints

| Route | What to implement |
|-------|-------------------|
| `GET /members` | Query all rows, `WHERE name ILIKE` or `lastname ILIKE` if `search` param, `LIMIT`/`OFFSET` for pagination. Return `{ data, total, page, limit, total_pages }` |
| `GET /members/search` | `WHERE (name ILIKE $1 OR lastname ILIKE $1) LIMIT $2`. `q` required, min 2 chars |
| `GET /members/:id` | Single row by id. Throw `AppError(404, 'MEMBER_NOT_FOUND')` if missing |
| `POST /members` | Insert row. Validate `name` and `lastname` present (throw `AppError(400, 'VALIDATION_ERROR')`) |
| `PUT /members/:id` | Update name/lastname with `COALESCE`. 404 if not found |
| `DELETE /members/:id` | Check no rows in `club_member` first (throw `AppError(409, 'MEMBER_HAS_CLUBS')`), then delete |

### Admin auth — ✅ already implemented

> `backend/src/routes/admin.ts` is done. No work needed here. Read this so you understand how auth works when protecting your own routes.

There is no user table and no email/password system. Auth works like this:

1. The backend has a single password stored in `.env` as `ADMIN_PASSWORD`
2. The frontend POSTs `{ password }` to `/api/v1/admin/login`
3. The backend compares it with `process.env.ADMIN_PASSWORD`. If it matches, it signs a JWT with `{ role: 'admin' }` using `JWT_SECRET` and returns `{ data: { token } }`
4. The frontend stores the token and sends it as `Authorization: Bearer <token>` on subsequent requests

**If you need to protect a route**, import `requireAuth` and use it as middleware:

```ts
import { requireAuth } from '../middleware/auth';

router.delete('/:id', requireAuth, async (req, res, next) => { ... })
```

The middleware verifies the JWT and attaches `req.admin = { role: 'admin' }` to the request. If the token is missing or invalid it responds 401 automatically — you don't need to handle it.

**Tip:** `pool` is imported from `../config/database`. All handlers already have `try/catch → next(err)`.

---

## Person 2 — Backend: Clubs + Events

**Files to work in:**
- `backend/src/routes/clubs.ts`
- `backend/src/routes/events.ts`

### Clubs endpoints

| Route | What to implement |
|-------|-------------------|
| `GET /clubs` | List with pagination + search. Include `member_count` via subquery: `(SELECT COUNT(*) FROM club_member WHERE id_club = club.id)` |
| `GET /clubs/:id` | Single club + `member_count`. 404 if missing |
| `POST /clubs` | Insert. Validate `name`, `description`, `schedule`, `location` |
| `PUT /clubs/:id` | Update with COALESCE. 404 if missing |
| `DELETE /clubs/:id` | Delete (cascade handles members/events via FK). 404 if missing |

### Club members endpoints (inside `clubs.ts`)

| Route | What to implement |
|-------|-------------------|
| `GET /clubs/:id/members` | JOIN `club_member` + `member`. Return member info nested under `member` key. Paginate |
| `POST /clubs/:id/members` | Insert into `club_member`. Throw `AppError(409, 'MEMBER_ALREADY_ASSIGNED')` on duplicate PK |
| `POST /clubs/:id/members/create-and-assign` | INSERT into `member` then INSERT into `club_member` in a transaction |
| `DELETE /clubs/:id/members/:memberId` | Delete from `club_member`. 404 if row not found |

### Events endpoints

| Route | What to implement |
|-------|-------------------|
| `GET /events` | List with pagination + search + optional `id_club` filter + `upcoming` (datetime > NOW()). JOIN club for `{ id, name }` |
| `GET /events/:id` | Single event + club info. 404 if missing |
| `POST /events` | Validate required fields. Verify `id_club` exists (404) |
| `PUT /events/:id` | Update with COALESCE. 404 if missing |
| `DELETE /events/:id` | Delete. 404 if missing |
| `GET /clubs/:id/events` | Filter events by `id_club`, optional `upcoming` filter |

---

## Person 3 — Frontend: Members page + Auth

**Files to create:**
- `frontend/app/(dashboard)/members/page.tsx`
- `frontend/app/login/page.tsx`
- `frontend/lib/auth.ts` (token helpers)

### Members page

Build a page similar to the clubs page. It needs:
- List members with pagination (use `client.members.list`)
- Search input (debounced, same pattern as clubs page)
- "Nuevo Miembro" button → dialog form with `name` + `lastname` fields → `client.members.create`
- Edit button per row → dialog pre-filled → `client.members.update({ id, data: {...} })`
- Delete button per row → confirm → `client.members.delete` (handle `MEMBER_HAS_CLUBS` error gracefully with a toast)

Add the Members link to the sidebar (`components/app-sidebar.tsx`):
```tsx
{ title: "Miembros", href: "/members", icon: Users }
```

### Admin login page

No user accounts — just a single hardcoded password set in the backend `.env` (`ADMIN_PASSWORD`).

- Simple centered form: **one password field only**
- POST to `apiClient.admin.login({ password })` — the backend checks it against `process.env.ADMIN_PASSWORD` and returns a JWT
- On success: save token to `localStorage`, redirect to `/clubs`
- On 401: show "Contraseña incorrecta"

> The login is already fully implemented on the backend — nothing left to do there.

### Auth token helpers (`lib/auth.ts`)

```ts
export const saveToken = (token: string) => localStorage.setItem('token', token)
export const getToken = () => localStorage.getItem('token')
export const clearToken = () => localStorage.removeItem('token')
```

Call `setToken(getToken())` from `api-client.ts` on app load (e.g. in `app/layout.tsx`).

> To log out: call `clearToken()` + `setToken(null)` + redirect to `/login`.

### Switch from mock to real API

In each page that you create, import from the real client:
```ts
import { apiClient as client } from '@/lib/sdk/api-client'
```

---

## Person 4 — Frontend: Clubs + Events CRUD

**Files to edit:**
- `frontend/app/(dashboard)/clubs/page.tsx` — add Create modal
- `frontend/app/(dashboard)/clubs/[id]/page.tsx` — add Edit / Delete
- `frontend/app/(dashboard)/events/page.tsx` — add Create modal
- `frontend/app/(dashboard)/events/[id]/page.tsx` — add Edit / Delete

### Clubs

- **Create club** — wire up the existing "Nuevo Club" button to a `Dialog` with fields: `name`, `description`, `schedule`, `location` → `client.clubs.create`
- **Edit club** — on club detail page, add an edit button that opens a pre-filled dialog → `client.clubs.update({ id, data: {...} })`
- **Delete club** — add a delete button on club detail page → confirm → `client.clubs.delete` → redirect to `/clubs`

### Events

- **Create event** — wire up "Nuevo Evento" button to a `Dialog` with fields: `name`, `description`, `datetime` (date+time input), `location`, `max_participants`, `id_club` (dropdown of clubs) → `client.events.create`
- **Edit event** — on event detail, the "Editar" button already exists → open pre-filled dialog → `client.events.update`
- **Delete event** — add a delete button on event detail → confirm → `client.events.delete` → redirect to `/events`

### Switch from mock to real API

In each file you edit, swap the import:
```ts
import { apiClient as client } from '@/lib/sdk/api-client'
```

---

## Shared notes

- **Error handling:** all API errors throw with `{ message, code }`. Show the `message` in a toast (the project has `sonner` installed: `import { toast } from 'sonner'`).
- **DB pool:** imported as `import pool from '../config/database'`. Use `pool.query(sql, [params])`. For transactions use `pool.connect()` → `client.query('BEGIN')` → ... → `COMMIT/ROLLBACK` → `client.release()`.
- **AppError:** `throw new AppError('message', httpStatus, 'ERROR_CODE')` — the error middleware handles the rest.
- **All backend stubs** already have `try/catch → next(err)`, just replace the `// TODO` with real queries.

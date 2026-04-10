# ClubHub UVG — Sistema de gestión de clubes

Aplicación web para administrar **clubes estudiantiles**, **miembros** y **eventos**, con API REST en Node.js y panel de administración en Next.js. El backend está pensado como **ClubHub UVG** (descripción en `backend/package.json`).

## Tabla de contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Configuración e instalación](#configuración-e-instalación)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [API REST](#api-rest)
- [Autenticación de administrador](#autenticación-de-administrador)
- [Frontend (Next.js)](#frontend-nextjs)
- [Manejo de errores](#manejo-de-errores)
- [Diagramas](#diagramas)

## Características

- **Clubes**: alta, edición, listado paginado con búsqueda, eliminación; conteo de miembros por club.
- **Miembros**: CRUD, búsqueda rápida (`/members/search`), listado paginado; no se puede eliminar un miembro si aún pertenece a algún club.
- **Asignación a clubes**: asignar miembro existente, crear miembro y asignar en una transacción, listar miembros de un club, quitar asignación.
- **Eventos**: CRUD global, filtros por club, texto y eventos futuros (`upcoming`); cada evento pertenece a un club.
- **Salud del servicio**: `GET /api/v1/health` comprueba conexión a PostgreSQL.
- **Panel admin**: login por contraseña compartida, JWT en `localStorage`, rutas del dashboard protegidas en el cliente.

## Arquitectura

El proyecto es un **monorepo lógico** con dos paquetes independientes:

| Capa | Rol |
|------|-----|
| **Frontend** (`frontend/`) | Next.js (App Router), UI con Tailwind y componentes tipo shadcn, cliente HTTP hacia la API. |
| **Backend** (`backend/`) | Express + TypeScript, rutas versionadas bajo `/api/v1`, acceso a datos con `pg` (pool). |
| **PostgreSQL** | Persistencia; esquema definido en SQL inicial. |

El navegador llama a la API mediante `fetch` (`NEXT_PUBLIC_API_URL` + `/api/v1`). El token JWT se envía en el header `Authorization: Bearer <token>` en las rutas que lo requieran (por ejemplo `admin/logout`, `admin/me`).

## Stack tecnológico

**Backend**

- Node.js, Express 4, TypeScript
- `pg` (PostgreSQL)
- `jsonwebtoken`, `dotenv`
- Ejecución en desarrollo: `tsx watch`

**Frontend**

- Next.js 16, React 19
- Tailwind CSS 4, Radix UI, `lucide-react`, `sonner`, etc.
- Formularios y validación: `react-hook-form`, `zod` (según dependencias del proyecto)

**Base de datos**

- PostgreSQL (recomendado usar el script `init.sql` para crear tablas)

## Estructura del repositorio

```
todolistway/
├── backend/
│   ├── db/
│   │   └── init.sql          # Esquema SQL (tablas y FKs)
│   └── src/
│       ├── app.ts            # Entrada del servidor Express
│       ├── config/
│       │   └── database.ts   # Pool de conexiones pg
│       ├── middleware/
│       │   ├── auth.ts       # requireAuth (JWT admin)
│       │   ├── errorHandler.ts
│       │   └── notFound.ts
│       ├── routes/
│       │   ├── index.ts      # Montaje de routers + /health
│       │   ├── members.ts
│       │   ├── clubs.ts
│       │   ├── events.ts
│       │   └── admin.ts
│       └── types/
│           └── index.ts      # Tipos de dominio y AppError
├── frontend/
│   ├── app/
│   │   ├── login/            # Página de login admin
│   │   └── (dashboard)/      # Clubes, eventos (layout con sidebar)
│   ├── components/           # UI (sidebar, auth-initializer, etc.)
│   └── lib/
│       ├── auth.ts           # localStorage del token
│       └── sdk/
│           ├── api-client.ts # Cliente API + setToken
│           └── types.ts      # Tipos alineados con la API
└── docs/                     # Diagramas draw.io (ver sección Diagramas)
```

## Requisitos previos

- Node.js (versión compatible con las dependencias del `package.json` de cada paquete)
- PostgreSQL accesible (local o remoto)
- npm (o el gestor que uses con los `package-lock.json` existentes)

## Configuración e instalación

### Backend

```bash
cd backend
npm install
```

Crear base de datos y ejecutar el esquema:

```bash
# Ejemplo: aplicar init.sql con tu cliente psql o herramienta gráfica
psql -U <usuario> -d <nombre_bd> -f db/init.sql
```

Copiar variables de entorno (ver siguiente sección), luego:

```bash
npm run dev      # desarrollo (tsx watch)
# o
npm run build && npm start
```

Por defecto el servidor escucha en el puerto **3000** (o el definido en `PORT`).

### Frontend

```bash
cd frontend
npm install
```

Definir `NEXT_PUBLIC_API_URL` apuntando a la URL base del backend **sin** el sufijo `/api/v1` (el cliente lo añade solo). Si no se define, se usa `http://localhost:3000`.

```bash
npm run dev
```

En desarrollo suele usarse otro puerto para Next.js (por ejemplo 3001) si el backend ya ocupa 3000; en ese caso `NEXT_PUBLIC_API_URL=http://localhost:3000`.

## Variables de entorno

### Backend (`.env` en `backend/`)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto HTTP del API (opcional, por defecto 3000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión PostgreSQL |
| `ADMIN_PASSWORD` | Contraseña compartida para `POST /api/v1/admin/login` |
| `JWT_SECRET` | Secreto para firmar y verificar JWT |

> **Nota:** Existe la tabla `admin` en la base de datos con email y hash de contraseña, pero el flujo de login implementado compara la contraseña del cuerpo de la petición con `ADMIN_PASSWORD` y emite un JWT con `{ role: 'admin' }`. La tabla `admin` queda disponible para usos futuros o semillas de datos.

### Frontend

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base del backend (ej. `http://localhost:3000`) |

## Base de datos

El archivo `backend/db/init.sql` define:

| Tabla | Descripción |
|-------|-------------|
| `member` | Personas que pueden pertenecer a clubes |
| `club` | Clubes (nombre, descripción, horario, ubicación) |
| `club_member` | Relación N:M entre miembro y club (`date_assign`) |
| `event` | Eventos ligados a un `club` (`id_club`, fecha/hora, cupo máximo, etc.) |
| `admin` | Cuentas de administrador (esquema persistido; login actual vía env + JWT) |

Relaciones principales:

- Un **miembro** puede estar en varios **clubes** (`club_member`).
- Un **club** tiene muchos **eventos**.
- Al borrar un club se eliminan en cascada miembros-asignación y eventos asociados (según FKs del script).

## API REST

Prefijo común: **`/api/v1`**.

### Salud

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | `{ status, db }` según `SELECT 1` |

### Miembros

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/members` | Lista paginada (`page`, `limit`, `search`) |
| GET | `/members/search` | Búsqueda por `q` (mín. 2 caracteres), `limit` |
| GET | `/members/:id` | Detalle |
| POST | `/members` | Crear `{ name, lastname }` |
| PUT | `/members/:id` | Actualizar (campos opcionales con `COALESCE`) |
| DELETE | `/members/:id` | Eliminar (409 si tiene clubes) |

### Clubes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/clubs` | Lista paginada + `member_count`, `search` |
| GET | `/clubs/:id` | Detalle + `member_count` |
| POST | `/clubs` | Crear (validación de longitudes en servidor) |
| PUT | `/clubs/:id` | Actualizar |
| DELETE | `/clubs/:id` | Eliminar |
| GET | `/clubs/:id/members` | Miembros del club (paginado) |
| POST | `/clubs/:id/members` | Asignar `{ id_member }` (409 si duplicado) |
| POST | `/clubs/:id/members/create-and-assign` | Crear miembro y asignar (transacción) |
| DELETE | `/clubs/:id/members/:memberId` | Quitar asignación |
| GET | `/clubs/:id/events` | Eventos del club; `upcoming=true` filtra futuros |

### Eventos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/events` | Lista paginada; query: `search`, `id_club`, `upcoming` |
| GET | `/events/:id` | Detalle |
| POST | `/events` | Crear (requiere `id_club` existente) |
| PUT | `/events/:id` | Actualizar |
| DELETE | `/events/:id` | Eliminar |

### Admin

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/admin/login` | No | `{ password }` → `{ data: { token } }` |
| POST | `/admin/logout` | JWT | Respuesta OK (stateless; el cliente borra el token) |
| GET | `/admin/me` | JWT | `{ data: { role: 'admin' } }` |

## Autenticación de administrador

1. El cliente envía `POST /api/v1/admin/login` con `{ "password": "..." }`.
2. Si coincide con `ADMIN_PASSWORD`, el servidor firma un JWT (expiración 12 h) con payload `{ role: 'admin' }`.
3. El frontend guarda el token en `localStorage` (`clubhub_token`) y llama a `setToken()` del SDK para incluirlo en peticiones posteriores.
4. `AuthInitializer` (en el layout raíz) rehidrata el token en memoria al cargar la app.
5. El layout del dashboard redirige a `/login` si no hay token.

Las rutas de negocio (miembros, clubes, eventos) **no** exigen JWT en el código actual; la protección principal es la del panel en el cliente. Si necesitas API privada, puedes aplicar `requireAuth` a los routers correspondientes.

## Frontend (Next.js)

- **`/login`**: formulario de contraseña → `apiClient.admin.login` → redirección a `/clubs`.
- **`/(dashboard)/clubs`**, **`/(dashboard)/clubs/[id]`**: gestión de clubes y miembros.
- **`/(dashboard)/events`**, **`/(dashboard)/events/[id]`**: listado y detalle de eventos.
- **`lib/sdk/api-client.ts`**: única capa de llamadas HTTP tipadas hacia la API.

## Manejo de errores

Los errores controlados se exponen como JSON:

```json
{ "error": "mensaje", "code": "CODIGO", "details": { "campo": "..." } }
```

Códigos frecuentes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `MEMBER_NOT_FOUND`, `CLUB_NOT_FOUND`, `EVENT_NOT_FOUND`, `MEMBER_ALREADY_ASSIGNED`, `MEMBER_HAS_CLUBS`, `INTERNAL_ERROR`.

## Diagramas

En la carpeta `docs/` hay archivos **XML compatibles con draw.io** (diagrams.net):

| Archivo | Contenido |
|---------|-----------|
| `docs/diagrama-entidades.xml` | Modelo entidad-relación (tablas y relaciones) |
| `docs/diagrama-secuencia-todos-endpoints.xml` | **Secuencias de toda la API** (`/api/v1`): un solo documento con **varias pestañas** — índice de endpoints, `GET /health` con flechas completas, desglose por recurso (miembros, clubes, eventos, admin), y pestaña «Patrón CRUD + BD». |
| `docs/diagrama-secuencia.xml` | Secuencia detallada solo del login de administrador (referencia rápida). |

**Cómo abrirlos:** en [draw.io / diagrams.net](https://app.diagrams.net) → *Archivo* → *Abrir desde* → *Dispositivo* y selecciona el `.xml`. En el archivo de todos los endpoints, cambia de página con las **pestañas** en la barra inferior del lienzo.

---

## Licencia

Revisa los campos `license` de cada `package.json` del repositorio.

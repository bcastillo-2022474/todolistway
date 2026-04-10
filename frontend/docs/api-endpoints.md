# API Endpoints - ClubHub UVG

Base URL: `{BACKEND_URL}/api/v1`

---

## Members

### GET /members
Lista todos los miembros con paginación y búsqueda.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Página actual (default: 1) |
| limit | number | No | Cantidad por página (default: 10) |
| search | string | No | Búsqueda por nombre o apellido |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Juan",
      "lastname": "Pérez",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10
}
```

---

### GET /members/:id
Obtiene un miembro por ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del miembro |

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Juan",
    "lastname": "Pérez",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Member not found",
  "code": "MEMBER_NOT_FOUND"
}
```

---

### POST /members
Crea un nuevo miembro.

**Request Body:**
```json
{
  "name": "Juan",
  "lastname": "Pérez"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Nombre del miembro (max 100 chars) |
| lastname | string | Yes | Apellido del miembro (max 100 chars) |

**Response (201):**
```json
{
  "data": {
    "id": 1,
    "name": "Juan",
    "lastname": "Pérez",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Member created successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "name": "Name is required",
    "lastname": "Lastname is required"
  }
}
```

---

### PUT /members/:id
Actualiza un miembro existente.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del miembro |

**Request Body:**
```json
{
  "name": "Juan Carlos",
  "lastname": "Pérez González"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Nombre del miembro |
| lastname | string | No | Apellido del miembro |

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Juan Carlos",
    "lastname": "Pérez González",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Member updated successfully"
}
```

---

### DELETE /members/:id
Elimina un miembro.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del miembro |

**Response:**
```json
{
  "message": "Member deleted successfully",
  "deleted_id": 1
}
```

**Error Response (409):**
```json
{
  "error": "Cannot delete member with active club memberships",
  "code": "MEMBER_HAS_CLUBS"
}
```

---

### GET /members/search
Busca miembros por nombre (para autocompletado).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Término de búsqueda (min 2 chars) |
| limit | number | No | Cantidad máxima de resultados (default: 5) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Juan",
      "lastname": "Pérez"
    }
  ]
}
```

---

## Clubs

### GET /clubs
Lista todos los clubes con paginación.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Página actual (default: 1) |
| limit | number | No | Cantidad por página (default: 10) |
| search | string | No | Búsqueda por nombre |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Club de Robótica",
      "description": "Club dedicado al diseño y construcción de robots",
      "schedule": "Martes y Jueves 15:00-17:00",
      "location": "Edificio de Ingeniería, Lab 201",
      "created_at": "2024-01-10T08:00:00Z",
      "member_count": 15
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10,
  "total_pages": 2
}
```

---

### GET /clubs/:id
Obtiene un club por ID con información detallada.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del club |

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Club de Robótica",
    "description": "Club dedicado al diseño y construcción de robots",
    "schedule": "Martes y Jueves 15:00-17:00",
    "location": "Edificio de Ingeniería, Lab 201",
    "created_at": "2024-01-10T08:00:00Z",
    "member_count": 15
  }
}
```

---

### POST /clubs
Crea un nuevo club.

**Request Body:**
```json
{
  "name": "Club de Robótica",
  "description": "Club dedicado al diseño y construcción de robots",
  "schedule": "Martes y Jueves 15:00-17:00",
  "location": "Edificio de Ingeniería, Lab 201"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Nombre del club (max 150 chars) |
| description | string | Yes | Descripción del club (max 500 chars) |
| schedule | string | Yes | Horario de reuniones (max 100 chars) |
| location | string | Yes | Ubicación de reuniones (max 150 chars) |

**Response (201):**
```json
{
  "data": {
    "id": 1,
    "name": "Club de Robótica",
    "description": "Club dedicado al diseño y construcción de robots",
    "schedule": "Martes y Jueves 15:00-17:00",
    "location": "Edificio de Ingeniería, Lab 201",
    "created_at": "2024-01-10T08:00:00Z"
  },
  "message": "Club created successfully"
}
```

---

### PUT /clubs/:id
Actualiza un club existente.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del club |

**Request Body:**
```json
{
  "name": "Club de Robótica Avanzada",
  "description": "Club dedicado al diseño y construcción de robots autónomos",
  "schedule": "Lunes, Miércoles y Viernes 16:00-18:00",
  "location": "Edificio de Ingeniería, Lab 305"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Nombre del club |
| description | string | No | Descripción del club |
| schedule | string | No | Horario de reuniones |
| location | string | No | Ubicación de reuniones |

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Club de Robótica Avanzada",
    "description": "Club dedicado al diseño y construcción de robots autónomos",
    "schedule": "Lunes, Miércoles y Viernes 16:00-18:00",
    "location": "Edificio de Ingeniería, Lab 305",
    "created_at": "2024-01-10T08:00:00Z"
  },
  "message": "Club updated successfully"
}
```

---

### DELETE /clubs/:id
Elimina un club.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del club |

**Response:**
```json
{
  "message": "Club deleted successfully",
  "deleted_id": 1
}
```

---

## Club Members (Asignaciones)

### GET /clubs/:id/members
Obtiene todos los miembros de un club.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del club |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Página actual (default: 1) |
| limit | number | No | Cantidad por página (default: 20) |

**Response:**
```json
{
  "data": [
    {
      "id_member": 1,
      "id_club": 1,
      "date_assign": "2024-02-01T10:00:00Z",
      "member": {
        "id": 1,
        "name": "Juan",
        "lastname": "Pérez"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "total_pages": 1
}
```

---

### POST /clubs/:id/members
Asigna un miembro existente a un club.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del club |

**Request Body:**
```json
{
  "id_member": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id_member | number | Yes | ID del miembro a asignar |

**Response (201):**
```json
{
  "data": {
    "id_member": 1,
    "id_club": 1,
    "date_assign": "2024-02-01T10:00:00Z",
    "member": {
      "id": 1,
      "name": "Juan",
      "lastname": "Pérez"
    }
  },
  "message": "Member assigned to club successfully"
}
```

**Error Response (409):**
```json
{
  "error": "Member is already assigned to this club",
  "code": "MEMBER_ALREADY_ASSIGNED"
}
```

---

### POST /clubs/:id/members/create-and-assign
Crea un nuevo miembro y lo asigna al club en un solo paso.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del club |

**Request Body:**
```json
{
  "name": "María",
  "lastname": "García"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Nombre del nuevo miembro |
| lastname | string | Yes | Apellido del nuevo miembro |

**Response (201):**
```json
{
  "data": {
    "member": {
      "id": 2,
      "name": "María",
      "lastname": "García",
      "created_at": "2024-02-15T14:30:00Z"
    },
    "assignment": {
      "id_member": 2,
      "id_club": 1,
      "date_assign": "2024-02-15T14:30:00Z"
    }
  },
  "message": "Member created and assigned to club successfully"
}
```

---

### DELETE /clubs/:id/members/:memberId
Remueve un miembro de un club.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del club |
| memberId | number | Yes | ID del miembro |

**Response:**
```json
{
  "message": "Member removed from club successfully"
}
```

---

## Events

### GET /events
Lista todos los eventos con paginación y filtros.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Página actual (default: 1) |
| limit | number | No | Cantidad por página (default: 10) |
| search | string | No | Búsqueda por nombre |
| id_club | number | No | Filtrar por club |
| upcoming | boolean | No | Solo eventos futuros |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "id_club": 1,
      "name": "Competencia de Robots",
      "description": "Competencia anual de robots autónomos",
      "datetime": "2024-03-15T09:00:00Z",
      "location": "Auditorio Principal",
      "max_participants": 50,
      "created_at": "2024-02-01T10:00:00Z",
      "current_participants": 30,
      "club": {
        "id": 1,
        "name": "Club de Robótica"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "total_pages": 3
}
```

---

### GET /events/:id
Obtiene un evento por ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del evento |

**Response:**
```json
{
  "data": {
    "id": 1,
    "id_club": 1,
    "name": "Competencia de Robots",
    "description": "Competencia anual de robots autónomos",
    "datetime": "2024-03-15T09:00:00Z",
    "location": "Auditorio Principal",
    "max_participants": 50,
    "created_at": "2024-02-01T10:00:00Z",
    "current_participants": 30,
    "club": {
      "id": 1,
      "name": "Club de Robótica"
    }
  }
}
```

---

### POST /events
Crea un nuevo evento.

**Request Body:**
```json
{
  "id_club": 1,
  "name": "Competencia de Robots",
  "description": "Competencia anual de robots autónomos",
  "datetime": "2024-03-15T09:00:00Z",
  "location": "Auditorio Principal",
  "max_participants": 50
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id_club | number | Yes | ID del club organizador |
| name | string | Yes | Nombre del evento (max 150 chars) |
| description | string | Yes | Descripción del evento (max 500 chars) |
| datetime | string | Yes | Fecha y hora (ISO 8601) |
| location | string | Yes | Ubicación del evento (max 150 chars) |
| max_participants | number | Yes | Capacidad máxima |

**Response (201):**
```json
{
  "data": {
    "id": 1,
    "id_club": 1,
    "name": "Competencia de Robots",
    "description": "Competencia anual de robots autónomos",
    "datetime": "2024-03-15T09:00:00Z",
    "location": "Auditorio Principal",
    "max_participants": 50,
    "created_at": "2024-02-01T10:00:00Z"
  },
  "message": "Event created successfully"
}
```

---

### PUT /events/:id
Actualiza un evento existente.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del evento |

**Request Body:**
```json
{
  "name": "Gran Competencia de Robots 2024",
  "description": "Competencia anual de robots autónomos - Edición especial",
  "datetime": "2024-03-20T10:00:00Z",
  "location": "Centro de Convenciones",
  "max_participants": 100
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Nombre del evento |
| description | string | No | Descripción del evento |
| datetime | string | No | Fecha y hora (ISO 8601) |
| location | string | No | Ubicación del evento |
| max_participants | number | No | Capacidad máxima |

**Response:**
```json
{
  "data": {
    "id": 1,
    "id_club": 1,
    "name": "Gran Competencia de Robots 2024",
    "description": "Competencia anual de robots autónomos - Edición especial",
    "datetime": "2024-03-20T10:00:00Z",
    "location": "Centro de Convenciones",
    "max_participants": 100,
    "created_at": "2024-02-01T10:00:00Z"
  },
  "message": "Event updated successfully"
}
```

---

### DELETE /events/:id
Elimina un evento.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del evento |

**Response:**
```json
{
  "message": "Event deleted successfully",
  "deleted_id": 1
}
```

---

### GET /clubs/:id/events
Obtiene todos los eventos de un club específico.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID del club |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| upcoming | boolean | No | Solo eventos futuros |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "id_club": 1,
      "name": "Competencia de Robots",
      "description": "Competencia anual de robots autónomos",
      "datetime": "2024-03-15T09:00:00Z",
      "location": "Auditorio Principal",
      "max_participants": 50,
      "created_at": "2024-02-01T10:00:00Z",
      "current_participants": 30
    }
  ]
}
```

---

## Admin (Autenticación)

### POST /admin/login
Inicia sesión de administrador.

**Request Body:**
```json
{
  "email": "admin@uvg.edu.gt",
  "password": "securepassword123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email del administrador |
| password | string | Yes | Contraseña |

**Response:**
```json
{
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin",
      "lastname": "Principal",
      "email": "admin@uvg.edu.gt"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

---

### POST /admin/logout
Cierra sesión del administrador.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {token} |

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

### GET /admin/me
Obtiene información del administrador autenticado.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer {token} |

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Admin",
    "lastname": "Principal",
    "email": "admin@uvg.edu.gt",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Error de validación en los datos enviados |
| UNAUTHORIZED | 401 | No autorizado / Token inválido |
| FORBIDDEN | 403 | Sin permisos para esta acción |
| MEMBER_NOT_FOUND | 404 | Miembro no encontrado |
| CLUB_NOT_FOUND | 404 | Club no encontrado |
| EVENT_NOT_FOUND | 404 | Evento no encontrado |
| MEMBER_ALREADY_ASSIGNED | 409 | Miembro ya asignado al club |
| MEMBER_HAS_CLUBS | 409 | No se puede eliminar miembro con clubes activos |
| INTERNAL_ERROR | 500 | Error interno del servidor |

---

## Request Headers

Todos los endpoints protegidos requieren:

```
Authorization: Bearer {token}
Content-Type: application/json
```

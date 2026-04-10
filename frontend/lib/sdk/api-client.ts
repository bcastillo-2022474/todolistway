import type {
  Member,
  Club,
  ClubMember,
  Event,
  GetByIdPayload,
  ListPayload,
  CreateMemberPayload,
  UpdateMemberPayload,
  SearchMemberPayload,
  CreateClubPayload,
  UpdateClubPayload,
  AssignMemberPayload,
  CreateAndAssignMemberPayload,
  CreateEventPayload,
  UpdateEventPayload,
  ListEventsPayload,
  PaginatedResponse,
  SingleResponse,
  DeleteResponse,
  CreateAndAssignResponse,
} from './types'

// ── Base fetcher ──────────────────────────────────────────────────────────────

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000') + '/api/v1'

let authToken: string | null = null

export function setToken(token: string | null) {
  authToken = token
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(BASE_URL + path)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText, code: 'UNKNOWN' }))
    throw Object.assign(new Error(err.error), { code: err.code, details: err.details, status: res.status })
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

const get  = <T>(path: string, params?: Record<string, string | number | boolean | undefined>) =>
  request<T>('GET', path, undefined, params)
const post = <T>(path: string, body?: unknown) => request<T>('POST', path, body)
const put  = <T>(path: string, body?: unknown) => request<T>('PUT', path, body)
const del  = <T>(path: string) => request<T>('DELETE', path)

// ── Members ───────────────────────────────────────────────────────────────────

const membersModule = {
  list: (payload?: ListPayload): Promise<PaginatedResponse<Member>> =>
    get('/members', payload),

  getById: (payload: GetByIdPayload): Promise<SingleResponse<Member>> =>
    get(`/members/${payload.id}`),

  search: (payload: SearchMemberPayload): Promise<{ data: Member[] }> =>
    get('/members/search', payload),

  create: (payload: CreateMemberPayload): Promise<SingleResponse<Member>> =>
    post('/members', payload),

  update: (payload: UpdateMemberPayload): Promise<SingleResponse<Member>> =>
    put(`/members/${payload.id}`, payload.data),

  delete: (payload: GetByIdPayload): Promise<DeleteResponse> =>
    del(`/members/${payload.id}`),
}

// ── Clubs ─────────────────────────────────────────────────────────────────────

const clubsModule = {
  list: (payload?: ListPayload): Promise<PaginatedResponse<Club>> =>
    get('/clubs', payload),

  getById: (payload: GetByIdPayload): Promise<SingleResponse<Club>> =>
    get(`/clubs/${payload.id}`),

  create: (payload: CreateClubPayload): Promise<SingleResponse<Club>> =>
    post('/clubs', payload),

  update: (payload: UpdateClubPayload): Promise<SingleResponse<Club>> =>
    put(`/clubs/${payload.id}`, payload.data),

  delete: (payload: GetByIdPayload): Promise<DeleteResponse> =>
    del(`/clubs/${payload.id}`),

  getMembers: (payload: GetByIdPayload & { page?: number; limit?: number }): Promise<PaginatedResponse<ClubMember & { member: Member }>> =>
    get(`/clubs/${payload.id}/members`, { page: payload.page, limit: payload.limit }),

  assignMember: (payload: AssignMemberPayload): Promise<SingleResponse<ClubMember & { member: Member }>> =>
    post(`/clubs/${payload.clubId}/members`, { id_member: payload.memberId }),

  createAndAssignMember: (payload: CreateAndAssignMemberPayload): Promise<CreateAndAssignResponse> =>
    post(`/clubs/${payload.clubId}/members/create-and-assign`, { name: payload.name, lastname: payload.lastname }),

  removeMember: (payload: AssignMemberPayload): Promise<{ message: string }> =>
    del(`/clubs/${payload.clubId}/members/${payload.memberId}`),

  getEvents: (payload: GetByIdPayload & { upcoming?: boolean }): Promise<{ data: Event[] }> =>
    get(`/clubs/${payload.id}/events`, { upcoming: payload.upcoming }),
}

// ── Events ────────────────────────────────────────────────────────────────────

const eventsModule = {
  list: (payload?: ListEventsPayload): Promise<PaginatedResponse<Event & { club?: Pick<Club, 'id' | 'name'> }>> =>
    get('/events', payload),

  getById: (payload: GetByIdPayload): Promise<SingleResponse<Event & { club?: Pick<Club, 'id' | 'name'> }>> =>
    get(`/events/${payload.id}`),

  create: (payload: CreateEventPayload): Promise<SingleResponse<Event>> =>
    post('/events', payload),

  update: (payload: UpdateEventPayload): Promise<SingleResponse<Event>> =>
    put(`/events/${payload.id}`, payload.data),

  delete: (payload: GetByIdPayload): Promise<DeleteResponse> =>
    del(`/events/${payload.id}`),

  getParticipants: (payload: GetByIdPayload): Promise<{ data: Pick<Member, 'id' | 'name' | 'lastname'>[] }> =>
    get(`/events/${payload.id}/participants`),

  addParticipant: (payload: { id: number; id_member: number }): Promise<{ message: string }> =>
    post(`/events/${payload.id}/participants`, { id_member: payload.id_member }),

  removeParticipant: (payload: { id: number; memberId: number }): Promise<{ message: string }> =>
    del(`/events/${payload.id}/participants/${payload.memberId}`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminModule = {
  login: (payload: { password: string }) =>
    post<{ data: { token: string }; message: string }>('/admin/login', payload),

  logout: () =>
    post<{ message: string }>('/admin/logout'),

  me: () =>
    get<{ data: Member }>('/admin/me'),
}

// ── Client ────────────────────────────────────────────────────────────────────

export const apiClient = {
  members: membersModule,
  clubs: clubsModule,
  events: eventsModule,
  admin: adminModule,
}

export * from './types'

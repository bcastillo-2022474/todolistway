// ============================================
// TIPOS PARA EL SDK DE GESTIÓN DE CLUBES UVG
// ============================================

export interface Member {
  id: number
  name: string
  lastname: string
  created_at: string
}

export interface Club {
  id: number
  name: string
  description: string
  schedule: string
  location: string
  created_at: string
  member_count?: number
}

export interface ClubMember {
  id_member: number
  id_club: number
  date_assign: string
  member?: Member
}

export interface Event {
  id: number
  id_club: number
  name: string
  description: string
  datetime: string
  location: string
  max_participants: number
  created_at: string
  current_participants?: number
  club?: Pick<Club, 'id' | 'name'>
}

export interface Admin {
  id: number
  name: string
  lastname: string
  email: string
  created_at: string
}

// Payloads para las operaciones
export interface GetByIdPayload {
  id: number
}

export interface ListPayload {
  page?: number
  limit?: number
  search?: string
}

export interface CreateMemberPayload {
  name: string
  lastname: string
}

export interface UpdateMemberPayload {
  id: number
  data: Partial<Pick<Member, 'name' | 'lastname'>>
}

export interface SearchMemberPayload {
  q: string
  limit?: number
}

export interface CreateClubPayload {
  name: string
  description: string
  schedule: string
  location: string
}

export interface UpdateClubPayload {
  id: number
  data: Partial<Pick<Club, 'name' | 'description' | 'schedule' | 'location'>>
}

export interface AssignMemberPayload {
  clubId: number
  memberId: number
}

export interface CreateAndAssignMemberPayload {
  clubId: number
  name: string
  lastname: string
}

export interface CreateEventPayload {
  id_club: number
  name: string
  description: string
  datetime: string
  location: string
  max_participants: number
}

export interface UpdateEventPayload {
  id: number
  data: Partial<Pick<Event, 'name' | 'description' | 'datetime' | 'location' | 'max_participants'>>
}

export interface ListEventsPayload extends ListPayload {
  id_club?: number
  upcoming?: boolean
}

// Respuestas
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface SingleResponse<T> {
  data: T
  message?: string
}

export interface DeleteResponse {
  message: string
  deleted_id: number
}

export interface CreateAndAssignResponse {
  data: {
    member: Member
    assignment: ClubMember
  }
  message: string
}

export interface ApiError {
  error: string
  code: string
  details?: Record<string, string>
}

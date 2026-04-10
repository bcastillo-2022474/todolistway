import { mockMembers, mockClubs, mockClubMembers, mockEvents } from './mock-data'
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
  CreateAndAssignResponse
} from './types'

// ============================================
// SDK CLIENT MOCKEADO
// ============================================

// Simular delay de red
const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms))

// Copias mutables de los datos
let members = [...mockMembers]
let clubs = [...mockClubs]
let clubMembers = [...mockClubMembers]
let events = [...mockEvents]

// Generador de IDs
let nextMemberId = Math.max(...members.map(m => m.id)) + 1
let nextClubId = Math.max(...clubs.map(c => c.id)) + 1
let nextEventId = Math.max(...events.map(e => e.id)) + 1

// ============================================
// MÓDULO DE MEMBERS
// ============================================
const membersModule = {
  async list(payload?: ListPayload): Promise<PaginatedResponse<Member>> {
    await delay()
    const { page = 1, limit = 10, search } = payload || {}
    
    let filtered = [...members]
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.lastname.toLowerCase().includes(searchLower)
      )
    }
    
    const total = filtered.length
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)
    
    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  },

  async getById(payload: GetByIdPayload): Promise<SingleResponse<Member>> {
    await delay()
    const member = members.find(m => m.id === payload.id)
    if (!member) throw new Error(`Member not found: ${payload.id}`)
    return { data: member }
  },

  async search(payload: SearchMemberPayload): Promise<{ data: Member[] }> {
    await delay()
    const { q, limit = 5 } = payload
    const searchLower = q.toLowerCase()
    
    const results = members
      .filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.lastname.toLowerCase().includes(searchLower)
      )
      .slice(0, limit)
    
    return { data: results }
  },

  async create(payload: CreateMemberPayload): Promise<SingleResponse<Member>> {
    await delay()
    const newMember: Member = {
      id: nextMemberId++,
      name: payload.name,
      lastname: payload.lastname,
      created_at: new Date().toISOString()
    }
    members.push(newMember)
    return { data: newMember, message: 'Member created successfully' }
  },

  async update(payload: UpdateMemberPayload): Promise<SingleResponse<Member>> {
    await delay()
    const index = members.findIndex(m => m.id === payload.id)
    if (index === -1) throw new Error(`Member not found: ${payload.id}`)
    members[index] = { ...members[index], ...payload.data }
    return { data: members[index], message: 'Member updated successfully' }
  },

  async delete(payload: GetByIdPayload): Promise<DeleteResponse> {
    await delay()
    const index = members.findIndex(m => m.id === payload.id)
    if (index === -1) throw new Error(`Member not found: ${payload.id}`)
    
    // Check if member has club assignments
    const hasClubs = clubMembers.some(cm => cm.id_member === payload.id)
    if (hasClubs) {
      throw new Error('Cannot delete member with active club memberships')
    }
    
    members.splice(index, 1)
    return { message: 'Member deleted successfully', deleted_id: payload.id }
  }
}

// ============================================
// MÓDULO DE CLUBS
// ============================================
const clubsModule = {
  async list(payload?: ListPayload): Promise<PaginatedResponse<Club>> {
    await delay()
    const { page = 1, limit = 10, search } = payload || {}
    
    let filtered = clubs.map(club => ({
      ...club,
      member_count: clubMembers.filter(cm => cm.id_club === club.id).length
    }))
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      )
    }
    
    const total = filtered.length
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)
    
    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  },

  async getById(payload: GetByIdPayload): Promise<SingleResponse<Club>> {
    await delay()
    const club = clubs.find(c => c.id === payload.id)
    if (!club) throw new Error(`Club not found: ${payload.id}`)
    
    const member_count = clubMembers.filter(cm => cm.id_club === club.id).length
    return { data: { ...club, member_count } }
  },

  async create(payload: CreateClubPayload): Promise<SingleResponse<Club>> {
    await delay()
    const newClub: Club = {
      id: nextClubId++,
      ...payload,
      created_at: new Date().toISOString(),
      member_count: 0
    }
    clubs.push(newClub)
    return { data: newClub, message: 'Club created successfully' }
  },

  async update(payload: UpdateClubPayload): Promise<SingleResponse<Club>> {
    await delay()
    const index = clubs.findIndex(c => c.id === payload.id)
    if (index === -1) throw new Error(`Club not found: ${payload.id}`)
    clubs[index] = { ...clubs[index], ...payload.data }
    return { data: clubs[index], message: 'Club updated successfully' }
  },

  async delete(payload: GetByIdPayload): Promise<DeleteResponse> {
    await delay()
    const index = clubs.findIndex(c => c.id === payload.id)
    if (index === -1) throw new Error(`Club not found: ${payload.id}`)
    
    // Remove all club member assignments
    clubMembers = clubMembers.filter(cm => cm.id_club !== payload.id)
    // Remove all club events
    events = events.filter(e => e.id_club !== payload.id)
    
    clubs.splice(index, 1)
    return { message: 'Club deleted successfully', deleted_id: payload.id }
  },

  async getMembers(payload: GetByIdPayload & { page?: number; limit?: number }): Promise<PaginatedResponse<ClubMember & { member: Member }>> {
    await delay()
    const { id, page = 1, limit = 20 } = payload
    
    const club = clubs.find(c => c.id === id)
    if (!club) throw new Error(`Club not found: ${id}`)
    
    const assignments = clubMembers
      .filter(cm => cm.id_club === id)
      .map(cm => ({
        ...cm,
        member: members.find(m => m.id === cm.id_member)!
      }))
      .filter(cm => cm.member)
    
    const total = assignments.length
    const start = (page - 1) * limit
    const data = assignments.slice(start, start + limit)
    
    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  },

  async assignMember(payload: AssignMemberPayload): Promise<SingleResponse<ClubMember & { member: Member }>> {
    await delay()
    const { clubId, memberId } = payload
    
    const club = clubs.find(c => c.id === clubId)
    if (!club) throw new Error(`Club not found: ${clubId}`)
    
    const member = members.find(m => m.id === memberId)
    if (!member) throw new Error(`Member not found: ${memberId}`)
    
    const existing = clubMembers.find(cm => cm.id_club === clubId && cm.id_member === memberId)
    if (existing) throw new Error('Member is already assigned to this club')
    
    const assignment: ClubMember = {
      id_member: memberId,
      id_club: clubId,
      date_assign: new Date().toISOString()
    }
    clubMembers.push(assignment)
    
    return { 
      data: { ...assignment, member },
      message: 'Member assigned to club successfully'
    }
  },

  async createAndAssignMember(payload: CreateAndAssignMemberPayload): Promise<CreateAndAssignResponse> {
    await delay()
    const { clubId, name, lastname } = payload
    
    const club = clubs.find(c => c.id === clubId)
    if (!club) throw new Error(`Club not found: ${clubId}`)
    
    // Create member
    const newMember: Member = {
      id: nextMemberId++,
      name,
      lastname,
      created_at: new Date().toISOString()
    }
    members.push(newMember)
    
    // Assign to club
    const assignment: ClubMember = {
      id_member: newMember.id,
      id_club: clubId,
      date_assign: new Date().toISOString()
    }
    clubMembers.push(assignment)
    
    return {
      data: { member: newMember, assignment },
      message: 'Member created and assigned to club successfully'
    }
  },

  async removeMember(payload: AssignMemberPayload): Promise<{ message: string }> {
    await delay()
    const { clubId, memberId } = payload
    
    const index = clubMembers.findIndex(cm => cm.id_club === clubId && cm.id_member === memberId)
    if (index === -1) throw new Error('Member is not assigned to this club')
    
    clubMembers.splice(index, 1)
    return { message: 'Member removed from club successfully' }
  },

  async getEvents(payload: GetByIdPayload & { upcoming?: boolean }): Promise<{ data: Event[] }> {
    await delay()
    const { id, upcoming } = payload
    
    const club = clubs.find(c => c.id === id)
    if (!club) throw new Error(`Club not found: ${id}`)
    
    let clubEvents = events.filter(e => e.id_club === id)
    
    if (upcoming) {
      const now = new Date()
      clubEvents = clubEvents.filter(e => new Date(e.datetime) > now)
    }
    
    return { data: clubEvents }
  }
}

// ============================================
// MÓDULO DE EVENTOS
// ============================================
const eventsModule = {
  async list(payload?: ListEventsPayload): Promise<PaginatedResponse<Event & { club?: Pick<Club, 'id' | 'name'> }>> {
    await delay()
    const { page = 1, limit = 10, search, id_club, upcoming } = payload || {}
    
    let filtered = events.map(event => ({
      ...event,
      club: clubs.find(c => c.id === event.id_club)
    }))
    
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower)
      )
    }
    
    if (id_club) {
      filtered = filtered.filter(e => e.id_club === id_club)
    }
    
    if (upcoming) {
      const now = new Date()
      filtered = filtered.filter(e => new Date(e.datetime) > now)
    }
    
    const total = filtered.length
    const start = (page - 1) * limit
    const data = filtered.slice(start, start + limit)
    
    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  },

  async getById(payload: GetByIdPayload): Promise<SingleResponse<Event & { club?: Pick<Club, 'id' | 'name'> }>> {
    await delay()
    const event = events.find(e => e.id === payload.id)
    if (!event) throw new Error(`Event not found: ${payload.id}`)
    
    const club = clubs.find(c => c.id === event.id_club)
    return { data: { ...event, club } }
  },

  async create(payload: CreateEventPayload): Promise<SingleResponse<Event>> {
    await delay()
    
    const club = clubs.find(c => c.id === payload.id_club)
    if (!club) throw new Error(`Club not found: ${payload.id_club}`)
    
    const newEvent: Event = {
      id: nextEventId++,
      ...payload,
      created_at: new Date().toISOString(),
      current_participants: 0
    }
    events.push(newEvent)
    return { data: newEvent, message: 'Event created successfully' }
  },

  async update(payload: UpdateEventPayload): Promise<SingleResponse<Event>> {
    await delay()
    const index = events.findIndex(e => e.id === payload.id)
    if (index === -1) throw new Error(`Event not found: ${payload.id}`)
    events[index] = { ...events[index], ...payload.data }
    return { data: events[index], message: 'Event updated successfully' }
  },

  async delete(payload: GetByIdPayload): Promise<DeleteResponse> {
    await delay()
    const index = events.findIndex(e => e.id === payload.id)
    if (index === -1) throw new Error(`Event not found: ${payload.id}`)
    events.splice(index, 1)
    return { message: 'Event deleted successfully', deleted_id: payload.id }
  }
}

// ============================================
// CLIENTE PRINCIPAL
// ============================================
export const client = {
  members: membersModule,
  clubs: clubsModule,
  events: eventsModule,
  
  // Método para resetear datos al estado inicial (útil para testing)
  reset: () => {
    members = [...mockMembers]
    clubs = [...mockClubs]
    clubMembers = [...mockClubMembers]
    events = [...mockEvents]
    nextMemberId = Math.max(...members.map(m => m.id)) + 1
    nextClubId = Math.max(...clubs.map(c => c.id)) + 1
    nextEventId = Math.max(...events.map(e => e.id)) + 1
  }
}

// Export types
export * from './types'

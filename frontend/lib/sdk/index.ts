// ============================================
// SDK DE GESTIÓN DE CLUBES - EXPORT PRINCIPAL
// ============================================

export { client } from './client'
export * from './types'

/**
 * Ejemplos de uso del SDK:
 * 
 * // Importar el cliente
 * import { client } from '@/lib/sdk'
 * 
 * // ESTUDIANTES
 * // Listar estudiantes
 * const students = await client.students.list({ page: 1, limit: 10, search: 'María' })
 * 
 * // Obtener estudiante por ID
 * const student = await client.students.getById({ id: 'st-001' })
 * 
 * // Crear estudiante
 * const newStudent = await client.students.create({
 *   firstName: 'Juan',
 *   lastName: 'Pérez',
 *   email: 'juan@escuela.edu',
 *   grade: '2° Secundaria',
 *   clubIds: ['club-001']
 * })
 * 
 * // Actualizar estudiante
 * await client.students.update({ id: 'st-001', data: { grade: '3° Secundaria' } })
 * 
 * // Eliminar estudiante
 * await client.students.delete({ id: 'st-001' })
 * 
 * // CLUBES
 * // Listar clubes
 * const clubs = await client.clubs.list({ search: 'robótica', status: 'active' })
 * 
 * // Obtener club por ID
 * const club = await client.clubs.getById({ id: 'club-001' })
 * 
 * // Crear club
 * const newClub = await client.clubs.create({
 *   name: 'Club de Música',
 *   description: 'Aprende a tocar instrumentos',
 *   category: 'arts',
 *   leaderId: 'st-001',
 *   meetingDay: 'Viernes',
 *   meetingTime: '15:00 - 17:00',
 *   location: 'Sala de Música'
 * })
 * 
 * // Agregar estudiante a club
 * await client.clubs.addStudent({ studentId: 'st-002', clubId: 'club-001' })
 * 
 * // Remover estudiante de club
 * await client.clubs.removeStudent({ studentId: 'st-002', clubId: 'club-001' })
 * 
 * // Obtener miembros del club
 * const members = await client.clubs.getMembers({ id: 'club-001' })
 * 
 * // Obtener eventos del club
 * const clubEvents = await client.clubs.getEvents({ id: 'club-001' })
 * 
 * // EVENTOS
 * // Listar eventos
 * const events = await client.events.list({ status: 'upcoming', clubId: 'club-001' })
 * 
 * // Obtener evento por ID
 * const event = await client.events.getById({ id: 'evt-001' })
 * 
 * // Crear evento
 * const newEvent = await client.events.create({
 *   title: 'Concierto de Fin de Año',
 *   description: 'Presentación anual',
 *   date: '2024-12-15',
 *   time: '18:00',
 *   location: 'Auditorio Principal',
 *   clubId: 'club-001',
 *   capacity: 200
 * })
 * 
 * // Registrar estudiante en evento
 * await client.events.register({ studentId: 'st-001', eventId: 'evt-001' })
 * 
 * // Cancelar registro en evento
 * await client.events.unregister({ studentId: 'st-001', eventId: 'evt-001' })
 * 
 * // Obtener asistentes del evento
 * const attendees = await client.events.getAttendees({ id: 'evt-001' })
 * 
 * // Obtener próximos eventos
 * const upcomingEvents = await client.events.getUpcoming()
 * 
 * // DASHBOARD
 * // Obtener estadísticas
 * const stats = await client.dashboard.getStats()
 * 
 * // RESET (útil para testing)
 * client.reset()
 */

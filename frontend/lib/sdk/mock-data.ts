import type { Member, Club, ClubMember, Event } from './types'

// ============================================
// DATOS MOCK PARA EL SDK
// ============================================

export const mockMembers: Member[] = [
  {
    id: 1,
    name: 'Carlos',
    lastname: 'Rodríguez',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'María',
    lastname: 'García',
    created_at: '2024-01-20T14:00:00Z'
  },
  {
    id: 3,
    name: 'José',
    lastname: 'Martínez',
    created_at: '2024-02-01T09:00:00Z'
  },
  {
    id: 4,
    name: 'Ana',
    lastname: 'López',
    created_at: '2024-02-05T11:30:00Z'
  },
  {
    id: 5,
    name: 'Luis',
    lastname: 'Hernández',
    created_at: '2024-02-10T16:00:00Z'
  },
  {
    id: 6,
    name: 'Sofia',
    lastname: 'Pérez',
    created_at: '2024-02-15T08:45:00Z'
  },
  {
    id: 7,
    name: 'Diego',
    lastname: 'Morales',
    created_at: '2024-02-20T13:20:00Z'
  },
  {
    id: 8,
    name: 'Valentina',
    lastname: 'Castro',
    created_at: '2024-03-01T10:00:00Z'
  },
  {
    id: 9,
    name: 'Andrés',
    lastname: 'Ramírez',
    created_at: '2024-03-05T15:30:00Z'
  },
  {
    id: 10,
    name: 'Isabella',
    lastname: 'Torres',
    created_at: '2024-03-10T12:00:00Z'
  }
]

export const mockClubs: Club[] = [
  {
    id: 1,
    name: 'Club de Robótica',
    description: 'Club dedicado al diseño, construcción y programación de robots autónomos. Participamos en competencias nacionales e internacionales.',
    schedule: 'Martes y Jueves 15:00-17:00',
    location: 'Edificio de Ingeniería, Lab 201',
    created_at: '2024-01-10T08:00:00Z',
    member_count: 4
  },
  {
    id: 2,
    name: 'Club de Debate',
    description: 'Espacio para desarrollar habilidades de argumentación, oratoria y pensamiento crítico a través de debates estructurados.',
    schedule: 'Lunes y Miércoles 14:00-16:00',
    location: 'Edificio de Humanidades, Salón 105',
    created_at: '2024-01-12T09:00:00Z',
    member_count: 3
  },
  {
    id: 3,
    name: 'Club de Fotografía',
    description: 'Aprende técnicas de fotografía digital, edición y composición. Organizamos exposiciones y salidas fotográficas.',
    schedule: 'Viernes 16:00-18:00',
    location: 'Centro Cultural, Sala de Arte',
    created_at: '2024-01-15T10:00:00Z',
    member_count: 3
  },
  {
    id: 4,
    name: 'Club de Ajedrez',
    description: 'Practica y mejora tus habilidades en ajedrez. Torneos internos y representación en competencias universitarias.',
    schedule: 'Miércoles 17:00-19:00',
    location: 'Biblioteca, Sala de Estudio 3',
    created_at: '2024-01-20T11:00:00Z',
    member_count: 2
  },
  {
    id: 5,
    name: 'Club de Voluntariado',
    description: 'Participa en proyectos de impacto social y comunitario. Organizamos actividades de ayuda a comunidades cercanas.',
    schedule: 'Sábados 08:00-12:00',
    location: 'Edificio Administrativo, Oficina 102',
    created_at: '2024-01-25T12:00:00Z',
    member_count: 3
  }
]

export const mockClubMembers: ClubMember[] = [
  // Club de Robótica (id: 1)
  { id_member: 1, id_club: 1, date_assign: '2024-02-01T10:00:00Z' },
  { id_member: 3, id_club: 1, date_assign: '2024-02-05T11:00:00Z' },
  { id_member: 5, id_club: 1, date_assign: '2024-02-10T14:00:00Z' },
  { id_member: 7, id_club: 1, date_assign: '2024-02-15T09:00:00Z' },
  
  // Club de Debate (id: 2)
  { id_member: 2, id_club: 2, date_assign: '2024-02-03T10:00:00Z' },
  { id_member: 4, id_club: 2, date_assign: '2024-02-08T15:00:00Z' },
  { id_member: 6, id_club: 2, date_assign: '2024-02-12T11:00:00Z' },
  
  // Club de Fotografía (id: 3)
  { id_member: 2, id_club: 3, date_assign: '2024-02-05T09:00:00Z' },
  { id_member: 8, id_club: 3, date_assign: '2024-03-02T14:00:00Z' },
  { id_member: 10, id_club: 3, date_assign: '2024-03-12T10:00:00Z' },
  
  // Club de Ajedrez (id: 4)
  { id_member: 9, id_club: 4, date_assign: '2024-03-06T16:00:00Z' },
  { id_member: 3, id_club: 4, date_assign: '2024-03-08T11:00:00Z' },
  
  // Club de Voluntariado (id: 5)
  { id_member: 4, id_club: 5, date_assign: '2024-02-10T08:00:00Z' },
  { id_member: 6, id_club: 5, date_assign: '2024-02-15T09:00:00Z' },
  { id_member: 8, id_club: 5, date_assign: '2024-03-05T10:00:00Z' }
]

export const mockEvents: Event[] = [
  {
    id: 1,
    id_club: 1,
    name: 'Competencia de Robots UVG 2024',
    description: 'Competencia anual de robots autónomos. Categorías: seguidor de línea, sumo y laberinto.',
    datetime: '2024-04-15T09:00:00Z',
    location: 'Gimnasio Principal',
    max_participants: 50,
    created_at: '2024-02-01T10:00:00Z',
    current_participants: 35
  },
  {
    id: 2,
    id_club: 2,
    name: 'Torneo Interuniversitario de Debate',
    description: 'Competencia de debate con universidades de la región centroamericana.',
    datetime: '2024-04-20T14:00:00Z',
    location: 'Auditorio Principal',
    max_participants: 30,
    created_at: '2024-02-15T11:00:00Z',
    current_participants: 24
  },
  {
    id: 3,
    id_club: 3,
    name: 'Exposición Fotográfica: Vida Universitaria',
    description: 'Muestra de las mejores fotografías tomadas por miembros del club durante el semestre.',
    datetime: '2024-05-01T18:00:00Z',
    location: 'Centro Cultural, Galería Principal',
    max_participants: 100,
    created_at: '2024-03-01T09:00:00Z',
    current_participants: 45
  },
  {
    id: 4,
    id_club: 4,
    name: 'Simultánea de Ajedrez',
    description: 'Partidas simultáneas con el maestro FIDE invitado. Abierto a toda la comunidad universitaria.',
    datetime: '2024-04-25T16:00:00Z',
    location: 'Plaza Central',
    max_participants: 20,
    created_at: '2024-03-10T14:00:00Z',
    current_participants: 18
  },
  {
    id: 5,
    id_club: 5,
    name: 'Jornada de Reforestación',
    description: 'Actividad de plantación de árboles en la comunidad de San Juan Sacatepéquez.',
    datetime: '2024-04-27T07:00:00Z',
    location: 'San Juan Sacatepéquez (transporte incluido)',
    max_participants: 40,
    created_at: '2024-03-15T08:00:00Z',
    current_participants: 32
  },
  {
    id: 6,
    id_club: 1,
    name: 'Taller de Arduino para Principiantes',
    description: 'Introducción práctica a la programación de microcontroladores Arduino.',
    datetime: '2024-05-10T15:00:00Z',
    location: 'Edificio de Ingeniería, Lab 201',
    max_participants: 25,
    created_at: '2024-03-20T10:00:00Z',
    current_participants: 20
  }
]

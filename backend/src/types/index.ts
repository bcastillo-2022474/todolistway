// ── Domain models ─────────────────────────────────────────────────────────────

export interface Member {
  id: number;
  name: string;
  lastname: string;
  created_at: Date;
}

export interface Club {
  id: number;
  name: string;
  description: string | null;
  schedule: string | null;
  location: string | null;
  created_at: Date;
  member_count?: number;
}

export interface ClubMember {
  id_member: number;
  id_club: number;
  date_assign: Date;
  member?: Pick<Member, 'id' | 'name' | 'lastname'>;
}

export interface Event {
  id: number;
  id_club: number;
  name: string;
  description: string | null;
  datetime: Date;
  location: string | null;
  max_participants: number;
  created_at: Date;
  current_participants?: number;
  club?: Pick<Club, 'id' | 'name'>;
}

export interface Admin {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password?: string;
  created_at: Date;
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SingleResponse<T> {
  data: T;
  message?: string;
}

// ── Error handling ────────────────────────────────────────────────────────────

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'MEMBER_NOT_FOUND'
  | 'CLUB_NOT_FOUND'
  | 'EVENT_NOT_FOUND'
  | 'MEMBER_ALREADY_ASSIGNED'
  | 'MEMBER_HAS_CLUBS'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number,
    public readonly code: ErrorCode,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ─── Standard API Response Types ───────────────────────────────────────────────

/**
 * Standard success response returned by every API endpoint.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp: string;
}

/**
 * Standard error response returned on failures.
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code: ErrorCode;
  errors?: ValidationError[];
  timestamp: string;
}

/**
 * Pagination metadata included in list responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Individual field-level validation error.
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Pagination query parameters expected from the client.
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ─── Error Codes ───────────────────────────────────────────────────────────────
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_REQUEST'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE';

// ─── Role Enum ─────────────────────────────────────────────────────────────────
export type UserRole = 'FACULTY' | 'ADMIN';

import { httpClient } from './client';

// Error handling utility
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  data: {
    items: T[];
    totalCount: number;
  };
  message?: string;
  success?: boolean;
}

// Re-export APIs from separate modules
export { patientApi } from './patient-api';
export { userApi } from './user-api';
export { authApi } from './auth-api';
export { ticketApi } from './ticket-api';
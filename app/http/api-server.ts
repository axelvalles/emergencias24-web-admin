// Error handling utility
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (error && typeof error === "object" && "error" in error) {
    return String(error.error);
  }
  return "An unexpected error occurred";
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: {
    items: T[];
    totalCount: number;
  };
  message?: string;
  success?: boolean;
}

// Re-export APIs from separate modules
export { patientApi } from "./patient-api";
export { userApi } from "./user-api";
export { authApi } from "./auth-api";
export { ticketApi } from "./ticket-api";
export { planApi } from "./plan-api";

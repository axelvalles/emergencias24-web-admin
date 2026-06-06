import { AxiosError } from "axios";

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

export function parseApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = error.response?.data as any;

    if (data && typeof data === "object") {
      return {
        message: Array.isArray(data.message)
          ? data.message.join(", ")
          : (data.message ?? "Unexpected error"),
        errorCode: data.errorCode,
        statusCode: data.statusCode ?? error.response?.status,
      };
    }

    return {
      message: error.message,
    };
  }

  if (error && typeof error === "object" && "message" in error) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: String((error as any).message),
    };
  }

  return {
    message: "Unexpected error occurred",
  };
}

export interface ApiError {
  message: string;
  errorCode?: string;
  statusCode?: number;
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
export { planSubscriptionApi } from "./plan-subscription-api";
export { companyApi } from "./company-api";
export { municipalityPricingApi } from "./municipality-pricing-api";
export { benefitApi } from "./benefit-api";

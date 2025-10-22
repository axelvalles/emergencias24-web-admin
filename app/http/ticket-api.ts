import { httpClient } from "./client";
import type { Ticket, QueryTicketsParams, TicketStatus } from "~/types/tickets";

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

// Ticket API functions
export const ticketApi = {
  // Get all tickets with pagination and filters
  getAllTickets: async (params?: QueryTicketsParams): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    return httpClient.get("/tickets", params as Record<string, string | number | boolean>);
  },

  // Get ticket by ID
  getTicketById: async (id: string): Promise<Ticket> => {
    return httpClient.get(`/tickets/${id}`);
  },

  // Get ticket by reference number
  getTicketByReference: async (referenceNumber: number): Promise<Ticket> => {
    return httpClient.get(`/tickets/reference/${referenceNumber}`);
  },

  // Update ticket status (resolve ticket)
  updateTicketStatus: async (id: string, status: TicketStatus): Promise<ApiResponse<unknown>> => {
    return httpClient.patch(`/tickets/${id}/status`, { status });
  },
};
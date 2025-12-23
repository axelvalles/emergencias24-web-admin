import type { ApiResponse } from "./api-server";
import { httpClient } from "./client";
import type {
  Ticket,
  QueryTicketsParams,
  TicketStatus,
  TicketStatusHistory,
} from "~/types/tickets";

// Ticket API functions
export const ticketApi = {
  // Get all tickets with pagination and filters
  getAllTickets: async (
    params?: QueryTicketsParams
  ): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    return httpClient.get(
      "/tickets",
      params as Record<string, string | number | boolean>
    );
  },

  // Get ticket by ID
  getTicketById: async (id: string): Promise<Ticket> => {
    return httpClient.get(`/tickets/${id}`);
  },

  // Get ticket by reference number
  getTicketByReference: async (referenceNumber: number): Promise<Ticket> => {
    return httpClient.get(
      `/tickets/get-by-reference-number/${referenceNumber}`
    );
  },

  // Update ticket status (resolve ticket)
  updateTicketStatus: async (
    id: string,
    status: TicketStatus
  ): Promise<ApiResponse<unknown>> => {
    return httpClient.patch(`/tickets/${id}/status`, { status });
  },

  completeTicket: async (id: string): Promise<ApiResponse<Ticket>> => {
    return httpClient.patch(`/tickets/${id}/complete`);
  },

  cancelTicket: async (
    id: string,
    cancellationReason?: string
  ): Promise<ApiResponse<Ticket>> => {
    return httpClient.patch(`/tickets/${id}/cancel`, {
      cancellationReason,
    });
  },

  assignTicket: async (
    id: string,
    userId: string
  ): Promise<ApiResponse<Ticket>> => {
    return httpClient.patch(`/tickets/${id}/assign/${userId}`);
  },

  getTicketHistory: async (id: string): Promise<TicketStatusHistory[]> => {
    return httpClient.get(`/tickets/${id}/history`);
  },

  startTicket: async (id: string): Promise<ApiResponse<Ticket>> => {
    return httpClient.patch(`/tickets/${id}/start`);
  },
};

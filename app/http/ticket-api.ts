import type { ApiResponse } from "./api-server";
import { httpClient } from "./client";
import type {
  AssignTicketPayload,
  Ticket,
  QueryTicketsParams,
  TicketStatus,
  TicketTimelineEntry,
} from "~/types/tickets";

// Ticket API functions
export const ticketApi = {
  // Get all tickets with pagination and filters
  getAllTickets: async (
    params?: QueryTicketsParams,
  ): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    return httpClient.get(
      "/tickets",
      params as Record<string, string | number | boolean>,
    );
  },

  // Get ticket by ID
  getTicketById: async (id: string): Promise<Ticket> => {
    return httpClient.get(`/tickets/${id}`);
  },

  // Get ticket by reference number
  getTicketByReference: async (referenceNumber: number): Promise<Ticket> => {
    return httpClient.get(
      `/tickets/get-by-reference-number/${referenceNumber}`,
    );
  },

  // Legacy helper kept for compatibility in callers that may still import it.
  updateTicketStatus: async (
    id: string,
    status: TicketStatus,
  ): Promise<ApiResponse<unknown>> => {
    return httpClient.patch(`/tickets/${id}/status`, { status });
  },

  completeTicket: async (
    id: string,
    comment?: string,
  ): Promise<ApiResponse<Ticket>> => {
    return httpClient.patch(`/tickets/${id}/complete`, { comment });
  },

  cancelTicket: async (
    id: string,
    comment?: string,
  ): Promise<ApiResponse<Ticket>> => {
    return httpClient.patch(`/tickets/${id}/cancel`, { comment });
  },

  assignTicket: async (
    id: string,
    payload: AssignTicketPayload,
  ): Promise<ApiResponse<Ticket>> => {
    if (payload.ownerRole === "paramedic" && payload.ambulanceUnitId) {
      return httpClient.patch(
        `/tickets/${id}/assign/${payload.ambulanceUnitId}`,
        {
          comment: payload.comment,
        },
      );
    }

    return httpClient.patch(`/tickets/${id}/assign`, payload);
  },

  getTicketHistory: async (id: string): Promise<TicketTimelineEntry[]> => {
    return httpClient.get(`/tickets/${id}/history`);
  },

  startTicket: async (
    id: string,
    comment?: string,
  ): Promise<ApiResponse<Ticket>> => {
    return httpClient.patch(`/tickets/${id}/start`, { comment });
  },
};

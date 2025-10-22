import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Ticket } from "~/types/tickets";

interface TicketState {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticket: Ticket) => void;
}

export const useTicketStore = create<TicketState>()(
  persist(
    (set) => ({
      tickets: [],
      addTicket: (ticket) =>
        set((state) => ({ tickets: [ticket, ...state.tickets] })),
      updateTicket: (ticket) =>
        set((state) => ({
          tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
        })),
    }),
    {
      name: "ticket-storage",
    }
  )
);

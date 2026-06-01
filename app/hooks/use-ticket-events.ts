import { useEffect } from "react";
import { queryClient } from "~/lib/query-client";
import { socket } from "~/lib/socket"; // conexión Socket.IO ya configurada
import { useAuthStore } from "~/store/useAuthStore";
import { useTicketStore } from "~/store/useTicketStore";
import { TicketTypeLabels, type Ticket } from "~/types/tickets";

type TicketEvent = {
  timestamp: string;
  ticket: Ticket;
};

// Hook que inicializa la suscripción a eventos de tickets
export function useTicketEvents() {
  const addTicket = useTicketStore((state) => state.addTicket);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      socket.disconnect();
      return;
    }

    socket.connect();

    console.log("useTicketEvents");
    // Solicita permisos para mostrar notificaciones
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Evento: conexión al socket
    socket.on("connect", () => {
      console.log("✅ Conectado al WebSocket del servidor");
    });

    socket.on("connect_error", (error) => {
      if (socket.active) {
        console.log("✅ Conectado al WebSocket del servidor");
      } else {
        console.error("❌ Error al conectar al WebSocket:", error);
      }
    });

    // Evento: nuevo ticket creado
    socket.on("ticket.created", async (event: TicketEvent) => {
      console.log("🎟️ Nuevo ticket recibido:", event);

      addTicket(event.ticket);
      playAlertSound();
      showNotification(event.ticket);

      await queryClient.refetchQueries({
        queryKey: ["tickets"],
      });
    });

    // Evento: ticket actualizado (opcional)
    socket.on("ticket.updated", async (event: TicketEvent) => {
      console.log("♻️ Ticket actualizado:", event);

      useTicketStore.getState().updateTicket(event.ticket);

      await queryClient.refetchQueries({
        queryKey: ["tickets"],
      });
    });

    // Evento: desconexión
    socket.on("disconnect", () => {
      console.warn("⚠️ Desconectado del WebSocket");
    });

    // Limpieza al desmontar
    return () => {
      socket.disconnect();
      socket.off("ticket.created");
      socket.off("ticket.updated");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [addTicket, token]);
}

// Reproduce un sonido de alerta cuando llega un ticket nuevo
function playAlertSound() {
  const audio = new Audio("/sounds/alert.mp3");
  audio.volume = 0.5;
  audio.play().catch((err) => {
    // algunos navegadores bloquean el autoplay sin interacción del usuario
    console.warn("🔇 No se pudo reproducir el sonido automáticamente", err);
  });
}

// Muestra una notificación de escritorio
function showNotification(ticket: Ticket) {
  console.log("showNotification", ticket);
  if (Notification.permission === "granted") {
    new Notification("🚨 Nuevo Ticket de Emergencia", {
      body: `${ticket.requesterName} - ${TicketTypeLabels[ticket.serviceType] || "Sin tipo"}`,
      icon: "/icons/alert.png", // opcional, si tienes un ícono en /public/icons
    });
  }
}

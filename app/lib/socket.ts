// src/lib/socket.ts
import { io } from "socket.io-client";
import { useAuthStore } from "~/store/useAuthStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const socket = io(`${API_BASE_URL}/tickets`, {
  transports: ["websocket"],
  reconnection: true,
  autoConnect: false,
  auth: (cb) => {
    const token = useAuthStore.getState().token;
    cb({ token });
  },
});

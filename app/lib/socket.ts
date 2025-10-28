// src/lib/socket.ts
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const socket = io(`${API_BASE_URL}/tickets`, {
  transports: ["websocket"],
  reconnection: true,
});

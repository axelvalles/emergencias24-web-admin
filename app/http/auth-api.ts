import type { LoginResponse } from "~/types/users";
import { httpClient } from "./client";

// Auth API functions
export const authApi = {
  // Login
  login: async (data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    return httpClient.post("/auth/login", data);
  },
};

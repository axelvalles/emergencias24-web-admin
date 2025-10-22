import type { LoginResponse } from "~/types/auth";
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

  // Logout
  // logout: async (): Promise<ApiResponse<any>> => {
  //   return httpClient.post("/auth/logout");
  // },

  // Refresh token
  // refreshToken: async (): Promise<ApiResponse<any>> => {
  //   return httpClient.post("/auth/refresh");
  // },

  // Get current user profile
  // getProfile: async (): Promise<ApiResponse<any>> => {
  //   return httpClient.get("/auth/profile");
  // },
};

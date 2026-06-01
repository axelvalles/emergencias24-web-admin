import type { CreateUserDTO, UpdateUserDTO, User } from "~/types/users";
import { httpClient } from "./client";

export type UserListFilters = {
  page?: number;
  limit?: number;
  q?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string[];
  status?: string[];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
};

export type UserListResponse = {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// User API functions
export const userApi = {
  // Get all users
  getAllUsers: async (params?: UserListFilters): Promise<UserListResponse> => {
    return httpClient.get("/users", params);
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    return httpClient.get(`/users/${id}`);
  },

  // Create new user
  createUser: async (data: CreateUserDTO): Promise<User> => {
    return httpClient.post("/users", data);
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserDTO): Promise<User> => {
    return httpClient.patch(`/users/${id}`, data);
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    return httpClient.delete(`/users/${id}`);
  },

  // Activate user
  activateUser: async (id: string): Promise<User> => {
    return httpClient.post(`/users/${id}/activate`);
  },

  // Deactivate user
  deactivateUser: async (id: string): Promise<User> => {
    return httpClient.post(`/users/${id}/deactivate`);
  },

  // Search users
  searchUsers: async (params?: { term?: string; role?: string[]; limit?: number }): Promise<User[]> => {
    return httpClient.get("/users/search", params);
  },
};

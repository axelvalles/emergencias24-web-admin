import { httpClient } from './client';

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  data: {
    items: T[];
    totalCount: number;
  };
  message?: string;
  success?: boolean;
}

// User API functions
export const userApi = {
  // Get all users
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<any>> => {
    return httpClient.get('/users', params);
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<any>> => {
    return httpClient.get(`/users/${id}`);
  },

  // Create new user
  createUser: async (data: any): Promise<ApiResponse<any>> => {
    return httpClient.post('/users', data);
  },

  // Update user
  updateUser: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return httpClient.put(`/users/${id}`, data);
  },

  // Delete user
  deleteUser: async (id: string): Promise<ApiResponse<any>> => {
    return httpClient.delete(`/users/${id}`);
  },
};
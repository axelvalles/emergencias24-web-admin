import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { useAuthStore } from "~/store/useAuthStore";

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle unauthorized responses
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - logout user
          useAuthStore.getState().logout();
          console.warn("Unauthorized access - user logged out");
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({
        url: endpoint,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error("HTTP Client Error:", error);
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      params,
    });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      data,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      data,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      data,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

// Create and export a default instance
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const httpClient = new HttpClient(API_BASE_URL);

// Export the class for creating additional instances if needed
export default HttpClient;

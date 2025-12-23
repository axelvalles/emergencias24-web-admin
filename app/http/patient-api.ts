import type {
  CreatePatientDTO,
  Patient,
  PatientDetail,
  UpdatePatientDTO,
} from "~/types/patients";
import { httpClient } from "./client";
import axios from "axios";
import { useAuthStore } from "~/store/useAuthStore";

// API Response types

// Patient API functions
export const patientApi = {
  // Get all patients with pagination and filters
  getAllPatients: async (params?: {
    page?: number;
    limit?: number;
    fullName?: string;
    documentNumber?: string;
    patientStatus?: string[];
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{
    data: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    return httpClient.get("/patients", params);
  },

  // Get patient by ID
  getPatientById: async (id: string | number): Promise<PatientDetail> => {
    return httpClient.get(`/patients/${id}`);
  },

  getPatientByDocument: async (
    document: string | number
  ): Promise<PatientDetail> => {
    return httpClient.get(`/patients/by-document/${document}`);
  },

  // Create new patient
  createPatient: async (data: CreatePatientDTO): Promise<PatientDetail> => {
    return httpClient.post("/patients", data);
  },

  // Update patient
  updatePatient: async (
    id: string,
    data: UpdatePatientDTO
  ): Promise<PatientDetail> => {
    return httpClient.patch(`/patients/${id}`, data);
  },

  // Delete patient
  deletePatient: async (id: string): Promise<PatientDetail> => {
    return httpClient.delete(`/patients/${id}`);
  },

  // Update patient status
  updateStatus: async (id: string, status: string): Promise<PatientDetail> => {
    return httpClient.patch(`/patients/${id}/status`, { status });
  },

  // Download import template
  downloadTemplate: async (): Promise<void> => {
    const token = useAuthStore.getState().token;
    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:3000";

    const response = await axios.get(
      `${API_BASE_URL}/patients/import/template`,
      {
        responseType: "blob",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla-pacientes.xlsx"); // Assuming it's Excel
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Upload import file
  uploadPatients: async (file: File): Promise<true> => {
    const token = useAuthStore.getState().token;
    const API_BASE_URL =
      import.meta.env.VITE_API_URL || "http://localhost:3000";

    const formData = new FormData();
    formData.append("file", file);

    return axios.post(`${API_BASE_URL}/patients/import`, formData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

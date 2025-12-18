import type {
  CreatePatientDTO,
  Patient,
  PatientDetail,
  UpdatePatientDTO,
} from "~/types/patients";
import { httpClient } from "./client";

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
  updateStatus: async (
    id: string,
    status: string
  ): Promise<PatientDetail> => {
    return httpClient.patch(`/patients/${id}/status`, { status });
  },
};

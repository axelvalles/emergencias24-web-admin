import { httpClient } from "./client";

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

export interface Patient {
  id: number;
  user: null;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  document_type: string;
  document_number: string;
  phone: string;
  patient_status: string;
  created_at: string;
  updated_at: null | string;
}

export interface PatientDetail {
  id: number;
  user: null;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  document_type: string;
  document_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  secondary_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_type: string;
  allergies: string;
  medical_conditions: string;
  patient_status: string;
  medical_record_number: null;
  created_at: string;
  updated_at: null;
  subscriptions: [];
  clinical_records: [];
}

// Patient API functions
export const patientApi = {
  // Get all patients with pagination and filters
  getAllPatients: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Patient[]> => {
    return httpClient.get("/patients", params);
  },

  // Get patient by ID
  getPatientById: async (id: string | number): Promise<PatientDetail> => {
    return httpClient.get(`/patients/${id}`);
  },

  // Create new patient
  createPatient: async (data: any): Promise<ApiResponse<any>> => {
    return httpClient.post("/patients", data);
  },

  // Update patient
  updatePatient: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return httpClient.put(`/patients/${id}`, data);
  },

  // Delete patient
  deletePatient: async (id: string): Promise<ApiResponse<any>> => {
    return httpClient.delete(`/patients/${id}`);
  },
};

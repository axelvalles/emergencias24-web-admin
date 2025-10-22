// Authentication Interfaces
export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterDTO {
  email: string;
  password: string;
  role?: UserRole;
}

// User Management Interfaces
export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
  PATIENT = 'patient',
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  role?: UserRole;
}

// Patient Management Interfaces
export interface Patient {
  id: number;
  user: User;
  first_name: string;
  last_name: string;
  birth_date: Date;
  gender: string;
  document_type: string;
  document_number: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  secondary_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  patient_status: string;
  medical_record_number?: string;
  created_at: Date;
  updated_at?: Date;
  subscriptions?: Subscription[];
  clinical_records?: ClinicalRecord[];
}

export interface CreatePatientDTO {
  first_name: string;
  last_name: string;
  birth_date?: Date;
  gender: string;
  document_type: string;
  document_number: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  secondary_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface UpdatePatientDTO {
  first_name?: string;
  last_name?: string;
  birth_date?: Date;
  gender?: string;
  document_type?: string;
  document_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  secondary_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  patient_status?: string;
  medical_record_number?: string;
}

// Minimal Related Interfaces (for Patient)
export interface Subscription {
  subscription_id: number;
  start_date: Date;
  end_date?: Date;
  subscription_status: string;
  total_cost?: number;
  patient: Patient;
}

export interface ClinicalRecord {
  record_id: number;
  appointment_date: Date;
  reason_for_visit: string;
  diagnosis: string;
  treatment?: string;
  observations?: string;
  appointment_status: string;
  patient: Patient;
}

// API Response Interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
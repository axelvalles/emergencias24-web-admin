// User Management Interfaces
import type { AmbulanceUnit } from "./ambulance-units";

export enum UserRole {
  SUPER_ADMIN = "super-admin",
  ADMIN = "admin",
  DISPATCHER = "dispatcher",
  PARAMEDIC = "paramedic",
  DOCTOR = "doctor",
  APPOINTMENT_MANAGER = "appointment_manager",
  MARKETING = "marketing",
}

export const UserRoleLabels = {
  [UserRole.SUPER_ADMIN]: "Super administrador",
  [UserRole.ADMIN]: "Administrador",
  [UserRole.DISPATCHER]: "Despachador",
  [UserRole.PARAMEDIC]: "Paramédico",
  [UserRole.DOCTOR]: "Médico",
  [UserRole.APPOINTMENT_MANAGER]: "Gestor de citas",
  [UserRole.MARKETING]: "Marketing",
} as const;

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  fullName: string;
  ambulanceUnits: AmbulanceUnit[];
  activeAmbulanceUnit: AmbulanceUnit | null;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  ambulanceUnitIds?: string[];
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: UserStatus;
  ambulanceUnitIds?: string[];
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

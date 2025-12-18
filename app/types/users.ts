// User Management Interfaces
export enum UserRole {
  SUPER_ADMIN = "superAdmin",
  CLINIC_ADMIN = "clinicAdmin",
  OPERATOR = "operator",
  DOCTOR = "doctor",
  NURSE = "nurse",
  RECEPTIONIST = "receptionist",
  LABADMIN = "labAdmin",
  FINANCE = "finance",
}

export const UserRoleLabels = {
  [UserRole.SUPER_ADMIN]: "Super administrador",
  [UserRole.CLINIC_ADMIN]: "Administrador de clínica",
  [UserRole.OPERATOR]: "Operador",
  [UserRole.DOCTOR]: "Doctor",
  [UserRole.NURSE]: "Enfermero/a",
  [UserRole.RECEPTIONIST]: "Recepcionista",
  [UserRole.LABADMIN]: "Administrador de laboratorio",
  [UserRole.FINANCE]: "Finanzas",
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
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: UserStatus;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

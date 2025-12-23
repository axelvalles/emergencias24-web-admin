// User Management Interfaces
export enum UserRole {
  ADMIN = "admin",
  OPERATOR = "operator",
}

export const UserRoleLabels = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.OPERATOR]: "Operador",
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

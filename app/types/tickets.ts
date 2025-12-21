import type { PatientDetail } from "./patients";
import type { User } from "./users";

export enum TicketType {
  IMMEDIATE_ATTENTION = "immediate_attention",
  TELEMEDICINE = "telemedicine",
  HOME_CARE = "home_care",
  MEDICAL_CONSULTATION = "medical_consultation",
  LABORATORY = "laboratory",
  AMBULANCE = "ambulance",
  EQUIPMENT_RENTAL = "equipment_rental",
  APPOINTMENT = "appointment",
  PLANS = "plans",
}

export const TicketTypeLabels = {
  [TicketType.IMMEDIATE_ATTENTION]: "Atención Inmediata",
  [TicketType.TELEMEDICINE]: "Telemedicina",
  [TicketType.HOME_CARE]: "Atención domiciliaria",
  [TicketType.MEDICAL_CONSULTATION]: "Consulta médica",
  [TicketType.LABORATORY]: "Laboratorio",
  [TicketType.AMBULANCE]: "Ambulancia",
  [TicketType.EQUIPMENT_RENTAL]: "Alquiler de equipo",
  [TicketType.APPOINTMENT]: "Cita",
  [TicketType.PLANS]: "Planes",
};

export enum TicketStatus {
  PENDING = "pending",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export const TicketStatusLabels = {
  [TicketStatus.PENDING]: "Pendiente",
  [TicketStatus.ASSIGNED]: "Asignado",
  [TicketStatus.IN_PROGRESS]: "En Proceso",
  [TicketStatus.COMPLETED]: "Completado",
  [TicketStatus.CANCELLED]: "Cancelado",
};

export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export const TicketPriorityLabels = {
  [TicketPriority.LOW]: "Baja",
  [TicketPriority.MEDIUM]: "Media",
  [TicketPriority.HIGH]: "Alta",
};

export interface Ticket {
  id: string;
  referenceNumber: number;
  serviceType: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  patient: PatientDetail | null;
  requesterPhone: string;
  requesterName: string;
  location: string;
  municipality: string | null;
  speciality: string | null;
  description: string;
  note: string | null;
  cancellationReason: string;
  assignedUser: User | null;
  assignedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// types server
export interface QueryTicketsParams {
  serviceType?: TicketType[];
  status?: TicketStatus[];
  priority?: TicketPriority;
  requesterPhone?: string;
  requesterName?: string;
  municipality?: string;
  assignedTo?: string;
  referenceNumber?: number;
  createdFrom?: Date;
  createdTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface TicketStatusHistory {
  id: string;
  status: TicketStatus;
  changedBy?: {
    id: string;
    fullName: string;
  } | null;
  comment?: string;
  createdAt: string;
}

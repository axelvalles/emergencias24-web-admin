import type { PatientDetail } from "./patients";
import type { AmbulanceUnit } from "./ambulance-units";
import type { User } from "./users";

export enum TicketType {
  IMMEDIATE_ATTENTION = "immediate_attention",
  TELEMEDICINE = "telemedicine",
  HOME_CARE = "home_care",
  MEDICAL_CONSULTATION = "medical_consultation",
  LABORATORY = "laboratory",
  AMBULANCE = "ambulance",
  STUDY_TRANSFER = "study_transfer",
  IMAGING = "imaging",
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
  [TicketType.STUDY_TRANSFER]: "Traslado para estudios",
  [TicketType.IMAGING]: "Imagenología",
  [TicketType.EQUIPMENT_RENTAL]: "Alquiler de equipos",
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

export const TICKET_OWNER_ROLE = {
  PARAMEDIC: "paramedic",
  DOCTOR: "doctor",
  APPOINTMENT_MANAGER: "appointment_manager",
  MARKETING: "marketing",
  DISPATCHER: "dispatcher",
  EMERGENCY_ROOM: "emergency_room",
} as const;

export type TicketOwnerRole =
  (typeof TICKET_OWNER_ROLE)[keyof typeof TICKET_OWNER_ROLE];

export const TicketOwnerRoleLabels: Record<TicketOwnerRole, string> = {
  [TICKET_OWNER_ROLE.PARAMEDIC]: "Paramédico",
  [TICKET_OWNER_ROLE.DOCTOR]: "Médico",
  [TICKET_OWNER_ROLE.APPOINTMENT_MANAGER]: "Gestor de citas",
  [TICKET_OWNER_ROLE.MARKETING]: "Marketing",
  [TICKET_OWNER_ROLE.DISPATCHER]: "Despachador",
  [TICKET_OWNER_ROLE.EMERGENCY_ROOM]: "Sala de emergencia",
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
  currentOwnerRole?: TicketOwnerRole | null;
  patient: PatientDetail | null;
  requesterPhone: string;
  requesterName: string;
  location: string;
  municipality: string | null;
  speciality: string | null;
  description: string;
  note: string | null;
  assignedUnit: AmbulanceUnit | null;
  assignedAt: Date | null;
  completedAt: Date | null;
  resolvedBy?: User | null;
  createdAt: Date;
  updatedAt: Date;
}

// types server
export interface QueryTicketsParams {
  q?: string;
  serviceType?: TicketType[];
  status?: TicketStatus[];
  priority?: TicketPriority;
  requesterPhone?: string;
  requesterName?: string;
  municipality?: string;
  assignedUnitId?: string;
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
  createdAt: string;
  eventType: "status" | "handoff";
  changedBy?: Pick<
    User,
    "id" | "firstName" | "lastName" | "email" | "role"
  > | null;
}

export interface TicketStatusHistoryEntry extends TicketStatusHistory {
  eventType: "status";
  status: TicketStatus;
  comment?: string;
  ownerRoleAtChange?: TicketOwnerRole | null;
  assignedUnitIdSnapshot?: string | null;
}

export interface TicketHandoffHistoryEntry extends TicketStatusHistory {
  eventType: "handoff";
  fromOwnerRole?: TicketOwnerRole | null;
  toOwnerRole: TicketOwnerRole;
  fromAssignedUnitId?: string | null;
  toAssignedUnitId?: string | null;
  reason?: string | null;
  note?: string | null;
}

export type TicketTimelineEntry =
  | TicketStatusHistoryEntry
  | TicketHandoffHistoryEntry;

export interface AssignTicketPayload {
  ownerRole: TicketOwnerRole;
  comment?: string;
  ambulanceUnitId?: string;
}

export interface UpdateTicketPayload {
  currentOwnerRole?: TicketOwnerRole;
  assignedUnitId?: string;
  scheduledAt?: string;
  note?: string;
}

export interface TicketActionPayload {
  comment?: string;
  ownerRole?: TicketOwnerRole;
  ambulanceUnitId?: string;
}

export interface TicketHistoryActor {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export function getUserDisplayName(user?: TicketHistoryActor | null): string {
  if (!user) return "Sistema";

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || user.email || user.id;
}

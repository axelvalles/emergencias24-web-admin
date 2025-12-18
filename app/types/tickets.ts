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
  patientId: null | string;
  requesterPhone: string;
  requesterName: string;
  location: string;
  municipality: string;
  description: string;
  additionalNotes: string | null;
  assignedTo: string | null;
  assignedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

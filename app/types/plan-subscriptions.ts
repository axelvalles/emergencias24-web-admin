import type { Company } from "./companies";
import type { Patient } from "./patients";
import type { Plan } from "./plans";

export enum PlanSubscriptionStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CANCELED = "CANCELED",
  EXPIRED = "EXPIRED",
}

export const PlanSubscriptionStatusLabels: Record<PlanSubscriptionStatus, string> = {
  [PlanSubscriptionStatus.ACTIVE]: "Activa",
  [PlanSubscriptionStatus.SUSPENDED]: "Suspendida",
  [PlanSubscriptionStatus.CANCELED]: "Cancelada",
  [PlanSubscriptionStatus.EXPIRED]: "Expirada",
};

export enum PayerType {
  PATIENT = "PATIENT",
  COMPANY = "COMPANY",
}

export const PayerTypeLabels: Record<PayerType, string> = {
  [PayerType.PATIENT]: "Paciente",
  [PayerType.COMPANY]: "Empresa",
};

export interface PlanSubscription {
  id: string;
  patient: Patient;
  plan: Plan;
  company?: Company | null;
  status: PlanSubscriptionStatus;
  payerType: PayerType;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export type PlanSubscriptionDetail = PlanSubscription;

export interface CreatePlanSubscriptionDTO {
  patientId: string;
  planId: string;
  companyId?: string;
  status?: PlanSubscriptionStatus;
  payerType: PayerType;
  startDate: string;
  endDate?: string;
}

export type UpdatePlanSubscriptionDTO = Partial<CreatePlanSubscriptionDTO>;

export interface PlanSubscriptionListFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  planId?: string;
  companyId?: string;
  status?: PlanSubscriptionStatus[];
  payerType?: PayerType[];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PlanSubscriptionListResponse {
  data: PlanSubscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export enum FamilyMemberAssignmentErrorCode {
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_NOT_ACTIVE = 'SUBSCRIPTION_NOT_ACTIVE',
  PLAN_NOT_FAMILY_TYPE = 'PLAN_NOT_FAMILY_TYPE',
  FAMILY_MEMBER_PATIENT_NOT_FOUND = 'FAMILY_MEMBER_PATIENT_NOT_FOUND',
  FAMILY_MEMBER_HAS_ACTIVE_FAMILY_PLAN = 'FAMILY_MEMBER_HAS_ACTIVE_FAMILY_PLAN',
  FAMILY_MEMBER_IS_MAIN_SUBSCRIBER = 'FAMILY_MEMBER_IS_MAIN_SUBSCRIBER',
  FAMILY_MEMBER_ALREADY_ASSIGNED = 'FAMILY_MEMBER_ALREADY_ASSIGNED',
}

export enum PlanSubscriptionCreationErrorCode {
  PLAN_ALREADY_ASSIGNED = 'PLAN_ALREADY_ASSIGNED',
  PATIENT_ALREADY_HAS_FAMILY_PLAN = 'PATIENT_ALREADY_HAS_FAMILY_PLAN',
}

export enum PlanSubscriptionUpdateErrorCode {
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  PATIENT_CHANGE_NOT_ALLOWED = 'PATIENT_CHANGE_NOT_ALLOWED',
  PLAN_CHANGE_NOT_ALLOWED = 'PLAN_CHANGE_NOT_ALLOWED',
  PLAN_ALREADY_ASSIGNED = 'PLAN_ALREADY_ASSIGNED',
  PATIENT_ALREADY_HAS_FAMILY_PLAN = 'PATIENT_ALREADY_HAS_FAMILY_PLAN',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
}

// Family member types
export interface FamilyMember {
  id: string;
  patient: Patient;
  status: PlanSubscriptionStatus;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
}

export interface AssignFamilyMemberDTO {
  subscriptionId: string;
  familyMemberDocumentNumber: string;
  startDate?: string;
  endDate?: string;
}

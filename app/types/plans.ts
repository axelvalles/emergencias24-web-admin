export enum PlanType {
  FAMILY = "FAMILY",
  ENTERPRISE = "ENTERPRISE",
}

export const PlanTypeLabels: Record<PlanType, string> = {
  [PlanType.FAMILY]: "Familiar",
  [PlanType.ENTERPRISE]: "Empresarial",
};

export enum PlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const PlanStatusLabels: Record<PlanStatus, string> = {
  [PlanStatus.ACTIVE]: "Activo",
  [PlanStatus.INACTIVE]: "Inactivo",
};

export interface PlanBenefits {
  consultations?: number;
  emergencyCoverage: boolean;
  dental: boolean;
  ophthalmology?: boolean;
  optometria?: boolean;
  notes?: string;
}

export interface PlanGroup {
  id: string;
  name: string;
  membersCount?: number;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  planType: PlanType;
  minMembers?: number | null;
  benefits: PlanBenefits;
  status: PlanStatus;
  monthlyCost?: number | null;
  annualCost?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  groups?: PlanGroup[];
}

export type PlanDetail = Plan;

export interface CreatePlanDTO {
  name: string;
  description?: string;
  planType: PlanType;
  minMembers?: number;
  benefits: PlanBenefits;
  monthlyCost?: number;
  annualCost?: number;
  validFrom?: string;
  validUntil?: string;
}

export interface UpdatePlanDTO extends Partial<CreatePlanDTO> {
  status?: PlanStatus;
}

export interface PlanListFilters {
  page?: number;
  limit?: number;
  name?: string;
  status?: PlanStatus[];
  planType?: PlanType[];
  minMembersMin?: number;
  minMembersMax?: number;
  monthlyCostMin?: number;
  monthlyCostMax?: number;
  annualCostMin?: number;
  annualCostMax?: number;
  validFrom?: string;
  validUntil?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface PlanListResponse {
  data: Plan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

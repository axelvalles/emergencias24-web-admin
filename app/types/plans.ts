export enum PlanType {
  FAMILY = "FAMILY",
  CORPORATE = "CORPORATE",
}

export const PlanTypeLabels: Record<PlanType, string> = {
  [PlanType.FAMILY]: "Familiar",
  [PlanType.CORPORATE]: "Corporativo",
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
  consultations: boolean;
  emergencyCoverage: boolean;
  dental: boolean;
  optometry?: boolean;
  notes?: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  planType: PlanType;
  benefits: PlanBenefits;
  status: PlanStatus;
  monthlyCost?: number | null;
  createdAt: string;
  updatedAt?: string | null;
}

export type PlanDetail = Plan;

export interface CreatePlanDTO {
  name: string;
  description?: string;
  planType: PlanType;
  benefits: PlanBenefits;
  status?: PlanStatus;
  monthlyCost?: number;
}

export type UpdatePlanDTO = Partial<CreatePlanDTO>;

export interface PlanListFilters {
  page?: number;
  limit?: number;
  name?: string;
  description?: string;
  status?: PlanStatus[];
  planType?: PlanType[];
  monthlyCostMin?: number;
  monthlyCostMax?: number;
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

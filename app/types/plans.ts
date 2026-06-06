import type { Benefit } from "./benefits";

export enum PlanType {
  FAMILY = "FAMILY",
  CORPORATE = "CORPORATE",
  GROUP = "GROUP",
}

export const PlanTypeLabels: Record<PlanType, string> = {
  [PlanType.FAMILY]: "Familiar",
  [PlanType.CORPORATE]: "Corporativo",
  [PlanType.GROUP]: "Grupal/Colectivo",
};

export enum PlanStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const PlanStatusLabels: Record<PlanStatus, string> = {
  [PlanStatus.ACTIVE]: "Activo",
  [PlanStatus.INACTIVE]: "Inactivo",
};

export enum PlanBillingPeriod {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMIANNUAL = "SEMIANNUAL",
  ANNUAL = "ANNUAL",
}

export const PlanBillingPeriodLabels: Record<PlanBillingPeriod, string> = {
  [PlanBillingPeriod.MONTHLY]: "Mensual",
  [PlanBillingPeriod.QUARTERLY]: "Trimestral",
  [PlanBillingPeriod.SEMIANNUAL]: "Semestral",
  [PlanBillingPeriod.ANNUAL]: "Anual",
};

export enum PlanBenefitValueType {
  QUANTITY = "QUANTITY",
  DISCOUNT = "DISCOUNT",
}

export const PlanBenefitValueTypeLabels: Record<PlanBenefitValueType, string> = {
  [PlanBenefitValueType.QUANTITY]: "Cantidad",
  [PlanBenefitValueType.DISCOUNT]: "Descuento",
};

export interface PlanBenefit {
  id?: string;
  benefitId: string;
  benefit: Benefit;
  valueType: PlanBenefitValueType;
  quantity?: number | null;
  isUnlimited: boolean;
  discountPercentage?: string | null;
}

export interface CreatePlanBenefitDTO {
  benefitId: string;
  valueType: PlanBenefitValueType;
  quantity?: number;
  isUnlimited: boolean;
  discountPercentage?: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  planType: PlanType;
  billingPeriod: PlanBillingPeriod;
  benefitsNotes?: string | null;
  planBenefits?: PlanBenefit[];
  status: PlanStatus;
  monthlyCost?: number | null;
  activeSubscriptionsCount?: number;
  benefitsCount?: number;
  createdAt: string;
  updatedAt?: string | null;
}

export type PlanDetail = Plan;

export interface CreatePlanDTO {
  name: string;
  description?: string;
  planType: PlanType;
  billingPeriod: PlanBillingPeriod;
  benefitsNotes?: string;
  planBenefits: CreatePlanBenefitDTO[];
  status?: PlanStatus;
  monthlyCost?: string;
}

export type UpdatePlanDTO = Partial<CreatePlanDTO>;

export interface PlanListFilters {
  page?: number;
  limit?: number;
  name?: string;
  description?: string;
  status?: PlanStatus[];
  planType?: PlanType[];
  billingPeriod?: PlanBillingPeriod[];
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

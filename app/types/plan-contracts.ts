export const IndividualPayerDocumentType = {
  CC: "CC",
  CE: "CE",
  PASSPORT: "PASSPORT",
  OTHER: "OTHER",
} as const;

export type IndividualPayerDocumentType =
  (typeof IndividualPayerDocumentType)[keyof typeof IndividualPayerDocumentType];

export interface IndividualPayer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: IndividualPayerDocumentType;
  documentNumber: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  linkedPatient?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  } | null;
}

export interface IndividualPayerListResponse {
  data: IndividualPayer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateIndividualPayerDTO {
  firstName: string;
  lastName: string;
  documentType: IndividualPayerDocumentType;
  documentNumber: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
}

export interface CreatePlanContractDTO {
  planId: string;
  individualPayerId: string;
  beneficiaryPatientIds: string[];
  startDate: string;
  endDate?: string;
}

export interface PlanContract {
  id: string;
  status: string;
  fixedPrice: string | number;
  billingPeriod: string;
  capacity: number;
  startDate: string;
  endDate?: string | null;
  plan: { id: string; name: string; planType: string };
  payer: Pick<
    IndividualPayer,
    "id" | "firstName" | "lastName" | "fullName" | "documentType" | "documentNumber"
  >;
  beneficiaries: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    documentType: string;
    documentNumber: string;
  }>;
}
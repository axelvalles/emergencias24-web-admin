export enum CompanyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const CompanyStatusLabels: Record<CompanyStatus, string> = {
  [CompanyStatus.ACTIVE]: "Activa",
  [CompanyStatus.INACTIVE]: "Inactiva",
};

export interface Company {
  id: string;
  name: string;
  taxId: string;
  contactEmail: string;
  contactPhone: string;
  status: CompanyStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateCompanyDTO {
  name: string;
  taxId: string;
  contactEmail: string;
  contactPhone: string;
  status?: CompanyStatus;
}

export type UpdateCompanyDTO = Partial<CreateCompanyDTO>;

export interface CompanyListFilters {
  page?: number;
  limit?: number;
  name?: string;
  taxId?: string;
  contactEmail?: string;
  status?: CompanyStatus[];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface CompanyListResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

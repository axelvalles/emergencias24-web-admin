export interface Benefit {
  id: string;
  name: string;
  plansCount?: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateBenefitDTO {
  name: string;
}

export type UpdateBenefitDTO = Partial<CreateBenefitDTO>;

export interface BenefitListFilters {
  page?: number;
  limit?: number;
  q?: string;
  name?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface BenefitListResponse {
  data: Benefit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

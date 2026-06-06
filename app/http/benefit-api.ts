import type {
  BenefitListFilters,
  BenefitListResponse,
  CreateBenefitDTO,
  UpdateBenefitDTO,
  Benefit,
} from "~/types/benefits";
import { httpClient } from "./client";

const toQueryParams = (
  filters?: BenefitListFilters
):
  | Record<string, string | number | boolean | (string | number | boolean)[]>
  | undefined => {
  if (!filters) {
    return undefined;
  }

  return Object.entries(filters).reduce(
    (acc, [key, value]) => {
      if (value === undefined || value === null) {
        return acc;
      }

      acc[key] = value as
        | string
        | number
        | boolean
        | (string | number | boolean)[];

      return acc;
    },
    {} as Record<
      string,
      string | number | boolean | (string | number | boolean)[]
    >
  );
};

export const benefitApi = {
  getAllBenefits: async (
    params?: BenefitListFilters
  ): Promise<BenefitListResponse> => {
    return httpClient.get("/benefits", toQueryParams(params));
  },

  getBenefitById: async (id: string): Promise<Benefit> => {
    return httpClient.get(`/benefits/${id}`);
  },

  createBenefit: async (data: CreateBenefitDTO): Promise<Benefit> => {
    return httpClient.post("/benefits", data);
  },

  updateBenefit: async (id: string, data: UpdateBenefitDTO): Promise<Benefit> => {
    return httpClient.patch(`/benefits/${id}`, data);
  },

  deleteBenefit: async (id: string): Promise<void> => {
    return httpClient.delete(`/benefits/${id}`);
  },
};

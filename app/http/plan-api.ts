import type {
  CreatePlanDTO,
  PlanDetail,
  PlanListFilters,
  PlanListResponse,
  UpdatePlanDTO,
} from "~/types/plans";
import { httpClient } from "./client";

const toQueryParams = (
  filters?: PlanListFilters
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

export const planApi = {
  getAllPlans: async (
    params?: PlanListFilters
  ): Promise<PlanListResponse> => {
    return httpClient.get("/plans", toQueryParams(params));
  },

  getPlanById: async (id: string): Promise<PlanDetail> => {
    return httpClient.get(`/plans/${id}`);
  },

  createPlan: async (data: CreatePlanDTO): Promise<PlanDetail> => {
    return httpClient.post("/plans", data);
  },

  updatePlan: async (
    id: string,
    data: UpdatePlanDTO
  ): Promise<PlanDetail> => {
    return httpClient.patch(`/plans/${id}`, data);
  },

  deletePlan: async (id: string): Promise<void> => {
    return httpClient.delete(`/plans/${id}`);
  },

  activatePlan: async (id: string): Promise<PlanDetail> => {
    return httpClient.put(`/plans/${id}/activate`);
  },

  deactivatePlan: async (id: string): Promise<PlanDetail> => {
    return httpClient.put(`/plans/${id}/deactivate`);
  },
};

import type {
  AssignFamilyMemberDTO,
  CreatePlanSubscriptionDTO,
  FamilyMember,
  PlanSubscription,
  PlanSubscriptionDetail,
  PlanSubscriptionListFilters,
  PlanSubscriptionListResponse,
  UpdatePlanSubscriptionDTO,
} from "~/types/plan-subscriptions";
import { httpClient } from "./client";

const toQueryParams = (
  filters?: PlanSubscriptionListFilters
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

export const planSubscriptionApi = {
  getAllPlanSubscriptions: async (
    params?: PlanSubscriptionListFilters
  ): Promise<PlanSubscriptionListResponse> => {
    return httpClient.get("/plan-subscriptions", toQueryParams(params));
  },

  getPlanSubscriptionById: async (id: string): Promise<PlanSubscriptionDetail> => {
    return httpClient.get(`/plan-subscriptions/${id}`);
  },

  createPlanSubscription: async (
    data: CreatePlanSubscriptionDTO
  ): Promise<PlanSubscriptionDetail> => {
    return httpClient.post("/plan-subscriptions", data);
  },

  updatePlanSubscription: async (
    id: string,
    data: UpdatePlanSubscriptionDTO
  ): Promise<PlanSubscriptionDetail> => {
    return httpClient.patch(`/plan-subscriptions/${id}`, data);
  },

  deletePlanSubscription: async (id: string): Promise<void> => {
    return httpClient.delete(`/plan-subscriptions/${id}`);
  },

  // Family member endpoints
  getFamilyMembers: async (subscriptionId: string): Promise<FamilyMember[]> => {
    return httpClient.get(`/plan-subscriptions/${subscriptionId}/family-members`);
  },

  assignFamilyMember: async (
    data: AssignFamilyMemberDTO
  ): Promise<PlanSubscriptionDetail> => {
    return httpClient.post("/plan-subscriptions/family-members", data);
  },

  removeFamilyMember: async (familyMemberId: string): Promise<void> => {
    return httpClient.delete(`/plan-subscriptions/family-members/${familyMemberId}`);
  },

  findActiveByPatientId: async (patientId: string): Promise<PlanSubscription[]> => {
    return httpClient.get(`/plan-subscriptions/patient/${patientId}/active`);
  },
};

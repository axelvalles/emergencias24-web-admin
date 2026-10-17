import type {
  CreateIndividualPayerDTO,
  CreatePlanContractDTO,
  IndividualPayer,
  IndividualPayerListResponse,
  PlanContract,
} from "~/types/plan-contracts";
import { httpClient } from "./client";

export const individualPayerApi = {
  getAllIndividualPayers: async (params?: {
    q?: string;
    documentNumber?: string;
    page?: number;
    limit?: number;
  }): Promise<IndividualPayerListResponse> => {
    return httpClient.get("/individual-payers", params);
  },

  createIndividualPayer: async (
    data: CreateIndividualPayerDTO
  ): Promise<IndividualPayer> => {
    return httpClient.post("/individual-payers", data);
  },
};

export const planContractApi = {
  createPlanContract: async (
    data: CreatePlanContractDTO
  ): Promise<PlanContract> => {
    return httpClient.post("/plan-contracts", data);
  },
};
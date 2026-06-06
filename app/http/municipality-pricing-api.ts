import { httpClient } from "./client";
import type {
  MunicipalityPricing,
  UpdateMunicipalityPricingDTO,
} from "~/types/municipality-pricing";

export const municipalityPricingApi = {
  getAll: async (): Promise<MunicipalityPricing[]> => {
    return httpClient.get("/municipality-pricing");
  },

  update: async (
    id: string,
    data: UpdateMunicipalityPricingDTO
  ): Promise<MunicipalityPricing> => {
    return httpClient.patch(`/municipality-pricing/${id}`, data);
  },
};

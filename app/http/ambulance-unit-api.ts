import type {
  AmbulanceUnit,
  AmbulanceUnitPayload,
} from "~/types/ambulance-units";
import type { User } from "~/types/users";
import { httpClient } from "./client";

export const ambulanceUnitApi = {
  getAllUnits: async (): Promise<AmbulanceUnit[]> => {
    return httpClient.get("/ambulance-units");
  },

  searchUnits: async (params?: {
    term?: string;
    limit?: number;
  }): Promise<AmbulanceUnit[]> => {
    return httpClient.get("/ambulance-units/search", params);
  },

  getUnitById: async (id: string): Promise<AmbulanceUnit> => {
    return httpClient.get(`/ambulance-units/${id}`);
  },

  createUnit: async (payload: AmbulanceUnitPayload): Promise<AmbulanceUnit> => {
    return httpClient.post("/ambulance-units", payload);
  },

  updateUnit: async (
    id: string,
    payload: Partial<AmbulanceUnitPayload>
  ): Promise<AmbulanceUnit> => {
    return httpClient.patch(`/ambulance-units/${id}`, payload);
  },

  setActiveUnit: async (id: string): Promise<User> => {
    return httpClient.patch(`/ambulance-units/active/${id}`, {});
  },
};

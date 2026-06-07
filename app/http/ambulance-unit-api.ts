import type {
  AmbulanceUnit,
  AmbulanceUnitPayload,
  AmbulanceUnitListFilters,
  AmbulanceUnitListResponse,
} from "~/types/ambulance-units";
import type { User } from "~/types/users";
import { httpClient } from "./client";

const toQueryParams = (
  filters?: AmbulanceUnitListFilters
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

export const ambulanceUnitApi = {
  getUnits: async (
    params?: AmbulanceUnitListFilters
  ): Promise<AmbulanceUnitListResponse> => {
    return httpClient.get("/ambulance-units", toQueryParams(params));
  },

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

  deleteUnit: async (id: string): Promise<void> => {
    return httpClient.delete(`/ambulance-units/${id}`);
  },

  setActiveUnit: async (id: string): Promise<User> => {
    return httpClient.patch(`/ambulance-units/active/${id}`, {});
  },
};

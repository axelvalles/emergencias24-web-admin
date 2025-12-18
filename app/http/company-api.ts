import type {
  Company,
  CompanyListFilters,
  CompanyListResponse,
  CreateCompanyDTO,
  UpdateCompanyDTO,
} from "~/types/companies";
import { httpClient } from "./client";

const toQueryParams = (
  filters?: CompanyListFilters
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

export const companyApi = {
  getAllCompanies: async (
    params?: CompanyListFilters
  ): Promise<CompanyListResponse> => {
    return httpClient.get("/companies", toQueryParams(params));
  },

  getCompanyById: async (id: string): Promise<Company> => {
    return httpClient.get(`/companies/${id}`);
  },

  createCompany: async (data: CreateCompanyDTO): Promise<Company> => {
    return httpClient.post("/companies", data);
  },

  updateCompany: async (
    id: string,
    data: UpdateCompanyDTO
  ): Promise<Company> => {
    return httpClient.patch(`/companies/${id}`, data);
  },

  deleteCompany: async (id: string): Promise<void> => {
    return httpClient.delete(`/companies/${id}`);
  },

  activateCompany: async (id: string): Promise<Company> => {
    return httpClient.put(`/companies/${id}/activate`);
  },

  deactivateCompany: async (id: string): Promise<Company> => {
    return httpClient.put(`/companies/${id}/deactivate`);
  },
};

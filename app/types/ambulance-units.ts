import type { User } from "./users";

export interface AmbulanceUnit {
  id: string;
  name: string;
  members: User[];
  membersCount: number;
  activeUsersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AmbulanceUnitPayload {
  name: string;
  memberIds?: string[];
}

export interface AmbulanceUnitListFilters {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface AmbulanceUnitListResponse {
  data: AmbulanceUnit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

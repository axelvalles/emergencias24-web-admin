import type { User } from "./users";

export interface AmbulanceUnit {
  id: string;
  name: string;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AmbulanceUnitPayload {
  name: string;
  memberIds?: string[];
}

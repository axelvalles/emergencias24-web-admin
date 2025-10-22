export interface User {
  id: number;
  email: string;
  roles: string[];
  is_active: true;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

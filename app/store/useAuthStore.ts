import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponse, User } from "~/types/users";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
  refreshToken: (newToken: string) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (loginResponse: LoginResponse) => {
        set({
          user: loginResponse.user,
          token: loginResponse.accessToken,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      refreshToken: (newToken: string) => {
        set((state) => ({
          ...state,
          token: newToken,
        }));
      },
      setUser: (user: User) => {
        set((state) => ({
          ...state,
          user,
        }));
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

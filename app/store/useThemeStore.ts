import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: (localStorage.getItem("theme") as Theme) || "light",
      setTheme: (theme) => {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
        set({ theme });
      },
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          localStorage.setItem("theme", newTheme);
          document.documentElement.classList.toggle(
            "dark",
            newTheme === "dark"
          );
          return { theme: newTheme };
        }),
    }),
    {
      name: "theme-storage",
    }
  )
);

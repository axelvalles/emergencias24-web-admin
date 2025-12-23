import { Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useThemeStore } from "~/store/useThemeStore";
import { useCallback, type MouseEvent } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useThemeStore();

  const handleThemeToggle = useCallback(
    (e?: MouseEvent) => {
      const newMode = theme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      if (e) {
        root.style.setProperty("--x", `${e.clientX}px`);
        root.style.setProperty("--y", `${e.clientY}px`);
      }

      document.startViewTransition(() => {
        setTheme(newMode);
      });
    },
    [theme, setTheme]
  );

  return (
    <Button
      variant="secondary"
      size="icon"
      className="group/toggle size-8"
      onClick={handleThemeToggle}
    >
      {theme === "dark" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}

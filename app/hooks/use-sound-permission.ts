import { useState } from "react";

export function useSoundPermission() {
  const [enabled, setEnabled] = useState(false);

  function enableSound() {
    const audio = new Audio("/sounds/alert.mp3");
    audio
      .play()
      .then(() => {
        setEnabled(true);
        console.log("🔊 Sonido habilitado");
      })
      .catch(() => {
        console.warn("🔇 No se pudo habilitar el sonido");
      });
  }

  return { enabled, enableSound };
}

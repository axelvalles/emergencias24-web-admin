import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  async function handleToggle() {
    if (!enabled) {
      try {
        const audio = new Audio("/sounds/alert.mp3");
        audio.volume = 0.0;
        await audio.play();
        setEnabled(true);
        console.log("🔊 Sonido habilitado correctamente");
      } catch (err) {
        console.warn("🔇 No se pudo habilitar el sonido automáticamente", err);
      }
    } else {
      setEnabled(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={"relative text-gray-600"}
      title={enabled ? "Desactivar sonido" : "Activar sonido"}
    >
      {enabled ? (
        <Volume2 className="h-5 w-5" />
      ) : (
        <VolumeX className="h-5 w-5" />
      )}
    </Button>
  );
}

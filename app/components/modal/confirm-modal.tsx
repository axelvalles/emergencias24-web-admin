import { useEffect, useState, type FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  confirmText: string; // <-- texto requerido para confirmar
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  confirmText,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setValue(""); // reset al cerrar
    }
  }, [isOpen]);

  if (!isMounted) return null;

  const isValid =
    value.trim().toLowerCase() === confirmText.trim().toLowerCase();

  return (
    <Modal
      title="Confirmar acción"
      description={`Para continuar, escribe: "${confirmText}"`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col space-y-4 pt-2">
        <Input
          placeholder={`Escribe "${confirmText}" para confirmar`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
        />

        <div className="flex w-full items-center justify-end space-x-2 pt-4">
          <Button disabled={loading} variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={!isValid || loading}
            variant="destructive"
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

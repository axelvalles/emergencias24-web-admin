import { AlertModal } from "~/components/modal/alert-modal";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { IconEdit, IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, type FC } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { patientApi, getErrorMessage } from "~/http/api-server";
import type { Patient } from "~/http/patient-api";

interface CellActionProps {
  data: Patient;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const [loading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await patientApi.deletePatient(data.id.toString());
    },
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(getErrorMessage(res.error));
        return;
      }

      setOpen(false);
      toast.success("Paciente eliminado exitosamente");
      // TODO: Refresh the page or update the list
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onConfirm = async () => {
    await deleteMutation.mutate();
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => navigate(`/patients/edit/${data.id}`)}
          >
            <IconEdit className="mr-2 h-4 w-4" /> Actualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

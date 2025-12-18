import { Button } from "~/components/ui/button";
import { IconEdit, IconTrash, IconUserCheck, IconUserOff } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import { useState, type FC } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { patientApi, getErrorMessage } from "~/http/api-server";
import { PatientStatus, type Patient } from "~/types/patients";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ConfirmModal } from "~/components/modal/confirm-modal";
import { queryClient } from "~/lib/query-client";

interface CellActionProps {
  data: Patient;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const [loading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      const newStatus =
        data.status === PatientStatus.ACTIVE
          ? PatientStatus.INACTIVE
          : PatientStatus.ACTIVE;
      return await patientApi.updateStatus(data.id.toString(), newStatus);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
      toast.success("Estado del paciente actualizado");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await patientApi.deletePatient(data.id.toString());
    },
    onSuccess: async () => {
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["patients"],
      });
      toast.success("Paciente eliminado exitosamente");
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
      <ConfirmModal
        confirmText={data.documentNumber}
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <div className="space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                navigate(`/pacientes/editar/${data.documentNumber}`)
              }
            >
              <IconEdit />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Editar paciente</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleStatusMutation.mutate()}
              disabled={toggleStatusMutation.isPending}
            >
              {data.status === PatientStatus.ACTIVE ? (
                <IconUserOff />
              ) : (
                <IconUserCheck />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>
              {data.status === PatientStatus.ACTIVE
                ? "Desactivar"
                : "Activar"}{" "}
              paciente
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
              <IconTrash />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Eliminar paciente</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

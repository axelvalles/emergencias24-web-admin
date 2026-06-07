import { useState, type FC } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { ambulanceUnitApi } from "~/http/ambulance-unit-api";
import type { AmbulanceUnit } from "~/types/ambulance-units";
import { ConfirmModal } from "~/components/modal/confirm-modal";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

interface CellActionProps {
  data: AmbulanceUnit;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await ambulanceUnitApi.deleteUnit(data.id);
    },
    onSuccess: () => {
      toast.success("Unidad eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ["ambulance-units"] });
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Error al eliminar la unidad");
      console.error(error);
    },
  });

  const onConfirm = async () => {
    setLoading(true);
    await deleteMutation.mutateAsync();
    setLoading(false);
  };

  return (
    <>
      <ConfirmModal
        confirmText={data.name}
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
              onClick={() => navigate(`/unidades-ambulancia/editar/${data.id}`)}
            >
              <IconEdit />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Editar unidad</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
              <IconTrash />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Eliminar unidad</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};
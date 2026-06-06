import { useState, type FC } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconEdit, IconTrash } from "@tabler/icons-react";

import { ConfirmModal } from "~/components/modal/confirm-modal";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { benefitApi, getErrorMessage } from "~/http/api-server";
import type { Benefit } from "~/types/benefits";

interface CellActionProps {
  data: Benefit;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const hasAssociatedPlans = (data.plansCount ?? 0) > 0;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return benefitApi.deleteBenefit(data.id);
    },
    onSuccess: async () => {
      toast.success("Beneficio eliminado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["benefits"] });
      setDeleteModalOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  return (
    <>
      <ConfirmModal
        confirmText={data.name}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/beneficios/editar/${data.id}`)}
            >
              <IconEdit className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Editar beneficio</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDeleteModalOpen(true)}
              disabled={deleteMutation.isPending || hasAssociatedPlans}
            >
              <IconTrash className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {hasAssociatedPlans
              ? "No se puede eliminar: está asociado a uno o más planes"
              : "Eliminar beneficio"}
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

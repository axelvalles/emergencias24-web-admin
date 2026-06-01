import { useState, type FC } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { ConfirmModal } from "~/components/modal/confirm-modal";
import { planApi } from "~/http/plan-api";
import { getErrorMessage, parseApiError } from "~/http/api-server";
import { PlanStatus, type Plan } from "~/types/plans";

interface CellActionProps {
  data: Plan;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const hasActiveSubscriptions = (data.activeSubscriptionsCount ?? 0) > 0;

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      if (data.status === PlanStatus.ACTIVE) {
        return planApi.deactivatePlan(data.id);
      }
      return planApi.activatePlan(data.id);
    },
    onSuccess: async (plan) => {
      toast.success(
        plan.status === PlanStatus.ACTIVE
          ? "Plan activado correctamente"
          : "Plan desactivado correctamente"
      );
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error) => {
      const apiError = parseApiError(error);
      const message = apiError.message.toLowerCase();

      if (message.includes("suscripciones activas o suspendidas")) {
        toast.error(
          "No puedes eliminar este plan porque tiene suscripciones activas o suspendidas"
        );
        return;
      }

      toast.error(getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return planApi.deletePlan(data.id);
    },
    onSuccess: async () => {
      toast.success("Plan eliminado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
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
              onClick={() => navigate(`/planes/editar/${data.id}`)}
            >
              <IconEdit className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Editar plan</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleStatusMutation.mutate()}
              disabled={toggleStatusMutation.isPending}
            >
              {data.status === PlanStatus.ACTIVE ? (
                <IconPlayerPause className="size-4" />
              ) : (
                <IconPlayerPlay className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {data.status === PlanStatus.ACTIVE
              ? "Desactivar plan"
              : "Activar plan"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDeleteModalOpen(true)}
              disabled={deleteMutation.isPending || hasActiveSubscriptions}
            >
              <IconTrash className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {hasActiveSubscriptions
              ? "No se puede eliminar: tiene suscripciones activas/suspendidas"
              : "Eliminar plan"}
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

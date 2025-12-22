import { useState, type FC } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { IconEdit, IconTrash } from "@tabler/icons-react";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ConfirmModal } from "~/components/modal/confirm-modal";
import { planSubscriptionApi } from "~/http/plan-subscription-api";
import { getErrorMessage } from "~/http/api-server";
import { type PlanSubscription } from "~/types/plan-subscriptions";

interface CellActionProps {
  data: PlanSubscription;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return planSubscriptionApi.deletePlanSubscription(data.id);
    },
    onSuccess: async () => {
      toast.success("Suscripción eliminada correctamente");
      await queryClient.invalidateQueries({ queryKey: ["plan-subscriptions"] });
      setDeleteModalOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
  };

  const confirmText = `${data.patient?.fullName ?? "Suscripción"} - ${data.plan?.name ?? ""}`;

  return (
    <>
      <ConfirmModal
        confirmText={confirmText}
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
              onClick={() => navigate(`/suscripciones/editar/${data.id}`)}
            >
              <IconEdit className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Editar suscripción</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDeleteModalOpen(true)}
              disabled={deleteMutation.isPending}
            >
              <IconTrash className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Eliminar suscripción</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

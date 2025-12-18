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
import { companyApi } from "~/http/company-api";
import { getErrorMessage } from "~/http/api-server";
import { type Company, CompanyStatus } from "~/types/companies";

interface CellActionProps {
  data: Company;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      if (data.status === CompanyStatus.ACTIVE) {
        return companyApi.deactivateCompany(data.id);
      }
      return companyApi.activateCompany(data.id);
    },
    onSuccess: async (company) => {
      toast.success(
        company.status === CompanyStatus.ACTIVE
          ? "Empresa activada correctamente"
          : "Empresa desactivada correctamente"
      );
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return companyApi.deleteCompany(data.id);
    },
    onSuccess: async () => {
      toast.success("Empresa eliminada correctamente");
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
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
              onClick={() => navigate(`/empresas/editar/${data.id}`)}
            >
              <IconEdit className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Editar empresa</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleStatusMutation.mutate()}
              disabled={toggleStatusMutation.isPending}
            >
              {data.status === CompanyStatus.ACTIVE ? (
                <IconPlayerPause className="size-4" />
              ) : (
                <IconPlayerPlay className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {data.status === CompanyStatus.ACTIVE
              ? "Desactivar empresa"
              : "Activar empresa"}
          </TooltipContent>
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
          <TooltipContent side="bottom">Eliminar empresa</TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

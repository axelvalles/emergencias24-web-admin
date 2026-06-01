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
import { getErrorMessage, parseApiError } from "~/http/api-server";
import { type Company, CompanyStatus } from "~/types/companies";

interface CellActionProps {
  data: Company;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const hasAssociatedPatients = (data.associatedPatientsCount ?? 0) > 0;

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
      const apiError = parseApiError(error);
      const message = apiError.message.toLowerCase();

      if (message.includes("pacientes asociados")) {
        toast.error(
          "No puedes eliminar esta empresa porque tiene pacientes asociados"
        );
        return;
      }

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
              aria-label="Editar empresa"
              data-testid={`company-edit-${data.id}`}
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
              aria-label={
                data.status === CompanyStatus.ACTIVE
                  ? "Desactivar empresa"
                  : "Activar empresa"
              }
              data-testid={`company-toggle-${data.id}`}
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
              disabled={deleteMutation.isPending || hasAssociatedPatients}
              aria-label={
                hasAssociatedPatients
                  ? "No se puede eliminar empresa"
                  : "Eliminar empresa"
              }
              data-testid={`company-delete-${data.id}`}
            >
              <IconTrash className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {hasAssociatedPatients
              ? "No se puede eliminar: tiene pacientes asociados"
              : "Eliminar empresa"}
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

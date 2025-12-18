import { useState, type FC } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { userApi } from "~/http/user-api";
import type { User } from "~/types/users";
import { ConfirmModal } from "~/components/modal/confirm-modal";
import { IconEdit, IconTrash, IconUserCheck, IconUserOff } from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

interface CellActionProps {
  data: User;
}

export const CellAction: FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await userApi.deleteUser(data.id);
    },
    onSuccess: () => {
      toast.success("Usuario eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Error al eliminar el usuario");
      console.error(error);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      if (data.status === "ACTIVE") {
        return await userApi.deactivateUser(data.id);
      } else {
        return await userApi.activateUser(data.id);
      }
    },
    onSuccess: () => {
      toast.success(
        `Usuario ${data.status === "ACTIVE" ? "desactivado" : "activado"} correctamente`
      );
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error("Error al cambiar el estado del usuario");
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
        confirmText={data.email}
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
              onClick={() => navigate(`/usuarios/editar/${data.id}`)}
            >
              <IconEdit />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Editar usuario</p>
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
              {data.status === "ACTIVE" ? <IconUserOff /> : <IconUserCheck />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{data.status === "ACTIVE" ? "Desactivar" : "Activar"} usuario</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
              <IconTrash />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Eliminar usuario</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
};

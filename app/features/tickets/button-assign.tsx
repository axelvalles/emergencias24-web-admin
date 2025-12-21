import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ticketApi, userApi } from "~/http/api-server";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UserRoleLabels, type User } from "~/types/users";
import { IconUser } from "@tabler/icons-react";
import { LoadingButton } from "~/components/ui/loading-button";
import { useParams } from "react-router";

interface ButtonAssignProps {
  ticketId: string;
  text?: string | null;
}

export default function ButtonAssign({
  ticketId,
  text = "Asignar",
}: ButtonAssignProps) {
  const { referenceNumber } = useParams();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-search"],
    queryFn: () => userApi.searchUsers({ limit: 50 }),
  });

  const assignMutation = useMutation({
    mutationFn: (userId: string) => ticketApi.assignTicket(ticketId, userId),
    onSuccess: () => {
      toast.success("Ticket asignado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["ticket-by-reference", referenceNumber],
      });
      queryClient.invalidateQueries({
        queryKey: ["ticket-history", ticketId],
      });
      setSelectedUserId("");
    },
    onError: (error) => {
      toast.error("Error al asignar el ticket");
      console.error(error);
    },
  });

  const handleAssign = () => {
    if (selectedUserId) {
      assignMutation.mutate(selectedUserId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Seleccionar usuario" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user: User) => (
            <SelectItem key={user.id} value={user.id}>
              {user.fullName} ({UserRoleLabels[user.role]})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <LoadingButton
        loading={isLoading}
        onClick={handleAssign}
        disabled={!selectedUserId || assignMutation.isPending}
        size="sm"
      >
        <IconUser className="mr-2 h-4 w-4" />
        {text || "Asignar"}
      </LoadingButton>
    </div>
  );
}

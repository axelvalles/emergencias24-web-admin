import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ambulanceUnitApi, getErrorMessage } from "~/http/api-server";
import { queryClient } from "~/lib/query-client";
import { socket } from "~/lib/socket";
import { useAuthStore } from "~/store/useAuthStore";
import { UserRole } from "~/types/users";

export default function ActiveAmbulanceUnitSelector() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const isAmbulanceUser = user?.role === UserRole.AMBULANCE;
  const ambulanceUnits = user?.ambulanceUnits ?? [];

  const setActiveUnitMutation = useMutation({
    mutationFn: async (unitId: string) => ambulanceUnitApi.setActiveUnit(unitId),
    onSuccess: async (updatedUser) => {
      setUser(updatedUser);
      socket.disconnect();
      socket.connect();
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Unidad activa actualizada");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  if (!isAmbulanceUser || ambulanceUnits.length === 0) {
    return null;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Unidad activa
      </span>
      <Select
        value={user?.activeAmbulanceUnit?.id ?? undefined}
        onValueChange={(value) => setActiveUnitMutation.mutate(value)}
        disabled={setActiveUnitMutation.isPending}
      >
        <SelectTrigger className="h-9 w-[180px] bg-background sm:w-[220px]">
          <SelectValue placeholder="Selecciona una unidad" />
        </SelectTrigger>
        <SelectContent>
          {ambulanceUnits.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

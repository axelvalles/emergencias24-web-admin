import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import PageContainer from "~/components/layout/page-container";
import { Heading } from "~/components/ui/heading";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { FormInput } from "~/components/forms/form-input";
import { FormCheckboxGroup } from "~/components/forms/form-checkbox-group";
import { LoadingButton } from "~/components/ui/loading-button";
import {
  ambulanceUnitApi,
  getErrorMessage,
  userApi,
} from "~/http/api-server";
import { queryClient } from "~/lib/query-client";
import { cn } from "~/lib/utils";
import type { AmbulanceUnit } from "~/types/ambulance-units";
import { UserRole } from "~/types/users";

const ambulanceUnitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "El nombre es obligatorio" })
    .max(100, { message: "Máximo 100 caracteres" }),
  memberIds: z.array(z.string()).optional(),
});

type AmbulanceUnitFormValues = z.infer<typeof ambulanceUnitFormSchema>;

export default function AmbulanceUnitsPage() {
  const [selectedUnit, setSelectedUnit] = useState<AmbulanceUnit | null>(null);

  const { data: ambulanceUnits = [], isLoading } = useQuery({
    queryKey: ["ambulance-units"],
    queryFn: () => ambulanceUnitApi.getAllUnits(),
  });

  const { data: ambulanceUsers = [] } = useQuery({
    queryKey: ["ambulance-users-search"],
    queryFn: () =>
      userApi.searchUsers({
        limit: 100,
        role: [UserRole.AMBULANCE],
      }),
  });

  const form = useForm<AmbulanceUnitFormValues>({
    resolver: zodResolver(ambulanceUnitFormSchema),
    defaultValues: {
      name: "",
      memberIds: [],
    },
  });

  useEffect(() => {
    if (!selectedUnit) {
      form.reset({ name: "", memberIds: [] });
      return;
    }

    form.reset({
      name: selectedUnit.name,
      memberIds: selectedUnit.members.map((member) => member.id),
    });
  }, [form, selectedUnit]);

  const saveMutation = useMutation({
    mutationFn: async (values: AmbulanceUnitFormValues) => {
      const payload = {
        name: values.name.trim(),
        memberIds: values.memberIds ?? [],
      };

      if (selectedUnit) {
        return ambulanceUnitApi.updateUnit(selectedUnit.id, payload);
      }

      return ambulanceUnitApi.createUnit(payload);
    },
    onSuccess: async () => {
      toast.success(
        selectedUnit ? "Unidad actualizada correctamente" : "Unidad creada correctamente"
      );
      setSelectedUnit(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ambulance-units"] }),
        queryClient.invalidateQueries({ queryKey: ["users"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const memberOptions = ambulanceUsers.map((user) => ({
    value: user.id,
    label: user.fullName,
  }));

  return (
    <PageContainer scrollable>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Heading
            title="Unidades de ambulancia"
            description="Crea unidades operativas y administra la tripulación asignada."
          />
          <Button
            variant="outline"
            onClick={() => setSelectedUnit(null)}
            disabled={saveMutation.isPending}
          >
            Nueva unidad
          </Button>
        </div>
        <Separator />

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Unidades registradas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading && <p className="text-sm text-muted-foreground">Cargando unidades...</p>}

              {!isLoading && ambulanceUnits.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Aun no hay unidades registradas.
                </p>
              )}

              {ambulanceUnits.map((unit) => (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setSelectedUnit(unit)}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                    selectedUnit?.id === unit.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <p className="font-medium">{unit.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {unit.members.length} integrante{unit.members.length === 1 ? "" : "s"}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {selectedUnit ? "Editar unidad" : "Crear unidad"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
                  className="space-y-6"
                >
                  <FormInput
                    control={form.control}
                    name="name"
                    label="Nombre de la unidad"
                    required
                    disabled={saveMutation.isPending}
                  />

                  <FormCheckboxGroup
                    control={form.control}
                    name="memberIds"
                    label="Tripulación"
                    description="Selecciona los usuarios ambulancia que pertenecen a esta unidad."
                    options={memberOptions}
                    columns={2}
                    disabled={saveMutation.isPending}
                  />

                  <div className="flex items-center gap-3">
                    <LoadingButton loading={saveMutation.isPending} type="submit">
                      {selectedUnit ? "Guardar cambios" : "Crear unidad"}
                    </LoadingButton>
                    {selectedUnit && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedUnit(null)}
                        disabled={saveMutation.isPending}
                      >
                        Cancelar edición
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

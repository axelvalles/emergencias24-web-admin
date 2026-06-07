import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { FormInput } from "~/components/forms/form-input";
import { FormCheckboxGroup } from "~/components/forms/form-checkbox-group";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { LoadingButton } from "~/components/ui/loading-button";
import { Button } from "~/components/ui/button";
import { ambulanceUnitApi, getErrorMessage, userApi } from "~/http/api-server";
import { queryClient } from "~/lib/query-client";
import type { AmbulanceUnit } from "~/types/ambulance-units";
import { UserRole } from "~/types/users";
import { ambulanceUnitFormSchema, type AmbulanceUnitFormSchema } from "./schemas";

const getDefaultValues = (initialData: AmbulanceUnit | null): AmbulanceUnitFormSchema => ({
  name: initialData?.name ?? "",
  memberIds: initialData?.members.map((member) => member.id) ?? [],
});

interface AmbulanceUnitFormProps {
  initialData: AmbulanceUnit | null;
  pageTitle: string;
}

export default function AmbulanceUnitForm({
  initialData,
  pageTitle,
}: AmbulanceUnitFormProps) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const navigate = useNavigate();

  const form = useForm<AmbulanceUnitFormSchema>({
    resolver: zodResolver(ambulanceUnitFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const { data: ambulanceUsers = [] } = useQuery({
    queryKey: ["ambulance-users-search"],
    queryFn: () =>
      userApi.searchUsers({
        limit: 100,
        role: [UserRole.AMBULANCE],
      }),
  });

  const createMutation = useMutation({
    mutationFn: async (values: AmbulanceUnitFormSchema) => {
      return ambulanceUnitApi.createUnit({
        name: values.name.trim(),
        memberIds: values.memberIds ?? [],
      });
    },
    onSuccess: async () => {
      toast.success("Unidad creada correctamente");
      await queryClient.invalidateQueries({ queryKey: ["ambulance-units"] });
      navigate(`/unidades-ambulancia?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: AmbulanceUnitFormSchema) => {
      return ambulanceUnitApi.updateUnit(initialData!.id, {
        name: values.name.trim(),
        memberIds: values.memberIds ?? [],
      });
    },
    onSuccess: async (data) => {
      toast.success("Unidad actualizada correctamente");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ambulance-units"] }),
        queryClient.invalidateQueries({ queryKey: ["ambulance-unit", data.id] }),
      ]);
      navigate(`/unidades-ambulancia?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;

  const memberOptions = ambulanceUsers.map((user) => ({
    value: user.id,
    label: user.fullName,
  }));

  async function onSubmit(values: AmbulanceUnitFormSchema) {
    if (initialData) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                control={form.control}
                name="name"
                label="Nombre de la unidad"
                disabled={isExecuting}
                required
              />
            </div>

            <FormCheckboxGroup
              control={form.control}
              name="memberIds"
              label="Tripulacion"
              description="Selecciona los usuarios ambulancia que pertenecen a esta unidad."
              options={memberOptions}
              columns={2}
              disabled={isExecuting}
            />

            <div className="flex items-center gap-3">
              <LoadingButton
                loading={isExecuting}
                disabled={isExecuting}
                type="submit"
              >
                {initialData ? "Actualizar unidad" : "Crear unidad"}
              </LoadingButton>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/unidades-ambulancia?page=${page}&perPage=${pageSize}`)}
                disabled={isExecuting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
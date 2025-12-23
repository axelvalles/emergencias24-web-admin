import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { FormInput } from "~/components/forms/form-input";
import { FormSelect, type FormOption } from "~/components/forms/form-select";
import { FormSwitch } from "~/components/forms/form-switch";
import { FormTextarea } from "~/components/forms/form-textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { LoadingButton } from "~/components/ui/loading-button";
import { Separator } from "~/components/ui/separator";

import { getErrorMessage, planApi } from "~/http/api-server";
import { queryClient } from "~/lib/query-client";
import { type PlanDetail, PlanType, PlanTypeLabels } from "~/types/plans";
import { planFormSchema, type PlanFormSchema } from "./schemas";

const planTypeOptions: FormOption[] = Object.entries(PlanTypeLabels).map(
  ([value, label]) => ({ value, label })
);

const defaultBenefits = {
  consultations: false,
  emergencyCoverage: false,
  dental: false,
  optometry: false,
  notes: "",
} satisfies PlanFormSchema["benefits"];

const getDefaultValues = (initialData: PlanDetail | null): PlanFormSchema => ({
  name: initialData?.name ?? "",
  description: initialData?.description ?? "",
  planType: initialData?.planType ?? PlanType.FAMILY,
  benefits: {
    consultations: initialData?.benefits?.consultations ?? defaultBenefits.consultations,
    emergencyCoverage:
      initialData?.benefits?.emergencyCoverage ?? defaultBenefits.emergencyCoverage,
    dental: initialData?.benefits?.dental ?? defaultBenefits.dental,
    optometry:
      initialData?.benefits?.optometry ?? defaultBenefits.optometry,
    notes: initialData?.benefits?.notes ?? defaultBenefits.notes,
  },
  monthlyCost: initialData?.monthlyCost ?? undefined,
});

const buildCreatePayload = (values: PlanFormSchema) => {
  const payload = {
    name: values.name.trim(),
    planType: values.planType,
    benefits: {
      consultations: values.benefits.consultations,
      emergencyCoverage: values.benefits.emergencyCoverage,
      dental: values.benefits.dental,
      optometry: values.benefits.optometry,
      ...(values.benefits.notes && values.benefits.notes.trim().length > 0
        ? { notes: values.benefits.notes.trim() }
        : {}),
    },
    ...(values.description && values.description.trim().length > 0
      ? { description: values.description.trim() }
      : {}),
    ...(typeof values.monthlyCost === "number"
      ? { monthlyCost: values.monthlyCost }
      : {}),
  } satisfies Parameters<typeof planApi.createPlan>[0];

  return payload;
};

const buildUpdatePayload = (values: PlanFormSchema) => ({
  ...buildCreatePayload(values),
}) satisfies Parameters<typeof planApi.updatePlan>[1];

interface PlanFormProps {
  initialData: PlanDetail | null;
  pageTitle: string;
}

export default function PlanForm({ initialData, pageTitle }: PlanFormProps) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const navigate = useNavigate();

  const form = useForm<PlanFormSchema>({
    resolver: zodResolver(planFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const createMutation = useMutation({
    mutationFn: async (values: PlanFormSchema) => {
      return planApi.createPlan(buildCreatePayload(values));
    },
    onSuccess: async () => {
      toast.success("Plan creado correctamente");
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
      navigate(`/planes?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: PlanFormSchema) => {
      return planApi.updatePlan(initialData!.id, buildUpdatePayload(values));
    },
    onSuccess: async (data) => {
      toast.success("Plan actualizado correctamente");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["plans"] }),
        queryClient.invalidateQueries({ queryKey: ["plan", data.id] }),
      ]);
      navigate(`/planes?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(values: PlanFormSchema) {
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
                label="Nombre del plan"
                disabled={isExecuting}
                required
              />
              <FormSelect
                control={form.control}
                name="planType"
                label="Tipo de plan"
                options={planTypeOptions}
                disabled={isExecuting}
                required
              />
              <FormInput
                control={form.control}
                name="monthlyCost"
                label="Costo mensual"
                type="number"
                step="0.01"
                min={0}
                disabled={isExecuting}
              />
              <FormTextarea
                control={form.control}
                name="description"
                label="Descripción"
                disabled={isExecuting}
                className="md:col-span-2"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">Beneficios</p>
                <p className="text-sm text-muted-foreground">
                  Configura los beneficios incluidos en el plan.
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="benefits.consultations"
                  label="Consultas incluidas"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.emergencyCoverage"
                  label="Cobertura de emergencias"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.dental"
                  label="Cobertura dental"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.optometry"
                  label="Optometría"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormTextarea
                  control={form.control}
                  name="benefits.notes"
                  label="Notas de beneficios"
                  disabled={isExecuting}
                  className="md:col-span-2"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <LoadingButton
                loading={isExecuting}
                disabled={isExecuting}
                type="submit"
              >
                {initialData ? "Actualizar plan" : "Crear plan"}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

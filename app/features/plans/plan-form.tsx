import { useEffect } from "react";
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
import { FormDatePicker } from "~/components/forms/form-date-picker";
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
  consultations: undefined,
  emergencyCoverage: false,
  dental: false,
  ophthalmology: false,
  optometria: false,
  notes: "",
} satisfies PlanFormSchema["benefits"];

const getDefaultValues = (initialData: PlanDetail | null): PlanFormSchema => ({
  name: initialData?.name ?? "",
  description: initialData?.description ?? "",
  planType: initialData?.planType ?? PlanType.FAMILY,
  minMembers: initialData?.minMembers ?? undefined,
  benefits: {
    consultations: initialData?.benefits?.consultations ?? defaultBenefits.consultations,
    emergencyCoverage:
      initialData?.benefits?.emergencyCoverage ?? defaultBenefits.emergencyCoverage,
    dental: initialData?.benefits?.dental ?? defaultBenefits.dental,
    ophthalmology:
      initialData?.benefits?.ophthalmology ?? defaultBenefits.ophthalmology,
    optometria:
      initialData?.benefits?.optometria ?? defaultBenefits.optometria,
    notes: initialData?.benefits?.notes ?? defaultBenefits.notes,
  },
  monthlyCost: initialData?.monthlyCost ?? undefined,
  annualCost: initialData?.annualCost ?? undefined,
  validFrom: initialData?.validFrom ? new Date(initialData.validFrom) : undefined,
  validUntil: initialData?.validUntil ? new Date(initialData.validUntil) : undefined,
});

const buildCreatePayload = (values: PlanFormSchema) => {
  const payload = {
    name: values.name.trim(),
    planType: values.planType,
    benefits: {
      emergencyCoverage: values.benefits.emergencyCoverage,
      dental: values.benefits.dental,
      ophthalmology: values.benefits.ophthalmology,
      optometria: values.benefits.optometria,
      ...(typeof values.benefits.consultations === "number"
        ? { consultations: values.benefits.consultations }
        : {}),
      ...(values.benefits.notes && values.benefits.notes.trim().length > 0
        ? { notes: values.benefits.notes.trim() }
        : {}),
    },
    ...(values.description && values.description.trim().length > 0
      ? { description: values.description.trim() }
      : {}),
    ...(typeof values.minMembers === "number"
      ? { minMembers: values.minMembers }
      : {}),
    ...(typeof values.monthlyCost === "number"
      ? { monthlyCost: values.monthlyCost }
      : {}),
    ...(typeof values.annualCost === "number"
      ? { annualCost: values.annualCost }
      : {}),
    ...(values.validFrom ? { validFrom: values.validFrom.toISOString() } : {}),
    ...(values.validUntil
      ? { validUntil: values.validUntil.toISOString() }
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

  const planTypeValue = form.watch("planType");
  const validFrom = form.watch("validFrom");
  const validUntil = form.watch("validUntil");

  useEffect(() => {
    if (planTypeValue !== PlanType.ENTERPRISE) {
      form.setValue("minMembers", undefined);
    }
  }, [planTypeValue, form]);

  useEffect(() => {
    if (validFrom && validUntil && validUntil < validFrom) {
      form.setValue("validUntil", undefined);
    }
  }, [validFrom, validUntil, form]);

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

  const shouldShowGroupFields = planTypeValue === PlanType.ENTERPRISE;

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
              {shouldShowGroupFields && (
                <FormInput
                  control={form.control}
                  name="minMembers"
                  label="Mínimo de miembros"
                  type="number"
                  min={1}
                  disabled={isExecuting}
                />
              )}
              <FormTextarea
                control={form.control}
                name="description"
                label="Descripción"
                disabled={isExecuting}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                control={form.control}
                name="monthlyCost"
                label="Costo mensual"
                type="number"
                step="0.01"
                min={0}
                disabled={isExecuting}
              />
              <FormInput
                control={form.control}
                name="annualCost"
                label="Costo anual"
                type="number"
                step="0.01"
                min={0}
                disabled={isExecuting}
              />
              <FormDatePicker
                control={form.control}
                name="validFrom"
                label="Vigencia desde"
                disabled={isExecuting}
              />
              <FormDatePicker
                control={form.control}
                name="validUntil"
                label="Vigencia hasta"
                disabled={isExecuting}
                config={{ minDate: validFrom }}
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
                  name="benefits.ophthalmology"
                  label="Oftalmología"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.optometria"
                  label="Optometría"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormInput
                  control={form.control}
                  name="benefits.consultations"
                  label="Consultas incluidas"
                  type="number"
                  min={0}
                  disabled={isExecuting}
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

            <LoadingButton
              loading={isExecuting}
              disabled={isExecuting}
              type="submit"
            >
              {initialData ? "Actualizar plan" : "Crear plan"}
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

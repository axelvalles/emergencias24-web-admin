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
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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
  telemedicine: false,
  medicationDelivery: false,
  ambulanceTransfer: false,
  homeCare: false,
  workplaceCare: false,
  emergencyRoom: false,
  specializedConsultations: false,
  labTests: false,
  notes: "",
} satisfies PlanFormSchema["benefits"];

const benefitFieldKeys = [
  "telemedicine",
  "medicationDelivery",
  "ambulanceTransfer",
  "homeCare",
  "workplaceCare",
  "emergencyRoom",
  "specializedConsultations",
  "labTests",
] as const;

const getDefaultValues = (initialData: PlanDetail | null): PlanFormSchema => ({
  name: initialData?.name ?? "",
  description: initialData?.description ?? "",
  planType: initialData?.planType ?? PlanType.FAMILY,
  benefits: {
    telemedicine: initialData?.benefits?.telemedicine ?? defaultBenefits.telemedicine,
    medicationDelivery: initialData?.benefits?.medicationDelivery ?? defaultBenefits.medicationDelivery,
    ambulanceTransfer: initialData?.benefits?.ambulanceTransfer ?? defaultBenefits.ambulanceTransfer,
    homeCare: initialData?.benefits?.homeCare ?? defaultBenefits.homeCare,
    workplaceCare: initialData?.benefits?.workplaceCare ?? defaultBenefits.workplaceCare,
    emergencyRoom: initialData?.benefits?.emergencyRoom ?? defaultBenefits.emergencyRoom,
    specializedConsultations: initialData?.benefits?.specializedConsultations ?? defaultBenefits.specializedConsultations,
    labTests: initialData?.benefits?.labTests ?? defaultBenefits.labTests,
    notes: initialData?.benefits?.notes ?? defaultBenefits.notes,
  },
  monthlyCost: initialData?.monthlyCost?.toString() ?? "",
});

const buildCreatePayload = (values: PlanFormSchema) => {
  const payload = {
    name: values.name.trim(),
    planType: values.planType,
    benefits: {
      telemedicine: values.benefits.telemedicine,
      medicationDelivery: values.benefits.medicationDelivery,
      ambulanceTransfer: values.benefits.ambulanceTransfer,
      homeCare: values.benefits.homeCare,
      workplaceCare: values.benefits.workplaceCare,
      emergencyRoom: values.benefits.emergencyRoom,
      specializedConsultations: values.benefits.specializedConsultations,
      labTests: values.benefits.labTests,
      ...(values.benefits.notes && values.benefits.notes.trim().length > 0
        ? { notes: values.benefits.notes.trim() }
        : {}),
    },
    ...(values.description && values.description.trim().length > 0
      ? { description: values.description.trim() }
      : {}),
    ...(values.monthlyCost && values.monthlyCost.trim().length > 0
      ? { monthlyCost: values.monthlyCost.trim() }
      : {}),
  } satisfies Parameters<typeof planApi.createPlan>[0];

  return payload;
};

const buildUpdatePayload = (values: PlanFormSchema) => ({
  ...buildCreatePayload(values),
}) satisfies Parameters<typeof planApi.updatePlan>[1];

const handleMonthlyCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/[^0-9.]/g, '');
  const dotIndex = value.indexOf('.');
  if (dotIndex !== -1) {
    const beforeDot = value.substring(0, dotIndex + 1);
    const afterDot = value.substring(dotIndex + 1).replace(/\./g, '');
    value = beforeDot + afterDot;
  }
  e.target.value = value;
};

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
  const benefits = form.watch("benefits");

  const activeBenefitsCount = benefitFieldKeys.reduce(
    (count, key) => (benefits[key] ? count + 1 : count),
    0
  );

  const setAllBenefits = (value: boolean) => {
    benefitFieldKeys.forEach((key) => {
      form.setValue(`benefits.${key}`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    });
  };

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
        {initialData && (initialData.activeSubscriptionsCount ?? 0) > 0 && (
          <div className="pt-2">
            <Badge variant="secondary">
              {initialData.activeSubscriptionsCount} suscripciones activas/suspendidas
            </Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              Este plan está en uso. No se puede eliminar mientras tenga suscripciones activas o suspendidas.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">Datos del plan</p>
                <p className="text-sm text-muted-foreground">
                  Define modalidad, costo y contexto comercial del plan.
                </p>
              </div>
              <Separator />
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
                  type="text"
                  disabled={isExecuting}
                  onChange={handleMonthlyCostChange}
                />
                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Descripción"
                  disabled={isExecuting}
                  className="md:col-span-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold">Beneficios</p>
                <p className="text-sm text-muted-foreground">
                  Configura los beneficios incluidos en el plan.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeBenefitsCount} de {benefitFieldKeys.length} beneficios activos
                </p>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isExecuting}
                  onClick={() => setAllBenefits(true)}
                >
                  Activar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isExecuting}
                  onClick={() => setAllBenefits(false)}
                >
                  Limpiar todos
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormSwitch
                  control={form.control}
                  name="benefits.telemedicine"
                  label="Telemedicina"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.medicationDelivery"
                  label="Entrega de medicamentos"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.ambulanceTransfer"
                  label="Traslado en ambulancia"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.homeCare"
                  label="Cuidado en casa"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.workplaceCare"
                  label="Cuidado en el trabajo"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.emergencyRoom"
                  label="Sala de emergencias"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.specializedConsultations"
                  label="Consultas especializadas"
                  disabled={isExecuting}
                  showDescription={false}
                />
                <FormSwitch
                  control={form.control}
                  name="benefits.labTests"
                  label="Pruebas de laboratorio"
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

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";

import { FormInput } from "~/components/forms/form-input";
import { FormSelect, type FormOption } from "~/components/forms/form-select";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { LoadingButton } from "~/components/ui/loading-button";
import { Button } from "~/components/ui/button";

import {
  parseApiError,
  patientApi,
  planApi,
  planSubscriptionApi,
} from "~/http/api-server";
import { companyApi } from "~/http/company-api";
import { queryClient } from "~/lib/query-client";
import {
  type PlanSubscriptionDetail,
  PayerType,
  PayerTypeLabels,
  PlanSubscriptionStatus,
  PlanSubscriptionStatusLabels,
  PlanSubscriptionCreationErrorCode,
  PlanSubscriptionUpdateErrorCode,
} from "~/types/plan-subscriptions";
import {
  planSubscriptionFormSchema,
  type PlanSubscriptionFormSchema,
} from "./schemas";
import { PlanType, PlanTypeLabels } from "~/types/plans";

const managePlanSubscriptionCreationErrors = (error: unknown) => {
  const result = parseApiError(error);

  if (
    result.errorCode === PlanSubscriptionCreationErrorCode.PLAN_ALREADY_ASSIGNED
  ) {
    toast.error("El paciente ya tiene asignado este plan");
  } else if (
    result.errorCode ===
    PlanSubscriptionCreationErrorCode.PATIENT_ALREADY_HAS_PLAN_TYPE
  ) {
    toast.error("El paciente ya tiene una suscripción activa/suspendida de este tipo de plan");
  } else if (
    result.errorCode ===
    PlanSubscriptionCreationErrorCode.PATIENT_ALREADY_HAS_FAMILY_PLAN
  ) {
    toast.error("El paciente ya tiene un plan familiar activo");
  } else {
    toast.error("Ocurrio un error al crear la suscripción");
  }
};

const managePlanSubscriptionUpdateErrors = (error: unknown) => {
  const result = parseApiError(error);

  if (
    result.errorCode === PlanSubscriptionUpdateErrorCode.SUBSCRIPTION_NOT_FOUND
  ) {
    toast.error("La suscripción no fue encontrada");
  } else if (
    result.errorCode ===
    PlanSubscriptionUpdateErrorCode.PATIENT_CHANGE_NOT_ALLOWED
  ) {
    toast.error("No se permite cambiar el paciente");
  } else if (
    result.errorCode === PlanSubscriptionUpdateErrorCode.PLAN_CHANGE_NOT_ALLOWED
  ) {
    toast.error("No se permite cambiar el plan");
  } else if (
    result.errorCode === PlanSubscriptionUpdateErrorCode.PLAN_ALREADY_ASSIGNED
  ) {
    toast.error("El paciente ya tiene asignado este plan");
  } else if (
    result.errorCode ===
    PlanSubscriptionUpdateErrorCode.PATIENT_ALREADY_HAS_PLAN_TYPE
  ) {
    toast.error("El paciente ya tiene una suscripción activa/suspendida de este tipo de plan");
  } else if (
    result.errorCode ===
    PlanSubscriptionUpdateErrorCode.PATIENT_ALREADY_HAS_FAMILY_PLAN
  ) {
    toast.error("El paciente ya tiene un plan familiar activo");
  } else if (
    result.errorCode ===
    PlanSubscriptionUpdateErrorCode.INVALID_STATUS_TRANSITION
  ) {
    toast.error("Transición de estado inválida");
  } else if (
    result.errorCode === PlanSubscriptionUpdateErrorCode.INVALID_DATE_RANGE
  ) {
    toast.error("Rango de fechas inválido");
  } else {
    toast.error("Ocurrio un error al actualizar la suscripción");
  }
};

const payerTypeOptions: FormOption[] = Object.entries(PayerTypeLabels).map(
  ([value, label]) => ({ value, label })
);

const statusOptions: FormOption[] = Object.entries(
  PlanSubscriptionStatusLabels
).map(([value, label]) => ({ value, label }));

const formatDateForInput = (dateString?: string | null): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const getDefaultValues = (
  initialData: PlanSubscriptionDetail | null,
  preselectedPatientId?: string | null
): PlanSubscriptionFormSchema => ({
  patientId: initialData?.patient?.id ?? preselectedPatientId ?? "",
  planId: initialData?.plan?.id ?? "",
  companyId: initialData?.company?.id ?? "",
  status: initialData?.status ?? PlanSubscriptionStatus.ACTIVE,
  payerType: initialData?.payerType ?? PayerType.PATIENT,
  startDate:
    formatDateForInput(initialData?.startDate) ||
    new Date().toISOString().split("T")[0],
  endDate: formatDateForInput(initialData?.endDate),
});

const buildCreatePayload = (values: PlanSubscriptionFormSchema) => {
  const payload = {
    patientId: values.patientId,
    planId: values.planId,
    payerType: values.payerType,
    startDate: values.startDate,
    ...(values.companyId && values.payerType === PayerType.COMPANY
      ? { companyId: values.companyId }
      : {}),
    ...(values.status ? { status: values.status } : {}),
    ...(values.endDate ? { endDate: values.endDate } : {}),
  } satisfies Parameters<typeof planSubscriptionApi.createPlanSubscription>[0];

  return payload;
};

const buildUpdatePayload = (values: PlanSubscriptionFormSchema) =>
  ({
    ...buildCreatePayload(values),
  }) satisfies Parameters<typeof planSubscriptionApi.updatePlanSubscription>[1];

interface PlanSubscriptionFormProps {
  initialData: PlanSubscriptionDetail | null;
  pageTitle: string;
}

type PlanFlowMode = PlanType.FAMILY | PlanType.CORPORATE | PlanType.GROUP;

const planModeConfig: {
  value: PlanFlowMode;
  title: string;
  description: string;
}[] = [
  {
    value: PlanType.FAMILY,
    title: "Individual / Familiar",
    description: "Paciente titular y opcionalmente su grupo familiar",
  },
  {
    value: PlanType.CORPORATE,
    title: "Empresarial",
    description: "Suscripción asociada a empresa como pagador",
  },
  {
    value: PlanType.GROUP,
    title: "Colectivo / Grupal",
    description: "Cobertura grupal para colectivos",
  },
];

export default function PlanSubscriptionForm({
  initialData,
  pageTitle,
}: PlanSubscriptionFormProps) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");

  const navigate = useNavigate();

  const form = useForm<PlanSubscriptionFormSchema>({
    resolver: zodResolver(planSubscriptionFormSchema),
    defaultValues: getDefaultValues(initialData, preselectedPatientId),
  });

  const payerType = form.watch("payerType");
  const selectedPlanId = form.watch("planId");

  // Fetch patients for select
  const { data: patientsData, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients", { limit: 100 }],
    queryFn: () => patientApi.getAllPatients({ limit: 100 }),
  });

  // Fetch plans for select
  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["plans", { limit: 100 }],
    queryFn: () => planApi.getAllPlans({ limit: 100 }),
  });

  // Fetch companies for select
  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ["companies", { limit: 100 }],
    queryFn: () => companyApi.getAllCompanies({ limit: 100 }),
    enabled: payerType === PayerType.COMPANY,
  });

  const patientOptions: FormOption[] =
    patientsData?.data?.map((patient) => ({
      value: patient.id,
      label: patient.fullName,
    })) ?? [];

  const selectedPlan = plansData?.data?.find((plan) => plan.id === selectedPlanId);

  const initialMode = useMemo<PlanFlowMode>(() => {
    return (
      (initialData?.plan?.planType as PlanFlowMode | undefined) ??
      (plansData?.data?.find((plan) => plan.id === selectedPlanId)?.planType as
        | PlanFlowMode
        | undefined) ??
      PlanType.FAMILY
    );
  }, [initialData?.plan?.planType, plansData?.data, selectedPlanId]);

  const [activeMode, setActiveMode] = useState<PlanFlowMode>(initialMode);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  const filteredPlanOptions: FormOption[] =
    plansData?.data
      ?.filter((plan) => plan.planType === activeMode)
      .map((plan) => ({
        value: plan.id,
        label: `${plan.name} - ${PlanTypeLabels[plan.planType]}`,
      })) ?? [];

  const companyOptions: FormOption[] =
    companiesData?.data?.map((company) => ({
      value: company.id,
      label: company.name,
    })) ?? [];

  // Clear companyId when payerType changes to PATIENT
  useEffect(() => {
    if (payerType === PayerType.PATIENT) {
      form.setValue("companyId", "");
    }
  }, [payerType, form]);

  useEffect(() => {
    if (!selectedPlan || initialData) {
      return;
    }

    if (selectedPlan.planType === PlanType.CORPORATE) {
      form.setValue("payerType", PayerType.COMPANY);
      return;
    }

    if (selectedPlan.planType === PlanType.FAMILY) {
      form.setValue("payerType", PayerType.PATIENT);
    }
  }, [selectedPlan, form, initialData]);

  useEffect(() => {
    if (!plansData?.data || !selectedPlanId) {
      return;
    }

    const selected = plansData.data.find((plan) => plan.id === selectedPlanId);
    if (!selected || selected.planType === activeMode) {
      return;
    }

    form.setValue("planId", "");
  }, [activeMode, selectedPlanId, plansData, form]);

  const createMutation = useMutation({
    mutationFn: async (values: PlanSubscriptionFormSchema) => {
      return planSubscriptionApi.createPlanSubscription(
        buildCreatePayload(values)
      );
    },
    onSuccess: async () => {
      toast.success("Suscripción creada correctamente");
      await queryClient.invalidateQueries({ queryKey: ["plan-subscriptions"] });
      navigate(`/suscripciones?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      managePlanSubscriptionCreationErrors(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: PlanSubscriptionFormSchema) => {
      return planSubscriptionApi.updatePlanSubscription(
        initialData!.id,
        buildUpdatePayload(values)
      );
    },
    onSuccess: async (data) => {
      toast.success("Suscripción actualizada correctamente");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["plan-subscriptions"] }),
        queryClient.invalidateQueries({
          queryKey: ["plan-subscription", data.id],
        }),
      ]);
      navigate(`/suscripciones?page=${page}&perPage=${pageSize}`);
    },
    onError: (error) => {
      managePlanSubscriptionUpdateErrors(error);
    },
  });

  const isExecuting = createMutation.isPending || updateMutation.isPending;
  const isLoadingOptions =
    isLoadingPatients || isLoadingPlans || isLoadingCompanies;

  async function onSubmit(values: PlanSubscriptionFormSchema) {
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
            <div className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium">Tipo de suscripción</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {planModeConfig.map((mode) => {
                  const isActive = activeMode === mode.value;
                  return (
                    <Button
                      key={mode.value}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      className="h-auto items-start justify-start py-3 text-left"
                      onClick={() => setActiveMode(mode.value)}
                      disabled={isExecuting || !!initialData}
                    >
                      <span className="block">
                        <span className="block text-sm font-semibold">{mode.title}</span>
                        <span className="block text-xs opacity-80">{mode.description}</span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormSelect
                control={form.control}
                name="patientId"
                label="Paciente"
                options={patientOptions}
                disabled={
                  isExecuting || isLoadingOptions || !!preselectedPatientId || !!initialData
                }
                required
              />
              <FormSelect
                control={form.control}
                name="planId"
                label="Plan"
                options={filteredPlanOptions}
                disabled={isExecuting || isLoadingOptions || !!initialData}
                required
              />
              <FormSelect
                control={form.control}
                name="payerType"
                label="Tipo de pagador"
                options={payerTypeOptions}
                disabled={isExecuting || (!initialData && selectedPlan?.planType === PlanType.CORPORATE)}
                required
              />
              {payerType === PayerType.COMPANY && (
                <FormSelect
                  control={form.control}
                  name="companyId"
                  label="Empresa"
                  options={companyOptions}
                  disabled={isExecuting || isLoadingOptions}
                  required
                />
              )}
              {initialData && (
                <FormSelect
                  control={form.control}
                  name="status"
                  label="Estado"
                  options={statusOptions}
                  disabled={isExecuting}
                />
              )}
              <FormInput
                control={form.control}
                name="startDate"
                label="Fecha de inicio"
                type="date"
                disabled={isExecuting}
                required
              />
              <FormInput
                control={form.control}
                name="endDate"
                label="Fecha de fin"
                type="date"
                disabled={isExecuting}
              />
            </div>

            {!initialData && selectedPlan?.planType === PlanType.CORPORATE && (
              <p className="text-sm text-muted-foreground">
                Los planes corporativos requieren pagador tipo empresa y selección de la empresa.
              </p>
            )}

            <div className="flex justify-end">
              <LoadingButton
                loading={isExecuting}
                disabled={isExecuting || isLoadingOptions}
                type="submit"
              >
                {initialData ? "Actualizar suscripción" : "Crear suscripción"}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

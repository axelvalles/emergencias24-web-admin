import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { FormInput } from "~/components/forms/form-input";
import { FormSelect, type FormOption } from "~/components/forms/form-select";
import { FormTextarea } from "~/components/forms/form-textarea";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { LoadingButton } from "~/components/ui/loading-button";
import { Separator } from "~/components/ui/separator";
import { benefitApi, getErrorMessage, planApi } from "~/http/api-server";
import { queryClient } from "~/lib/query-client";
import type { Benefit } from "~/types/benefits";
import {
  type CreatePlanBenefitDTO,
  type PlanDetail,
  PlanBenefitValueType,
  PlanBenefitValueTypeLabels,
  PlanBillingPeriod,
  PlanBillingPeriodLabels,
  PlanType,
  PlanTypeLabels,
} from "~/types/plans";
import { planFormSchema, type PlanFormSchema } from "./schemas";

const planTypeOptions: FormOption[] = Object.entries(PlanTypeLabels).map(
  ([value, label]) => ({ value, label })
);

const billingPeriodOptions: FormOption[] = Object.entries(
  PlanBillingPeriodLabels
).map(([value, label]) => ({ value, label }));

const benefitValueTypeOptions: FormOption[] = Object.entries(
  PlanBenefitValueTypeLabels
).map(([value, label]) => ({ value, label }));

const emptyPlanBenefit = (): PlanFormSchema["planBenefits"][number] => ({
  benefitId: "",
  valueType: PlanBenefitValueType.QUANTITY,
  quantity: 1,
  isUnlimited: false,
  discountPercentage: "",
});

const getDefaultValues = (initialData: PlanDetail | null): PlanFormSchema => ({
  name: initialData?.name ?? "",
  description: initialData?.description ?? "",
  planType: initialData?.planType ?? PlanType.FAMILY,
  billingPeriod: initialData?.billingPeriod ?? PlanBillingPeriod.MONTHLY,
  benefitsNotes: initialData?.benefitsNotes ?? "",
  planBenefits:
    initialData?.planBenefits?.map((planBenefit) => ({
      benefitId: planBenefit.benefitId,
      valueType: planBenefit.valueType,
      quantity: planBenefit.quantity ?? undefined,
      isUnlimited: planBenefit.isUnlimited,
      discountPercentage: planBenefit.discountPercentage ?? "",
    })) ?? [],
  monthlyCost: initialData?.monthlyCost?.toString() ?? "",
});

const sanitizeDecimalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.replace(/[^0-9.]/g, "");
  const dotIndex = value.indexOf(".");

  if (dotIndex !== -1) {
    const beforeDot = value.substring(0, dotIndex + 1);
    const afterDot = value.substring(dotIndex + 1).replace(/\./g, "");
    value = beforeDot + afterDot;
  }

  e.target.value = value;
};

const buildPlanBenefitsPayload = (
  planBenefits: PlanFormSchema["planBenefits"]
): CreatePlanBenefitDTO[] => {
  return planBenefits.map((planBenefit) => {
    if (planBenefit.valueType === PlanBenefitValueType.QUANTITY) {
      return {
        benefitId: planBenefit.benefitId,
        valueType: planBenefit.valueType,
        isUnlimited: planBenefit.isUnlimited,
        ...(planBenefit.isUnlimited
          ? {}
          : { quantity: planBenefit.quantity ?? 1 }),
      };
    }

    return {
      benefitId: planBenefit.benefitId,
      valueType: planBenefit.valueType,
      isUnlimited: false,
      discountPercentage: planBenefit.discountPercentage.trim(),
    };
  });
};

const buildCreatePayload = (values: PlanFormSchema) => {
  return {
    name: values.name.trim(),
    description:
      values.description && values.description.trim().length > 0
        ? values.description.trim()
        : undefined,
    planType: values.planType,
    billingPeriod: values.billingPeriod,
    benefitsNotes:
      values.benefitsNotes && values.benefitsNotes.trim().length > 0
        ? values.benefitsNotes.trim()
        : undefined,
    planBenefits: buildPlanBenefitsPayload(values.planBenefits),
    monthlyCost:
      values.monthlyCost && values.monthlyCost.trim().length > 0
        ? values.monthlyCost.trim()
        : undefined,
  };
};

interface PlanFormProps {
  initialData: PlanDetail | null;
  pageTitle: string;
}

function getBenefitOptions(benefits: Benefit[]): FormOption[] {
  return benefits.map((benefit) => ({
    value: benefit.id,
    label: benefit.name,
  }));
}

function getBenefitName(benefits: Benefit[], benefitId: string) {
  return benefits.find((benefit) => benefit.id === benefitId)?.name ?? "Beneficio";
}

export default function PlanForm({ initialData, pageTitle }: PlanFormProps) {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState("perPage", parseAsInteger.withDefault(10));

  const navigate = useNavigate();

  const form = useForm<PlanFormSchema>({
    resolver: zodResolver(planFormSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "planBenefits",
  });

  const { data: benefitsResponse, isLoading: isLoadingBenefits } = useQuery({
    queryKey: ["benefits", "plan-form"],
    queryFn: () =>
      benefitApi.getAllBenefits({
        page: 1,
        limit: 100,
        sortBy: "name",
        sortOrder: "ASC",
      }),
  });

  const benefits = benefitsResponse?.data ?? [];
  const benefitOptions = getBenefitOptions(benefits);

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
      return planApi.updatePlan(initialData!.id, buildCreatePayload(values));
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
  const watchedPlanBenefits = form.watch("planBenefits");

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
                  Define la modalidad, el periodo de cobro y el monto comercial del plan.
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
                <FormSelect
                  control={form.control}
                  name="billingPeriod"
                  label="Periodo de cobro"
                  options={billingPeriodOptions}
                  disabled={isExecuting}
                  required
                />
                <FormInput
                  control={form.control}
                  name="monthlyCost"
                  label="Monto de cobro"
                  type="text"
                  disabled={isExecuting}
                  onChange={sanitizeDecimalInput}
                />
                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Descripción"
                  disabled={isExecuting}
                  className="md:col-span-2"
                />
                <FormTextarea
                  control={form.control}
                  name="benefitsNotes"
                  label="Notas de beneficios"
                  disabled={isExecuting}
                  className="md:col-span-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">Beneficios asociados</p>
                  <p className="text-sm text-muted-foreground">
                    Relaciona beneficios del catálogo y define si el plan ofrece cantidad o descuento.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isExecuting || isLoadingBenefits}
                  onClick={() => append(emptyPlanBenefit())}
                >
                  <IconPlus className="mr-2 size-4" /> Agregar beneficio
                </Button>
              </div>
              <Separator />

              {isLoadingBenefits ? (
                <p className="text-sm text-muted-foreground">Cargando catálogo de beneficios...</p>
              ) : benefits.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay beneficios creados todavía. Crea al menos uno desde el módulo de beneficios.
                </p>
              ) : null}

              <div className="space-y-3">
                {fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    Este plan todavía no tiene beneficios asociados.
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const currentPlanBenefit = watchedPlanBenefits[index];
                    const isQuantityBenefit =
                      currentPlanBenefit?.valueType === PlanBenefitValueType.QUANTITY;

                    return (
                      <div key={field.id} className="rounded-xl border bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {currentPlanBenefit?.benefitId
                                ? getBenefitName(benefits, currentPlanBenefit.benefitId)
                                : `Beneficio ${index + 1}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Configura la cobertura específica de este beneficio.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isExecuting}
                            onClick={() => remove(index)}
                          >
                            <IconTrash className="size-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                          <FormSelect
                            control={form.control}
                            name={`planBenefits.${index}.benefitId`}
                            label="Beneficio"
                            options={benefitOptions}
                            disabled={isExecuting || isLoadingBenefits}
                            required
                            className="lg:col-span-5"
                          />
                          <FormSelect
                            control={form.control}
                            name={`planBenefits.${index}.valueType`}
                            label="Tipo de cobertura"
                            options={benefitValueTypeOptions}
                            disabled={isExecuting}
                            required
                            className="lg:col-span-3"
                          />

                          {isQuantityBenefit ? (
                            <>
                              <div className="space-y-2 lg:col-span-2">
                                <label className="text-sm font-medium">Cobertura</label>
                                <label className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={currentPlanBenefit?.isUnlimited ?? false}
                                    disabled={isExecuting}
                                    onChange={(event) => {
                                      const isUnlimited = event.target.checked;
                                      form.setValue(
                                        `planBenefits.${index}.isUnlimited`,
                                        isUnlimited,
                                        {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        }
                                      );

                                      if (isUnlimited) {
                                        form.setValue(
                                          `planBenefits.${index}.quantity`,
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          }
                                        );
                                      }
                                    }}
                                    className="size-4 rounded border-input"
                                  />
                                  <span>Ilimitado</span>
                                </label>
                              </div>
                              <div className="lg:col-span-2">
                                {currentPlanBenefit?.isUnlimited ? (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Cantidad</label>
                                    <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
                                      Sin límite
                                    </div>
                                  </div>
                                ) : (
                                  <FormInput
                                    control={form.control}
                                    name={`planBenefits.${index}.quantity`}
                                    label="Cantidad"
                                    type="number"
                                    min={1}
                                    disabled={isExecuting}
                                  />
                                )}
                              </div>
                            </>
                          ) : (
                            <FormInput
                              control={form.control}
                              name={`planBenefits.${index}.discountPercentage`}
                              label="Porcentaje de descuento"
                              disabled={isExecuting}
                              placeholder="Ej: 25"
                              onChange={sanitizeDecimalInput}
                              className="lg:col-span-4"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <LoadingButton loading={isExecuting} disabled={isExecuting} type="submit">
                {initialData ? "Actualizar plan" : "Crear plan"}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

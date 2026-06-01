import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { getErrorMessage, planSubscriptionApi } from "~/http/api-server";
import {
  PlanSubscriptionStatus,
  PlanSubscriptionStatusLabels,
  PayerTypeLabels,
  type PlanSubscription,
} from "~/types/plan-subscriptions";
import { PlanType, PlanTypeLabels } from "~/types/plans";
import FamilyMembersSection from "~/features/plan-subscriptions/family-members-section";

interface PatientSubscriptionsProps {
  patientId: string;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

const formatCurrency = (value?: number | null) => {
  if (value === null || value === undefined) return "—";
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `${value}`;
  }
};

const getStatusVariant = (status: PlanSubscriptionStatus) => {
  switch (status) {
    case PlanSubscriptionStatus.ACTIVE:
      return "default";
    case PlanSubscriptionStatus.SUSPENDED:
      return "secondary";
    case PlanSubscriptionStatus.CANCELED:
      return "destructive";
    case PlanSubscriptionStatus.EXPIRED:
      return "outline";
    default:
      return "secondary";
  }
};

const getPlanTypeVariant = (planType?: PlanType) => {
  switch (planType) {
    case PlanType.CORPORATE:
      return "secondary";
    case PlanType.GROUP:
      return "outline";
    case PlanType.FAMILY:
      return "default";
    default:
      return "secondary";
  }
};

const benefitDefinitions: { key: string; label: string }[] = [
  { key: "telemedicine", label: "Telemedicina" },
  { key: "medicationDelivery", label: "Medicamentos" },
  { key: "ambulanceTransfer", label: "Traslado ambulancia" },
  { key: "homeCare", label: "Atención domiciliaria" },
  { key: "workplaceCare", label: "Atención laboral" },
  { key: "emergencyRoom", label: "Urgencias" },
  { key: "specializedConsultations", label: "Consultas especializadas" },
  { key: "labTests", label: "Laboratorios" },
  { key: "consultations", label: "Consultas" },
  { key: "emergencyCoverage", label: "Cobertura emergencias" },
  { key: "dental", label: "Dental" },
  { key: "optometry", label: "Optometría" },
];

function SubscriptionCard({ subscription }: { subscription: PlanSubscription }) {
  const plan = subscription.plan;
  const benefits = (plan?.benefits ?? {}) as unknown as Record<string, unknown>;
  const activeBenefits = benefitDefinitions.filter(
    (benefit) => benefits[benefit.key] === true
  );
  const isFamilyPlan = plan?.planType === PlanType.FAMILY;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{plan?.name ?? "Plan"}</CardTitle>
              {plan?.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plan.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant={getPlanTypeVariant(plan?.planType)}>
                  {plan?.planType ? PlanTypeLabels[plan.planType] : "Tipo de plan"}
                </Badge>
                <Badge variant="outline">
                  Pagador: {PayerTypeLabels[subscription.payerType]}
                </Badge>
                {subscription.company && (
                  <Badge variant="outline">Empresa: {subscription.company.name}</Badge>
                )}
              </div>
            </div>
            <Badge variant={getStatusVariant(subscription.status)}>
              {PlanSubscriptionStatusLabels[subscription.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tipo de plan</p>
              <p className="font-medium">
                {plan?.planType ? PlanTypeLabels[plan.planType] : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Costo mensual</p>
              <p className="font-medium">{formatCurrency(plan?.monthlyCost)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pagador</p>
              <p className="font-medium">
                {PayerTypeLabels[subscription.payerType]}
                {subscription.company && (
                  <span className="text-muted-foreground">
                    {" "}
                    ({subscription.company.name})
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Vigencia</p>
              <p className="font-medium">
                {formatDate(subscription.startDate)}
                {subscription.endDate && (
                  <span className="text-muted-foreground">
                    {" "}
                    - {formatDate(subscription.endDate)}
                  </span>
                )}
              </p>
            </div>
          </div>

          {plan?.benefits && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Beneficios incluidos</p>
              {activeBenefits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeBenefits.map((benefit) => (
                    <Badge key={benefit.key} variant="outline">
                      {benefit.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin beneficios configurados</p>
              )}
              {typeof benefits.notes === "string" && benefits.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  {benefits.notes}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Link
              to={`/suscripciones/editar/${subscription.id}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Editar suscripción
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Family members section for family plans */}
      {isFamilyPlan && <FamilyMembersSection subscription={subscription} />}
    </div>
  );
}

function SubscriptionsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PatientSubscriptions({
  patientId,
}: PatientSubscriptionsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["plan-subscriptions", { patientId }],
    queryFn: () =>
      planSubscriptionApi.getAllPlanSubscriptions({
        patientId,
        limit: 50,
      }),
    enabled: Boolean(patientId),
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  if (isLoading) {
    return <SubscriptionsSkeleton />;
  }

  const subscriptions = data?.data ?? [];

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            Este paciente no tiene suscripciones activas.
          </p>
          <Link
            to={`/suscripciones/nueva?patientId=${patientId}`}
            className={cn(buttonVariants())}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Crear suscripción
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          to={`/suscripciones/nueva?patientId=${patientId}`}
          className={cn(buttonVariants())}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Nueva suscripción
        </Link>
      </div>
      <div className="space-y-6">
        {subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </div>
    </div>
  );
}

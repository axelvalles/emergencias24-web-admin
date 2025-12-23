import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import PageContainer from "~/components/layout/page-container";
import PlanSubscriptionForm from "~/features/plan-subscriptions/plan-subscription-form";
import FamilyMembersSection from "~/features/plan-subscriptions/family-members-section";
import { planSubscriptionApi } from "~/http/plan-subscription-api";
import { PlanType } from "~/types/plans";

export default function EditPlanSubscriptionPage() {
  const { id = "" } = useParams();

  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["plan-subscription", id],
    queryFn: () => planSubscriptionApi.getPlanSubscriptionById(id),
    enabled: Boolean(id),
  });

  if (error) {
    toast.error("Error al cargar la suscripción");
  }

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Cargando suscripción...
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <PlanSubscriptionForm
          initialData={subscription}
          pageTitle="Editar suscripción"
        />
        {subscription.plan.planType === PlanType.FAMILY && (
          <FamilyMembersSection subscription={subscription} />
        )}
      </div>
    </PageContainer>
  );
}

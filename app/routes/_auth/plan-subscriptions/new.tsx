import PageContainer from "~/components/layout/page-container";
import PlanSubscriptionForm from "~/features/plan-subscriptions/plan-subscription-form";

export default function CreatePlanSubscriptionPage() {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <PlanSubscriptionForm initialData={null} pageTitle="Crear suscripción" />
      </div>
    </PageContainer>
  );
}

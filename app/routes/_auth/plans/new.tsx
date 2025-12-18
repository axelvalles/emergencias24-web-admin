import PageContainer from "~/components/layout/page-container";
import PlanForm from "~/features/plans/plan-form";

export default function CreatePlanPage() {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <PlanForm initialData={null} pageTitle="Crear plan" />
      </div>
    </PageContainer>
  );
}

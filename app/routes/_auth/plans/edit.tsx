import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import PageContainer from "~/components/layout/page-container";
import PlanForm from "~/features/plans/plan-form";
import { planApi } from "~/http/plan-api";

export default function EditPlanPage() {
  const { id = "" } = useParams();

  const {
    data: plan,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["plan", id],
    queryFn: () => planApi.getPlanById(id),
    enabled: Boolean(id),
  });

  if (error) {
    toast.error("Error al cargar el plan");
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando plan...</div>;
  }

  if (!plan) {
    return null;
  }

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <PlanForm initialData={plan} pageTitle="Editar plan" />
      </div>
    </PageContainer>
  );
}

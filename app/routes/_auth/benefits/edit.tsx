import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { toast } from "sonner";

import PageContainer from "~/components/layout/page-container";
import BenefitForm from "~/features/benefits/benefit-form";
import { benefitApi } from "~/http/benefit-api";

export default function EditBenefitPage() {
  const { id = "" } = useParams();

  const {
    data: benefit,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["benefit", id],
    queryFn: () => benefitApi.getBenefitById(id),
    enabled: Boolean(id),
  });

  if (error) {
    toast.error("Error al cargar el beneficio");
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando beneficio...</div>;
  }

  if (!benefit) {
    return null;
  }

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <BenefitForm initialData={benefit} pageTitle="Editar beneficio" />
      </div>
    </PageContainer>
  );
}

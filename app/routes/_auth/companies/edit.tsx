import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import PageContainer from "~/components/layout/page-container";
import CompanyForm from "~/features/companies/company-form";
import { companyApi } from "~/http/company-api";

export default function EditCompanyPage() {
  const { id = "" } = useParams();

  const {
    data: company,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["company", id],
    queryFn: () => companyApi.getCompanyById(id),
    enabled: Boolean(id),
  });

  if (error) {
    toast.error("Error al cargar la empresa");
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando empresa...</div>;
  }

  if (!company) {
    return null;
  }

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <CompanyForm initialData={company} pageTitle="Editar empresa" />
      </div>
    </PageContainer>
  );
}

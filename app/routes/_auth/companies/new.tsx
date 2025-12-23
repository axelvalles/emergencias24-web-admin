import PageContainer from "~/components/layout/page-container";
import CompanyForm from "~/features/companies/company-form";

export default function CreateCompanyPage() {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <CompanyForm initialData={null} pageTitle="Crear empresa" />
      </div>
    </PageContainer>
  );
}

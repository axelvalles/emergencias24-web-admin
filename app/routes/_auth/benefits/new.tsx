import PageContainer from "~/components/layout/page-container";
import BenefitForm from "~/features/benefits/benefit-form";

export default function CreateBenefitPage() {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <BenefitForm initialData={null} pageTitle="Crear beneficio" />
      </div>
    </PageContainer>
  );
}

import PageContainer from "~/components/layout/page-container";
import { AuthGuard } from "~/components/auth-guard";
import { Heading } from "~/components/ui/heading";
import { Separator } from "~/components/ui/separator";
import MunicipalityPricingPage from "~/features/municipality-pricing/municipality-pricing-page";
import { UserRole } from "~/types/users";

export default function MunicipalityPricingRoute() {
  return (
    <AuthGuard requireAuth allowedRoles={[UserRole.SUPER_ADMIN]}>
      <PageContainer scrollable={false}>
        <div className="flex flex-1 flex-col space-y-4">
          <div className="flex items-start justify-between gap-3">
            <Heading
              title="Costos por municipio"
              description="Configura los montos de atencion domiciliaria y ambulancia para cada municipio."
            />
          </div>
          <Separator />
          <MunicipalityPricingPage />
        </div>
      </PageContainer>
    </AuthGuard>
  );
}

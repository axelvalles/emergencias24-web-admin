import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";

import PageContainer from "~/components/layout/page-container";
import { buttonVariants } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Separator } from "~/components/ui/separator";
import BenefitListingPage from "~/features/benefits/benefit-listing";
import { cn } from "~/lib/utils";

export default function BenefitsPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Beneficios"
            description="Administra el catálogo de beneficios disponible para los planes."
          />
          <Link
            to="/beneficios/nuevo"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Nuevo beneficio
          </Link>
        </div>
        <Separator />
        <BenefitListingPage />
      </div>
    </PageContainer>
  );
}

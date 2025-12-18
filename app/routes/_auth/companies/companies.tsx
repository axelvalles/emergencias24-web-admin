import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";

import PageContainer from "~/components/layout/page-container";
import { buttonVariants } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import CompanyListingPage from "~/features/companies/company-listing";

export default function CompaniesPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Empresas"
            description="Administra las empresas registradas."
          />
          <Link
            to="/empresas/nueva"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Nueva empresa
          </Link>
        </div>
        <Separator />
        <CompanyListingPage />
      </div>
    </PageContainer>
  );
}

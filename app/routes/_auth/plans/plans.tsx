import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";

import PageContainer from "~/components/layout/page-container";
import { buttonVariants } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import PlanListingPage from "~/features/plans/plan-listing";

export default function PlansPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Planes"
            description="Administra los planes comerciales."
          />
          <Link
            to="/planes/nuevo"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Nuevo plan
          </Link>
        </div>
        <Separator />
        <PlanListingPage />
      </div>
    </PageContainer>
  );
}

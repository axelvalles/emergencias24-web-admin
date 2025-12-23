import { Separator } from "~/components/ui/separator";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";
import PageContainer from "~/components/layout/page-container";
import { buttonVariants } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import UserListing from "~/features/users/user-listing";
import { cn } from "~/lib/utils";

export default function Users() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="Usuarios" description="Gestiona los usuarios." />
          <Link
            to="/usuarios/nuevo"
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <IconPlus className="mr-2 h-4 w-4" /> Agregar nuevo
          </Link>
        </div>
        <Separator />
        <UserListing />
      </div>
    </PageContainer>
  );
}

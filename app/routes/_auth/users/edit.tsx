import { useParams } from "react-router";
import PageContainer from "~/components/layout/page-container";
import UserForm from "~/features/users/user-form";
import { toast } from "sonner";
import { getErrorMessage, userApi } from "~/http/api-server";
import { useQuery } from "@tanstack/react-query";

export default function EditUser() {
  const { id = "" } = useParams();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => userApi.getUserById(id),
    enabled: Boolean(id),
  });

  if (error) {
    toast.error(getErrorMessage(error));
  }

  if (isLoading) {
    return <div>Cargando usuario...</div>;
  }

  if (!userData) {
    return null;
  }

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <UserForm initialData={userData} pageTitle={"Editar usuario"} />
      </div>
    </PageContainer>
  );
}

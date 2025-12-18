import PageContainer from "~/components/layout/page-container";
import UserForm from "~/features/users/user-form";

export default function CreateUser() {
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <UserForm initialData={null} pageTitle={"Crear usuario"} />
      </div>
    </PageContainer>
  );
}

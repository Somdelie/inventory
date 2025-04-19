import RoleForm from "@/components/Forms/RoleForm";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function page() {
  const user = await getAuthenticatedUser();
  const organizationId = user.organizationId ?? "";
  return <RoleForm organizationId={organizationId} />;
}

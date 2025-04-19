import { getOrgRoles } from "@/actions/roles";
import UserForm from "@/components/Forms/UserForm";
import { getAuthenticatedUser } from "@/config/useAuth";
// import UserForm from "@/components/dashboard/Forms/UserForm";

export default async function page() {
  const user = await getAuthenticatedUser();
  const organizationId = user?.organizationId ?? "";
  const res = await getOrgRoles(organizationId);
  const roles = res.data || [];

  return <UserForm roles={roles} />;
}

import DataTable from "@/components/DataTableComponents/DataTable";
import { columns } from "./columns";
import {
  getOrganizationInvitations,
  getUsersByOrganizationId,
} from "@/actions/users";
import { UserInvitationForm } from "@/components/Forms/users/UserInvitationForm";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { getAuthenticatedUser } from "@/config/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvitationsTable } from "@/components/dashboard/Tables/InvitationsTable";
import { getOrgRoles } from "@/actions/roles";
import { getLocationsByOrganizationId } from "@/actions/location";
import { getOrganizationById } from "@/actions/organization";

export default async function page() {
  const user = await getAuthenticatedUser();

  const userOrganization = await getOrganizationById(
    user?.organizationId ?? ""
  );

  console.log("User Organization", userOrganization);

  const organizationId = user?.organizationId ?? "";
  const organizationName = user?.organizationName ?? "";
  const users = await getUsersByOrganizationId(organizationId);
  const invitations = await getOrganizationInvitations(organizationId);
  const res = await getOrgRoles(organizationId);
  const locationData = await getLocationsByOrganizationId(organizationId);
  const locations = locationData.map((location) => {
    return {
      label: location.name,
      value: location.id,
    };
  });
  const rolesData = res.data || [];
  const roles = rolesData.map((role) => {
    return {
      label: role.displayName,
      value: role.id,
    };
  });

  console.log("Locations Data", locationData);

  return (
    <div className="p-8">
      <Tabs defaultValue="users" className="space-y-8">
        <TabsList className="inline-flex h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0 flex-wrap">
          {["users", "invitations"].map((feature) => {
            return (
              <TabsTrigger
                key={feature}
                value={feature}
                className="inline-flex items-center gap-2 border-b-2 border-transparent px-8 pb-3 pt-2 data-[state=active]:border-primary capitalize"
              >
                {feature.split("-").join(" ")}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <TabsContent value="users" className="space-y-8">
          <ModalTableHeader
            title="Users"
            data={users}
            model="user"
            modalForm={
              <UserInvitationForm
                locations={locations}
                roles={roles}
                organizationId={organizationId}
                organizationName={organizationName}
              />
            }
          />
          <DataTable columns={columns} data={users} />
          <div className="py-8"></div>
        </TabsContent>
        <TabsContent value="invitations" className="space-y-8">
          <InvitationsTable invitations={invitations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

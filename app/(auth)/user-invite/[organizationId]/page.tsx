import RegisterInvitedUserForm from "@/components/Forms/RegisterInvitedUserForm";
import { GridBackground } from "@/components/reusable-ui/grid-background";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{
    email: string;
    roleId: string;
    organizationId: string;
    organizationName: string;
    locationId: string;
    locationName: string;
  }>;
}) {
  // console.log("Params", params);
  const { organizationId } = await params;
  console.log("Params", organizationId);

  const { email, roleId, organizationName, locationId, locationName } =
    await searchParams;

  return (
    <GridBackground>
      <div className="px-4 items-center justify-center flex flex-col min-h-screen">
        <RegisterInvitedUserForm
          organizationId={organizationId}
          userEmail={email}
          roleId={roleId}
          organizationName={organizationName}
          locationId={locationId}
          locationName={locationName}
        />
      </div>
    </GridBackground>
  );
}

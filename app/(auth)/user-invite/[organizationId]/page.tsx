import RegisterInvitedUserForm from "@/components/Forms/RegisterInvitedUserForm";
import { GridBackground } from "@/components/reusable-ui/grid-background";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    email: string;
    roleId: string;
    organizationName: string;
  }>;
}) {
  const { id } = await params;
  const organizationId = id;
  const { email, roleId, organizationName } = await searchParams;

  return (
    <GridBackground>
      <div className="px-4 items-center justify-center flex flex-col min-h-screen">
        <RegisterInvitedUserForm
          userEmail={email}
          organizationId={organizationId}
          roleId={roleId}
          organizationName={organizationName}
        />
      </div>
    </GridBackground>
  );
}

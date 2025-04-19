import { getDashboardOverview } from "@/actions/analytics";
import DashboardMain from "@/components/dashboard/DashboardMain";
import DefaultUserDashboard from "@/components/dashboard/DefaultUserDashboard";
import { getAuthenticatedUser } from "@/config/useAuth";

export default async function Dashboard() {
  const analytics = (await getDashboardOverview()) || [];
  const user = {
    ...(await getAuthenticatedUser()),
    organizationName: (await getAuthenticatedUser())?.organizationName ?? "",
  };

  const userPermissions = user?.permissions || [];
  // const hasPermission = userPermissions.includes("dashboard.read");

  if (!userPermissions.includes("dashboard.create")) {
    return <DefaultUserDashboard user={user} />;
  }

  return (
    <main>
      <DashboardMain user={user} />
    </main>
  );
}

import ListingWrapper from "@/components/dashboard/settings/locations/listing-wrapper";
import { getAuthenticatedUser } from "@/config/useAuth";
import React from "react";

export default async function LocationsPage() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId ?? "";

  return (
    <div className="">
      <ListingWrapper organizationId={organizationId} />
    </div>
  );
}

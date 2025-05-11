import ListingWrapper from "@/components/dashboard/purchases/listing-wrapper";
import { getAuthenticatedUser } from "@/config/useAuth";
import React from "react";

export default async function SuppliersPage() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId ?? "";


  return (
    <div className="">
      <ListingWrapper organizationId={organizationId} />
    </div>
  );
}

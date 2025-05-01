import { TableLoading } from "@/components/ui/data-table";
import { Suspense } from "react";
import LocationsListing from "./LocationsListing";

export default function ListingWrapper(props: { organizationId: string }) {
  return (
    // The fallback was being rendered but the component wasn't suspending properly
    <Suspense fallback={<TableLoading title="Vehicle Inventory" />}>
      <LocationsListing
        title="Locations Listing"
        organizationId={props.organizationId}
      />
    </Suspense>
  );
}

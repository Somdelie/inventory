import { TableLoading } from "@/components/ui/data-table";
import { Suspense } from "react";
import ItemsListing from "./ItemsListing";

export default function ListingWrapper(props: {
  organizationId: string;
  categoryMap: any;
  brandMap: any;
}) {
  return (
    // The fallback was being rendered but the component wasn't suspending properly
    <Suspense fallback={<TableLoading title="Vehicle Inventory" />}>
      <ItemsListing
        title="Items Listing"
        organizationId={props.organizationId}
        categoryMap={props.categoryMap}
        brandMap={props.brandMap}
      />
    </Suspense>
  );
}

import { getSuppliersByOrganizationId } from "@/actions/suppliers";
import ListingWrapper from "@/components/dashboard/purchases/listing-wrapper";
import SuppliersListing from "@/components/dashboard/purchases/SuppliersListing";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { SupplierForm } from "@/components/Forms/inventory/SupplierForm";
import CustomBinIcon from "@/components/global/CustomBinIcon";
import EmptyState from "@/components/global/EmptyState";
import { TableLoading } from "@/components/ui/data-table";
import { getAuthenticatedUser } from "@/config/useAuth";
import React, { Suspense } from "react";

export default async function SuppliersPage() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId ?? "";


  return (
    <div className="">
      <ListingWrapper organizationId={organizationId} />
    </div>
  );
}

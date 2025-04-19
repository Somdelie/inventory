import { columns } from "./columns";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { getAuthenticatedUser } from "@/config/useAuth";
import { UnitForm } from "@/components/Forms/inventory/UnitForm";
import { getUnitsByOrganizationId } from "@/actions/unit";
import DataTable from "@/components/DataTableComponents/DataTable";
import { BrandDTO, UnitDTO } from "@/types/types"; // Make sure this import exists
import EmptyState from "@/components/global/EmptyState";
import CustomBinIcon from "@/components/global/CustomBinIcon";
import { BrandForm } from "@/components/Forms/inventory/BrandForm";
import { getBrandsByOrganizationId } from "@/actions/brands";

export default async function BrandsPage() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId ?? "";
  const brands = await getBrandsByOrganizationId(organizationId);

  console.log(user.permissions, "User Permissions");

  // Create an empty array as fallback to ensure data is never null
  const safeBrands: BrandDTO[] = brands || [];

  return (
    <div className="p-8">
      <ModalTableHeader
        title="Brands"
        data={brands}
        model="brand"
        modalForm={<BrandForm organizationId={organizationId} />}
      />
      <div>
        {safeBrands.length === 0 ? (
          <EmptyState
            message="No brands found"
            icon="custom"
            customIcon={<CustomBinIcon />}
            description="Create your first brand to get started with inventory management."
            // actionButton={<UnitForm organizationId={organizationId} />}
          />
        ) : (
          <DataTable columns={columns} data={safeBrands} />
        )}
      </div>
    </div>
  );
}

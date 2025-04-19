import { columns } from "./columns";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { getAuthenticatedUser } from "@/config/useAuth";
import { UnitForm } from "@/components/Forms/inventory/UnitForm";
import { getUnitsByOrganizationId } from "@/actions/unit";
import DataTable from "@/components/DataTableComponents/DataTable";
import { UnitDTO } from "@/types/types"; // Make sure this import exists
import EmptyState from "@/components/global/EmptyState";
import CustomBinIcon from "@/components/global/CustomBinIcon";

export default async function UnitsPage() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId ?? "";
  const units = await getUnitsByOrganizationId(organizationId);

  // Create an empty array as fallback to ensure data is never null
  const safeUnits: UnitDTO[] = units || [];

  return (
    <div className="p-8">
      <ModalTableHeader
        title="Units"
        data={units}
        model="unit"
        modalForm={<UnitForm organizationId={organizationId} />}
      />
      <div>
        {safeUnits.length === 0 ? (
          <EmptyState
            message="No units found"
            icon="custom"
            customIcon={<CustomBinIcon />}
            description="Create your first unit to get started with inventory management."
            // actionButton={<UnitForm organizationId={organizationId} />}
          />
        ) : (
          <DataTable columns={columns} data={safeUnits} />
        )}
      </div>
    </div>
  );
}

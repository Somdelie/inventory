import { columns } from "./columns";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { getAuthenticatedUser } from "@/config/useAuth";
import DataTable from "@/components/DataTableComponents/DataTable";
import { TaxDTO } from "@/types/types"; // Make sure this import exists
import EmptyState from "@/components/global/EmptyState";
import CustomBinIcon from "@/components/global/CustomBinIcon";
import { getTaxesByOrganizationId } from "@/actions/taxes";
import { TaxForm } from "@/components/Forms/settings/TaxForm";

export default async function TaxRatesPage() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId ?? "";
  const taxes = await getTaxesByOrganizationId(organizationId);

  // Create an empty array as fallback to ensure data is never null
  const safeTaxes: TaxDTO[] = taxes || [];

  // Check if the user has permission to to create a tax
  const canCreateTax = user?.permissions.some(
    (permission) => permission === "settings.taxes.create"
  );

  console.log("User permissions:", user?.permissions);

  return (
    <div className="p-8">
      {canCreateTax && (
        <ModalTableHeader
          title="Tax Rates"
          data={safeTaxes}
          model="tax"
          modalForm={<TaxForm organizationId={organizationId} />}
        />
      )}
      <div>
        {safeTaxes.length === 0 ? (
          <EmptyState
            message="No tax rates found"
            icon="custom"
            customIcon={<CustomBinIcon />}
            description="Create your first unit to get started with inventory management."
          />
        ) : (
          <DataTable columns={columns} data={safeTaxes} />
        )}
      </div>
    </div>
  );
}

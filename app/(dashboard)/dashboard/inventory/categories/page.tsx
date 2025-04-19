import React from "react";
import { columns } from "./columns";
import DataTable from "@/components/DataTableComponents/DataTable";
import { CategoryDTO } from "@/types/types";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { getAuthenticatedUser } from "@/config/useAuth";
import { CategoryForm } from "@/components/Forms/CategoryForm";
import EmptyState from "@/components/global/EmptyState";
import CustomBinIcon from "@/components/global/CustomBinIcon";
import { getCategoriesByOrganizationId } from "@/actions/categories";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function page() {
  const user = await getAuthenticatedUser();

  const organizationId = user?.organizationId ?? "";
  const categories = await getCategoriesByOrganizationId(organizationId);

  // Create an empty array as fallback to ensure data is never null
  const safeCategories: CategoryDTO[] = categories || [];

  return (
    <Card>
      <CardHeader>
        {" "}
        <ModalTableHeader
          title="Categories"
          data={categories}
          model="category"
          modalForm={<CategoryForm organizationId={organizationId} />}
        />
      </CardHeader>
      <CardContent>
        {safeCategories.length === 0 ? (
          <EmptyState
            message="No categories found"
            icon="custom"
            customIcon={<CustomBinIcon />}
            description="Create your first brand to get started with inventory management."
            // actionButton={<UnitForm organizationId={organizationId} />}
          />
        ) : (
          <DataTable columns={columns} data={safeCategories} />
        )}
      </CardContent>
    </Card>
  );
}

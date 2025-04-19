import React from "react";
import { columns } from "./columns";
import DataTable from "@/components/DataTableComponents/DataTable";
import { BrandDTO, CategoryDTO } from "@/types/types";
import ModalTableHeader from "@/components/dashboard/Tables/ModalTableHeader";
import { getAuthenticatedUser } from "@/config/useAuth";
import EmptyState from "@/components/global/EmptyState";
import CustomBinIcon from "@/components/global/CustomBinIcon";
import { getCategoriesByOrganizationId } from "@/actions/categories";
import { ItemForm } from "@/components/Forms/inventory/ItemForm";
import { getItemsByOrganizationId } from "@/actions/item";
import { getBrandsByOrganizationId } from "@/actions/brands";
import { ItemDTO } from "@/types/itemTypes";

export default async function page() {
  const user = await getAuthenticatedUser();
  const organizationId = user?.organizationId ?? "";

  // Get items - now correctly typed as ItemDTO[]
  const items = await getItemsByOrganizationId(organizationId);

  const categories = await getCategoriesByOrganizationId(organizationId);
  const categoryMap: { [key: string]: CategoryDTO } = {};
  categories?.forEach((category: CategoryDTO) => {
    categoryMap[category.id] = category;
  });

  const brands = await getBrandsByOrganizationId(organizationId);
  const brandMap: { [key: string]: BrandDTO } = {};
  brands?.forEach((brand: BrandDTO) => {
    brandMap[brand.id] = brand;
  });

  // check if the user has permission to create an item
  const userPermissions = user?.permissions || [];
  const hasPermission = userPermissions.includes("products.create");

  return (
    <div className="">
      {hasPermission && (
        <ModalTableHeader
          title="Items"
          data={items}
          model="item"
          modalForm={
            <ItemForm
              organizationId={organizationId}
              categoryMap={categoryMap}
              brandMap={brandMap}
            />
          }
        />
      )}

      <div>
        {items.length === 0 ? (
          <EmptyState
            message="No items found"
            icon="custom"
            customIcon={<CustomBinIcon />}
            description="Create your first item to get started with your inventory."
            // actionButton={<UnitForm organizationId={organizationId} />}
          />
        ) : (
          <DataTable columns={columns} data={items} />
        )}
      </div>
    </div>
  );
}

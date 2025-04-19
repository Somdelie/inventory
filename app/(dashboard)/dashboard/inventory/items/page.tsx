// pages/dashboard/inventory/items/index.tsx
import React from "react";
import { Suspense } from "react";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getBrandsByOrganizationId } from "@/actions/brands";
import { BrandDTO, CategoryDTO } from "@/types/types";
import { getCategoriesByOrganizationId } from "@/actions/categories";
import ListingWrapper from "@/components/dashboard/items/listing-wrapper";

export default async function ItemsPage() {
  // Get user and organization ID
  const user = await getAuthenticatedUser();
  const organizationId = user?.organizationId ?? "";

  const categories = await getCategoriesByOrganizationId(organizationId);
  const categoryMap: { [key: string]: CategoryDTO } = {};
  categories?.forEach((category: CategoryDTO) => {
    categoryMap[category.id] = category;
  });

  console.log(organizationId, "this is the id of the organization");

  const brands = await getBrandsByOrganizationId(organizationId);
  const brandMap: { [key: string]: BrandDTO } = {};
  brands?.forEach((brand: BrandDTO) => {
    brandMap[brand.id] = brand;
  });

  console.log(brands, "this is the brands");

  // console.log("Items fetched on server:", items);

  return (
    <div className="">
      <ListingWrapper
        organizationId={organizationId}
        categoryMap={categoryMap}
        brandMap={brandMap}
      />
    </div>
  );
}

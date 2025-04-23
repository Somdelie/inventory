import { getBrandsByOrganizationId } from "@/actions/brands";
import { getCategoriesByOrganizationId } from "@/actions/categories";
import { getItemById } from "@/actions/item";
import NotFound from "@/app/not-found";
import { ItemUpdateForm } from "@/components/dashboard/items/item-update-form";
import { Brand, Category } from "@/types/itemTypes";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const itemId = await params;
  const id = itemId.id;
  const { data: item, success, error } = await getItemById(id);
  const categories = await getCategoriesByOrganizationId(item?.organizationId);
  const brands = await getBrandsByOrganizationId(item?.organizationId);

  const categoryOptions = categories.map((category:Category) => ({
    value: category.id,
    label: category.title,
  }));
  const brandOptions = brands.map((brand:Brand) => ({
    value: brand.id,
    label: brand.name,
  }));

  if (!success) {
    return <NotFound />;
  }

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">
        Edit Item: <span className="text-primary">{item?.name}</span>
      </h1>
      <ItemUpdateForm item={item}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
      />
    </div>
  );
}

import { getBrandsByOrganizationId } from "@/actions/brands"
import { getCategoriesByOrganizationId } from "@/actions/categories"
import { getItemById } from "@/actions/item"
import { getTaxesByOrganizationId } from "@/actions/taxes"
import { getUnitsByOrganizationId } from "@/actions/unit"
import NotFound from "@/app/not-found"
import { ItemUpdateForm } from "@/components/dashboard/items/item-update-form"
import type { Brand, Category } from "@/types/itemTypes"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import ItemEditSkeleton from "./loading"

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense fallback={<ItemEditSkeleton />}>
      <EditItemContent params={params} />
    </Suspense>
  )
}

async function EditItemContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const itemId = await params
  const id = itemId.id
  const { data: item, success, error } = await getItemById(id)
  const categories = await getCategoriesByOrganizationId(item?.organizationId)
  const brands = await getBrandsByOrganizationId(item?.organizationId)
  const units = await getUnitsByOrganizationId(item?.organizationId)
  const taxes = await getTaxesByOrganizationId(item?.organizationId)

  const categoryOptions = categories.map((category: Category) => ({
    value: category.id,
    label: category.title,
  }))
  const brandOptions = brands.map((brand: Brand) => ({
    value: brand.id,
    label: brand.name,
  }))

  const unitOptions = units?.map((unit) => ({
    value: unit.id,
    label: unit.title,
  }))

  const taxOptions = taxes?.map((tax) => ({
    value: tax.id,
    label: `${tax.name}-${tax.rate}`,
  }))

  if (!success) {
    return <NotFound />
  }

  return (
    <div className="space-y-2">
      <Link
        href="/items"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Items / Edit</span>
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-primary">{item?.name}</h1>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">SKU:</span>
            <span>{item?.sku || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Last Updated:</span>
            <span>
              {item?.updatedAt
                ? new Date(item.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <ItemUpdateForm
        item={item}
        categoryOptions={categoryOptions}
        brandOptions={brandOptions}
        unitOptions={unitOptions || []}
        taxOptions={taxOptions || []}
      />
    </div>
  )
}

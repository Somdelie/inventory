import { Suspense } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import ItemEditSkeleton from "../edit/loading"
import ClientSupplierSelector from "@/components/dashboard/items/client-supplier-selector"
import AddSuppliersModal from "@/components/dashboard/items/add-suppliers-modal"
import { getItemById } from "@/actions/item"
import { getSuppliersByItemId } from "@/actions/item-suppliers"
import { getBriefSuppliersByOrganizationId } from "@/actions/suppliers"
import { getAuthenticatedUser } from "@/config/useAuth"

export default async function ItemSuppliersPage({
  params,
  searchParams,
}: {
   params: Promise<{ id: string }>;
  searchParams: Promise<{ supplierId?: string }>;
}) {
  // Now awaiting is correct because you're explicitly typing these as Promises
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const id = resolvedParams.id;
  const supplierId = resolvedSearchParams.supplierId;

  // Get authenticated user
  const user = await getAuthenticatedUser();
  const organizationId = user?.organizationId;

  if (!organizationId) {
    throw new Error("Organization ID not found");
  }

  // Load item data
  const { data: item, success } = await getItemById(id);
  if (!success || !item) {
    return notFound();
  }

  // Load suppliers for this item
  const itemSuppliers = await getSuppliersByItemId(id);
  if (!itemSuppliers) {
    throw new Error("Failed to load suppliers");
  }

  // Load all suppliers for the organization (for the add modal)
  const briefSuppliers = await getBriefSuppliersByOrganizationId(organizationId);

  // Get IDs of suppliers that are already associated with the item
  const existingSupplierIds = itemSuppliers.map((supplier) => supplier.supplierId);

  console.log("Item Suppliers:", itemSuppliers);

  return (
    <Suspense fallback={<ItemEditSkeleton />}>
      <div className="space-y-4">
        <Link
          href="/dashboard/inventory/items"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Items/Suppliers</span>
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{item.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-medium">SKU:</span>
                <span>{item.sku || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">Last Updated:</span>
                <span>
                  {item.updatedAt
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

          <AddSuppliersModal
            suppliers={briefSuppliers || []}
            itemId={item.id}
            existingSupplierIds={existingSupplierIds}
          />
        </div>

        {/* Use the client component for the supplier selection and form */}
        <ClientSupplierSelector
          suppliers={itemSuppliers}
          itemId={id}
          initialSelectedSupplierId={supplierId}
        />
      </div>
    </Suspense>
  );
}
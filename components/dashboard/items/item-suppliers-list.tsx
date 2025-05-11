import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ItemSuppliersListProps {
  suppliers: {
    id: string
    supplierId: string
    name: string
    isPreferred: boolean
  }[]
  itemId: string
  selectedSupplierId?: string
}

export default function ItemSuppliersList({ suppliers, itemId, selectedSupplierId }: ItemSuppliersListProps) {
  return (
    <Card className="h-[calc(100vh-220px)] md:h-[calc(100vh-180px)]">
      <CardContent className="p-0">
        <ScrollArea className="h-full max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-180px)]">
          <div className="p-1">
            {suppliers.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">No suppliers found</div>
            ) : (
              <ul className="space-y-1">
                {suppliers.map((supplier) => (
                  <li key={supplier.id}>
                    <Link
                      href={`/dashboard/inventory/items/${itemId}/suppliers?supplierId=${supplier.id}`}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-muted",
                        selectedSupplierId === supplier.id &&
                          "bg-muted font-medium text-primary border-l-4 border-primary",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{supplier.name}</span>
                        {supplier.isPreferred && (
                          <Badge variant="outline" className="ml-2">
                            Preferred
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>Supplier ID: {supplier.supplierId}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

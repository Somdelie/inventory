"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { InventoryTab } from "./tabs/inventory-tab";
import { DetailsTab } from "./tabs/details-tab";
import type { Item } from "@/types/itemTypes";
import { cn } from "@/lib/utils";
import { FileText, Package, Tag } from "lucide-react";

export type CatOptions = {
  value: string;
  label: string;
};

export type BrandOptions = {
  value: string;
  label: string;
};

export type UnitOptions = {
  value: string;
  label: string;
};

export type TaxOptions = {
  value: string;
  label: string;
};

interface ItemUpdateFormProps {
  item: Item;
  categoryOptions: CatOptions[];
  brandOptions: BrandOptions[];
  unitOptions: UnitOptions[];
  taxOptions: TaxOptions[];
}

export function ItemUpdateForm({
  item,
  categoryOptions,
  brandOptions,
  unitOptions,
  taxOptions,
}: ItemUpdateFormProps) {
  const [activeTab, setActiveTab] = useState("basic-info");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-100 rounded">
        <TabsTrigger
          value="basic-info"
          className={cn(
            "flex items-center gap-2 transition-all",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "data-[state=active]:shadow-sm"
          )}
        >
          <FileText className="h-4 w-4" />
          <span>Basic Information</span>
        </TabsTrigger>
        <TabsTrigger
          value="inventory"
          className={cn(
            "flex items-center gap-2 transition-all",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "data-[state=active]:shadow-sm"
          )}
        >
          <Tag className="h-4 w-4" />
          <span>Inventory & Pricing</span>
        </TabsTrigger>
        <TabsTrigger
          value="details"
          className={cn(
            "flex items-center gap-2 transition-all",
            "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
            "data-[state=active]:shadow-sm"
          )}
        >
          <Package className="h-4 w-4" />
          <span>Product Details</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6 bg-white p-6 rounded-lg border shadow-sm">
        <TabsContent value="basic-info">
          <BasicInfoTab
            item={item}
            categoryOptions={categoryOptions}
            brandOptions={brandOptions}
          />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryTab
            item={item}
            unitOptions={unitOptions}
            taxOptions={taxOptions}
          />
        </TabsContent>

        <TabsContent value="details">
          <DetailsTab item={item} />
        </TabsContent>
      </div>
    </Tabs>
  );
}

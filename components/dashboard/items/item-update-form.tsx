"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { InventoryTab } from "./tabs/inventory-tab";
import { DetailsTab } from "./tabs/details-tab";
import { Item } from "@/types/itemTypes";

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
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic-info">Basic Information</TabsTrigger>
        <TabsTrigger value="inventory">Inventory & Pricing</TabsTrigger>
        <TabsTrigger value="details">Product Details</TabsTrigger>
      </TabsList>

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
    </Tabs>
  );
}

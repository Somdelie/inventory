"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

interface InventoryTabProps {
  item: any; // In a real app, you would use a proper type
}

export function InventoryTab({ item }: InventoryTabProps) {
  // Each card has its own state
  const [pricing, setPricing] = useState({
    costPrice: item.costPrice || 0,
    sellingPrice: item.sellingPrice || 0,
  });

  const [inventory, setInventory] = useState({
    quantity: item.quantity || 0,
    minStockLevel: item.minStockLevel || 0,
  });

  const [maxStock, setMaxStock] = useState({
    maxStockLevel: item.maxStockLevel || 0,
    isSerialTracked: item.isSerialTracked || false,
  });

  const [taxInfo, setTaxInfo] = useState({
    tax: item.tax || 0,
    taxRateId: item.taxRateId || "",
  });

  const [unitInfo, setUnitInfo] = useState({
    unitId: item.unitId || "",
    unitOfMeasure: item.unitOfMeasure || "",
  });

  // Update handlers for each card
  const updatePricing = async () => {
    try {
      console.log("Updating pricing:", pricing);
      toast({
        title: "Success",
        description: "Pricing updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive",
      });
    }
  };

  const updateInventory = async () => {
    try {
      console.log("Updating inventory:", inventory);
      toast({
        title: "Success",
        description: "Inventory updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    }
  };

  const updateMaxStock = async () => {
    try {
      console.log("Updating max stock:", maxStock);
      toast({
        title: "Success",
        description: "Max stock updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update max stock",
        variant: "destructive",
      });
    }
  };

  const updateTaxInfo = async () => {
    try {
      console.log("Updating tax info:", taxInfo);
      toast({
        title: "Success",
        description: "Tax info updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tax info",
        variant: "destructive",
      });
    }
  };

  const updateUnitInfo = async () => {
    try {
      console.log("Updating unit info:", unitInfo);
      toast({
        title: "Success",
        description: "Unit info updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update unit info",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6">
      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price</Label>
            <Input
              id="costPrice"
              type="number"
              value={pricing.costPrice}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  costPrice: Number.parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Selling Price</Label>
            <Input
              id="sellingPrice"
              type="number"
              value={pricing.sellingPrice}
              onChange={(e) =>
                setPricing({
                  ...pricing,
                  sellingPrice: Number.parseFloat(e.target.value),
                })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={updatePricing}>Update Pricing</Button>
        </CardFooter>
      </Card>

      {/* Inventory Card */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Levels</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quantity">Current Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={inventory.quantity}
              onChange={(e) =>
                setInventory({
                  ...inventory,
                  quantity: Number.parseInt(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
            <Input
              id="minStockLevel"
              type="number"
              value={inventory.minStockLevel}
              onChange={(e) =>
                setInventory({
                  ...inventory,
                  minStockLevel: Number.parseInt(e.target.value),
                })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={updateInventory}>Update Inventory</Button>
        </CardFooter>
      </Card>

      {/* Max Stock Card */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxStockLevel">Maximum Stock Level</Label>
            <Input
              id="maxStockLevel"
              type="number"
              value={maxStock.maxStockLevel}
              onChange={(e) =>
                setMaxStock({
                  ...maxStock,
                  maxStockLevel: Number.parseInt(e.target.value),
                })
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isSerialTracked"
              checked={maxStock.isSerialTracked}
              onCheckedChange={(checked) =>
                setMaxStock({ ...maxStock, isSerialTracked: checked })
              }
            />
            <Label htmlFor="isSerialTracked">Track Serial Numbers</Label>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={updateMaxStock}>Update Stock Settings</Button>
        </CardFooter>
      </Card>

      {/* Tax Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tax">Tax Rate (%)</Label>
            <Input
              id="tax"
              type="number"
              value={taxInfo.tax}
              onChange={(e) =>
                setTaxInfo({
                  ...taxInfo,
                  tax: Number.parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate</Label>
            <select
              id="taxRate"
              className="w-full p-2 border rounded-md"
              value={taxInfo.taxRateId}
              onChange={(e) =>
                setTaxInfo({ ...taxInfo, taxRateId: e.target.value })
              }
            >
              <option value="">Select a tax rate</option>
              {/* In a real app, you would map through tax rates here */}
              <option value="tax1">Standard (20%)</option>
              <option value="tax2">Reduced (5%)</option>
              <option value="tax3">Zero (0%)</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={updateTaxInfo}>Update Tax Info</Button>
        </CardFooter>
      </Card>

      {/* Unit Card */}
      <Card>
        <CardHeader>
          <CardTitle>Unit Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              className="w-full p-2 border rounded-md"
              value={unitInfo.unitId}
              onChange={(e) =>
                setUnitInfo({ ...unitInfo, unitId: e.target.value })
              }
            >
              <option value="">Select a unit</option>
              {/* In a real app, you would map through units here */}
              <option value="unit1">Piece</option>
              <option value="unit2">Kilogram</option>
              <option value="unit3">Liter</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
            <Input
              id="unitOfMeasure"
              value={unitInfo.unitOfMeasure}
              onChange={(e) =>
                setUnitInfo({ ...unitInfo, unitOfMeasure: e.target.value })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={updateUnitInfo}>Update Unit Info</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

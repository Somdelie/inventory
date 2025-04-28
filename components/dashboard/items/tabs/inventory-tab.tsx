"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { updateItem } from "@/actions/item";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormCard } from "./form-card";
import { Item } from "@/types/itemTypes";
import { PriceDisplay } from "./price-display";
import { TaxOptions, UnitOptions } from "../item-update-form";
import { parseTaxRate } from "@/lib/formatTaxRate";
import { TaxRateDisplay } from "./TaxRateDisplay";
import { UnitMeasureDisplay } from "./UnitMeasureDisplay";

interface InventoryTabProps {
  item: Item;
  taxOptions: TaxOptions[];
  unitOptions: UnitOptions[];
  countryCode?: string;
  currencyCode?: string;
}

export function InventoryTab({
  item,
  taxOptions = [],
  unitOptions = [],
  countryCode = "ZA",
  currencyCode,
}: InventoryTabProps) {
  // Consolidated state
  const [formState, setFormState] = useState({
    // Pricing
    costPrice: item.costPrice || 0,
    sellingPrice: item.sellingPrice || 0,

    // Inventory
    quantity: item.quantity || 0,
    minStockLevel: item.minStockLevel || 0,

    // Stock Settings
    maxStockLevel: item.maxStockLevel || 0,
    isSerialTracked: item.isSerialTracked || false,

    // Tax - store as number or null, NEVER as string
    tax: item.tax || null,
    taxRateId: item.taxRateId || null,
    taxName: "", // Store tax name for display purposes

    // Unit
    unitId: item.unitId || null,
    unitOfMeasure: item.unitOfMeasure || null,
    unitTitle: "", // Store unit title for display purposes
    unitSymbol: "", // Store unit symbol for formatting
  });

  // States for editing mode
  const [editingCostPrice, setEditingCostPrice] = useState(false);
  const [editingSellingPrice, setEditingSellingPrice] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [editingUnitMeasure, setEditingUnitMeasure] = useState(false);

  // Temp values for editing
  const [tempCostPrice, setTempCostPrice] = useState(
    formState.costPrice.toString()
  );
  const [tempSellingPrice, setTempSellingPrice] = useState(
    formState.sellingPrice.toString()
  );
  const [tempTaxRate, setTempTaxRate] = useState(
    formState.tax !== null ? formState.tax.toString() : ""
  );
  const [tempUnitMeasure, setTempUnitMeasure] = useState(
    formState.unitOfMeasure || ""
  );

  // Helper functions to get display names and symbols
  const getUnitInfo = () => {
    const unit = unitOptions.find((u) => u.value === formState.unitId);
    return {
      title: unit?.label || null,
      symbol: unit ? getUnitSymbol(unit.label) : null,
    };
  };

  const getUnitSymbol = (unitTitle: string): string => {
    // Find the unit in unitOptions to get its symbol
    const unit = unitOptions.find((u) => u.label === unitTitle);

    // If we can't find the unit, try to extract the first letter or return empty string
    if (!unit) {
      return unitTitle ? unitTitle.charAt(0) : "";
    }

    // This is a simplified approach - in a real app, you would get the symbol from your database
    // For example, if unit data includes a symbol property: return unit.symbol;

    // For now, we'll use the first letter of the unit name as the symbol
    // This should be replaced with actual unit symbols from your database
    return unit.label.charAt(0);
  };

  const getTaxName = () => {
    const tax = taxOptions.find((t) => t.value === formState.taxRateId);
    return tax?.label || null;
  };

  // Update values when form state changes
  useEffect(() => {
    setTempCostPrice(formState.costPrice.toString());
    setTempSellingPrice(formState.sellingPrice.toString());
    setTempTaxRate(formState.tax !== null ? formState.tax.toString() : "");
    setTempUnitMeasure(formState.unitOfMeasure || "");
  }, [
    formState.costPrice,
    formState.sellingPrice,
    formState.tax,
    formState.unitOfMeasure,
  ]);

  // Update tax and unit info when their IDs change
  useEffect(() => {
    const taxName = getTaxName();
    setFormState((prev) => ({
      ...prev,
      taxName: taxName || "",
    }));
  }, [formState.taxRateId, taxOptions]);

  useEffect(() => {
    const { title, symbol } = getUnitInfo();
    setFormState((prev) => ({
      ...prev,
      unitTitle: title || "",
      unitSymbol: symbol || "",
    }));
  }, [formState.unitId, unitOptions]);

  // Create complete form data with all fields and proper types
  const getCompleteFormData = () => {
    // Make a copy of the form state to ensure we're not modifying the original
    const formData = { ...formState };

    // Ensure tax is a number or null, never a string
    if (formData.tax !== null) {
      formData.tax = Number(formData.tax);
    }

    // Return complete data with original item values
    return {
      ...item,
      ...formData,
    };
  };

  // Generic state update handler
  const updateField = (
    field: string,
    value: string | number | boolean | null
  ) => {
    // For tax field, ensure the value is converted to a number if it's a string
    if (field === "tax" && typeof value === "string" && value !== "") {
      value = Number(value);
    }

    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Price and tax editing handlers
  const handleCostPriceEdit = () => {
    setEditingCostPrice(true);
  };

  const handleSellingPriceEdit = () => {
    setEditingSellingPrice(true);
  };

  const handleTaxRateEdit = () => {
    setEditingTaxRate(true);
  };

  const handleUnitMeasureEdit = () => {
    setEditingUnitMeasure(true);
  };

  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempCostPrice(e.target.value);
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempSellingPrice(e.target.value);
  };

  const handleTaxRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempTaxRate(e.target.value);
  };

  const handleUnitMeasureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUnitMeasure(e.target.value);
  };

  const handleCostPriceBlur = () => {
    const value = Number.parseFloat(tempCostPrice) || 0;
    updateField("costPrice", value);
    setEditingCostPrice(false);
  };

  const handleSellingPriceBlur = () => {
    const value = Number.parseFloat(tempSellingPrice) || 0;
    updateField("sellingPrice", value);
    setEditingSellingPrice(false);
  };

  const handleTaxRateBlur = () => {
    // Parse the tax rate without the % symbol
    const taxValue = parseTaxRate(tempTaxRate);
    updateField("tax", taxValue);
    setEditingTaxRate(false);
  };

  const handleUnitMeasureBlur = () => {
    // Just store the raw value, we'll format it for display
    updateField(
      "unitOfMeasure",
      tempUnitMeasure === "" ? null : tempUnitMeasure
    );
    setEditingUnitMeasure(false);
  };

  const handleCostPriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCostPriceBlur();
    } else if (e.key === "Escape") {
      setTempCostPrice(formState.costPrice.toString());
      setEditingCostPrice(false);
    }
  };

  const handleSellingPriceKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleSellingPriceBlur();
    } else if (e.key === "Escape") {
      setTempSellingPrice(formState.sellingPrice.toString());
      setEditingSellingPrice(false);
    }
  };

  const handleTaxRateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTaxRateBlur();
    } else if (e.key === "Escape") {
      setTempTaxRate(formState.tax !== null ? formState.tax.toString() : "");
      setEditingTaxRate(false);
    }
  };

  const handleUnitMeasureKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleUnitMeasureBlur();
    } else if (e.key === "Escape") {
      setTempUnitMeasure(formState.unitOfMeasure || "");
      setEditingUnitMeasure(false);
    }
  };

  // Validation and update handlers
  const updatePricing = async () => {
    if (formState.costPrice < 0 || formState.sellingPrice < 0) {
      toast.error("Prices cannot be negative");
      throw new Error("Validation failed");
    }

    try {
      // Check what's actually being updated by comparing with original values
      const costChanged = formState.costPrice !== item.costPrice;
      const sellingChanged = formState.sellingPrice !== item.sellingPrice;

      const response = await updateItem(getCompleteFormData(), item.id);

      if (response.status === 200) {
        // Return message about what was updated
        if (costChanged && sellingChanged) {
          return "Cost and selling prices";
        } else if (costChanged) {
          return "Cost price";
        } else if (sellingChanged) {
          return "Selling price";
        } else {
          return "No changes needed to pricing";
        }
      }
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error("Failed to update pricing");
      throw error;
    }
  };

  const updateInventory = async () => {
    if (formState.quantity < 0 || formState.minStockLevel < 0) {
      toast.error("Inventory values cannot be negative");
      throw new Error("Validation failed");
    }

    try {
      // Check what's actually being updated by comparing with original values
      const quantityChanged = formState.quantity !== item.quantity;
      const minStockChanged = formState.minStockLevel !== item.minStockLevel;

      const response = await updateItem(getCompleteFormData(), item.id);

      if (response.status === 200) {
        // Return message about what was updated
        if (quantityChanged && minStockChanged) {
          return "Quantity and minimum stock level";
        } else if (quantityChanged) {
          return "Current quantity";
        } else if (minStockChanged) {
          return "Minimum stock level";
        } else {
          return "No changes needed to inventory";
        }
      }
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error("Failed to update inventory");
      throw error;
    }
  };

  const updateStockSettings = async () => {
    if (formState.maxStockLevel < 0) {
      toast.error("Maximum stock level cannot be negative");
      throw new Error("Validation failed");
    }

    if (formState.maxStockLevel < formState.minStockLevel) {
      toast.error(
        "Maximum stock level cannot be less than minimum stock level"
      );
      throw new Error("Validation failed");
    }

    try {
      // Check what's actually being updated by comparing with original values
      const maxStockChanged = formState.maxStockLevel !== item.maxStockLevel;
      const serialTrackingChanged =
        formState.isSerialTracked !== item.isSerialTracked;

      const response = await updateItem(getCompleteFormData(), item.id);

      if (response.status === 200) {
        // Return message about what was updated
        if (maxStockChanged && serialTrackingChanged) {
          return "Maximum stock level and serial tracking";
        } else if (maxStockChanged) {
          return "Maximum stock level";
        } else if (serialTrackingChanged) {
          return "Serial tracking";
        } else {
          return "No changes needed to stock settings";
        }
      }
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error("Failed to update stock settings");
      throw error;
    }
  };

  const updateTaxInfo = async () => {
    // The tax is already converted to a number in formState
    try {
      // Check what's actually being updated by comparing with original values
      const taxChanged = formState.tax !== item.tax;
      const taxRateIdChanged = formState.taxRateId !== item.taxRateId;

      // Always use getCompleteFormData to ensure proper types
      const response = await updateItem(getCompleteFormData(), item.id);

      if (response.status === 200) {
        // Return message about what was updated
        if (taxChanged && taxRateIdChanged) {
          return "Tax rate and tax type";
        } else if (taxChanged) {
          return "Tax rate";
        } else if (taxRateIdChanged) {
          return "Tax type";
        } else {
          return "No changes needed to tax information";
        }
      }
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error("Failed to update tax information");
      throw error;
    }
  };

  const updateUnitInfo = async () => {
    try {
      // Check what's actually being updated by comparing with original values
      const unitIdChanged = formState.unitId !== item.unitId;
      const unitOfMeasureChanged =
        formState.unitOfMeasure !== item.unitOfMeasure;

      const response = await updateItem(getCompleteFormData(), item.id);

      if (response.status === 200) {
        // Return message about what was updated
        if (unitIdChanged && unitOfMeasureChanged) {
          return "Unit and unit of measure";
        } else if (unitIdChanged) {
          return "Unit";
        } else if (unitOfMeasureChanged) {
          return "Unit of measure";
        } else {
          return "No changes needed to unit information";
        }
      }
      if (response.error) {
        toast.error(response.error);
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error("Failed to update unit information");
      throw error;
    }
  };

  return (
    <div className="grid gap-6">
      {/* Pricing Card */}
      <FormCard
        title="Pricing"
        onSubmit={updatePricing}
        buttonText="Update Pricing"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price</Label>
            <div
              className="relative flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
              onClick={handleCostPriceEdit}
            >
              {editingCostPrice ? (
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={tempCostPrice}
                  onChange={handleCostPriceChange}
                  onBlur={handleCostPriceBlur}
                  onKeyDown={handleCostPriceKeyDown}
                  className="border-0 p-0 focus-visible:ring-0"
                  autoFocus
                />
              ) : (
                <PriceDisplay
                  amount={formState.costPrice}
                  countryCode={countryCode}
                  currencyCode={currencyCode}
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">Selling Price</Label>
            <div
              className="relative flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
              onClick={handleSellingPriceEdit}
            >
              {editingSellingPrice ? (
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={tempSellingPrice}
                  onChange={handleSellingPriceChange}
                  onBlur={handleSellingPriceBlur}
                  onKeyDown={handleSellingPriceKeyDown}
                  className="border-0 p-0 focus-visible:ring-0"
                  autoFocus
                />
              ) : (
                <PriceDisplay
                  amount={formState.sellingPrice}
                  countryCode={countryCode}
                  currencyCode={currencyCode}
                />
              )}
            </div>
          </div>
        </div>
      </FormCard>

      {/* Inventory Card */}
      <FormCard
        title="Inventory Levels"
        onSubmit={updateInventory}
        buttonText="Update Inventory"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quantity">Current Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={formState.quantity}
              onChange={(e) =>
                updateField("quantity", Number.parseInt(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
            <Input
              id="minStockLevel"
              type="number"
              value={formState.minStockLevel}
              onChange={(e) =>
                updateField(
                  "minStockLevel",
                  Number.parseInt(e.target.value) || 0
                )
              }
            />
          </div>
        </div>
      </FormCard>

      {/* Stock Settings Card */}
      <FormCard
        title="Stock Settings"
        onSubmit={updateStockSettings}
        buttonText="Update Stock Settings"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxStockLevel">Maximum Stock Level</Label>
            <Input
              id="maxStockLevel"
              type="number"
              value={formState.maxStockLevel}
              onChange={(e) =>
                updateField(
                  "maxStockLevel",
                  Number.parseInt(e.target.value) || 0
                )
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isSerialTracked"
              checked={formState.isSerialTracked}
              onCheckedChange={(checked) =>
                updateField("isSerialTracked", checked)
              }
            />
            <Label htmlFor="isSerialTracked">Track Serial Numbers</Label>
          </div>
        </div>
      </FormCard>

      {/* Tax Card */}
      <FormCard
        title="Tax Information"
        onSubmit={updateTaxInfo}
        buttonText="Update Tax Info"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tax">Tax Rate</Label>
            <div
              className="relative flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
              onClick={handleTaxRateEdit}
            >
              {editingTaxRate ? (
                <Input
                  id="tax"
                  type="text"
                  value={tempTaxRate}
                  onChange={handleTaxRateChange}
                  onBlur={handleTaxRateBlur}
                  onKeyDown={handleTaxRateKeyDown}
                  className="border-0 p-0 focus-visible:ring-0"
                  autoFocus
                  placeholder="e.g. 15"
                />
              ) : (
                <TaxRateDisplay rate={formState.tax} />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Enter rate without % symbol (e.g., 15 for 15%)
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRateId">Tax Type</Label>
            <Select
              value={formState.taxRateId || ""}
              onValueChange={(value) => updateField("taxRateId", value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tax Types</SelectLabel>
                  {taxOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formState.taxName && (
              <div className="text-sm text-muted-foreground mt-1">
                Selected: {formState.taxName}
              </div>
            )}
          </div>
        </div>
      </FormCard>

      {/* Unit Card */}
      <FormCard
        title="Unit Information"
        onSubmit={updateUnitInfo}
        buttonText="Update Unit Info"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="unitId">Unit</Label>
            <Select
              value={formState.unitId || ""}
              onValueChange={(value) => updateField("unitId", value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Units</SelectLabel>
                  {unitOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formState.unitTitle && (
              <div className="text-sm text-muted-foreground mt-1">
                Selected: {formState.unitTitle}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
            <div
              className="relative flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50"
              onClick={handleUnitMeasureEdit}
            >
              {editingUnitMeasure ? (
                <Input
                  id="unitOfMeasure"
                  type="text"
                  value={tempUnitMeasure}
                  onChange={handleUnitMeasureChange}
                  onBlur={handleUnitMeasureBlur}
                  onKeyDown={handleUnitMeasureKeyDown}
                  className="border-0 p-0 focus-visible:ring-0"
                  autoFocus
                  placeholder="e.g. 5"
                />
              ) : (
                <UnitMeasureDisplay
                  value={formState.unitOfMeasure}
                  symbol={formState.unitSymbol}
                />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Enter value only (e.g., 5 for 5{formState.unitSymbol})
            </div>
          </div>
        </div>
      </FormCard>
    </div>
  );
}

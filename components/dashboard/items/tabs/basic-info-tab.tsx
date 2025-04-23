"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { generateSlug } from "@/lib/generateSlug";
import { generateSKU } from "@/lib/generateSKU";

interface BasicInfoTabProps {
  item: Item;
  categoryOptions: Array<{ value: string; label: string }>;
  brandOptions: Array<{ value: string; label: string }>;
}

export function BasicInfoTab({
  item,
  categoryOptions,
  brandOptions,
}: BasicInfoTabProps) {
  // Consolidated state
  const [formState, setFormState] = useState({
    name: item.name || "",
    slug: item.slug || "",
    sku: item.sku || "",
    barcode: item.barcode || "",
    description: item.description || "",
    isActive: item.isActive || false,
    isPublished: item.isPublished || false,
    categoryId: item.categoryId || "",
    brandId: item.brandId || "",
    brandName: item.brandName || "",
  });

  // Get brand and category names for SKU generation
  const getBrandName = () => {
    const brand = brandOptions.find((b) => b.value === formState.brandId);
    return brand?.label || null;
  };

  const getCategoryName = () => {
    const category = categoryOptions.find(
      (c) => c.value === formState.categoryId
    );
    return category?.label || null;
  };

  // Update slug and SKU when name changes
  useEffect(() => {
    if (formState.name) {
      const newSlug = generateSlug(formState.name);
      const brandName = getBrandName();
      const categoryName = getCategoryName();
      const newSku = generateSKU(formState.name, brandName, categoryName);

      setFormState((prev) => ({
        ...prev,
        slug: newSlug,
        sku: newSku,
        brandName: brandName || prev.brandName,
      }));
    }
  }, [formState.name, formState.categoryId, formState.brandId]);

  // Create complete form data with all fields
  const getCompleteFormData = () => ({
    ...item,
    ...formState,
  });

  // Generic state update handler
  const updateField = (field: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Validation and update handlers
  const updateNameSlug = async () => {
    if (!formState.name) {
      toast.error("Name cannot be empty");
      throw new Error("Validation failed");
    }
    await updateItem(getCompleteFormData(), item.id);
  };

  const updateBarcode = async () => {
    if (!formState.barcode) {
      toast.error("Barcode cannot be empty");
      throw new Error("Validation failed");
    }

    try {
      // Check what's actually being updated by comparing with original values
      const barcodeChanged = formState.barcode !== item.barcode;

      await updateItem(getCompleteFormData(), item.id);

      // Return message about what was updated without showing a toast
      if (barcodeChanged) {
        return "Barcode";
      } else {
        return "No changes needed to barcode";
      }
    } catch (error) {
      toast.error("Failed to update barcode");
      throw error;
    }
  };

  const updateDescription = async () => {
    if (!formState.description) {
      toast.error("Description cannot be empty");
      throw new Error("Validation failed");
    }
    await updateItem(getCompleteFormData(), item.id);
  };

  // Updated function for Product Status
  const updateStatus = async () => {
    try {
      // Check what's actually being updated by comparing with original values
      const activeChanged = formState.isActive !== item.isActive;
      const publishedChanged = formState.isPublished !== item.isPublished;

      await updateItem(getCompleteFormData(), item.id);

      // Return message about what was updated without showing a toast
      if (activeChanged && publishedChanged) {
        return "Active and Published status";
      } else if (activeChanged) {
        return "Active status";
      } else if (publishedChanged) {
        return "Published status";
      }
    } catch (error) {
      toast.error("Failed to update product status");
      throw error;
    }
  };

  const updateCategoryAndBrand = async () => {
    // Required field validation
    if (!formState.categoryId) {
      toast.error("Category cannot be empty");
      throw new Error("Validation failed");
    }

    if (!formState.brandId) {
      toast.error("Brand cannot be empty");
      throw new Error("Validation failed");
    }

    try {
      // Check what's actually being updated by comparing with original values
      const categoryChanged = formState.categoryId !== item.categoryId;
      const brandChanged = formState.brandId !== item.brandId;

      console.log("Updating category and brand:", {
        categoryId: formState.categoryId,
        brandId: formState.brandId,
        brandName: formState.brandName,
      });

      // Update the item but don't show a toast here
      await updateItem(getCompleteFormData(), item.id);

      // Return what was changed without showing a toast
      // This will be used by the FormCard to show the appropriate toast
      if (categoryChanged && brandChanged) {
        return "Category and brand";
      } else if (categoryChanged) {
        return "Category";
      } else if (brandChanged) {
        return "Brand";
      } else {
        return "No changes needed to classification";
      }
    } catch (error) {
      // Still show error toast here as this is a specific error message
      toast.error("Failed to update product classification");
      throw error;
    }
  };

  return (
    <div className="grid gap-6">
      {/* Name and Slug Card */}
      <FormCard
        title="Product Identity"
        onSubmit={updateNameSlug}
        buttonText="Update Identity"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formState.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (Auto-generated)</Label>
            <Input
              id="slug"
              value={formState.slug}
              disabled
              className="bg-muted"
            />
          </div>
        </div>
      </FormCard>

      {/* SKU and Barcode Card */}
      <FormCard
        title="Product Codes"
        onSubmit={updateBarcode}
        buttonText="Update Barcode"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (Auto-generated)</Label>
            <Input
              id="sku"
              value={formState.sku}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formState.barcode}
              onChange={(e) => updateField("barcode", e.target.value)}
            />
          </div>
        </div>
      </FormCard>

      {/* Description Card */}
      <FormCard
        title="Product Description"
        onSubmit={updateDescription}
        buttonText="Update Description"
      >
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            className="resize-none"
            placeholder="Enter product description"
            value={formState.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
      </FormCard>

      {/* Status Card */}
      <FormCard
        title="Product Status"
        onSubmit={updateStatus}
        buttonText="Update Status"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formState.isActive}
              onCheckedChange={(checked) => updateField("isActive", checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={formState.isPublished}
              onCheckedChange={(checked) => updateField("isPublished", checked)}
            />
            <Label htmlFor="isPublished">Published</Label>
          </div>
        </div>
      </FormCard>

      {/* Category and Brand Card */}
      <FormCard
        title="Product Classification"
        onSubmit={updateCategoryAndBrand}
        buttonText="Update Classification"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formState.categoryId}
              onValueChange={(value) => updateField("categoryId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select
              value={formState.brandId}
              onValueChange={(value) => updateField("brandId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Brands</SelectLabel>
                  {brandOptions?.map((brand) => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormCard>
    </div>
  );
}

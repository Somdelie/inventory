"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { ImageInput } from "@/components/FormInputs/ThumbnailUpload";
import { FormCard } from "./form-card";
import { Item } from "@/types/itemTypes";
import { updateItem } from "@/actions/item";
import Image from "next/image";
import { ImageIcon, Loader2, X } from "lucide-react";
import { useUtDelete } from "@/hooks/useUtDelete";

interface DetailsTabProps {
  item: Item;
}

export function DetailsTab({ item }: DetailsTabProps) {
  // Consolidated state
  const [formState, setFormState] = useState({
    dimensions: item.dimensions || "",
    weight: item.weight || "",
    upc: item.upc || "",
    ean: item.ean || "",
    mpn: item.mpn || "",
    isbn: item.isbn || "",
    thumbnail: item.thumbnail || "",
    imageUrls: item.imageUrls || [],
  });

  const [imageUrl, setImageUrl] = useState(item.thumbnail || "");
  const [showPreview, setShowPreview] = useState(false);
  const [newUploadUrl, setNewUploadUrl] = useState("");
  const { deleteFile, isDeleting } = useUtDelete();

  // Check if there's a new image different from the current thumbnail
  useEffect(() => {
    if (imageUrl && imageUrl !== item.thumbnail) {
      setShowPreview(true);
      // Store the new upload URL separately to track for deletion if needed
      if (imageUrl !== newUploadUrl) {
        setNewUploadUrl(imageUrl);
      }
    } else {
      setShowPreview(false);
    }
  }, [imageUrl, item.thumbnail]);

  // Create complete form data with all fields
  const getCompleteFormData = () => ({
    ...item,
    ...formState,
    thumbnail: imageUrl, // Use the imageUrl state for thumbnail
  });

  // Generic state update handler
  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Validation and update handlers
  const updateDimensions = async () => {
    try {
      console.log("Updating dimensions:", {
        dimensions: formState.dimensions,
        weight: formState.weight,
      });
      await updateItem(getCompleteFormData(), item.id);
      toast.success("Dimensions updated successfully");
    } catch (error) {
      toast.error("Failed to update dimensions");
      throw error;
    }
  };

  const updateIdentifiers = async () => {
    try {
      console.log("Updating identifiers:", {
        upc: formState.upc,
        ean: formState.ean,
      });
      await updateItem(getCompleteFormData(), item.id);
      toast.success("Identifiers updated successfully");
    } catch (error) {
      toast.error("Failed to update identifiers");
      throw error;
    }
  };

  const updateAdditionalIds = async () => {
    try {
      console.log("Updating additional IDs:", {
        mpn: formState.mpn,
        isbn: formState.isbn,
      });
      await updateItem(getCompleteFormData(), item.id);
      toast.success("Additional IDs updated successfully");
    } catch (error) {
      toast.error("Failed to update additional IDs");
      throw error;
    }
  };

  const updateThumbnail = async () => {
    try {
      console.log("Updating thumbnail:", imageUrl);

      // Update the actual item with the new imageUrl
      const updatedData = {
        ...getCompleteFormData(),
        thumbnail: imageUrl,
      };

      // If the item already had a thumbnail and it's different from the new one, delete it
      if (
        item.thumbnail &&
        item.thumbnail !== imageUrl &&
        item.thumbnail !== "/placeholder.jpg"
      ) {
        try {
          await deleteFile(item.thumbnail);
          console.log("Previous item thumbnail deleted:", item.thumbnail);
        } catch (deleteError) {
          console.error("Failed to delete previous thumbnail:", deleteError);
          // Continue with the update even if deletion fails
        }
      }

      await updateItem(updatedData, item.id);
      toast.success("Thumbnail updated successfully", {
        position: "bottom-right",
        style: {
          background: "green",
          color: "#fff",
        },
      });

      // Reset preview state and new upload tracking after successful update
      setShowPreview(false);
      setNewUploadUrl("");
    } catch (error) {
      toast.error("Failed to update thumbnail");
      throw error;
    }
  };

  // Cancel preview and delete the uploaded file
  const cancelImagePreview = async () => {
    // Delete the uploaded file if it exists and is different from the current thumbnail
    if (newUploadUrl && newUploadUrl !== item.thumbnail) {
      try {
        await deleteFile(newUploadUrl);
        console.log("Canceled upload deleted:", newUploadUrl);
      } catch (error) {
        console.error("Failed to delete canceled upload:", error);
      }
    }

    // Reset to the original thumbnail
    setImageUrl(item.thumbnail || "");
    setShowPreview(false);
    setNewUploadUrl("");
  };

  // Custom handler for the ImageInput component
  const handleImageUrlChange = (url: string) => {
    // If there's already a new upload and we're uploading another one, delete the previous one
    if (
      newUploadUrl &&
      newUploadUrl !== url &&
      newUploadUrl !== item.thumbnail
    ) {
      deleteFile(newUploadUrl).catch((err) => {
        console.error("Failed to delete previous upload:", err);
      });
    }

    setImageUrl(url);
  };

  return (
    <div className="grid gap-6">
      {/* Dimensions Card */}
      <FormCard
        title="Physical Attributes"
        onSubmit={updateDimensions}
        buttonText="Update Physical Attributes"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions (LxWxH)</Label>
            <Input
              id="dimensions"
              value={formState.dimensions}
              onChange={(e) => updateField("dimensions", e.target.value)}
              placeholder="e.g., 10x5x2 cm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <Input
              id="weight"
              type="number"
              value={formState.weight || ""}
              onChange={(e) =>
                updateField("weight", Number.parseFloat(e.target.value) || null)
              }
              placeholder="e.g., 0.5 kg"
            />
          </div>
        </div>
      </FormCard>

      {/* UPC/EAN Card */}
      <FormCard
        title="Product Identifiers"
        onSubmit={updateIdentifiers}
        buttonText="Update Identifiers"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="upc">UPC</Label>
            <Input
              id="upc"
              value={formState.upc}
              onChange={(e) => updateField("upc", e.target.value)}
              placeholder="Universal Product Code"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ean">EAN</Label>
            <Input
              id="ean"
              value={formState.ean}
              onChange={(e) => updateField("ean", e.target.value)}
              placeholder="European Article Number"
            />
          </div>
        </div>
      </FormCard>

      {/* MPN/ISBN Card */}
      <FormCard
        title="Additional Identifiers"
        onSubmit={updateAdditionalIds}
        buttonText="Update Additional IDs"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mpn">MPN</Label>
            <Input
              id="mpn"
              value={formState.mpn}
              onChange={(e) => updateField("mpn", e.target.value)}
              placeholder="Manufacturer Part Number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              value={formState.isbn}
              onChange={(e) => updateField("isbn", e.target.value)}
              placeholder="International Standard Book Number"
            />
          </div>
        </div>
      </FormCard>

      {/* Thumbnail Card */}
      <FormCard
        title="Item Thumbnail"
        onSubmit={updateThumbnail}
        buttonText="Update Thumbnail"
      >
        <div className="grid md:flex gap-6 items-start">
          {/* Current thumbnail */}
          <div className="">
            <h3 className="text-sm font-medium mb-2">Current Thumbnail</h3>
            {item.thumbnail ? (
              <Image
                width={100}
                height={100}
                src={item.thumbnail}
                alt="Item thumbnail"
                className="w-24 h-24 md:w-56 md:h-56 object-cover rounded border shadow-sm"
              />
            ) : (
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 flex flex-col items-center justify-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <ImageIcon className="h-10 w-10 text-primary" />
                </div>
                <p className="text-base font-medium text-center mb-1">
                  Upload an image
                </p>
              </div>
            )}
          </div>

          {/* Upload + Preview section */}
          <div className="">
            <h3 className="text-sm font-medium mb-2">Upload New Image</h3>

            {/* Image uploader */}
            <ImageInput
              title=""
              imageUrl={imageUrl}
              setImageUrl={handleImageUrlChange}
              endpoint="itemImage"
            />

            {/* Preview appears below the uploader */}
            {showPreview && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-amber-600">
                    Preview - Thumbnail will change to:
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelImagePreview}
                    className="h-6 w-6 p-0 rounded-full bg-primary text-white hover:opacity-80 hover:bg-primary ml-1"
                  >
                    {isDeleting ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="border border-dashed border-amber-400 rounded p-2 bg-amber-50">
                  <Image
                    width={100}
                    height={100}
                    src={imageUrl}
                    alt="New thumbnail preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </FormCard>
    </div>
  );
}

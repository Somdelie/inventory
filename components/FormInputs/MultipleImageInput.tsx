import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Upload } from "lucide-react";
import { updateItem } from "@/actions/item";
import toast from "react-hot-toast";

type ImageInputProps = {
  title: string;
  imageUrls: string[];
  setImageUrls: any;
  endpoint: any;
  itemId?: string;
  item?: any; // Optional full item object
};

export default function MultipleImageInput({
  title,
  imageUrls,
  setImageUrls,
  endpoint,
  itemId,
  item,
}: ImageInputProps) {
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const MAX_IMAGES = 4;
  const remainingSlots = MAX_IMAGES - imageUrls.length;

  // Function to extract file key from URL
  const getFileKeyFromUrl = (url: string) => {
    try {
      // Extract the file key from the uploadthing URL format
      const urlParts = url.split("/");
      return urlParts[urlParts.length - 1];
    } catch (error) {
      console.error("Failed to extract file key:", error);
      return null;
    }
  };

  // Function to delete an image
  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      setDeletingIndex(index);

      // Extract the file key from the URL
      const fileKey = getFileKeyFromUrl(imageUrl);

      if (!fileKey) {
        toast.error("Could not identify file key for deletion");
        return;
      }

      // Call the API to delete the file from uploadthing
      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete file");
      }

      // Remove the image from the state
      const updatedUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(updatedUrls);

      // Update the item in the database if itemId is provided
      if (itemId) {
        // We need to pass a partial update with just the imageUrls field
        await updateItem({ imageUrls: updatedUrls } as any, itemId);
      }

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeletingIndex(null);
    }
  };

  // Get remaining message text
  const getRemainingMessage = () => {
    if (remainingSlots === 0) {
      return "Max images reached";
    } else if (remainingSlots === 1) {
      return "Add 1 more image";
    } else {
      return `Add up to ${remainingSlots} more images`;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {imageUrls.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {imageUrls.map((imageUrl: string, i: number) => {
                return (
                  <div
                    key={i}
                    className="relative aspect-square rounded overflow-hidden border shadow-sm group"
                  >
                    <Image
                      alt={`Product image ${i + 1}`}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={imageUrl}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />

                    {/* Delete button overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <Button
                        variant={"destructive"}
                        size={"icon"}
                        type="button"
                        onClick={() => handleDeleteImage(imageUrl, i)}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all transform hover:scale-110"
                        disabled={deletingIndex === i}
                        aria-label="Delete image"
                      >
                        {deletingIndex === i ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center h-44 border-dashed border-2 border-gray-300 rounded-lg">
              <h1 className="text-center text-lg font-semibold mb-4">
                This item has no images yet. Please upload one.
              </h1>
              <Image
                src="/empty.png"
                alt="Empty bin"
                width={60}
                height={60}
                priority
                className="object-contain"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            {" "}
            <div className="flex">
              <div className="">
                <Upload className="h-full w-full bg-green-700 text-white rounded-l p-2" />
              </div>
              {remainingSlots <= 0 ? (
                <Button
                  disabled
                  className="bg-gray-400 text-white rounded-r rounded-none p-2"
                >
                  Max images reached
                </Button>
              ) : (
                <UploadButton
                  className="ut-button:bg-transparent ut-button:text-white bg-primary rounded-r hover:opacity-95 transition duration-200 ease-in-out ut-allowed-content:hidden border-primary"
                  endpoint={endpoint}
                  onClientUploadComplete={(res) => {
                    // Add new images to existing ones, up to MAX_IMAGES
                    const newUrls = res.map((item) => item.url);
                    const combinedUrls = [...imageUrls, ...newUrls].slice(
                      0,
                      MAX_IMAGES
                    );
                    setImageUrls(combinedUrls);

                    // Update the item in database if itemId is provided
                    if (itemId) {
                      updateItem(
                        { imageUrls: combinedUrls } as any,
                        itemId
                      ).catch((error) => {
                        console.error("Error updating item:", error);
                        toast.error("Failed to update item with new images");
                      });
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload error: ${error.message}`);
                  }}
                />
              )}
            </div>
            {/* Display message about remaining image slots */}
            {imageUrls.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {getRemainingMessage()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

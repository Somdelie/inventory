"use client";

import { FormLabel } from "@/components/ui/form";
import { UploadButton } from "@/lib/uploadthing";
import { ImageIcon, UploadCloud } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUtDelete } from "@/hooks/useUtDelete";

type ImageInputProps = {
  title?: string;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  endpoint: any;
};

export function ImageInput({
  title,
  imageUrl,
  setImageUrl,
  endpoint,
}: ImageInputProps) {
  const showPlaceholder = !imageUrl || imageUrl === "/placeholder.svg";
  const [previousUrl, setPreviousUrl] = useState<string>("");
  const { deleteFile } = useUtDelete();

  // Keep track of the previous URL to delete it when it changes
  useEffect(() => {
    // When the component mounts, store the initial URL
    if (imageUrl && imageUrl !== "/placeholder.svg" && !previousUrl) {
      setPreviousUrl(imageUrl);
    }
  }, []);

  // Handle setting a new image URL
  const handleSetImageUrl = async (newUrl: string) => {
    // If there's a previous URL that's different from the initial URL
    // and it's not the placeholder, delete it
    if (
      previousUrl &&
      previousUrl !== imageUrl &&
      previousUrl !== "/placeholder.svg"
    ) {
      try {
        await deleteFile(previousUrl);
        console.log("Previous upload deleted:", previousUrl);
      } catch (error) {
        console.error("Failed to delete previous upload:", error);
      }
    }

    // Update the previous URL to the current one before setting the new one
    setPreviousUrl(imageUrl);

    // Set the new URL
    setImageUrl(newUrl);
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Only show title if provided */}
      {title && (
        <FormLabel className="text-base font-medium">{title}</FormLabel>
      )}
      {/* Only show placeholder when no image is available */}
      {/* {showPlaceholder && (
        <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 flex flex-col items-center justify-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <ImageIcon className="h-10 w-10 text-primary" />
          </div>
          <p className="text-base font-medium text-center mb-1">
            Upload an image
          </p>
        </div>
      )} */}
      <div className="border-dashed border-2 border-primary/30 rounded p-4 py-2 flex flex-col items-center justify-center w-full hover:bg-gray-200 transition duration-200 ease-in-out">
        <div className="flex items-center justify-center shadow">
          <UploadCloud className="h-full w-10 p-2 text-white bg-green-700 rounded-l" />
          <UploadButton
            className="ut-button:bg-transparent ut-button:text-white bg-primary rounded-r hover:opacity-95 transition duration-200 ease-in-out ut-allowed-content:hidden border-primary"
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              console.log("Files: ", res);
              handleSetImageUrl(res[0].url);

              // Add success toast notification
              toast.success("Upload successful", {
                description: "Your image has been uploaded",
              });
            }}
            onUploadError={(error: Error) => {
              // Error toast notification
              toast.error("Upload failed", {
                description: error.message,
              });
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          {showPlaceholder
            ? "Click to upload"
            : "Change image allowed size: 1MB"}
        </div>
      </div>
    </div>
  );
}

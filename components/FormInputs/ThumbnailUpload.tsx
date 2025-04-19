"use client";

import { FormLabel } from "@/components/ui/form";
import { UploadButton } from "@/lib/uploadthing";
import { ImageIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner"; // Add this import

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

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Only show title if provided */}
      {title && (
        <FormLabel className="text-base font-medium">{title}</FormLabel>
      )}

      {/* Only show placeholder when no image is available */}
      {showPlaceholder && (
        <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 flex flex-col items-center justify-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <ImageIcon className="h-10 w-10 text-primary" />
          </div>
          <p className="text-base font-medium text-center mb-1">
            Upload an image
          </p>
        </div>
      )}

      {/* Upload button with improved styling */}
      <div>
        <UploadButton
          className="ut-button:bg-primary ut-button:hover:bg-primary/90 ut-button:text-primary-foreground ut-button:font-medium ut-button:py-5 ut-button:w-full ut-button:rounded-md ut-allowed-content:text-muted-foreground ut-button:flex ut-button:items-center ut-button:justify-center"
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            console.log("Files: ", res);
            setImageUrl(res[0].url);

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
    </div>
  );
}

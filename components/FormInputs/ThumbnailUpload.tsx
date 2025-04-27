"use client";

import { FormLabel } from "@/components/ui/form";
import { UploadButton } from "@/lib/uploadthing";
import { ImageIcon, UploadCloud } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

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
  const showPlaceholder = !imageUrl || imageUrl === "/placeholder.jpg";
  const [uploadInProgress, setUploadInProgress] = useState(false);

  // Direct handler without the previous URL tracking
  // The parent component (DetailsTab) will handle deletion of previous uploads
  const handleSetImageUrl = (newUrl: string) => {
    console.log("ImageInput: New image URL received:", newUrl);
    setImageUrl(newUrl);
  };

  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* Only show title if provided */}
      {title && (
        <FormLabel className="text-base font-medium">{title}</FormLabel>
      )}
      <div className="border-dashed border-2 border-primary/30 rounded p-4 py-2 flex flex-col items-center justify-center w-full hover:bg-gray-200 transition duration-200 ease-in-out">
        <div className="flex items-center justify-center shadow">
          <UploadCloud
            className={`h-full w-10 p-2 text-white ${
              uploadInProgress ? "bg-yellow-600" : "bg-green-700"
            } rounded-l`}
          />
          <UploadButton
            className="ut-button:bg-transparent ut-button:text-white bg-primary rounded-r hover:opacity-95 transition duration-200 ease-in-out ut-allowed-content:hidden border-primary"
            endpoint={endpoint}
            onUploadBegin={() => {
              setUploadInProgress(true);
              console.log("Upload started");
            }}
            onClientUploadComplete={(res) => {
              setUploadInProgress(false);
              if (res && res.length > 0) {
                console.log("Upload completed:", res[0].url);
                handleSetImageUrl(res[0].url);

                // Add success toast notification
                toast.success("Upload successful", {
                  description: "Your image has been uploaded",
                });
              } else {
                console.error("Upload response empty or invalid");
                toast.error("Upload failed", {
                  description: "Received empty response from server",
                });
              }
            }}
            onUploadError={(error: Error) => {
              setUploadInProgress(false);
              console.error("Upload error:", error);

              // Error toast notification
              toast.error("Upload failed", {
                description: error.message || "An unknown error occurred",
              });
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          {uploadInProgress
            ? "Uploading..."
            : showPlaceholder
            ? "Click to upload"
            : "Change image (max 1MB)"}
        </div>
      </div>
    </div>
  );
}

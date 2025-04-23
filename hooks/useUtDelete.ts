"use client";

import { useState } from "react";

export function useUtDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Extract the file key from an UploadThing URL
   */
  const getFileKeyFromUrl = (url: string): string | null => {
    try {
      // UploadThing URLs typically follow a pattern like:
      // https://utfs.io/f/12345-filename.jpg
      const urlObj = new URL(url);
      // Get the last part of the path which should be the file key
      const pathname = urlObj.pathname;
      const fileKey = pathname.split("/").pop();
      return fileKey || null;
    } catch (e) {
      console.error("Invalid URL:", e);
      return null;
    }
  };

  /**
   * Delete a file from UploadThing
   */
  const deleteFile = async (url: string): Promise<boolean> => {
    if (!url || url === "/placeholder.svg") return false;

    setIsDeleting(true);
    setError(null);

    try {
      const fileKey = getFileKeyFromUrl(url);

      if (!fileKey) {
        throw new Error("Could not extract file key from URL");
      }

      // Call the UploadThing deletion API endpoint
      const response = await fetch(`/api/uploadthing/delete`, {
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

      const data = await response.json();
      return true;
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteFile,
    isDeleting,
    error,
  };
}

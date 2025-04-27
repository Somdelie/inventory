"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useFileDelete() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Delete a file from Firebase Storage
   */
  const deleteFile = async (url: string): Promise<boolean> => {
    if (!url || url === "/placeholder.jpg") return true;

    setIsDeleting(true);
    setError(null);

    try {
      console.log("Deleting file:", url);

      // Call the file deletion API endpoint
      const response = await fetch(`/api/delete-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file");
      }

      const data = await response.json();
      console.log("File deletion response:", data);

      return true;
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Unknown error occurred during file deletion")
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

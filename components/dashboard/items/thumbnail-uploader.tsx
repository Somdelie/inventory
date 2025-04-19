"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload } from "lucide-react";

interface ThumbnailUploaderProps {
  // Changed type to accept a string URL instead of a File
  onUpload: (url: string, file: File) => void;
}

export function ThumbnailUploader({ onUpload }: ThumbnailUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Create a URL from the file and pass both URL and file to the callback
      const imageUrl = URL.createObjectURL(selectedFile);
      onUpload(imageUrl, selectedFile);
      resetForm();
      setIsModalOpen(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Button to open the modal - improved styling */}
      <Button
        type="button"
        variant="default"
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center py-5 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Upload className="mr-2 h-5 w-5" />
        <span className="font-medium">Upload Thumbnail</span>
      </Button>

      {/* Upload Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Upload Thumbnail
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div
              className="border-2 border-dashed border-primary/20 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative w-full aspect-square max-h-[250px] overflow-hidden rounded-md">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="object-contain w-full h-full"
                  />
                </div>
              ) : (
                <>
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <ImageIcon className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-base font-medium text-center mb-1">
                    Click to select an image
                  </p>
                  <p className="text-sm text-muted-foreground text-center">
                    or drag and drop here
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                title="Upload an image file"
              />
            </div>

            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium">{selectedFile.name}</span> (
                {Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

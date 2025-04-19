"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { UploadModal } from "./upload-modal";
import { Button } from "../ui/button";

interface UploadButtonProps {
  onUpload?: (file: File) => void;
  className?: string;
}

export function UploadButton({ onUpload, className = "" }: UploadButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpload = (file: File) => {
    if (onUpload) {
      onUpload(file);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="col-span-2 flex items-center justify-center">
      <Button
        type="button"
        className={`relative w-full max-w-md h-12 rounded-full outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Silver border effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-300 to-gray-400 shadow-lg" />

        {/* Rose button background with gradient */}
        <div
          className={`absolute inset-[2px] rounded-full bg-gradient-to-b from-rose-600 to-rose-700 flex items-center transition-all ${
            isHovered ? "brightness-110" : ""
          }`}
        >
          {/* Text */}
          <span className="text-white font-bold text-2xl tracking-wide ml-8 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            UPLOAD
          </span>

          {/* Circle with arrow */}
          <div className="absolute right-0 h-full aspect-square">
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-rose-700 to-rose-800 border-2 border-white flex items-center justify-center">
              <ArrowUp className="w-10 h-10 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
}

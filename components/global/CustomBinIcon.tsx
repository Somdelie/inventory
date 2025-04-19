import React from "react";
import Image from "next/image";

const CustomBinIcon = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/empty.png"
        alt="Empty bin"
        width={80}
        height={80}
        priority
        className="object-contain"
      />
    </div>
  );
};

export default CustomBinIcon;

"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loader = ({
  size = "md",
  variant = "primary",
  text,
  fullScreen = false,
  className,
}: LoaderProps) => {
  // Size mappings
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  // Variant mappings
  const variantClasses = {
    primary: "border-primary",
    secondary: "border-muted-foreground",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-t-transparent",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {text && (
        <p
          className={cn(
            "mt-2 text-center text-muted-foreground",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base"
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
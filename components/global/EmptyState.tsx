import React from "react";
import { Box, Inbox, FilePlus, Trash2 } from "lucide-react";

interface EmptyStateProps {
  message: string | React.ReactNode;
  icon?: "box" | "inbox" | "file" | "trash" | "custom";
  customIcon?: React.ReactNode;
  description?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon = "box",
  customIcon,
  description,
  className = "",
}) => {
  const renderIcon = () => {
    switch (icon) {
      case "box":
        return <Box className="w-16 h-16 text-gray-300" strokeWidth={1.5} />;
      case "inbox":
        return <Inbox className="w-16 h-16 text-gray-300" strokeWidth={1.5} />;
      case "file":
        return (
          <FilePlus className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
        );
      case "trash":
        return <Trash2 className="w-16 h-16 text-gray-300" strokeWidth={1.5} />;
      case "custom":
        return customIcon;
      default:
        return <Box className="w-16 h-16 text-gray-300" strokeWidth={1.5} />;
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center h-80 p-6 ${className}`}
    >
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="mb-4">
          {icon === "custom" ? (
            customIcon
          ) : (
            <div className="animate-pulse">{renderIcon()}</div>
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">{message}</h3>
        {description && (
          <p className="text-sm text-gray-500 mb-6">{description}</p>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

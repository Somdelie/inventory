"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  onSubmit: () => Promise<string | void>;
  buttonText?: string;
}

// Reusable form card component
export const FormCard = ({
  title,
  children,
  onSubmit,
  buttonText,
}: FormCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await onSubmit();

      // Only show success toast if there's no return value
      // or if it doesn't contain "No changes needed"
      if (!result) {
        toast.success(`${title} updated successfully`);
      } else if (!result.includes("No changes needed")) {
        toast.success(`${result} updated successfully`);
      } else {
        toast.success(result);
      }
    } catch (error) {
      // Error toasts are handled in the individual update functions
      // so we don't need to show a generic one here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="justify-end">
        <Button disabled={isLoading} onClick={handleSubmit}>
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Updating...
            </span>
          ) : (
            buttonText || `Update ${title}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

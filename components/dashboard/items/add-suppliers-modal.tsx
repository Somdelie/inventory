"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addSuppliersToItem } from "@/actions/item-suppliers";
import { toast } from "sonner";
import SupplierSkeleton from "./SupplierSkeleton";
import { DialogDescription } from "@radix-ui/react-dialog";

interface Suppliers {
    id: string;
    name: string;
}

const AddSuppliersModal = ({
    itemId,
    suppliers,
    existingSupplierIds = [],
    }: {
    itemId: string | undefined;
    suppliers: Suppliers[];
    existingSupplierIds?: string[];
}) => {
  const [open, setOpen] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset selections when modal is opened/closed
  useEffect(() => {
    if (!open) {
      setSelectedSuppliers([]);
      setSearchQuery("");
    }
  }, [open]);

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSuppliers((prev) => {
      if (prev.includes(supplierId)) {
        return prev.filter((id) => id !== supplierId);
      } else {
        return [...prev, supplierId];
      }
    });
  };

  const handleAddSuppliers = async () => {
    if (selectedSuppliers.length === 0 || !itemId) return;
    setIsLoading(true);
    try {
      const response = await addSuppliersToItem(itemId, selectedSuppliers);
      
      if (response?.status === 200) {
        toast.success(response.message || "Suppliers added successfully!");
        setOpen(false);
        // Force a page refresh to show the updated supplier list
        // window.location.reload();
      } else {
        toast.error(response?.message || "Failed to add suppliers");
      }
    } catch (error) {
      console.error("Failed to add suppliers:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter suppliers based on search query and exclude existing suppliers
  const filteredSuppliers = suppliers
    .filter((supplier) => 
      Boolean(supplier.id) && 
      !existingSupplierIds.includes(supplier.id) &&
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const hasAvailableSuppliers = filteredSuppliers.length > 0;
  const allSuppliersFiltered = searchQuery && filteredSuppliers.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={suppliers.length === 0}>Add Supplier</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Suppliers</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select suppliers to associate with this item.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <ScrollArea className="h-72">
          {isLoading ? (
            <SupplierSkeleton count={5} className="h-20" />
          ) : !hasAvailableSuppliers ? (
            <div className="flex justify-center items-center h-full">
              {allSuppliersFiltered ? (
                <p className="text-sm text-muted-foreground text-center">
                  No suppliers match your search
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  All suppliers are already associated with this item
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center space-x-2 rounded-md border px-3 py-2 hover:bg-accent"
                >
                  <Checkbox
                    id={`supplier-${supplier.id}`}
                    checked={selectedSuppliers.includes(supplier.id)}
                    onCheckedChange={() => handleSupplierToggle(supplier.id)}
                  />
                  <label
                    htmlFor={`supplier-${supplier.id}`}
                    className="text-sm font-medium flex-1 cursor-pointer"
                  >
                    {supplier.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedSuppliers.length} suppliers selected
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSuppliers}
              disabled={selectedSuppliers.length === 0 || isLoading}
            >
              {isLoading ? "Adding..." : "Add Selected"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSuppliersModal;
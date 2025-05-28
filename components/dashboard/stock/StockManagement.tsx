"use client"

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  MapPin, 
  ArrowRight, 
  Plus, 
  Minus,
  Warehouse,
  AlertCircle,
  Info,
  RotateCcw,
  Building2,
  ArrowLeftRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InventoryItem, Item } from '@/types/itemTypes';
import { transferInventory } from '@/actions/inventory';
import toast from 'react-hot-toast';


interface Location {
  id: string;
  name: string;
  type: string;
}

interface InventoryManagementClientProps {
  initialItems: InventoryItem[]; // Changed from Item[] to InventoryItem[]
  locations: Location[];
}

export default function InventoryManagementClient({ 
  initialItems, 
  locations 
}: InventoryManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transferData, setTransferData] = useState({
    fromLocationId: '',
    toLocationId: '',
    quantity: 1
  });

  const filteredItems = initialItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalStock = (item: InventoryItem) => {
    return item.inventories?.reduce((total, inv) => total + inv.quantity, 0) ?? 0;
  };

  const getAvailableStock = (item: InventoryItem) => {
    return item.inventories?.reduce((total, inv) => total + (inv.quantity - inv.reservedQuantity), 0) ?? 0;
  };

  const getTotalReserved = (item: InventoryItem) => {
    return item.inventories?.reduce((total, inv) => total + inv.reservedQuantity, 0) ?? 0;
  };

  const getStockStatus = (totalStock: number) => {
    if (totalStock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-300' };
    if (totalStock <= 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const handleTransfer = async () => {
    if (!selectedItem || !canTransfer()) return;

    setIsLoading(true);
    
    try {
     
      const response = await transferInventory({
        itemId: selectedItem.id,
        fromLocationId: transferData.fromLocationId,
        toLocationId: transferData.toLocationId,
        quantity: transferData.quantity,
      });

      if (response.success) {
        toast.success('Stock Transferred Successfully💐')
      } else {
        console.error('Transfer failed');
        toast.error('Failed to transfer stock. Please try again.');
      }
    } catch (error) {
      console.error('Error transferring stock:', error);
    } finally {
      setIsLoading(false);
      setIsTransferModalOpen(false);
      setTransferData({ fromLocationId: '', toLocationId: '', quantity: 1 });
    }
  };

  const canTransfer = () => {
    if (!transferData.fromLocationId || !transferData.toLocationId || transferData.quantity <= 0) {
      return false;
    }
    
    const fromLocation = selectedItem?.inventories?.find(inv => inv.locationId === transferData.fromLocationId);
    return fromLocation && (fromLocation.quantity - fromLocation.reservedQuantity) >= transferData.quantity;
  };

  const getMaxTransferQuantity = () => {
    if (!transferData.fromLocationId || !selectedItem) return 0;
    const fromLocation = selectedItem.inventories?.find(inv => inv.locationId === transferData.fromLocationId);
    return fromLocation ? fromLocation.quantity - fromLocation.reservedQuantity : 0;
  };

  const getLocationName = (inventory: any) => {
    // Handle both locationName property and location.name nested property
    return inventory.locationName || inventory.location?.name || 'Unknown Location';
  };

  // Helper function to get unique inventories by locationId
  const getUniqueInventories = (inventories: any[]) => {
    const seen = new Set();
    return inventories.filter(inv => {
      if (seen.has(inv.locationId)) {
        return false;
      }
      seen.add(inv.locationId);
      return true;
    });
  };

  // Helper function to get available locations for transfer
  const getAvailableTransferLocations = () => {
    if (!selectedItem?.inventories) return [];
    
    return selectedItem.inventories
      .filter(inv => inv.quantity - inv.reservedQuantity > 0)
      .reduce((unique: any[], inv) => {
        // Check if this locationId already exists in our unique array
        if (!unique.find(u => u.locationId === inv.locationId)) {
          unique.push(inv);
        }
        return unique;
      }, []);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Column - Items List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Inventory Items ({initialItems.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No items found</p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredItems.map((item) => {
                const totalStock = getTotalStock(item);
                const stockStatus = getStockStatus(totalStock);
                
                return (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedItem?.id === item.id ? 'ring-2 ring-blue-500 shadow-md' : ''
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm mb-1">{item.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{item.sku}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs px-2 py-1 ${stockStatus.color}`}>
                              {stockStatus.label}
                            </Badge>
                            <span className="text-xs text-gray-500">{item.category?.title || 'No Category'}</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-semibold">{totalStock}</div>
                          <div className="text-xs text-gray-500">{item.unitOfMeasure || 'Units'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Item Details */}
      <div className="flex-1 flex flex-col">
        {!selectedItem ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <Warehouse className="h-24 w-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Item</h3>
              <p className="text-gray-500">Choose an item from the list to view its inventory details and manage stock transfers</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedItem.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {selectedItem.sku}
                    </span>
                    <span>{selectedItem.category?.title || 'No Category'}</span>
                    <span>{selectedItem.unitOfMeasure || 'Units'}</span>
                  </div>
                  {selectedItem.description && (
                    <p className="text-gray-700 mt-2">{selectedItem.description}</p>
                  )}
                </div>
                <Button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="gap-2"
                  disabled={getAvailableStock(selectedItem) === 0 || !selectedItem.inventories?.length}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Transfer Stock
                </Button>
              </div>
            </div>

            {/* Stock Summary */}
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{getTotalStock(selectedItem)}</div>
                    <div className="text-sm text-blue-600">Total Stock</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{getAvailableStock(selectedItem)}</div>
                    <div className="text-sm text-green-600">Available</div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">{getTotalReserved(selectedItem)}</div>
                    <div className="text-sm text-orange-600">Reserved</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">{getUniqueInventories(selectedItem.inventories || []).length}</div>
                    <div className="text-sm text-purple-600">Locations</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Location Details */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Stock by Location
              </h3>
              
              <div className="space-y-4">
                {selectedItem.inventories?.length ? (
                  getUniqueInventories(selectedItem.inventories).map((location, index) => {
                    const available = location.quantity - location.reservedQuantity;
                    const locationName = getLocationName(location);
                    
                    return (
                      <Card key={`${location.locationId}-${index}`} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-gray-600" />
                              <h4 className="font-medium">{locationName}</h4>
                            </div>
                            {location.quantity === 0 && (
                              <Badge className="bg-red-100 text-red-800 border-red-300">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="text-xl font-bold text-gray-900">{location.quantity}</div>
                              <div className="text-xs text-gray-600">Total Quantity</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-700">{available}</div>
                              <div className="text-xs text-green-600">Available</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-xl font-bold text-orange-700">{location.reservedQuantity}</div>
                              <div className="text-xs text-orange-600">Reserved</div>
                            </div>
                          </div>

                          {location.reservedQuantity > 0 && (
                            <Alert className="mt-3">
                              <Info className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {location.reservedQuantity} units are reserved for pending orders
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Warehouse className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No inventory locations found for this item</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transfer Stock Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Transfer Stock
            </DialogTitle>
            <DialogDescription>
              Transfer {selectedItem?.name} between locations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From Location</label>
              <Select 
                value={transferData.fromLocationId} 
                onValueChange={(value) => setTransferData({ ...transferData, fromLocationId: value, quantity: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source location" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTransferLocations().length > 0 ? (
                    getAvailableTransferLocations().map((inv, index) => (
                      <SelectItem key={`from-${inv.locationId}-${index}`} value={inv.locationId}>
                        {getLocationName(inv)} ({inv.quantity - inv.reservedQuantity} available)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No locations available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Location</label>
              <Select 
                value={transferData.toLocationId} 
                onValueChange={(value) => setTransferData({ ...transferData, toLocationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination location" />
                </SelectTrigger>
                <SelectContent>
                  {locations
                    .filter(loc => loc.id !== transferData.fromLocationId)
                    .map((location, index) => (
                      <SelectItem key={`to-${location.id}-${index}`} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantity to Transfer
                {transferData.fromLocationId && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Max: {getMaxTransferQuantity()})
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransferData({ 
                    ...transferData, 
                    quantity: Math.max(1, transferData.quantity - 1) 
                  })}
                  disabled={transferData.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({ 
                    ...transferData, 
                    quantity: Math.max(1, Math.min(getMaxTransferQuantity(), parseInt(e.target.value) || 1))
                  })}
                  className="text-center w-20"
                  min="1"
                  max={getMaxTransferQuantity()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTransferData({ 
                    ...transferData, 
                    quantity: Math.min(getMaxTransferQuantity(), transferData.quantity + 1) 
                  })}
                  disabled={transferData.quantity >= getMaxTransferQuantity()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {transferData.fromLocationId && transferData.toLocationId && (
              <Alert>
                <ArrowRight className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Transfer <strong>{transferData.quantity}</strong> units from{' '}
                  <strong>
                    {selectedItem?.inventories?.find(inv => inv.locationId === transferData.fromLocationId) && 
                      getLocationName(selectedItem.inventories.find(inv => inv.locationId === transferData.fromLocationId)!)
                    }
                  </strong>{' '}
                  to{' '}
                  <strong>
                    {locations.find(loc => loc.id === transferData.toLocationId)?.name}
                  </strong>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransfer} disabled={!canTransfer() || isLoading}>
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              {isLoading ? 'Transferring...' : 'Transfer Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
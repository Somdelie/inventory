'use client'

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createSalesOrder, getItemsForOrder, getLocationsForOrder } from '@/actions/sales-orders';

const OrderLineSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
});

const CreateOrderSchema = z.object({
  locationId: z.string().optional(),
  source: z.enum(['POS', 'SALES_ORDER']),
  notes: z.string().optional(),
  lines: z.array(OrderLineSchema).min(1, 'At least one item is required'),
});

type CreateOrderForm = z.infer<typeof CreateOrderSchema>;

interface CreateOrderModalProps {
  customer: {
    id: string;
    name: string;
    organizationId: string;
  };
  createdBy: string;
  onOrderCreated?: () => void;
  children: React.ReactNode;
}

interface Item {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  tax: number | null;
  category: { title: string } | null;
  brand: { name: string } | null;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  customer,
  createdBy,
  onOrderCreated,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [itemSearch, setItemSearch] = useState('');

  const form = useForm<CreateOrderForm>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: {
      source: 'SALES_ORDER',
      lines: [{ itemId: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });

  // Load items and locations when modal opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [itemsResponse, locationsResponse] = await Promise.all([
        getItemsForOrder(customer.organizationId),
        getLocationsForOrder(customer.organizationId)
      ]);

      if (itemsResponse.success) {
        setItems(itemsResponse.items);
      }
      if (locationsResponse.success) {
        setLocations(locationsResponse.locations);
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = items.find(item => item.id === itemId);
    if (selectedItem) {
      form.setValue(`lines.${index}.itemId`, itemId);
      form.setValue(`lines.${index}.unitPrice`, selectedItem.sellingPrice);
      form.setValue(`lines.${index}.taxRate`, selectedItem.tax || 0);
    }
  };

  const calculateLineTotal = (index: number) => {
    const line = form.watch(`lines.${index}`);
    if (!line) return 0;
    
    const subtotal = line.quantity * line.unitPrice;
    const discount = line.discount || 0;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * ((line.taxRate || 0) / 100);
    return afterDiscount + tax;
  };

  const calculateOrderTotal = () => {
    const lines = form.watch('lines');
    return lines.reduce((total, line, index) => {
      const subtotal = line.quantity * line.unitPrice;
      const discount = line.discount || 0;
      const afterDiscount = subtotal - discount;
      const tax = afterDiscount * ((line.taxRate || 0) / 100);
      return total + afterDiscount + tax;
    }, 0);
  };

  const onSubmit = async (data: CreateOrderForm) => {
    setIsSubmitting(true);
    try {
      const result = await createSalesOrder({
        customerId: customer.id,
        organizationId: customer.organizationId,
        createdBy,
        ...data,
      });

      if (result.success) {
        toast.success('Order created successfully!');
        setOpen(false);
        form.reset();
        onOrderCreated?.();
      } else {
        toast.error(result.error || 'Failed to create order');
      }
    } catch (error) {
      toast.error('An error occurred while creating the order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order for {customer.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SALES_ORDER">Sales Order</SelectItem>
                          <SelectItem value="POS">Point of Sale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({location.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any notes for this order..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ itemId: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Item Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search items by name or SKU..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Order Lines */}
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name={`lines.${index}.itemId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item</FormLabel>
                            <Select onValueChange={(value) => handleItemSelect(index, value)} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select item" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {filteredItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{item.name}</span>
                                      <span className="text-sm text-gray-500">
                                        {item.sku} • ${item.sellingPrice} • Stock: {item.quantity}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`lines.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`lines.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1">
                      <FormField
                        control={form.control}
                        name={`lines.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax%</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`lines.${index}.discount`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-1 flex items-center justify-between">
                      <div className="text-sm font-medium">
                        ${calculateLineTotal(index).toFixed(2)}
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Order Total */}
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      Total: ${calculateOrderTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Order...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderModal;
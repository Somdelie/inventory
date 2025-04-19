// // components/ui/groups/product-listing-suspense.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { format } from "date-fns";
// import * as XLSX from "xlsx";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { toast } from "sonner";
// import { Car, DollarSign } from "lucide-react";
// import { useSession } from "next-auth/react";
// import {
//   DataTable,
//   Column,
//   TableActions,
//   EntityForm,
//   ConfirmationDialog,
// } from "@/components/ui/data-table";
// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   useSuspenseProducts,
//   useCreateProduct,
//   useUpdateProduct,
//   useDeleteProduct,
// } from "@/hooks/useProductQueries";
// import type { Product } from "@/types/product";

// interface ProductDetailProps {
//   title: string;
// }

// // Form schema for editing/adding products
// const productFormSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   price: z.string().min(1, "Price is required"),
//   numberPlate: z.string().min(1, "Number plate is required"),
// });

// type ProductFormValues = z.infer<typeof productFormSchema>;

// export default function ProductDetail({ title }: ProductDetailProps) {
//   // React Query hooks with Suspense - note that data is always defined
//   const { products, refetch } = useSuspenseProducts();
//   const createProductMutation = useCreateProduct();
//   const updateProductMutation = useUpdateProduct();
//   const deleteProductMutation = useDeleteProduct();

//   // Local state
//   const [formDialogOpen, setFormDialogOpen] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [isExporting, setIsExporting] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
//   const [productToDelete, setProductToDelete] = useState<Product | null>(null);

//   // Form for editing/adding products
//   const form = useForm<ProductFormValues>({
//     resolver: zodResolver(productFormSchema),
//     defaultValues: {
//       name: "",
//       price: "",
//       numberPlate: "",
//     },
//   });

//   // Update form when current product changes
//   useEffect(() => {
//     if (!currentProduct) {
//       // Adding new - reset form
//       form.reset({
//         name: "",
//         price: "",
//         numberPlate: "",
//       });
//     } else {
//       // Editing existing - populate form
//       form.reset({
//         name: currentProduct.name,
//         price: currentProduct.price,
//         numberPlate: currentProduct.numberPlate,
//       });
//     }
//   }, [currentProduct, form]);

//   const { data: session } = useSession();

//   // Format date function
//   const formatDate = (date: Date | string) => {
//     const dateObj = typeof date === "string" ? new Date(date) : date;
//     return format(dateObj, "MMM dd, yyyy");
//   };

//   // Format currency
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-UG", {
//       style: "currency",
//       currency: "UGX",
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   // Export to Excel
//   const handleExport = async (filteredProducts: Product[]) => {
//     setIsExporting(true);
//     try {
//       // Prepare data for export
//       const exportData = filteredProducts.map((product) => ({
//         Name: product.name,
//         "Number Plate": product.numberPlate,
//         Price: product.price,
//         "Sales Count": product.salesCount,
//         "Total Sales": formatCurrency(product.salesTotal),
//         "Date Added": formatDate(product.createdAt),
//       }));

//       // Create workbook and worksheet
//       const worksheet = XLSX.utils.json_to_sheet(exportData);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

//       // Generate filename with current date
//       const fileName = `Products_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

//       // Export to file
//       XLSX.writeFile(workbook, fileName);

//       toast.success("Export successful", {
//         description: `Products exported to ${fileName}`,
//       });
//     } catch (error) {
//       toast.error("Export failed", {
//         description:
//           error instanceof Error ? error.message : "Unknown error occurred",
//       });
//     } finally {
//       setIsExporting(false);
//     }
//   };

//   // Handle add new click
//   const handleAddClick = () => {
//     setCurrentProduct(null);
//     setFormDialogOpen(true);
//   };

//   // Handle edit click
//   const handleEditClick = (product: Product) => {
//     setCurrentProduct(product);
//     setFormDialogOpen(true);
//   };

//   // Handle delete click
//   const handleDeleteClick = (product: Product) => {
//     setProductToDelete(product);
//     setDeleteDialogOpen(true);
//   };

//   // Handle form submission (edit or add)
//   const onSubmit = async (data: ProductFormValues) => {
//     if (!currentProduct) {
//       // Add new product
//       createProductMutation.mutate(data);
//     } else {
//       // Edit existing product
//       updateProductMutation.mutate({
//         id: currentProduct.id,
//         data,
//       });
//     }
//   };

//   // Handle confirming delete
//   const handleConfirmDelete = () => {
//     if (productToDelete) {
//       deleteProductMutation.mutate(productToDelete.id);
//     }
//   };

//   // Calculate total products value
//   const getTotalValue = (products: Product[]) => {
//     return products.reduce((total, product) => {
//       const price = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
//       return total + price;
//     }, 0);
//   };

//   // Define columns for the data table
//   const columns: Column<Product>[] = [
//     {
//       header: "Name",
//       accessorKey: "name",
//       cell: (row) => <span className="font-medium">{row.name}</span>,
//     },
//     {
//       header: "Number Plate",
//       accessorKey: "numberPlate",
//     },
//     {
//       header: "Price",
//       accessorKey: "price",
//     },
//     {
//       header: "Sales Count",
//       accessorKey: "salesCount",
//     },
//     {
//       header: "Total Sales",
//       accessorKey: (row) => formatCurrency(row.salesTotal),
//     },
//     {
//       header: "Date Added",
//       accessorKey: (row) => formatDate(row.createdAt),
//     },
//   ];

//   // Generate subtitle with total value
//   const getSubtitle = (productCount: number, totalValue: number) => {
//     return `${productCount} ${
//       productCount === 1 ? "product" : "products"
//     } | Total Value: ${formatCurrency(totalValue)}`;
//   };

//   return (
//     <>
//       <DataTable<Product>
//         title={title}
//         subtitle={
//           products.length > 0
//             ? getSubtitle(products.length, getTotalValue(products))
//             : undefined
//         }
//         data={products}
//         columns={columns}
//         keyField="id"
//         isLoading={false} // With Suspense, we're guaranteed to have data
//         onRefresh={refetch}
//         actions={{
//           onAdd: handleAddClick,
//           onExport: handleExport,
//         }}
//         filters={{
//           searchFields: ["name", "numberPlate"],
//           enableDateFilter: true,
//           getItemDate: (item) => item.createdAt,
//         }}
//         renderRowActions={(item) => (
//           <TableActions.RowActions
//             onEdit={() => handleEditClick(item)}
//             onDelete={() => handleDeleteClick(item)}
//             isDeleting={
//               deleteProductMutation.isPending && productToDelete?.id === item.id
//             }
//           />
//         )}
//       />

//       {/* Product Form Dialog */}
//       <EntityForm
//         open={formDialogOpen}
//         onOpenChange={setFormDialogOpen}
//         title={currentProduct ? "Edit Product" : "Add New Product"}
//         form={form}
//         onSubmit={onSubmit}
//         isSubmitting={
//           createProductMutation.isPending || updateProductMutation.isPending
//         }
//         submitLabel={currentProduct ? "Save Changes" : "Add Product"}
//       >
//         <FormField
//           control={form.control}
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Product Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="Enter product name" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="price"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Price</FormLabel>
//               <FormControl>
//                 <div className="relative">
//                   <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input placeholder="25,000,000" className="pl-8" {...field} />
//                 </div>
//               </FormControl>
//               <FormDescription>Enter the product price in UGX</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="numberPlate"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Number Plate</FormLabel>
//               <FormControl>
//                 <div className="relative">
//                   <Car className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     placeholder="UAX 123B"
//                     className="pl-8"
//                     {...field}
//                     disabled={!!currentProduct}
//                   />
//                 </div>
//               </FormControl>
//               <FormDescription>
//                 {!currentProduct
//                   ? "Enter the unique number plate for this product"
//                   : "Number plate cannot be changed after creation"}
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </EntityForm>

//       {/* Delete Confirmation Dialog */}
//       <ConfirmationDialog
//         open={deleteDialogOpen}
//         onOpenChange={setDeleteDialogOpen}
//         title="Delete Product"
//         description={
//           productToDelete ? (
//             <>
//               Are you sure you want to delete{" "}
//               <strong>{productToDelete.name}</strong> (
//               {productToDelete.numberPlate})? This action cannot be undone.
//             </>
//           ) : (
//             "Are you sure you want to delete this product?"
//           )
//         }
//         onConfirm={handleConfirmDelete}
//         isConfirming={deleteProductMutation.isPending}
//         confirmLabel="Delete"
//         variant="destructive"
//       />
//     </>
//   );
// }

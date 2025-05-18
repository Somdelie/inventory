'use client'
import React, { useState, useEffect } from 'react';
import { Camera, PackageCheck, Clock, Calendar, Truck, FileText, CreditCard, Info, Printer, CheckCircle, Receipt } from 'lucide-react';
import { confirmPurchaseOrder, getPurchaseOrderById, getPurchaseOrderLineItems } from '@/actions/purchase-orders';
import Logo from '../global/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

// Define the primary color - brand red to match the email template
const PRIMARY_COLOR = '#e11d48';

// Helper function to format price
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
    }).format(price);
};

// Format date to local string
const formatDate = (dateString: string | Date): string => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-ZA');
};

// Type definitions
interface OrderItem {
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface ContactInfo {
    email: string;
    phone: string;
}

interface InvoiceData {
    id: string;
    invoiceNumber: string;
    dueDate: string | Date;
    totalAmount: number;
}

interface OrderData {
    id: string;
    poNumber: string;
    orderDate: string;
    date: Date;
    expectedDeliveryDate: string;
    companyName: string;
    companyLogo: string;
    supplierName: string;
    supplierEmail: string;
    supplierPhone: string;
    items: OrderItem[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paymentTerms: string;
    deliveryAddress: string;
    contactInfo: ContactInfo;
    notes: string;
    status: string;
}


interface ConfirmPurchaseOrderFormProps {
    params: Promise<{ id: string }>;
    token: string;
}

const ConfirmPurchaseOrderForm: React.FC<ConfirmPurchaseOrderFormProps> = ({ params, token }) => {
    const [status, setStatus] = useState('pending');
    const [notes, setNotes] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Get the ID from params
                const { id } = await params;
                
                // Fetch purchase order data
                const purchaseOrder = await getPurchaseOrderById(id);
                
                if (!purchaseOrder) {
                    setError('Purchase order not found');
                    return;
                }

                // Fetch line items
                const lineItems = await getPurchaseOrderLineItems(id);
                
                // Format the data
                const formattedItems = lineItems.map(line => ({
                    name: line.item?.name || 'Unknown Product',
                    sku: line.item?.sku || '',
                    quantity: line.quantity,
                    unitPrice: line.unitPrice,
                    total: line.totalPrice
                }));

                // Format dates
                const formattedDate = purchaseOrder.date
                    ? new Date(purchaseOrder.date).toLocaleDateString('en-ZA')
                    : new Date().toLocaleDateString('en-ZA');

                const expectedDeliveryDate = purchaseOrder.expectedDeliveryDate
                    ? new Date(purchaseOrder.expectedDeliveryDate).toISOString().split('T')[0]
                    : '';

                // Set delivery date state
                setDeliveryDate(expectedDeliveryDate);

                // Build the delivery address
                const deliveryLocation = purchaseOrder.deliveryLocation || purchaseOrder.Location;
                const deliveryAddress = deliveryLocation
                    ? `${deliveryLocation.name}${deliveryLocation.address ? `, ${deliveryLocation.address}` : ''}`
                    : '';

                // Prepare the order data
                const formattedOrderData: OrderData = {
                    id: purchaseOrder.id,
                    poNumber: purchaseOrder.poNumber,
                    orderDate: formattedDate,
                    date: purchaseOrder.date,
                    expectedDeliveryDate: expectedDeliveryDate,
                    companyName: purchaseOrder.organization?.name || 'Food Lovers',
                    companyLogo: '/api/placeholder/120/40', // Default placeholder
                    supplierName: purchaseOrder.supplier?.name || purchaseOrder.supplierName || '',
                    supplierEmail: purchaseOrder.supplier?.email || purchaseOrder.supplierEmail || '',
                    supplierPhone: purchaseOrder.supplier?.phone || purchaseOrder.supplierPhone || '',
                    items: formattedItems,
                    subtotal: purchaseOrder.subtotal,
                    taxAmount: purchaseOrder.taxAmount,
                    totalAmount: purchaseOrder.totalAmount,
                    paymentTerms: purchaseOrder.paymentTerms || 'Not specified',
                    deliveryAddress: deliveryAddress || '',
                    contactInfo: {
                        email: purchaseOrder.createdBy?.email || 'admin@cautiousndlovu.co.za',
                        phone: purchaseOrder.createdBy?.phone || '0603121981'
                    },
                    notes: purchaseOrder.notes || '',
                    status: purchaseOrder.status
                };

                setOrderData(formattedOrderData);
                setItems(formattedItems);
                
                // Set initial status based on purchase order status
                if (purchaseOrder.status === 'APPROVED') {
                    setStatus('confirmed');
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('An error occurred while fetching data. Please try again later.');
                setLoading(false);
            }
        }

        fetchData();
    }, [params]);

    const handleConfirm = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!orderData) return;
        
        setIsSubmitting(true);
        
        try {
            // Call the server action to confirm the purchase order
            const result = await confirmPurchaseOrder(orderData.id, deliveryDate, notes);
            
            if (result.success) {
                setStatus('confirmed');
                
                // Save invoice data if it was returned
                if (result.data?.invoice) {
                    setInvoiceData({
                        id: result.data.invoice.id,
                        invoiceNumber: result.data.invoice.invoiceNumber,
                        dueDate: result.data.invoice.dueDate,
                        totalAmount: result.data.invoice.totalAmount
                    });
                }
                
                console.log('Order confirmed successfully:', result);
            } else {
                setError(result.message || 'Failed to confirm order');
                console.error('Failed to confirm order:', result.message);
            }
        } catch (err) {
            setError('An error occurred while confirming the order. Please try again.');
            console.error('Error confirming order:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700 mx-auto"></div>
                    <p className="mt-4 text-gray-700">Loading purchase order details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Purchase Order Not Found</h1>
                    <p className="text-gray-600">
                        The purchase order you are looking for could not be found. Please check the URL and try again.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="">

            <main className="max-w-[90%]  mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
                {/* Status Banner */}
                <div className={`mb-6 p-4 rounded-lg flex items-center ${
                    status === 'confirmed' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                    <div className="rounded-full p-2 mr-3" style={{ backgroundColor: status === 'confirmed' ? '#d1fae5' : '#fef3c7' }}>
                        {status === 'confirmed' ? (
                            <CheckCircle size={24} className="text-green-600" />
                        ) : (
                            <Clock size={24} className="text-yellow-600" />
                        )}
                    </div>
                    <div>
                        <h2 className={`font-medium ${status === 'confirmed' ? 'text-green-800' : 'text-yellow-800'}`}>
                            {status === 'confirmed' ? 'Order Confirmed' : 'Awaiting Confirmation'}
                        </h2>
                        <p className={`text-sm ${status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {status === 'confirmed' 
                                ? `Purchase order ${orderData.poNumber} has been confirmed successfully.` 
                                : `Please review and confirm purchase order ${orderData.poNumber}.`}
                        </p>
                    </div>
                </div>

                {status === 'confirmed' ? (
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex items-center mb-2">
                                        <Calendar size={18} className="mr-2 text-gray-500" />
                                        <h3 className="text-md font-medium text-gray-900">Confirmed Delivery Date</h3>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-ZA') : 'Not specified'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <div className="flex items-center mb-2">
                                        <CheckCircle size={18} className="mr-2 text-gray-500" />
                                        <h3 className="text-md font-medium text-gray-900">Confirmation Date</h3>
                                    </div>
                                    <p className="text-sm text-gray-700">{new Date().toLocaleDateString('en-ZA')}</p>
                                </div>
                            </div>

                            {/* Invoice Information Section - New */}
                            {invoiceData && (
                                <div className="mb-8 border border-green-200 bg-green-50 rounded-lg overflow-hidden">
                                    <div className="bg-green-100 px-6 py-4 border-b border-green-200">
                                        <div className="flex items-center">
                                            <Receipt size={24} className="mr-3 text-green-600" />
                                            <div>
                                                <h2 className="text-lg font-medium text-green-800">Invoice Sent</h2>
                                                <p className="text-sm text-green-700">
                                                    An invoice has sent to your customer for this purchase order.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Invoice Number</p>
                                                <p className="text-lg font-bold text-gray-900">{invoiceData.invoiceNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Due Date</p>
                                                <p className="text-lg font-bold text-gray-900">{formatDate(invoiceData.dueDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                                <p className="text-lg font-bold text-green-600">{formatPrice(invoiceData.totalAmount)}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-end">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                                onClick={() => window.open(`/invoices/${invoiceData.id}`, '_blank')}
                                            >
                                                <Receipt className="h-4 w-4 mr-2" />
                                                View Invoice
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <div className="flex items-center mb-3">
                                        <CreditCard size={18} className="mr-2" style={{ color: PRIMARY_COLOR }} />
                                        <h3 className="text-md font-medium text-gray-900">Payment Terms</h3>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-700">{orderData.paymentTerms}</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center mb-3">
                                        <Truck size={18} className="mr-2" style={{ color: PRIMARY_COLOR }} />
                                        <h3 className="text-md font-medium text-gray-900">Delivery Information</h3>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-700">{orderData.deliveryAddress || 'Not specified'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* {notes && (
                                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                                    <div className="flex items-center mb-2">
                                        <Info size={18} className="mr-2 text-gray-500" />
                                        <h3 className="text-md font-medium text-gray-900">Additional Notes</h3>
                                    </div>
                                    <p className="text-sm text-gray-700">{notes}</p>
                                </div>
                            )} */}

                            {notes && (
                                <Card className="mb-6 bg-yellow-50 rounded">
                                   <CardHeader>
                                    <CardTitle className="text-md font-medium text-gray-900">
                                        Additional Notes
                                    </CardTitle>
                                    <CardContent className='p-0'>
                                      
                                            {notes}
                                       
                                    </CardContent>
                                   </CardHeader>
                                </Card>
                            )}

                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-gray-500 text-sm">Thank you for confirming this purchase order.</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        onClick={() => window.print()}
                                    >
                                        <Printer size={18} className="mr-2 text-gray-500" />
                                        Print Confirmation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="border-b border-gray-100 bg-gray-50">
                            <div className="px-6 py-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <PackageCheck size={24} className="mr-3" style={{ color: PRIMARY_COLOR }} />
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">Purchase Order: {orderData.poNumber}</h2>
                                        <p className="text-sm text-gray-500">Date: {orderData.orderDate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{orderData.companyName}</p>
                                    <p className="text-xs text-gray-500">{orderData.deliveryAddress || 'No delivery address specified'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-8">
                                <div className="flex items-center mb-3">
                                    <FileText size={18} className="mr-2" style={{ color: PRIMARY_COLOR }} />
                                    <h3 className="text-md font-medium text-gray-900">Supplier Information</h3>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p className="text-sm font-medium text-gray-900">{orderData.supplierName}</p>
                                    <div className="mt-2 flex flex-col sm:flex-row text-sm text-gray-500">
                                        {orderData.supplierEmail && (
                                            <p className="flex items-center mr-6 mb-2 sm:mb-0">
                                                <span className="font-medium mr-1">Email:</span> {orderData.supplierEmail}
                                            </p>
                                        )}
                                        {orderData.supplierPhone && (
                                            <p className="flex items-center">
                                                <span className="font-medium mr-1">Phone:</span> {orderData.supplierPhone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center mb-3">
                                    <PackageCheck size={18} className="mr-2" style={{ color: PRIMARY_COLOR }} />
                                    <h3 className="text-md font-medium text-gray-900">Order Items</h3>
                                </div>
                                <div className="overflow-x-auto bg-gray-50 p-4 rounded-md">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Item
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Qty
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Unit Price
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {items.length > 0 ? items.map((item, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {item.name}
                                                        {item.sku && <div className="text-xs text-gray-500 mt-1">SKU: {item.sku}</div>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                        {formatPrice(item.unitPrice)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                                        {formatPrice(item.total)}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No items found for this purchase order.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="mt-6 flex justify-end">
                                        <div className="w-full max-w-xs">
                                            <div className="flex justify-between text-sm py-2">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span className="text-gray-900">{formatPrice(orderData.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm py-2">
                                                <span className="text-gray-500">Tax</span>
                                                <span className="text-gray-900">{formatPrice(orderData.taxAmount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-medium py-2 border-t border-gray-200 mt-2 pt-2">
                                                <span className="text-gray-900">Total</span>
                                                <span style={{ color: PRIMARY_COLOR }} className="font-bold">
                                                    {formatPrice(orderData.totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {orderData.notes && (
                                <div className="mb-8">
                                    <div className="flex items-center mb-3">
                                        <Info size={18} className="mr-2" style={{ color: PRIMARY_COLOR }} />
                                        <h3 className="text-md font-medium text-gray-900">Order Notes</h3>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <p className="text-sm text-gray-700">{orderData.notes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-6">
                                <form onSubmit={handleConfirm} className="space-y-6">
                                    <div>
                                        <label htmlFor="expected-delivery" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Expected Delivery Date
                                        </label>
                                        <input
                                            type="date"
                                            id="expected-delivery"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            value={deliveryDate}
                                            onChange={(e) => setDeliveryDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Additional Notes (Optional)
                                        </label>
                                        <textarea
                                            id="notes"
                                            rows={3}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="Add any additional information or special instructions..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white disabled:opacity-70"
                                            style={{ backgroundColor: PRIMARY_COLOR }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={20} className="mr-2" />
                                                    Confirm Purchase Order
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-white mt-auto border-t border-gray-200">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-sm text-gray-500">
                        <p>
                            If you have any questions regarding this purchase order, please contact us at{' '}
                            <a href={`mailto:${orderData.contactInfo.email}`} className="text-blue-600 hover:underline">
                                {orderData.contactInfo.email}
                            </a>
                            {' '}or call{' '}
                            <a href={`tel:${orderData.contactInfo.phone}`} className="text-blue-600 hover:underline">
                                {orderData.contactInfo.phone}
                            </a>
                        </p>
                        <p className="mt-2">
                            &copy; {new Date().getFullYear()} {orderData.companyName}. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ConfirmPurchaseOrderForm;
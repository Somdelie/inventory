'use client'
import React, { useState } from 'react';
import { Camera, PackageCheck, Clock, Calendar, Truck, FileText, CreditCard, Info, Printer, CheckCircle } from 'lucide-react';

// Define the primary color - brand red to match the email template
const PRIMARY_COLOR = '#e11d48';

// Mock data for the purchase order
const orderData = {
  poNumber: 'PO-2025-05611',
  orderDate: 'May 11, 2025',
  expectedDeliveryDate: 'May 25, 2025',
  companyName: 'Acme Industries',
  companyLogo: '/api/placeholder/120/40',
  supplierName: 'Global Supplies Ltd',
  supplierEmail: 'orders@globalsupplies.com',
  supplierPhone: '+1 (555) 123-4567',
  items: [
    { name: 'Premium Widgets', sku: 'WDG-001', quantity: 50, unitPrice: 12.99, total: 649.50 },
    { name: 'Standard Gadgets', sku: 'GDG-002', quantity: 25, unitPrice: 24.99, total: 624.75 },
    { name: 'Deluxe Components', sku: 'CMP-003', quantity: 10, unitPrice: 75.00, total: 750.00 }
  ],
  subtotal: 2024.25,
  vat: 147.35,
  total: 2171.60,
  paymentTerms: 'Net 40',
  deliveryAddress: '123 Business Park, Suite 100, San Francisco, CA 94107',
  contactInfo: {
    email: 'purchasing@acmeindustries.com',
    phone: '+1 (555) 987-6543'
  },
  notes: 'Please ensure all items are packed separately and labeled according to SKU.'
};

// Helper function to format price
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
};

const ConfirmPurchaseOrderForm = () => {
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(orderData.expectedDeliveryDate || '');
  
interface OrderData {
    poNumber: string;
    orderDate: string;
    expectedDeliveryDate: string;
    companyName: string;
    companyLogo: string;
    supplierName: string;
    supplierEmail: string;
    supplierPhone: string;
    items: Array<{
        name: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    subtotal: number;
    vat: number;
    total: number;
    paymentTerms: string;
    deliveryAddress: string;
    contactInfo: {
        email: string;
        phone: string;
    };
    notes: string;
}

interface ConfirmData {
    poNumber: string;
    status: string;
    supplierNotes: string;
    confirmedDeliveryDate: string;
}

const handleConfirm = (e: React.FormEvent<HTMLFormElement>): void => {
    if (e) {
        e.preventDefault();
    }
    setStatus('confirmed');
    // In a real application, you would submit this data to your backend
    const confirmData: ConfirmData = {
        poNumber: orderData.poNumber,
        status: 'confirmed',
        supplierNotes: notes,
        confirmedDeliveryDate: deliveryDate
    };
    console.log(confirmData);
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header style={{ backgroundColor: PRIMARY_COLOR }} className="text-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Purchase Order Confirmation</h1>
              <p className="mt-1 text-white text-opacity-80">Verify and confirm your purchase order details</p>
            </div>
            {orderData.companyLogo && (
              <img src={orderData.companyLogo} alt={orderData.companyName} className="h-10" />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
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
                  <p className="text-sm text-gray-700">{deliveryDate}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <CheckCircle size={18} className="mr-2 text-gray-500" />
                    <h3 className="text-md font-medium text-gray-900">Confirmation Date</h3>
                  </div>
                  <p className="text-sm text-gray-700">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

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
                    <p className="text-sm text-gray-700">{orderData.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <Info size={18} className="mr-2 text-gray-500" />
                    <h3 className="text-md font-medium text-gray-900">Additional Notes</h3>
                  </div>
                  <p className="text-sm text-gray-700">{notes}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Thank you for confirming this purchase order.</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                  <p className="text-xs text-gray-500">{orderData.deliveryAddress}</p>
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
                      {orderData.items.map((item, index) => (
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
                      ))}
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
                        <span className="text-gray-900">{formatPrice(orderData.vat)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium py-2 border-t border-gray-200 mt-2 pt-2">
                        <span className="text-gray-900">Total</span>
                        <span style={{ color: PRIMARY_COLOR }} className="font-bold">
                          {formatPrice(orderData.total)}
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
                      className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white"
                      style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                      <CheckCircle size={20} className="mr-2" />
                      Confirm Purchase Order
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
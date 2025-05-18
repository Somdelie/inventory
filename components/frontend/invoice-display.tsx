'use client'
import React, { useRef } from 'react'
import html2pdf from 'html2pdf.js'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  Printer, 
  ArrowLeft, 
  Download, 
  Share2,
  CalendarDays
} from 'lucide-react'
import { Button } from '../ui/button'
import { formatPrice } from '@/lib/formatPrice'
import Logo from '../global/Logo'
import { Card,CardContent } from '../ui/card'

// Helper function to format date
const formatDate = (date: Date | string | null): string => {
  if (!date) return 'N/A'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-ZA')
}

interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  taxAmount: number
  totalPrice: number
}

interface InvoiceData {
  id: string
  invoiceNumber: string
  date: string | Date
  dueDate: string | Date
  status: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes: string | null
  purchaseOrder: {
    id: string
    poNumber: string
    date: string | Date
  }
  supplier: {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
  } | null
  organization: {
    id: string
    name: string
    country: string | null
  }
  lines: InvoiceLine[]
}

interface InvoiceResponse {
  data: InvoiceData | null
  error: string | null
  status: number
}

interface InvoiceDisplayProps {
  invoice: InvoiceResponse;
}

export default function InvoiceDisplay({ invoice }: InvoiceDisplayProps) {
  const router = useRouter()
  const invoiceRef = useRef<HTMLDivElement>(null)
  
  // Extract the invoice data and error
  const { data: invoiceData, error: invoiceError } = invoice

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, bgColor: string, borderColor: string }> = {
      'PAID': { 
        color: '#065f46', 
        bgColor: '#d1fae5', 
        borderColor: '#a7f3d0' 
      },
      'UNPAID': { 
        color: '#92400e', 
        bgColor: '#fef3c7', 
        borderColor: '#fde68a' 
      },
      'OVERDUE': { 
        color: '#9f1239', 
        bgColor: '#ffe4e6', 
        borderColor: '#fecdd3' 
      }
    }
    
    const style = statusMap[status] || { 
      color: '#374151', 
      bgColor: '#f3f4f6', 
      borderColor: '#e5e7eb' 
    }
    
    return {
      className: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`,
      style: {
        color: style.color,
        backgroundColor: style.bgColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: style.borderColor
      }
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (invoiceRef.current) {
      const element = invoiceRef.current
      
      const opt = {
        margin: 0.5,
        filename: `invoice-${invoiceData?.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }

      html2pdf().set(opt).from(element).save()
    }
  }

  if (invoiceError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{invoiceError}</p>
          <Button 
            onClick={() => router.push('/dashboard/invoices')}
            variant="outline"
            className="inline-flex items-center px-3 py-1 text-sm"
          >
            <ArrowLeft size={14} className="mr-1" />
            Back to Invoices
          </Button>
        </div>
      </div>
    )
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-3">Invoice Not Found</h1>
          <p className="text-gray-600 mb-3">
            The invoice you are looking for could not be found. Please check the ID and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-[95%] w-full mx-auto">
        <div className="flex justify-between items-center mb-3 print:hidden">
          <Logo/>
          
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
            >
              <Printer size={14} className="mr-1" />
              Print
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
            >
              <Download size={14} className="mr-1" />
              Download
            </Button>
            
            <Button size="sm">
              <Share2 size={14} className="mr-1" />
              Share
            </Button>
          </div>
        </div>
        
        <div 
          ref={invoiceRef} 
          className="bg-white overflow-hidden print:shadow-none print:max-h-full print:max-w-[100%] p-4 border-2 border-gray-300"
          style={{ pageBreakInside: 'avoid' }}
        >
          {/* Header with compact design */}
          <div className="bg-primary text-white px-4 py-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="bg-rose-100 rounded-full p-2">
                  <FileText size={16} className="text-rose-500" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Invoice Details</h1>
                  <div className="flex items-center text-xs text-gray-300 mt-0.5">
                    <span>{invoiceData.organization.name}</span>
                    <span className="mx-1">→</span>
                    <span>{invoiceData.supplier?.name || 'Unknown Supplier'}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span>{formatDate(invoiceData.date)}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span>Due: {formatDate(invoiceData.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="py-4">
            {/* From/To section with more compact design */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card>
                <CardContent className='py-2'>
                <h2 className="text-xs font-medium text-gray-400 uppercase mb-2">From</h2>
                <div className="">
                  <p className="font-semibold text-gray-900">{invoiceData.supplier?.name || 'Unknown Supplier'}</p>
                  {invoiceData.supplier?.email && <p className="text-xs text-gray-600">{invoiceData.supplier.email}</p>}
                  {invoiceData.supplier?.phone && <p className="text-xs text-gray-600">{invoiceData.supplier.phone}</p>}
                  {invoiceData.supplier?.address && <p className="text-xs text-gray-600">{invoiceData.supplier.address}</p>}
                </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className='py-2'>
                <h2 className="text-xs font-medium text-gray-400 uppercase mb-2">To</h2>
                <div className="">
                  <p className="font-semibold text-gray-900">{invoiceData.organization.name}</p>
                  <p className="text-xs text-gray-600">{invoiceData.organization.country}</p>
                </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Invoice info - more compact grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="p-2 border border-gray-100">
                <CardContent className='flex flex-col justify-center'>  <p className="text-xs text-gray-400 uppercase mb-2">Invoice Number</p>
                <p className="font-semibold text-sm text-gray-900">{invoiceData.invoiceNumber}</p></CardContent>
              
              </Card>
              
              <Card className="p-2 border border-gray-100">
                <CardContent className='flex flex-col justify-center'>
                <p className="text-xs text-gray-400 uppercase mb-2">Purchase Order</p>
                <p className="font-semibold text-sm">
                  <span 
                    className="text-rose-500 hover:underline cursor-pointer"
                  >
                    {invoiceData.purchaseOrder.poNumber}
                  </span>
                </p>
              </CardContent>
              
              </Card>
            </div>
            
            {/* Line items - more compact table */}
            <div>
              <h2 className="text-xs font-medium text-gray-400 uppercase mb-1">Items</h2>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Unit Price
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Tax
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {invoiceData.lines.map((line, index) => (
                      <tr key={line.id || index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {line.description}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 text-center">
                          {line.quantity}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 text-right">
                          {formatPrice(line.unitPrice)}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 text-right">
                          {formatPrice(line.taxAmount)}
                        </td>
                        <td className="px-3 py-2 text-xs font-medium text-right">
                          {formatPrice(line.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Totals - more compact */}
              <div className="mt-3 flex justify-end">
                <div className="w-40">
                  <div className="flex justify-between py-1 text-xs">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(invoiceData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-xs border-b">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium">{formatPrice(invoiceData.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 pb-1">
                    <span className="font-semibold text-sm">Total</span>
                    <span className="font-bold text-sm text-rose-500">{formatPrice(invoiceData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes - only show if not too long */}
            {invoiceData.notes && (
              <div className="mt-3">
                <h2 className="text-xs font-medium text-gray-400 uppercase mb-2">Notes</h2>
                <div className="p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-700">{invoiceData.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
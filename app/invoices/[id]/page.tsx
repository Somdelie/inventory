// /app/invoices/[id]/page.tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import InvoiceDisplay from '@/components/frontend/invoice-display';
import { getInvoiceById } from '@/actions/invoice';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  return (
    <Suspense fallback={<InvoiceSkeleton />}>
      <InvoiceDisplay invoice={invoice}/>
    </Suspense>
  );
}

function InvoiceSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Skeleton className="h-4 w-16 mb-3" />
                <div className="bg-gray-50 rounded-lg p-4">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>
              
              <div>
                <Skeleton className="h-4 w-16 mb-3" />
                <div className="bg-gray-50 rounded-lg p-4">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-72" />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-4 w-16 mb-3" />
              <div className="overflow-x-auto">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
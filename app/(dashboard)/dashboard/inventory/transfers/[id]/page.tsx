import { getStockTransferById } from '@/actions/inventory';
import TransferDetails from '@/components/dashboard/stock/TransferDetails';
import React from 'react'

const SingleTransferPage = async ({
    params
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params;

    const transfer = await getStockTransferById(id);
     if (!transfer) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Transfer Not Found</h1>
                    <p className="text-gray-600">The transfer you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

  return (
    <div>
        <TransferDetails transfer={transfer} />
    </div>
  )
}

export default SingleTransferPage;

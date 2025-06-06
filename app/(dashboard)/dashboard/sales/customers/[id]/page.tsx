import { getCustomerById } from '@/actions/customers';
import CustomerDetails from '@/components/dashboard/customers/CustomerDetails';
import { getAuthenticatedUser } from '@/config/useAuth';
import React from 'react'

const SingleCustomerPage = async ({
    params
}: {
    params: Promise<{ id: string }>
}) => {

    const { id } = await params;

    const response = await getCustomerById(id);
    const user = await getAuthenticatedUser();
    const currentUserId = user?.id || '';
    
    // Handle the response structure with success/error
    if (!response.success || !response.customer) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h1>
                    <p className="text-gray-600">
                        {response.error || "The customer you're looking for doesn't exist."}
                    </p>
                </div>
            </div>
        );
    }

  return (
    <div>
        <CustomerDetails customer={{ ...response.customer, updatedAt: response.customer.updatedAt || new Date().toISOString() } } currentUserId={currentUserId}/>
    </div>
  )
}

export default SingleCustomerPage;
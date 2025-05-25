import React from 'react'
import { getAuthenticatedUser } from '@/config/useAuth'
import { redirect } from 'next/navigation'
import InventoryManagementClient from '@/components/dashboard/stock/StockManagement';
import { getLocationsByOrganizationId } from '@/actions/location';
import { getInventoryItems } from '@/actions/inventory';



const StockManagementPage = async () => {
  // Authentication check
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/auth/login');
  }

  if (!user.organizationId) {
    redirect('/setup/organization');
  }

  // Fetch data on the server
  const [items, locations] = await Promise.all([
    getInventoryItems(),
    getLocationsByOrganizationId(user.organizationId),
  ]);

  return (
    <div className="h-full">
      <InventoryManagementClient
        initialItems={items}
        locations={locations}
      />
    </div>
  );
};

export default StockManagementPage;
import { getPurchaseOrderById } from "@/actions/purchase-orders";
import ConfirmPurchaseOrderForm from "@/components/frontend/confirm-order";


export default async function Page({ params, searchParams }: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token: string }>;
}) {

    const purchaseOrder = await getPurchaseOrderById(
        (await params).id
    );
    if (!purchaseOrder) {
        return <div>Purchase Order not found</div>;
    }

    console.log("Purchase Order", purchaseOrder);


  return <ConfirmPurchaseOrderForm params={params} token={(await searchParams).token} />;
}
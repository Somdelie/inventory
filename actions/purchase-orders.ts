"use server";

import PurchaseOrderEmail from "@/components/dashboard/purchases/orders/purchase-order-email";
import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";
import { createPurchaseOrderConfirmationUrl } from "@/services/confirmationTokenService";
import { CreatePurchaseOrderInput } from "@/types/purchase-order";
import {
  PurchaseOrderStatus,
  PaymentStatus,
  InvoiceStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Define the interface for payload items
interface ReceiveItem {
  id: string;
  receivedQuantity: number;
}

// Define the interface for the receive order payload
interface ReceiveOrderPayload {
  purchaseOrderId: string;
  poNumber: string;
  items: ReceiveItem[];
}

export async function createPurchaseOrder(data: CreatePurchaseOrderInput) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID not found for the user");
    }

    // Create the purchase order with its line items using a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the purchase order
      const purchaseOrder = await tx.purchaseOrder.create({
        data: {
          poNumber: data.poNumber,
          date: data.date,
          supplierName: data.supplierName,
          supplierEmail: data.supplierEmail,
          supplierPhone: data.supplierPhone,
          status: PurchaseOrderStatus.DRAFT,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingCost: data.shippingCost,
          discount: data.discount,
          totalAmount: data.totalAmount,
          notes: data.notes || null,
          paymentTerms: data.paymentTerms || null,
          expectedDeliveryDate: data.expectedDeliveryDate || null,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: data.paymentMethod || null,

          // Connect to supplier if supplierId is provided
          ...(data.supplierId
            ? {
                supplier: {
                  connect: { id: data.supplierId },
                },
              }
            : {}),

          // Connect to location if locationId is provided
          ...(data.locationId
            ? {
                Location: {
                  connect: { id: data.locationId },
                },
              }
            : {}),

          // Connect to delivery location if deliveryLocationId is provided
          ...(data.deliveryLocationId
            ? {
                deliveryLocation: {
                  connect: { id: data.deliveryLocationId },
                },
              }
            : {}),

          // Connect to organization and created by user
          organization: {
            connect: { id: organizationId },
          },
          createdBy: {
            connect: { id: user.id },
          },

          // Create purchase order lines
          lines: {
            create: data.lines.map((line) => ({
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate || 0,
              taxAmount: line.taxAmount || 0,
              discount: line.discount || null,
              totalPrice: line.totalPrice,
              notes: line.notes || null,
              item: {
                connect: { id: line.itemId },
              },
            })),
          },
        },
        include: {
          supplier: true,
          Location: true,
          deliveryLocation: true,
          lines: {
            include: {
              item: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      revalidatePath("/dashboard/purchases/orders");
      return purchaseOrder;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// update purchase order
export async function updatePurchaseOrder(data: any) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID not found for the user");
    }

    // Update the purchase order with its line items using a transaction
    const result = await db.$transaction(async (tx) => {
      // Update the purchase order
      const purchaseOrder = await tx.purchaseOrder.update({
        where: {
          id: data.id,
        },
        data: {
          poNumber: data.poNumber,
          date: data.date,
          supplierName: data.supplierName,
          supplierEmail: data.supplierEmail,
          supplierPhone: data.supplierPhone,
          status: PurchaseOrderStatus.DRAFT,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          shippingCost: data.shippingCost,
          discount: data.discount,
          totalAmount: data.totalAmount,
          notes: data.notes || null,
          paymentTerms: data.paymentTerms || null,
          expectedDeliveryDate: data.expectedDeliveryDate || null,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: data.paymentMethod || null,

          // Connect to supplier if supplierId is provided
          ...(data.supplierId
            ? {
                supplier: {
                  connect: { id: data.supplierId },
                },
              }
            : {}),

          // Connect to location if locationId is provided
          ...(data.locationId
            ? {
                Location: {
                  connect: { id: data.locationId },
                },
              }
            : {}),

          // Connect to delivery location if deliveryLocationId is provided
          ...(data.deliveryLocationId
            ? {
                deliveryLocation: {
                  connect: { id: data.deliveryLocationId },
                },
              }
            : {}),

          // Connect to organization and created by user
          organization: {
            connect: { id: organizationId },
          },
        },
        include: {
          supplier: true,
          Location: true,
          deliveryLocation: true,
          lines: {
            include: {
              item: true,
            },
          },
        },
      });

      revalidatePath("/dashboard/purchases/orders");
      return purchaseOrder;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating purchase order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getPurchaseOrders() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID not found for the user");
    }
    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        organizationId: organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        supplier: true,
        Location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return purchaseOrders;
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    return []; // Return an empty array in case of error
  }
}

export async function getPurchaseOrderNumber(organizationId: string) {
  try {
    const purchaseOrderCount = await db.purchaseOrder.count({
      where: {
        organizationId: organizationId,
      },
    });
    return purchaseOrderCount;
  } catch (error) {
    console.error("Error fetching purchase order count:", error);
    return 0; // Return 0 in case of error
  }
}

// Get purchase order count for an organization (used for generating PO numbers)
export async function getPurchaseOrderCount(purchaseOrderId: string) {
  try {
    const purchaseOrderCount = await db.purchaseOrder.count({
      where: {
        id: purchaseOrderId,
      },
    });
    return purchaseOrderCount;
  } catch (error) {
    console.error("Error fetching purchase order count:", error);
    return 0; // Return 0 in case of error
  }
}

export async function getItemsBySupplier(supplierId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID not found for the user");
    }

    // Find all items that have a relationship with this supplier through ItemSupplier
    const items = await db.item.findMany({
      where: {
        organizationId,
        isActive: true,
        supplierRelations: {
          some: {
            supplierId,
          },
        },
      },
      include: {
        supplierRelations: {
          where: {
            supplierId,
          },
        },
        category: true,
        unit: true,
        brand: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Map the items to include supplier-specific pricing
    return items.map((item) => {
      const supplierRelation = item.supplierRelations[0];

      return {
        ...item,
        // Use supplier-specific cost if available, otherwise fall back to item's default cost
        costPrice: supplierRelation?.unitCost ?? item.costPrice,
      };
    });
  } catch (error) {
    console.error("Error fetching items for supplier:", error);
    return [];
  }
}

// get purchase order items by purchase order id
export async function getPurchaseOrdersItems(purchaseOrderId: string) {
  try {
    const purchaseOrderItems = await db.purchaseOrderLine.findMany({
      where: {
        purchaseOrderId,
      },
      include: {
        item: {
          include: {
            category: true,
            unit: true,
            brand: true,
            suppliers: {
              where: {
                purchaseOrders: { some: { id: purchaseOrderId } },
              },
            },
          },
        },
      },
    });

    console.log("Purchase Order Items:", purchaseOrderItems);
    return purchaseOrderItems;
  } catch (error) {
    console.error("Error fetching purchase order items:", error);
    return [];
  }
}

// get supplier by purchase order id
export async function getSupplierByPurchaseOrderId(purchaseOrderId: string) {
  try {
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
      },
      include: {
        supplier: true,
      },
    });

    return purchaseOrder?.supplier || null;
  } catch (error) {
    console.error("Error fetching supplier by purchase order ID:", error);
    return null;
  }
}

// delete purchase order by id
export async function deletePurchaseOrder(id: string) {
  try {
    const purchaseOrder = await db.purchaseOrder.delete({
      where: {
        id,
      },
    });
    revalidatePath("/dashboard/purchases/orders");
    return {
      status: 200,
      message: "Purchase order deleted successfully",
      data: purchaseOrder,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

// get purchase order line items by purchase order id
export async function getPurchaseOrderLineItems(purchaseOrderId: string) {
  try {
    const purchaseOrderLines = await db.purchaseOrderLine.findMany({
      where: {
        purchaseOrderId,
      },
      include: {
        item: true,
      },
    });
    return purchaseOrderLines;
  } catch (error) {
    console.error("Error fetching purchase order line items:", error);
    return [];
  }
}

// send purchase order email
// send purchase order email
export async function sendPurchaseOrderEmail(purchaseOrderId: string) {
  try {
    // Get authenticated user for contact info
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Fetch the purchase order with all necessary data
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        supplier: true,
        Location: true,
        deliveryLocation: true,
        organization: true,
        lines: {
          include: {
            item: true,
          },
        },
      },
    });

    console.log("Purchase Order:", purchaseOrder);

    if (!purchaseOrder) {
      throw new Error("Purchase order not found");
    }

    // Check if there's a supplier email to send to
    const recipientEmail =
      purchaseOrder.supplierEmail || purchaseOrder.supplier?.email;
    if (!recipientEmail) {
      throw new Error(
        "No supplier email address found for this purchase order"
      );
    }

    // Generate a confirmation URL for this purchase order
    const confirmationUrl = await createPurchaseOrderConfirmationUrl(
      purchaseOrderId
    );

    // Format line items for the email template
    const formattedItems = purchaseOrder.lines.map((line) => ({
      name: line.item?.name || "Unknown Product",
      sku: line.item?.sku || null,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      total: line.totalPrice,
    }));

    // Get organization/company details
    const companyName = purchaseOrder.organization?.name || "Your Company";
    const companyLogo =
      "https://9tf4o9l5yt.ufs.sh/f/2L7IdLt9oQb1lfpmkLRM01cGEpgqXdT82VoP7aK5Rut3AiHm";

    // Determine the delivery location
    const deliveryLocation =
      purchaseOrder.deliveryLocation || purchaseOrder.Location;

    // Set up contact info
    const contactInfo = {
      email: user.email || "procurement@example.com",
      phone: user.phone || "+27 123 456 7890",
    };

    // Format the date
    const formattedDate = purchaseOrder.date
      ? new Date(purchaseOrder.date).toLocaleDateString("en-ZA")
      : new Date().toLocaleDateString("en-ZA");

    // Format the expected delivery date if exists
    const expectedDeliveryDate = purchaseOrder.expectedDeliveryDate
      ? new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString("en-ZA")
      : null;

    // Build the delivery address string
    const deliveryAddressStr = deliveryLocation
      ? `${deliveryLocation.name}${
          deliveryLocation.address ? `, ${deliveryLocation.address}` : ""
        }`
      : null;

    // Get supplier information from the supplier object
    const supplierName =
      purchaseOrder.supplier?.name || purchaseOrder.supplierName;
    const supplierEmail =
      purchaseOrder.supplier?.email || purchaseOrder.supplierEmail;
    const supplierPhone =
      purchaseOrder.supplier?.phone || purchaseOrder.supplierPhone;
    const supplierAddress = purchaseOrder.supplier?.address || null;

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: `${companyName} <admin@cautiousndlovu.co.za>`,
      to: recipientEmail,
      subject: `Purchase Order: ${purchaseOrder.poNumber}`,
      react: PurchaseOrderEmail({
        poNumber: purchaseOrder.poNumber,
        orderDate: formattedDate,
        expectedDeliveryDate: expectedDeliveryDate,
        companyName: companyName,
        companyLogo: companyLogo,
        // Pass supplier information explicitly
        supplierName: supplierName,
        supplierEmail: supplierEmail,
        supplierPhone: supplierPhone,
        supplierAddress: supplierAddress,
        items: formattedItems,
        subtotal: purchaseOrder.subtotal,
        vat: purchaseOrder.taxAmount,
        total: purchaseOrder.totalAmount,
        paymentTerms: purchaseOrder.paymentTerms,
        deliveryAddress: deliveryAddressStr,
        contactInfo: contactInfo,
        notes: purchaseOrder.notes,
        status: purchaseOrder.status,
        // Add the confirmation URL
        confirmationUrl: confirmationUrl,
      }),
    });

    if (error) {
      console.error("Error from Resend:", error);
      throw new Error(error.message);
    }

    // Update the purchase order status to 'SENT' if currently in 'DRAFT'
    if (purchaseOrder.status === "DRAFT") {
      await db.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: "SUBMITTED" },
      });
    }

    // Revalidate the page to show updated status
    revalidatePath(`/dashboard/purchases/orders/${purchaseOrderId}`);
    revalidatePath(`/dashboard/purchases/orders`);

    return {
      success: true,
      status: 200,
      message: `Purchase order email sent to ${recipientEmail}`,
      data: data,
    };
  } catch (error) {
    console.error("Error sending purchase order email:", error);
    return {
      success: false,
      status: 500,
      message:
        error instanceof Error
          ? error.message
          : "Error sending purchase order email",
    };
  }
}

// get purchase order by id
export async function getPurchaseOrderById(id: string) {
  try {
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: {
        id: id,
      },
      include: {
        supplier: true,
        Location: true,
        deliveryLocation: true,
        organization: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    return purchaseOrder;
  } catch (error) {
    console.error("Error fetching purchase order by ID:", error);
    return null; // Return null in case of error
  }
}

// Enhanced confirm purchase order with invoice generation
export async function confirmPurchaseOrder(
  purchaseOrderId: string,
  expectedDeliveryDate?: string,
  supplierNotes?: string
) {
  try {
    // Begin transaction to handle purchase order confirmation and invoice creation
    const result = await db.$transaction(async (tx) => {
      // 1. Get the purchase order with its lines and related data
      const purchaseOrder = await tx.purchaseOrder.findUnique({
        where: { id: purchaseOrderId },
        include: {
          lines: {
            include: { item: true },
          },
          supplier: true,
          organization: true,
          Location: true,
          deliveryLocation: true,
        },
      });

      if (!purchaseOrder) {
        throw new Error("Purchase order not found");
      }

      // 2. Update the purchase order status to 'APPROVED'
      const updatedPurchaseOrder = await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          status: PurchaseOrderStatus.APPROVED,
          // Also update the confirmed delivery date if provided
          ...(expectedDeliveryDate && {
            expectedDeliveryDate: new Date(expectedDeliveryDate),
          }),
          // Also update supplier notes if provided
          ...(supplierNotes && {
            supplierNotes: supplierNotes,
          }),
        },
      });

      // 3. Generate invoice number - format: INV-YYYYMMDD-XXXX
      const now = new Date();
      const dateString = now.toISOString().slice(0, 10).replace(/-/g, "");

      const invoiceCount = await tx.invoice.count({
        where: { organizationId: purchaseOrder.organizationId },
      });

      const invoiceNumber = `INV-${dateString}-${(invoiceCount + 1)
        .toString()
        .padStart(4, "0")}`;

      // 4. Calculate due date based on payment terms - default to Net 30 if not specified
      const dueDate = new Date();
      const paymentTermsMatch = purchaseOrder.paymentTerms?.match(/\d+/);

      // Default: Net 30
      let paymentDays = 30;

      // Try to extract days from payment terms
      if (paymentTermsMatch && paymentTermsMatch[0]) {
        const parsedDays = parseInt(paymentTermsMatch[0], 10);
        if (!isNaN(parsedDays) && parsedDays > 0) {
          paymentDays = parsedDays;
        }
      }

      dueDate.setDate(dueDate.getDate() + paymentDays);

      // 5. Create the invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          date: new Date(),
          dueDate,
          status: InvoiceStatus.UNPAID,
          subtotal: purchaseOrder.subtotal,
          taxAmount: purchaseOrder.taxAmount,
          totalAmount: purchaseOrder.totalAmount,
          notes: `Auto-generated invoice for Purchase Order ${purchaseOrder.poNumber}`,
          purchaseOrder: { connect: { id: purchaseOrderId } },
          supplier: purchaseOrder.supplierId
            ? { connect: { id: purchaseOrder.supplierId } }
            : undefined,
          organization: { connect: { id: purchaseOrder.organizationId } },
          // Create invoice lines from purchase order lines
          lines: {
            create: purchaseOrder.lines.map((line) => ({
              description: line.item?.name || "Unknown Item",
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate || 0,
              taxAmount: line.taxAmount || 0,
              totalPrice: line.totalPrice,
              item: { connect: { id: line.itemId } },
              purchaseOrderLine: { connect: { id: line.id } },
            })),
          },
        },
      });

      return { updatedPurchaseOrder, invoice };
    });

    // Mark the confirmation token as used
    try {
      // This would use the token service in a real implementation
      // await markTokenAsUsed(token);
    } catch (tokenError) {
      console.error("Error marking token as used:", tokenError);
      // Continue with the confirmation process even if marking the token fails
    }

    // Revalidate the page paths
    revalidatePath(`/dashboard/purchases/orders/${purchaseOrderId}`);
    revalidatePath(`/dashboard/purchases/orders`);
    revalidatePath(`/dashboard/invoices`);

    // Return successful response with invoice information
    return {
      success: true,
      message: "Purchase order confirmed and invoice created successfully",
      data: {
        purchaseOrder: result.updatedPurchaseOrder,
        invoice: {
          id: result.invoice.id,
          invoiceNumber: result.invoice.invoiceNumber,
          dueDate: result.invoice.dueDate,
          totalAmount: result.invoice.totalAmount,
        },
      },
    };
  } catch (error) {
    console.error("Error confirming purchase order:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error confirming purchase order",
    };
  }
}

// receive purchase order
// Function to receive a purchase order
export async function receiveOrder(payload: ReceiveOrderPayload) {
  try {
    // Get the authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const organizationId = user.organizationId;
    if (!organizationId) {
      throw new Error("Organization ID not found for the user");
    }

    const { purchaseOrderId, items } = payload;

    // Validate payload
    if (!purchaseOrderId || !items || items.length === 0) {
      throw new Error("Invalid payload for receiving order");
    }

    // Get the purchase order with its related data
    const purchaseOrder = await db.purchaseOrder.findUnique({
      where: {
        id: purchaseOrderId,
        organizationId,
      },
      include: {
        lines: true,
        Location: true,
        deliveryLocation: true,
      },
    });

    if (!purchaseOrder) {
      throw new Error("Purchase order not found");
    }

    // Get the location for this purchase order
    const locationId =
      purchaseOrder.locationId || purchaseOrder.deliveryLocationId;
    if (!locationId) {
      throw new Error("No location found for this purchase order");
    }

    // Process the order receipt in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Generate receipt number
      const receiptNumber = `GR-${Date.now().toString().slice(-8)}`;

      // 2. Create the goods receipt record
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          date: new Date(),
          status: "COMPLETED",
          notes: `Received via web interface by ${user.name}`,
          purchaseOrder: { connect: { id: purchaseOrderId } },
          location: { connect: { id: locationId } },
          organization: { connect: { id: organizationId } },
          receivedBy: { connect: { id: user.id } },
        },
      });

      // 3. Process each received item
      const updatedLines: {
        id: string;
        createdAt: Date;
        updatedAt: Date | null;
        itemId: string;
        quantity: number;
        purchaseOrderId: string;
        notes: string | null;
        taxRate: number;
        taxAmount: number;
        discount: number | null;
        unitPrice: number;
        totalPrice: number;
        receivedQuantity: number;
      }[] = [];
      const goodsReceiptLines = [];

      for (const item of items) {
        // Skip items with zero quantity
        if (!item.id || item.receivedQuantity <= 0) continue;

        // Find the corresponding purchase order line
        const poLine = purchaseOrder.lines.find((line) => line.id === item.id);
        if (!poLine) continue;

        // Calculate the new received quantity for the purchase order line
        const newReceivedQuantity =
          (poLine.receivedQuantity || 0) + item.receivedQuantity;

        // Update the purchase order line
        const updatedLine = await tx.purchaseOrderLine.update({
          where: { id: item.id },
          data: { receivedQuantity: newReceivedQuantity },
        });
        updatedLines.push(updatedLine);

        // Create a goods receipt line
        const goodsReceiptLine = await tx.goodsReceiptLine.create({
          data: {
            receivedQuantity: item.receivedQuantity,
            notes: `Received ${item.receivedQuantity} units`,
            goodsReceipt: { connect: { id: goodsReceipt.id } },
            purchaseOrderLine: { connect: { id: item.id } },
            item: { connect: { id: poLine.itemId } },
          },
        });
        goodsReceiptLines.push(goodsReceiptLine);

        // Update inventory quantity - use upsert to handle both creation and update
        const inventoryKey = `${poLine.itemId}_${locationId}_${organizationId}`;
        await tx.inventory.upsert({
          where: {
            id: inventoryKey,
          },
          update: {
            quantity: {
              increment: item.receivedQuantity,
            },
            updatedAt: new Date(),
          },
          create: {
            id: inventoryKey,
            itemId: poLine.itemId,
            locationId: locationId,
            organizationId: organizationId,
            quantity: item.receivedQuantity,
          },
        });
      }

      // 4. Determine the new purchase order status
      let newStatus = purchaseOrder.status;

      // Check if all lines are fully received
      const allLinesFullyReceived = purchaseOrder.lines.every((line) => {
        const updatedLine =
          updatedLines.find((ul) => ul.id === line.id) || line;
        return updatedLine.receivedQuantity >= updatedLine.quantity;
      });

      // Check if any lines are partially received
      const anyLinePartiallyReceived = purchaseOrder.lines.some((line) => {
        const updatedLine =
          updatedLines.find((ul) => ul.id === line.id) || line;
        return (
          updatedLine.receivedQuantity > 0 &&
          updatedLine.receivedQuantity < updatedLine.quantity
        );
      });

      // Update status based on receipt state
      if (allLinesFullyReceived) {
        newStatus = PurchaseOrderStatus.RECEIVED;
      } else if (anyLinePartiallyReceived) {
        newStatus = PurchaseOrderStatus.PARTIALLY_RECEIVED;
      }

      // 5. Update the purchase order status
      const updatedPurchaseOrder = await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: { status: newStatus },
      });

      return {
        goodsReceipt,
        goodsReceiptLines,
        updatedPurchaseOrder,
      };
    });

    // Revalidate the relevant paths to reflect changes
    revalidatePath(`/dashboard/purchases/orders/${purchaseOrderId}`);
    revalidatePath("/dashboard/purchases/orders");
    revalidatePath("/dashboard/inventory");

    // Return success result
    return {
      success: true,
      message: "Order received successfully",
      data: {
        goodsReceiptId: result.goodsReceipt.id,
        receiptNumber: result.goodsReceipt.receiptNumber,
        status: result.updatedPurchaseOrder.status,
      },
    };
  } catch (error) {
    console.error("Error receiving order:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred while receiving the order");
  }
}

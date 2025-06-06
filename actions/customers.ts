"use server";

import { db } from "@/prisma/db";
import { Prisma } from "@prisma/client";

export async function createCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  notes?: string;
  organizationId: string;
}) {
  try {
    const customer = await db.customer.create({
      data,
    });
    return { success: true, customer };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateCustomer(
  id: string,
  data: Partial<Prisma.CustomerUpdateInput>
) {
  try {
    const customer = await db.customer.update({
      where: { id },
      data,
    });
    return { success: true, customer };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteCustomer(id: string) {
  try {
    // check if the customer has any sales orders
    const existingOrders = await db.salesOrder.findMany({
      where: { customerId: id },
    });
    if (existingOrders.length > 0) {
      return {
        success: false,
        error: "Cannot delete customer with existing sales orders.",
      };
    }
    await db.customer.delete({
      where: { id },
      include: {
        salesOrders: true,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getCustomer(id: string) {
  try {
    const customer = await db.customer.findUnique({
      where: { id },
    });
    return { success: true, customer };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Add this function to your existing customers actions file

// Test this simplified version first
// Test this simplified version first
export async function getCustomerById(id: string) {
  try {
    console.log("Fetching customer with ID:", id);

    // First, get just the customer
    const customer = await db.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return {
        success: false,
        error: "Customer not found",
        customer: null,
      };
    }

    // Then get the sales orders separately
    const salesOrders = await db.salesOrder.findMany({
      where: { customerId: id },
      include: {
        lines: {
          include: {
            item: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Combine them with explicit serialization
    const customerWithOrders = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      taxId: customer.taxId,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt?.toISOString() || null,
      organizationId: customer.organizationId,
      salesOrders: salesOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.date.toISOString(),
        status: order.status,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        shippingCost: order.shippingCost,
        discount: order.discount,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        source: order.source,
        createdAt: order.createdAt.toISOString(),
        lines: order.lines.map((line) => ({
          id: line.id,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.totalPrice,
          item: {
            name: line.item.name,
            sku: line.item.sku,
          },
        })),
      })),
    };

    console.log("Customer with orders (serialized):", {
      id: customerWithOrders.id,
      name: customerWithOrders.name,
      salesOrdersCount: customerWithOrders.salesOrders.length,
      salesOrdersIsArray: Array.isArray(customerWithOrders.salesOrders),
    });

    return {
      success: true,
      customer: customerWithOrders,
    };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return {
      success: false,
      error: (error as Error).message,
      customer: null,
    };
  }
}

export async function listCustomers(organizationId: string) {
  try {
    const customers = await db.customer.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, customers };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Add this function to your existing customers actions file

export async function toggleCustomerStatus(id: string, isActive: boolean) {
  try {
    const customer = await db.customer.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date(),
      },
    });
    return { success: true, customer };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

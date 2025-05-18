"use server";

import { db } from "@/prisma/db";

export async function getInvoiceById(id: string) {
  try {
    const response = await db.invoice.findFirst({
      where: {
        id: id,
      },
      include: {
        purchaseOrder: {
          select: {
            id: true,
            poNumber: true,
            date: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            country: true
          },
        },
        lines: {
          include: {
            item: true,
            purchaseOrderLine: true,
          },
        },
      },
    });

    console.log("Invoice response", response);
    if (!response) {
      return {
        data: null,
        error: "Invoice not found",
        status: 404,
      };
    }
    return {
      data: response,
      error: null,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return {
      data: null,
      error: "Failed to fetch invoice data. Please try again later.",
      status: 500,
    };
  }
}

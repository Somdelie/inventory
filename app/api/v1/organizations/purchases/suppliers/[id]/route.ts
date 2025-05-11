import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the supplier by ID
    const supplier = await db.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return NextResponse.json(
        {
          status: 404,
          data: null,
          error: "Not found",
          message: "Supplier not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: 200,
        data: supplier,
        error: null,
        message: "Supplier fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      {
        status: 500,
        data: null,
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Update a supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplierData = await request.json();

    // Validate required fields
    if (!supplierData.name) {
      return NextResponse.json(
        {
          status: 400,
          data: null,
          error: "Validation error",
          message: "Name is required",
        },
        { status: 400 }
      );
    }

    // Check if supplier exists
    const existingSupplier = await db.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        {
          status: 404,
          data: null,
          error: "Not found",
          message: "Supplier not found",
        },
        { status: 404 }
      );
    }

    // Update the supplier
    const updatedSupplier = await db.supplier.update({
      where: { id },
      data: {
        name: supplierData.name,
        email: supplierData.email || null,
        phone: supplierData.phone || null,
        address: supplierData.address || null,
        taxId: supplierData.taxId || null,
        paymentTerms: supplierData.paymentTerms || null,
        notes: supplierData.notes || null,
        isActive: supplierData.isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        status: 200,
        data: updatedSupplier,
        error: null,
        message: "Supplier updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      {
        status: 500,
        data: null,
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// Delete a supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if supplier exists
    const existingSupplier = await db.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        {
          status: 404,
          data: null,
          error: "Not found",
          message: "Supplier not found",
        },
        { status: 404 }
      );
    }

    // Delete the supplier
    const deletedSupplier = await db.supplier.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        status: 200,
        data: deletedSupplier,
        error: null,
        message: "Supplier deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      {
        status: 500,
        data: null,
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

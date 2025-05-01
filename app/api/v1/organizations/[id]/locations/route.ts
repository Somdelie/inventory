import { db } from "@/prisma/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const headersList = await headers();
    const apiKey = headersList.get("x-api-key") || "";
    const organizationId = id; // Get organizationId from params

    if (!apiKey) {
      return NextResponse.json(
        {
          data: null,
          status: 401,
          error: "API key not found",
          message: "API key not found",
          success: false,
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Check if pagination is requested
    const isPaginated = searchParams.has("page") || searchParams.has("limit");

    // Get total count for pagination metadata
    const totalCount = await db.location.count({
      where: {
        organizationId,
      },
    });

    if (isPaginated) {
      // Parse pagination parameters with defaults
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const skip = (page - 1) * limit;

      // Fetch paginated locations
      const locations = await db.location.findMany({
        where: {
          organizationId,
        },
        include: {
          Organization: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        skip,
        take: limit,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);

      // Return with consistent API response format
      return NextResponse.json(
        {
          status: 200,
          data: locations,
          error: null,
          message: "Locations retrieved successfully",
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
        { status: 200 }
      );
    } else {
      // If no pagination parameters, return all data
      const allLocations = await db.location.findMany({
        where: {
          organizationId,
        },
        include: {
          Organization: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      // Return with consistent API response format
      return NextResponse.json(
        {
          status: 200,
          data: allLocations,
          error: null,
          message: "Locations retrieved successfully",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching suppliers:", error);
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

export async function POST(request: Request) {
  try {
    // Parse the request body
    const locationData = await request.json();

    // Validate required fields
    if (!locationData.name) {
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

    // Create the supplier in database
    const newLocation = await db.supplier.create({
      data: {
        name: locationData.name,
        email: locationData.email || null,
        phone: locationData.phone || null,
        address: locationData.address || null,
        taxId: locationData.taxId || null,
        paymentTerms: locationData.paymentTerms || null,
        notes: locationData.notes || null,
        isActive: true,
        organizationId: locationData.organizationId,
      },
    });

    return NextResponse.json(
      {
        status: 200,
        data: newLocation,
        error: null,
        message: "Location created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating location:", error);
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
    const locationData = await request.json();

    // Validate required fields
    if (!locationData.name) {
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

    // Check if location exists
    const existingLocation = await db.supplier.findUnique({
      where: { id },
    });

    if (!existingLocation) {
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
    const updatedLocation = await db.supplier.update({
      where: { id },
      data: {
        name: locationData.name,
        email: locationData.email || null,
        phone: locationData.phone || null,
        address: locationData.address || null,
        taxId: locationData.taxId || null,
        paymentTerms: locationData.paymentTerms || null,
        notes: locationData.notes || null,
        isActive: locationData.isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        status: 200,
        data: updatedLocation,
        error: null,
        message: "Location updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating location:", error);
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

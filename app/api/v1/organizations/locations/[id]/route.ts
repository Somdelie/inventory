import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const locationId = request.nextUrl.searchParams.get("locationId");

    if (!locationId) {
      return new Response(
        JSON.stringify({
          data: null,
          status: 400,
          error: "Location ID is required",
          success: false,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch the location by ID
    const location = await db.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      return new Response(
        JSON.stringify({
          data: null,
          status: 404,
          error: "Location not found",
          success: false,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        data: location,
        status: 200,
        success: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching location:", error);
    return new Response(
      JSON.stringify({
        data: null,
        status: 500,
        error: "Internal Server Error",
        success: false,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { organizationId, ...updateData } = body;

    console.log("Updating location with data:", updateData);

    // Check if the location exists
    const existingLocation = await db.location.findUnique({
      where: {
        id: updateData.id,
      },
    });

    if (!existingLocation) {
      return new Response(
        JSON.stringify({
          status: 404,
          error: "Location not found",
          success: false,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for name conflict (only if name is being changed)
    if (updateData.name && updateData.name !== existingLocation.name) {
      const nameConflict = await db.location.findFirst({
        where: {
          name: updateData.name,
          organizationId,
          id: {
            not: existingLocation.id, // Exclude the current location ID
          },
        },
      });

      if (nameConflict) {
        return new Response(
          JSON.stringify({
            status: 409,
            error: "Another location with this name already exists",
            success: false,
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    console.log("Updating location with data on api:", updateData);

    // Update the location
    const updatedLocation = await db.location.update({
      where: {
        id: updateData.id,
      },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/inventory/locations");

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Location updated successfully",
        data: updatedLocation,
        success: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error updating location:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        error: error.message || "Failed to update location",
        success: false,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const { locationId } = await params;

  try {
    // Check if the location exists
    const existingLocation = await db.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!existingLocation) {
      return new Response(
        JSON.stringify({
          status: 404,
          error: "Location not found",
          success: false,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if the location is being used in inventories
    const inventoryCount = await db.inventory.count({
      where: {
        locationId,
      },
    });

    if (inventoryCount > 0) {
      return new Response(
        JSON.stringify({
          status: 409,
          error: "Cannot delete location with associated inventory items",
          success: false,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete the location
    await db.location.delete({
      where: {
        id: locationId,
      },
    });

    revalidatePath("/dashboard/inventory/locations");

    return new Response(
      JSON.stringify({
        status: 200,
        message: "Location deleted successfully",
        success: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error deleting location:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        error: error.message || "Failed to delete location",
        success: false,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

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
      return new Response(
        JSON.stringify({
          data: null,
          status: 401,
          error: "API key not found",
          success: false,
        })
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Check if pagination is requested
    const isPaginated = searchParams.has("page") || searchParams.has("limit");

    // Check if filtering by isActive is requested
    const isActiveFilter = searchParams.get("isActive");

    // Build the where condition
    const whereCondition: any = { organizationId };

    // Apply isActive filter if provided
    if (isActiveFilter !== null && isActiveFilter !== undefined) {
      whereCondition.isActive = isActiveFilter === "true";
    }

    // Get total count for pagination metadata
    const totalCount = await db.location.count({
      where: whereCondition,
    });

    if (isPaginated) {
      // Parse pagination parameters with defaults
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const skip = (page - 1) * limit;

      // Fetch paginated locations
      const locations = await db.location.findMany({
        where: whereCondition,
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);

      // Construct response with pagination metadata
      const response = {
        data: locations,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        success: true,
      };

      return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // If no pagination parameters, return all data
      const allLocations = await db.location.findMany({
        where: whereCondition,
        orderBy: {
          name: "asc",
        },
      });

      return new Response(JSON.stringify({ data: allLocations }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching locations:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { organizationId, ...data } = body; // Destructure organizationId from body

    // Check if the location already exists
    const existingLocation = await db.location.findFirst({
      where: {
        name: data.name,
        organizationId: organizationId,
      },
    });

    if (existingLocation) {
      return new Response(
        JSON.stringify({
          status: 400,
          error:
            "Location already exists with the same name in this organization",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a new location with the organizationId included in the data
    const newLocation = await db.location.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
        organizationId, // Include organizationId in the location creation
      },
    });

    revalidatePath("/dashboard/inventory/locations");

    return new Response(
      JSON.stringify({
        status: 201,
        message: "Location created successfully💐",
        data: newLocation,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error creating location:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        error: error.message || "Failed to create location",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

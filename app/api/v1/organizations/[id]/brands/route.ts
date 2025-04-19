import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log("Fetching brands for organization ID:", id);

  try {
    const organizationId = id;
    const searchParams = request.nextUrl.searchParams;

    const isPaginated = searchParams.has("page") || searchParams.has("limit");
    const totalCount = await db.brand.count({
      where: {
        organizationId,
      },
    });

    if (isPaginated) {
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const skip = (page - 1) * limit;

      const brands = await db.brand.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(totalCount / limit);

      const response = {
        data: brands,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };

      return NextResponse.json(response, { status: 200 });
    } else {
      const brands = await db.brand.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json(brands, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Parse the request body
  const body = await request.json();
  const { name } = body;

  // e.g. Insert new user into your DB
  const newUser = { id: Date.now(), name };

  return new Response(JSON.stringify(newUser), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

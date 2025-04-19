import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const organizationId = (await params).id;
//     const searchParams = request.nextUrl.searchParams;

//     // Check if pagination is requested
//     const isPaginated = searchParams.has("page") || searchParams.has("limit");

//     // Get total count for pagination metadata
//     const totalCount = await db.category.count({
//       where: {
//         organizationId,
//       },
//     });

//     if (isPaginated) {
//       // Parse pagination parameters with defaults
//       const page = parseInt(searchParams.get("page") || "1", 10);
//       const limit = parseInt(searchParams.get("limit") || "10", 10);
//       const skip = (page - 1) * limit;

//       // Fetch paginated categories
//       const categories = await db.category.findMany({
//         where: {
//           organizationId,
//         },
//         include: {
//           items: true,
//         },
//         orderBy: {
//           title: "asc",
//         },
//         skip,
//         take: limit,
//       });

//       // Calculate pagination metadata
//       const totalPages = Math.ceil(totalCount / limit);

//       // Construct response with pagination metadata
//       const response = {
//         data: categories,
//         pagination: {
//           total: totalCount,
//           page,
//           limit,
//           totalPages,
//           hasNextPage: page < totalPages,
//           hasPrevPage: page > 1,
//         },
//       };

//       return new Response(JSON.stringify(response), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     } else {
//       // If no pagination parameters, return all data
//       const allCategories = await db.category.findMany({
//         where: {
//           organizationId,
//         },
//         include: {
//           items: true,
//         },
//         orderBy: {
//           title: "asc",
//         },
//       });

//       return new Response(JSON.stringify({ data: allCategories }), {
//         status: 200,
//         headers: { "Content-Type": "application/json" },
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const organizationId = id;
    const searchParams = request.nextUrl.searchParams;

    // Check if pagination is requested
    const isPaginated = searchParams.has("page") || searchParams.has("limit");

    // Get total count for pagination metadata
    const totalCount = await db.category.count({
      where: {
        organizationId,
      },
    });
    if (isPaginated) {
      // Parse pagination parameters with defaults
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const skip = (page - 1) * limit;

      // Fetch paginated categories
      const categories = await db.category.findMany({
        where: {
          organizationId,
        },
        include: {
          items: true,
        },
        orderBy: {
          title: "asc",
        },
        skip,
        take: limit,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);

      // Construct response with pagination metadata
      const response = {
        data: categories,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // If no pagination parameters, return all data
      const allCategories = await db.category.findMany({
        where: {
          organizationId,
        },
        include: {
          items: true,
        },
        orderBy: {
          title: "asc",
        },
      });

      return new Response(JSON.stringify({ data: allCategories }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new Response("Internal Server Error", { status: 500 });
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

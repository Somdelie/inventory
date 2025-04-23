import { db } from "@/prisma/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;

//   try {
//     const headersList = await headers();
//     const apiKey = headersList.get("x-api-key") || "";

//     if (!apiKey) {
//       return new Response(
//         JSON.stringify({
//           data: null,
//           status: 401,
//           error: "API key not found",
//           success: false,
//         })
//       );
//     }

//     const validKey = await db.apiKey.findUnique({
//       where: {
//         key: apiKey,
//       },
//     });
//     if (!validKey) {
//       return new Response(
//         JSON.stringify({
//           data: null,
//           status: 401,
//           error: "Invalid API key",
//           success: false,
//         })
//       );
//     }

//     const item = await db.item.findUnique({
//       where: {
//         id: id,
//       },
//       include: {
//         category: true,
//         brand: true,
//         unit: true,
//         taxRate: true,
//       },
//     });
//     console.log("Item fetched:", item);
//     return new Response(
//       JSON.stringify({
//         data: item,
//         status: 200,
//         error: null,
//         success: true,
//       })
//     );
//   } catch (error) {
//     console.error("Error fetching item:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

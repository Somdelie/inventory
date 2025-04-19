import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({ message: `Hello ${id}!` });
}

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const organizationId = (await params).id;
//     const organization = await db.organization.findUnique({
//       where: {
//         id: organizationId,
//       },
//       include: {
//         users: true,
//         items: true,
//       },
//     });

//     if (!organization) {
//       return new Response("Organization not found", { status: 404 });
//     }

//     return new Response(JSON.stringify(organization), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error fetching organization:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }

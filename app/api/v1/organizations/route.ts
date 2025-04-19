import { db } from "@/prisma/db";

export async function GET(request: Request) {
  try {
    const organizations = await db.organization.findMany({
      include: {
        users: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return new Response(JSON.stringify(organizations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching item:", error);
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

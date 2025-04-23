// File: app/api/v1/organizations/items/[id]/route.ts
import { db } from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      data: null,
      status: 401,
      error: "API key not found",
      success: false,
    })
  );
}

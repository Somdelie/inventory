// app/api/uploadthing/delete/route.ts
import { UTApi } from "uploadthing/server";
import { NextRequest, NextResponse } from "next/server";

// Initialize the UploadThing API client
const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileKey } = body;

    if (!fileKey) {
      return NextResponse.json(
        { message: "File key is required" },
        { status: 400 }
      );
    }

    // Call the UploadThing API to delete the file
    await utapi.deleteFiles(fileKey);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting file:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { message: `Failed to delete file: ${errorMessage}` },
      { status: 500 }
    );
  }
}

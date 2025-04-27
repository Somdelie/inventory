// app/api/delete-file/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";

// Your Firebase configuration - using the same NEXT_PUBLIC_ variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase - check if already initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const storage = getStorage(app);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileUrl } = body;

    if (!fileUrl) {
      return NextResponse.json(
        { error: "No file URL provided" },
        { status: 400 }
      );
    }

    try {
      // Extract the file path from the URL
      // Firebase URLs look like: https://firebasestorage.googleapis.com/v0/b/PROJECT_ID.appspot.com/o/items%2Ffilename.jpg?alt=media...
      const fileUrlObj = new URL(fileUrl);
      const pathname = fileUrlObj.pathname;

      // The path is typically in the format /v0/b/PROJECT_ID.appspot.com/o/FILEPATH
      // We need to extract the FILEPATH part, which is URL encoded
      let filePath = "";

      if (pathname.includes("/o/")) {
        filePath = pathname.split("/o/")[1];
        // URL decode the path
        filePath = decodeURIComponent(filePath);
      } else {
        throw new Error("Invalid file URL format");
      }

      // Create a reference to the file
      const fileRef = ref(storage, filePath);

      // Delete the file
      await deleteObject(fileRef);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error deleting file:", error);

      if (error instanceof Error) {
        // If the file doesn't exist, consider it a success
        if (
          error.message.includes("Object does not exist") ||
          (error as any).code === "storage/object-not-found"
        ) {
          return NextResponse.json(
            {
              success: true,
              message: "File did not exist or was already deleted",
            },
            { status: 200 }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error deleting file",
      },
      { status: 500 }
    );
  }
}

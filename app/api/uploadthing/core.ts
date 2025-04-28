import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  categoryImage: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
    async () => {
      return { uploadedBy: "JB" };
    }
  ),
  // Define as many FileRoutes as you like, each with a unique routeSlug
  itemImage: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(
    async ({ file }) => {
      if (file.size > 1 * 1024 * 1024) {
        return {
          error: "File size exceeds 1MB",
          message: "File size exceeds 1MB",
        };
      }
      return { uploadedBy: "SG" };
    }
  ),
  itemImages: f({
    image: { maxFileSize: "1MB", maxFileCount: 4 },
  }).onUploadComplete(async ({ file }) => {
    if (file.size > 1 * 1024 * 1024) {
      return {
        error: "File size exceeds 1MB",
        message: "File size exceeds 1MB",
      };
    }
    return { uploadedBy: "SG" };
  }),
  blogImage: f({ image: { maxFileSize: "1MB" } }).onUploadComplete(async () => {
    return { uploadedBy: "SGD" };
  }),
  fileUploads: f({
    image: { maxFileSize: "1MB", maxFileCount: 4 },
    pdf: { maxFileSize: "1MB", maxFileCount: 4 },
    "application/msword": { maxFileSize: "1MB", maxFileCount: 4 }, // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "1MB",
      maxFileCount: 4,
    }, // .docx
    "application/vnd.ms-excel": { maxFileSize: "1MB", maxFileCount: 4 }, // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "1MB",
      maxFileCount: 4,
    }, // .xlsx
    "application/vnd.ms-powerpoint": { maxFileSize: "1MB", maxFileCount: 4 }, // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      { maxFileSize: "1MB", maxFileCount: 4 }, // .pptx
    "text/plain": { maxFileSize: "1MB", maxFileCount: 4 }, // .txt

    // Archive types
    "application/gzip": { maxFileSize: "1MB", maxFileCount: 4 },
    "application/zip": { maxFileSize: "1MB", maxFileCount: 4 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedBy: "JB" };
  }),
  mailAttachments: f({
    image: { maxFileSize: "1MB", maxFileCount: 4 },
    pdf: { maxFileSize: "1MB", maxFileCount: 4 },
    "application/msword": { maxFileSize: "1MB", maxFileCount: 4 }, // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "1MB",
      maxFileCount: 4,
    }, // .docx
    "application/vnd.ms-excel": { maxFileSize: "1MB", maxFileCount: 4 }, // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "1MB",
      maxFileCount: 4,
    }, // .xlsx
    "application/vnd.ms-powerpoint": { maxFileSize: "1MB", maxFileCount: 4 }, // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      { maxFileSize: "1MB", maxFileCount: 4 }, // .pptx
    "text/plain": { maxFileSize: "1MB", maxFileCount: 4 }, // .txt

    // Archive types
    "application/gzip": { maxFileSize: "1MB", maxFileCount: 4 },
    "application/zip": { maxFileSize: "1MB", maxFileCount: 4 },
  }).onUploadComplete(async ({ file }) => {
    //check if the file is bigger than 1MB
    if (file.size > 1 * 1024 * 1024) {
      throw new UploadThingError("File size exceeds 1MB");
    }
    return { uploadedBy: "SGD" };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

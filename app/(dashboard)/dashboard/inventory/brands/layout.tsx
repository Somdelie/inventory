import { checkPermission } from "@/config/useAuth";
import React, { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
  await checkPermission("brands.create");
  return <div>{children}</div>;
}

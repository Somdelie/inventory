"use server";

import { db } from "@/prisma/db";
import {
  DollarSign,
  LayoutGrid,
  LucideProps,
  Users,
  Users2,
} from "lucide-react";
export type AnalyticsProps = {
  title: string;
  total: number;
  href: string;
  icon: any;
  isCurrency?: boolean;
};
export async function getDashboardOverview() {
  try {
    // const usersLength = await db.user.count();
  } catch (error) {
    console.log(error);
    return null;
  }
}

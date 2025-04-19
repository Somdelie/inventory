"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  MoveRight,
  BarChart,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MdCategory } from "react-icons/md";
import Link from "next/link";
import { ISidebarLink, sidebarLinks } from "@/config/sidebar";

// Using the same type as in the provided code
interface AuthenticatedUser {
  name?: string | null;
  organizationName?: string;
  permissions?: string[];
  // Add other properties that might be needed
}

interface NavigationLinks {
  title: string;
  description: string;
  iconName: string; // Changed to string identifier
  count?: string;
  linkText: string;
  linkHref: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Icon mapping object
const iconComponents = {
  // Lucide icons
  ShoppingCart,
  Users,
  BarChart,
  Layers,
};

const DefaultUserDashboard = ({ user }: { user: AuthenticatedUser }) => {
  const [greeting, setGreeting] = useState("");
  const userName = user?.name || "User";

  // Helper function to check if user has permission
  const hasPermission = (permission: string): boolean => {
    return user.permissions?.includes(permission) ?? false;
  };

  // Filter sidebar links based on permissions
  const filterSidebarLinks = (links: ISidebarLink[]): ISidebarLink[] => {
    return links
      .filter((link) => hasPermission(link.permission))
      .map((link) => ({
        ...link,
        dropdownMenu: link.dropdownMenu?.filter((item) =>
          hasPermission(item.permission)
        ),
      }))
      .filter(
        (link) =>
          !link.dropdown || (link.dropdownMenu && link.dropdownMenu.length > 0)
      );
  };

  const filteredLinks = filterSidebarLinks(sidebarLinks);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  return (
    <main className="flex-1">
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <Card className="col-span-2">
            <CardHeader className="bg-rose-200 text-rose-800 py-2">
              <div className="flex items-center justify-between">
                <div className="">
                  <CardTitle className="font-bold md:text-2xl">
                    {greeting}, {userName}!
                  </CardTitle>
                  <CardDescription className="text-rose-800 font-medium">
                    Welcome to your store dashboard.
                  </CardDescription>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="flex items-center space-x-1 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-rose-800" />
                    <span className="text-rose-800">10:30 AM</span>
                  </p>
                  <p className="flex items-center space-x-1 text-xs">
                    <Calendar className="h-4 w-4 text-rose-500" />
                    <span className="text-rose-500 ">Monday, March 7</span>
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {filteredLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Card
                key={index}
                className="hover:bg-rose-100 transition-all duration-200 ease-in-out"
              >
                <CardHeader className="flex items-center flex-row justify-between text-rose-700">
                  <p>{link.title}</p>
                  <span className="bg-rose-100 text-rose-800 rounded-full flex items-center justify-center p-2">
                    {/* Render the icon component */}
                    <Icon className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <CardTitle className="font-semibold text-rose-900 font-sans">
                    {/* {link.count} */}
                  </CardTitle>
                  <CardDescription className="text-rose-700">
                    {/* {link.description} */}
                  </CardDescription>
                </CardContent>
                <CardFooter className="">
                  <Link href={"#"} className="text-rose-500 flex items-center">
                    Manage
                    <MoveRight className="h-4 w-4 mt-1" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default DefaultUserDashboard;

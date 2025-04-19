import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/reusable-ui/theme-provider";
// import FooterBanner from "@/components/Footer";
const inter = Rethink_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Somdelie-Inventory Management System",
  description:
    "Somdelie-Inventory Management System is a simple inventory management system that helps you manage your inventory with ease. It is built with Next.js, Prisma, and PostgreSQL. It is a great starting point for building your own inventory management system.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <main className="dark:bg-black">{children}</main>
          </Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Box, Layers } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative bg-slate-100">
      <div className="">
        {/* Hero content */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-12 max-w-[90%] mx-auto py-16">
          <div className="flex flex-col justify-center">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-800 md:text-5xl">
              Inventory that helps you stay organized
            </h1>
            <p className="mb-8 text-slate-600">
              Streamline your stock management with real-time tracking,
              multi-location support, and powerful analytics for retailers and
              wholesalers.
            </p>

            <div className="flex max-w-md items-center gap-2 rounded-full bg-white p-1 pl-4 shadow-sm">
              <Input
                type="email"
                placeholder="Your email address"
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button className="rounded-full bg-slate-800 px-6 hover:bg-slate-700">
                Get Started
              </Button>
            </div>
          </div>

          <div className="relative">
            {/* Main image */}
            <div className="relative rounded-xl overflow-hidden z-20">
              <Image
                src="/hero2.png"
                alt="Inventory Dashboard"
                width={500}
                height={400}
                className="w-full object-cover"
                priority
              />
            </div>

            {/* Floating elements */}
            <Image
              src={"/p1.jpg"}
              alt="Product icon"
              width={500}
              height={500}
              className="absolute left-4 -top-4 h-16 w-16 rounded-full object-cover shadow-md"
            />

            {/* <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full border-4 border-white bg-slate-50 p-2 shadow-md">
              <Image
                src="/p1.jpg"
                alt="Product icon"
                width={500}
                height={500}
                className="rounded-full object-cover"
              />
            </div> */}

            <div className="absolute -right-4 bottom-1/3 h-16 w-16 rounded-full border-4 border-white bg-slate-50 p-2 shadow-md">
              <Image
                src="/p2.jpg?height=48&width=48"
                alt="Product icon"
                width={500}
                height={500}
                className="rounded-full object-fill"
              />
            </div>

            <div className="absolute right-1/4 -top-4 h-16 w-16 rounded-full border-4 border-white bg-slate-50 p-2 shadow-md">
              <Image
                src="/p3.jpg"
                alt="Product icon"
                width={400}
                height={400}
                className="rounded-full object-cover"
              />
            </div>

            <svg
              className="absolute left-0 right-0 top-0 h-full w-full"
              viewBox="0 0 600 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 250 Q 150 150, 300 200 T 550 250"
                stroke="#e2e8f0"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <svg
              className="absolute left-0 right-10 top-0 h-full w-full"
              viewBox="0 0 600 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 250 Q 150 150, 300 200 T 550 250"
                stroke="#e2e8f0"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Featured modules */}
        <div className="mt-16 max-w-[90%] mx-auto py-16">
          <h2 className="mb-6 text-xl font-medium text-slate-800">
            Featured Modules
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Card className="overflow-hidden rounded">
              <div className="relative h-40 w-full">
                <Image
                  src="/hero.png"
                  alt="Inventory tracking"
                  width={320}
                  height={160}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800">
                  Core
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-slate-800">
                  Inventory Tracking
                </h3>
                <p className="text-sm text-slate-500">
                  Real-time stock management
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded">
              <div className="relative h-40 w-full">
                <Image
                  src="/hero.png"
                  alt="Sales orders"
                  width={320}
                  height={160}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800">
                  Pro
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-slate-800">Sales Orders</h3>
                <p className="text-sm text-slate-500">
                  Order processing and fulfillment
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded">
              <div className="relative h-40 w-full">
                <Image
                  src="/hero.png"
                  alt="Analytics dashboard"
                  width={320}
                  height={160}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800">
                  Pro
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-slate-800">
                  Analytics Dashboard
                </h3>
                <p className="text-sm text-slate-500">Insights and reporting</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Popular features */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-[90%] mx-auto py-16">
          <div>
            <h2 className="mb-6 text-xl font-medium text-slate-800">
              Popular Features
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-sm font-medium text-slate-800">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">
                    Multi-location Support
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage inventory across warehouses
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-sm font-medium text-slate-800">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">Batch Tracking</h3>
                  <p className="text-sm text-slate-500">
                    Track products by batch or lot number
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-sm font-medium text-slate-800">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">
                    Low Stock Alerts
                  </h3>
                  <p className="text-sm text-slate-500">
                    Automatic notifications for reordering
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="max-w-xs text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-slate-800">
                Ready to get started?
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Join thousands of businesses managing their inventory with
                InventoryPro
              </p>
              <Button className="rounded-full bg-slate-800 px-6 hover:bg-slate-700">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Box, Layers, ArrowRight, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SectionHeader from "./section-header";
import { MdInventory } from "react-icons/md";

export default function HeroSection() {
  // This helps prevent hydration errors by only rendering after the component is mounted
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardHover = {
    rest: { scale: 1 },
    hover: {
      scale: 1.03,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  // To avoid hydration issues with image paths that might change based on theme
  const imageSources = {
    hero: "/hero3.png",
    card: "/hero.png",
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="overflow-hidden">
        {/* Hero content */}
        <motion.div
          initial="hidden"
          animate={isMounted ? "visible" : "hidden"}
          variants={staggerChildren}
          className="grid gap-8 md:grid-cols-2 md:gap-12 max-w-[90%] mx-auto py-6"
        >
          <motion.div
            variants={fadeIn}
            className="flex flex-col justify-center"
          >
            <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-800 dark:text-white md:text-5xl lg:text-6xl">
              <span className="text-rose-500">Smart</span> inventory management
              made simple
            </h1>
            <p className="mb-8 text-slate-600 dark:text-slate-300 text-lg">
              Streamline your stock management with real-time tracking,
              multi-location support, and powerful analytics for retailers and
              wholesalers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button className="rounded-full bg-rose-600 px-8 py-4 shadow text-lg hover:bg-rose-700 transition-all">
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-8 shadow py-4 text-lg border-rose-300 hover:border-rose-400 transition-all group"
              >
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:tranrose-x-1 transition-transform" />
              </Button>
            </div>

            <p className="text-sm text-rose-500 dark:text-rose-400">
              No credit card required. 14-day free trial.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="relative">
            {/* Main image with animation */}
            {isMounted && (
              <motion.div
                className="relative overflow-hidden z-20"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <Image
                  src={imageSources.hero}
                  alt="Inventory Dashboard"
                  width={200}
                  height={100}
                  className="w-full object-cover"
                  priority
                />
              </motion.div>
            )}

            {/* Background elements */}
            <motion.div
              className="absolute -z-10 w-full h-full top-0 left-0"
              initial={{ opacity: 0 }}
              animate={isMounted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-purple-400 rounded-full opacity-10 blur-3xl"></div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Featured modules */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-6 max-w-[90%] mx-auto py-6"
        >
          <SectionHeader
            title="Featured Modules"
            description="All the tools you need to manage your inventory with ease and efficiency in one place."
            heading="All the tools you need to manage your inventory"
          />
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 py-6">
            {isMounted &&
              [
                {
                  title: "Inventory Tracking",
                  desc: "Real-time stock management",
                  tier: "Core",
                  img: "/inve1.jpg",
                  icon: <Box className="h-6 w-6 text-rose-500" />,
                },
                {
                  title: "Sales Orders",
                  desc: "Order processing and fulfillment",
                  tier: "Pro",
                  img: "/inve3.jpg",
                  icon: <ArrowRight className="h-6 w-6 text-green-500" />,
                },
                {
                  title: "Analytics Dashboard",
                  desc: "Insights and reporting",
                  tier: "Pro",
                  img: "/inve2.jpg",
                  icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
                },
              ].map((module, i) => (
                <motion.div
                  key={i}
                  variants={cardHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <Card className="overflow-hidden rounded border border-slate-200 hover:border-slate-300 transition-all h-full">
                    <div className="relative h-48 w-full bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center">
                      {/* {module.icon} */}
                      <Image
                        src={module.img || imageSources.card}
                        alt={module.title}
                        width={320}
                        height={160}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 shadow-lg">
                        {module.tier}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        {module.title}
                        {module.icon}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        {module.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Popular features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-12 md:grid-cols-2 max-w-[90%] mx-auto py-16"
        >
          <div>
            <h2 className="mb-8 text-2xl font-semibold text-slate-800 dark:text-white">
              Popular Features
            </h2>
            <motion.div
              className="space-y-4"
              variants={staggerChildren}
              initial="hidden"
              whileInView={isMounted ? "visible" : "hidden"}
              viewport={{ once: true }}
            >
              {isMounted &&
                [
                  {
                    num: 1,
                    title: "Multi-location Support",
                    desc: "Manage inventory across warehouses",
                  },
                  {
                    num: 2,
                    title: "Batch Tracking",
                    desc: "Track products by batch or lot number",
                  },
                  {
                    num: 3,
                    title: "Low Stock Alerts",
                    desc: "Automatic notifications for reordering",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    variants={fadeIn}
                    className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <span className="text-base font-semibold text-blue-600 dark:text-blue-300">
                        {feature.num}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView={isMounted ? "visible" : "hidden"}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <div className="max-w-md text-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-10 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
              <motion.div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Layers className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="mb-4 text-2xl font-semibold text-slate-800 dark:text-white">
                Ready to streamline your inventory?
              </h3>
              <p className="mb-8 text-slate-600 dark:text-slate-300">
                Join thousands of businesses managing their inventory with
                InventoryPro and save up to 35% on operational costs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="rounded-lg bg-blue-600 px-6 py-5 hover:bg-blue-700 transition-all">
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg px-6 py-5 border-slate-300 hover:border-slate-400 transition-all"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

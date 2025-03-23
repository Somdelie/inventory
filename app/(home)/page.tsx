import Iframe from "react-iframe";
import TechStackGrid from "@/components/frontend/Techstack";
import { GridBackground } from "@/components/reusable-ui/grid-background";
import ProjectComparison from "@/components/reusable-ui/project-comparison";
import ReUsableHero from "@/components/reusable-ui/reusable-hero";
import { BarChart2, Database, Package, Rocket, TrendingUp } from "lucide-react";
import Showcase from "@/components/frontend/showcase";
import PricingCard from "@/components/frontend/single-tier-pricing";
import FAQ from "@/components/frontend/FAQ";
import CustomizationCard from "@/components/frontend/customisation-card";
import Image from "next/image";
import { BorderBeam } from "@/components/magicui/border-beam";
import FeatureTabs from "@/components/frontend/SmoothTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/frontend/HeroSection";

export default async function Page() {
  const currentUsers = 300;

  return (
    <section className="overflow-hidden">
      <HeroSection />
      {/* Hero Section with improved height and spacing */}
      {/* <ReUsableHero
        theme="light"
        announcement={{
          text: "Introducing InventoryPro - Launch your inventory system in days",
        }}
        title={
          <>
            Complete Inventory Management
            <br />
            for Growing Businesses
          </>
        }
        mobileTitle="Complete Inventory Management System"
        subtitle="Get a powerful inventory management solution with real-time stock tracking, multi-location support, sales order processing, and purchase management - everything retailers, wholesalers, and manufacturers need to optimize their inventory operations and boost profitability."
        buttons={[
          {
            label: "Start Free Trial",
            href: "/register",
            primary: true,
          },
          {
            label: "View Demo",
            href: "/#demo",
          },
        ]}
        icons={[
          { icon: Database, position: "left" }, // Database icon for inventory
          { icon: BarChart2, position: "right" }, // Chart for analytics/reporting
          { icon: Package, position: "center" }, // Package for product/inventory focus
          // { icon: ShoppingCart, position: "bottom-left" }, // Additional icon for retail
          // { icon: TrendingUp, position: "bottom-right" }, // Additional icon for growth
        ]}
        backgroundStyle="neutral"
        className="min-h-[80vh] py-12"
        userCount={currentUsers > 10 ? currentUsers : null}
      /> */}

      {/* Trusted By Section */}
      <div className="bg-muted/30 py-6">
        <div className="mx-auto">
          <h2 className="text-center text-2xl font-semibold">
            Trusted By Industry Leaders
          </h2>
          <GridBackground>
            <div className=" py-8">
              <TechStackGrid />
            </div>
          </GridBackground>
        </div>
      </div>

      {/* Dashboard Preview Section with improved visual appeal */}
      <div className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Dashboard at Your Fingertips
            </h2>
            <p className="text-muted-foreground text-lg">
              Get real-time insights into your inventory, sales, and procurement
              with our intuitive dashboard
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden max-w-6xl mx-auto">
            <BorderBeam />
            <div className="p-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl">
              <Image
                src="/images/dash-2.webp"
                alt="InventoryPro Dashboard"
                width={1775}
                height={1109}
                className="w-full h-full rounded-lg object-cover border shadow-2xl"
                priority
              />
            </div>

            {/* Quick stats overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-4">
              <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">99.9% Uptime</span>
                </CardContent>
              </Card>
              <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Real-time Updates</span>
                </CardContent>
              </Card>
              <Card className="bg-background/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-3 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Lightning Fast</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Project Comparison with improved spacing */}
      <div className="py-20 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How We Compare
            </h2>
            <p className="text-muted-foreground text-lg">
              See why businesses choose InventoryPro over traditional solutions
            </p>
          </div>
          <ProjectComparison />
        </div>
      </div>

      {/* Feature Tabs Section with improved background */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/30 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to manage your inventory efficiently
            </p>
          </div>
          <GridBackground className="rounded-xl overflow-hidden">
            <FeatureTabs />
          </GridBackground>
        </div>
      </div>

      {/* Demo and Showcase Section */}
      <div id="demo" className="py-24 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See InventoryPro in Action
            </h2>
            <p className="text-muted-foreground text-lg">
              Watch how our platform streamlines inventory management
            </p>
          </div>

          <div className="max-w-6xl mx-auto relative mb-24">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl blur-sm"></div>
            <div className="relative bg-background rounded-lg p-1">
              <Iframe
                url="https://www.youtube.com/embed/TcyKfjikcIA?si=naix1jg9I2r0CnSu"
                width="100%"
                className="h-[32rem] rounded-lg"
                display="block"
                position="relative"
              />
            </div>
          </div>

          <div className="mb-24">
            <Showcase />
          </div>
        </div>
      </div>

      {/* Pricing Section with improved layout */}
      <div className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started today with our affordable plans
            </p>
          </div>
          <PricingCard />

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Need a custom solution?
            </p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Customization Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <CustomizationCard theme="light" />
        </div>
      </div>

      {/* FAQ Section with improved spacing */}
      <div className="py-24 bg-muted/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about InventoryPro
            </p>
          </div>
          <FAQ />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-b from-muted/10 to-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Inventory Management?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that have streamlined their operations
            with InventoryPro
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="px-8">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

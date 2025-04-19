import Link from "next/link";
import Image from "next/image";

export default function Logo({
  variant = "light",
  href = "/",
}: {
  variant?: "dark" | "light";
  href?: string;
}) {
  return (
    <Link href={href} className="flex items-center space-x-3">
      {variant === "dark" ? (
        <Image
          src="/invelogo-dark.png" // Using the existing PNG file
          alt="Somdelie Inventory Logo"
          width={200}
          height={60}
          className="object-contain"
          priority // Ensures fast loading
        />
      ) : (
        <Image
          src="/invelogo.png" // Using the existing PNG file
          alt="Somdelie Inventory Logo"
          width={200}
          height={60}
          className="object-contain"
          priority // Ensures fast loading
        />
      )}
    </Link>
  );
}

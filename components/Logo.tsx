import Image from "next/image";
import Link from "next/link";
import logoImage from "@/app/logo gamified.png";

type LogoSize = "sm" | "md";

type LogoProps = {
  href?: string;
  subtitle?: string;
  compact?: boolean;
  size?: LogoSize;
  className?: string;
};

export function Logo({ href = "/", size = "md", className = "" }: LogoProps) {
  const heightClass = size === "sm" ? "h-8" : "h-12";
  const image = (
    <Image
      src={logoImage}
      alt="AlMurshed logo"
      priority
      className={`${heightClass} w-auto`}
    />
  );

  const linkClass = className
    ? `inline-flex items-center ${className}`
    : "inline-flex items-center";

  return href ? (
    <Link href={href} aria-label="Go to landing page" className={linkClass}>
      {image}
    </Link>
  ) : (
    image
  );
}

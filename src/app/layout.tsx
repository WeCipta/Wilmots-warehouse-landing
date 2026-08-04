import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import { pally } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "lenis/dist/lenis.css";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wilmots Warehouse",
  description: "Wilmots Warehouse landing page",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        pally.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

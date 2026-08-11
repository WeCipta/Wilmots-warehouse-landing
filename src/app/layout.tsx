import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import Navbar from "@/app/(landing)/_components/navbar";
import { nunito } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "lenis/dist/lenis.css";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wilmot's Warehouse",
  description:
    "Created by Ricky Haggett, Richard Hogg, and David King (II). In Wilmot's Warehouse, your team will work co-operatively to organize the warehouse, using memory, imagination, and silly stories you make up.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans dark",
        nunito.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

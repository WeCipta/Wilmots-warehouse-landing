import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import {
  FollowMouseProvider,
  FollowMouseCursor,
} from "@/components/follow-mouse";
import Navbar from "@/app/(landing)/_components/navbar";
import { nunito } from "@/lib/fonts";
import { siteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import "lenis/dist/lenis.css";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteContent.meta.title,
  description: siteContent.meta.description,
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
        <FollowMouseProvider>
          <Navbar />
          <SmoothScroll>{children}</SmoothScroll>
          <FollowMouseCursor />
        </FollowMouseProvider>
      </body>
    </html>
  );
}

import localFont from "next/font/local";

export const pally = localFont({
  src: [
    {
      path: "../fonts/pally/Pally-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/pally/Pally-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/pally/Pally-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HomeButton } from "@/components/HomeButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QUADRANTS - See how you align",
  description: "Discover how you and your friends align. Answer slider questions and visualize your group's perspectives on a 2D grid.",
  openGraph: {
    title: "QUADRANTS - See how you align",
    description: "Discover how you and your friends align. Answer slider questions and visualize your group's perspectives on a 2D grid.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QUADRANTS - See how you align",
    description: "Discover how you and your friends align. Answer slider questions and visualize your group's perspectives on a 2D grid.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HomeButton />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Chakra_Petch, Barlow, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { HomeButton } from "@/components/HomeButton";

const chakraPetch = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${chakraPetch.variable} ${barlow.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <HomeButton />
        {children}
      </body>
    </html>
  );
}

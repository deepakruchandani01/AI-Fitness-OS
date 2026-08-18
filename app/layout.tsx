import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = { title: "AI Fitness OS", description: "Your health. Your data. Your AI coach." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#F6F7F4" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="font-sans min-h-dvh">{children}</body>
    </html>
  );
}

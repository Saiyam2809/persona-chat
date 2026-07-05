import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Persona Chat — Talk with Hitesh & Piyush",
  description:
    "An AI-powered chat app where you can talk with Hitesh Choudhary and Piyush Garg personas. Get mentorship on web development, system design, and more.",
  keywords: ["AI chat", "Hitesh Choudhary", "Piyush Garg", "web development", "mentorship"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { NavbarWrapper } from "@/components/layout/Navbar/NavbarWrapper";
import { Footer } from "@/components/layout/Footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Warkop",
  description: "LMS Pusdiklat BPS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50`}
      >
        <NavbarWrapper user={{ role: "Manager" }} />
      
        <div className="min-h-[calc(100vh-4rem)] bg-zinc-50">
          <QueryProvider>{children}</QueryProvider>
        </div>

        <Footer />
      </body>
    </html>
  );
}
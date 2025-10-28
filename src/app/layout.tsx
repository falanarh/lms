import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-zinc-50`}
      >
        <Navbar
          variant="solid"
          size="lg"
          items={[
            { key: "home", label: "Home" },
            { key: "my-course", label: "My Course" },
            { key: "management", label: "Management" }
          ]}
          activeKey={"my-course"}
          brandTitle="E-Warkop"
          user={{ role: "Manager" }}
        />
      
        <div className="min-h-[calc(100vh-4rem)] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 bg-zinc-50">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
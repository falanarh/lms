import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NavbarWrapper } from "@/components/layout/Navbar/NavbarWrapper";
import { Footer } from "@/components/layout/Footer/Footer";

const inter = Inter({
  variable: "--font-inter",
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
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-900 transition-colors duration-200`}
      >
        <ThemeProvider defaultTheme="system">
          <NavbarWrapper user={{ role: "Manager" }} />

          <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 transition-colors duration-200">
            <QueryProvider>{children}</QueryProvider>
          </div>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
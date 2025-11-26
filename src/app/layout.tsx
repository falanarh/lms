import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

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
          <QueryProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
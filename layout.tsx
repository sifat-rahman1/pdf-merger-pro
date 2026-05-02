import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Merge Pro - Merge PDF Files Instantly",
  description: "Drag and drop to merge your PDF files instantly. Fast, secure, and free PDF merging tool with modern premium design.",
  keywords: ["PDF merge", "merge PDF", "PDF tools", "PDF merger", "combine PDF", "join PDF"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "PDF Merge Pro - Merge PDF Files Instantly",
    description: "Fast, secure, and free PDF merging tool with drag and drop interface",
    url: "https://chat.z.ai",
    siteName: "PDF Merge Pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Merge Pro - Merge PDF Files Instantly",
    description: "Fast, secure, and free PDF merging tool",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

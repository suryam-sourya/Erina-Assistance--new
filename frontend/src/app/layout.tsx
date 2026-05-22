import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Shared/Navbar";
import Footer from "@/components/Shared/Footer";
import EmergencyButton from "@/components/Shared/EmergencyButton";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Erina Assistance | 24/7 Roadside Help",
  description: "AI-powered 24/7 roadside assistance in Bangalore. Get emergency help in minutes. Towing, Flat Tyre, Battery Jumpstart, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col relative`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <EmergencyButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

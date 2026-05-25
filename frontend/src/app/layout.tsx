import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Shared/Navbar";
import Footer from "@/components/Shared/Footer";
import EmergencyButton from "@/components/Shared/EmergencyButton";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Erina Assistance | 24/7 AI-Powered Roadside Help in Bangalore",
  description:
    "India's smartest roadside assistance. Get emergency towing, flat tyre repair, battery jumpstart, fuel delivery & EV charging in Bangalore within 30 minutes. 24/7 live tracking, verified technicians.",
  keywords: [
    "roadside assistance bangalore",
    "24/7 towing service",
    "emergency breakdown help",
    "flat tyre repair near me",
    "battery jumpstart service",
    "fuel delivery bangalore",
    "EV charging assistance",
    "bike towing service",
    "car towing near me",
    "erina assistance",
  ],
  openGraph: {
    title: "Erina Assistance | 24/7 AI-Powered Roadside Help",
    description:
      "Stranded on the road? Get emergency help in under 30 minutes — towing, battery, tyre, fuel & more. AI-dispatched, GPS-tracked, verified technicians.",
    url: "https://www.erinaassistance.in",
    siteName: "Erina Assistance",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Erina Assistance | 24/7 Roadside Help in Bangalore",
    description:
      "AI-powered emergency roadside assistance. Towing, battery, tyre, fuel delivery — dispatched in minutes.",
  },
  other: {
    "theme-color": "#FF3366",
  },
};

// JSON-LD structured data for LocalBusiness
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Erina Assistance",
  description: "24/7 AI-powered roadside assistance in Bangalore",
  url: "https://www.erina-assistance.com",
  telephone: "+917340066655",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Shop No. 02, Dinnur Main Road, Kadugodi Colony, Opp: Srihalli Cafe",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560067",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.9902,
    longitude: 77.7602,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
  priceRange: "₹₹",
  sameAs: ["https://wa.me/917340066655"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin="" 
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col relative`}
        suppressHydrationWarning
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

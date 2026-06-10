import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, CheckCircle2, Shield, Clock, MapPin } from 'lucide-react';
import { SEO_LOCATIONS, SEO_SERVICES } from '@/lib/seo-data';
import TrustBanner from '@/components/Home/TrustBanner';
import ServicesSection from '@/components/Home/ServicesSection';

interface PageProps {
  params: Promise<{ seoSlug: string }>;
}

export function generateStaticParams() {
  const paths: { seoSlug: string }[] = [];
  SEO_SERVICES.forEach((service) => {
    SEO_LOCATIONS.forEach((location) => {
      paths.push({
        seoSlug: `${service.slug}-in-${location.slug}`,
      });
    });
  });
  return paths;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Extract service and location from the slug
  const match = resolvedParams.seoSlug.match(/^(.*?)-in-(.*)$/);
  if (!match) return { title: 'Erina Assistance' };
  
  const [, serviceSlug, locationSlug] = match;
  const serviceData = SEO_SERVICES.find((s) => s.slug === serviceSlug);
  const locationData = SEO_LOCATIONS.find((l) => l.slug === locationSlug);

  if (!serviceData || !locationData) {
    return {
      title: 'Erina Assistance',
    };
  }

  return {
    title: `24/7 ${serviceData.name} in ${locationData.name} | Erina Assistance`,
    description: `Stuck in ${locationData.name}? Get immediate ${serviceData.name.toLowerCase()} and roadside assistance from verified professionals. Fast response, transparent pricing. Call +91 73400 66655.`,
    openGraph: {
      title: `Fast & Reliable ${serviceData.name} in ${locationData.name}`,
      description: `Emergency ${serviceData.name.toLowerCase()} services available 24/7 in ${locationData.name}, Bangalore.`,
      url: `https://www.erinaassistance.in/${resolvedParams.seoSlug}`,
      siteName: 'Erina Assistance',
      images: [
        {
          url: '/og-image.jpg', // Placeholder for OG image
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
  };
}

export default async function SeoLandingPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  // Extract service and location from the slug
  const match = resolvedParams.seoSlug.match(/^(.*?)-in-(.*)$/);
  if (!match) notFound();
  
  const [, serviceSlug, locationSlug] = match;
  const serviceData = SEO_SERVICES.find((s) => s.slug === serviceSlug);
  const locationData = SEO_LOCATIONS.find((l) => l.slug === locationSlug);

  if (!serviceData || !locationData) {
    notFound();
  }

  return (
    <>
      {/* Hyper-Local Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-[70vh] flex items-center bg-dark text-white">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div 
            className="absolute inset-0 bg-cover bg-[center_35%]"
            style={{ backgroundImage: 'url(/hero-bg.png)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Live Tracking & Dispatch in {locationData.name}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              Fast & Reliable <span className="text-primary">{serviceData.name}</span> in <span className="text-white border-b-4 border-primary/50">{locationData.name}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              {serviceData.shortDesc}. We are the nearest and fastest emergency roadside assistance provider covering the entire {locationData.name} area. Reach out to us now for immediate help.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a 
                href="tel:+917340066655"
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(238,42,123,0.3)]"
              >
                <Phone size={24} />
                Call +91 73400 66655
              </a>
              <Link 
                href={`/booking?service=${serviceData.slug}&location=${locationData.slug}`}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all"
              >
                <MapPin size={24} />
                Book Online
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span>ETA 20-30 Mins</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-emerald-500" />
                <span>24/7 Service</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-500" />
                <span>Verified Partners</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBanner />
      <ServicesSection />
    </>
  );
}

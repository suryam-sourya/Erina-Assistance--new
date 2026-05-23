import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";

export const dynamic = "force-dynamic";

const defaultStories = [
  {
    name: 'Arjun Krishnan',
    role: 'Software Architect',
    location: 'Nandi Hills Road, Bangalore',
    serviceType: 'battery',
    serviceLabel: 'Battery Jumpstart',
    eta: '22 Mins ETA',
    technician: 'Ramesh Kumar',
    rating: 5,
    storyTitle: 'Stranded at 2:30 AM on a Weekend',
    quote: 'My battery died while returning from Nandi Hills late at night. Stranded in the pitch dark, I requested a jumpstart. The technician Ramesh arrived in just 22 minutes with a battery pack and got my car running in no time. Absolutely life-saving service!',
    avatarColor: 'from-orange-500 to-red-500',
    initials: 'AK',
  },
  {
    name: 'Sneha Reddy',
    role: 'Product Designer',
    location: 'NICE Road Expressway',
    serviceType: 'towing',
    serviceLabel: 'Flatbed Towing',
    eta: '28 Mins ETA',
    technician: 'Amit Singh',
    rating: 5,
    storyTitle: 'Heavy Downpour & Transmission Failure',
    quote: 'During a massive storm on NICE Road, my sedan suffered a major gearbox failure. Erina dispatched a flatbed tow truck instantly. Amit, the technician, was extremely professional, taking utmost care of my vehicle. The live tracking gave me immense peace of mind.',
    avatarColor: 'from-blue-500 to-indigo-500',
    initials: 'SR',
  },
  {
    name: 'Dr. Vijay Shekhar',
    role: 'Cardiologist',
    location: 'Outer Ring Road (near Marathahalli)',
    serviceType: 'ev',
    serviceLabel: 'Mobile EV Charging',
    eta: '18 Mins ETA',
    technician: 'Vikram Rao',
    rating: 5,
    storyTitle: 'EV Battery Depleted in Traffic Gridlock',
    quote: 'Got stuck in an unexpected 2-hour traffic jam and my EV battery dropped to 1%. I was completely stranded. Erina sent a mobile charging van within 18 minutes. They plugged me in for a quick 15-minute top-up, which was enough to safely reach my home charger.',
    avatarColor: 'from-emerald-500 to-teal-500',
    initials: 'VS',
  },
  {
    name: 'Priya Mudaliar',
    role: 'Retail Manager',
    location: 'Phoenix Marketcity, Whitefield',
    serviceType: 'lockout',
    serviceLabel: 'Lockout Assistance',
    eta: '15 Mins ETA',
    technician: 'Nitesh Gowda',
    rating: 5,
    storyTitle: 'Keys Locked Inside the Boot',
    quote: 'After a long shopping day, I accidentally loaded my keys into the boot and closed it. I was locked out. The lockout expert Nitesh arrived in 15 minutes. Using specialized non-destructive tools, he unlocked my door within 3 minutes without a single scratch. Incredible!',
    avatarColor: 'from-purple-500 to-pink-500',
    initials: 'PM',
  }
];

export async function GET() {
  try {
    await connectDB();
    
    // Check if collection is empty
    let testimonials = await Testimonial.find().sort({ createdAt: -1 });
    
    if (testimonials.length === 0) {
      // Seed default testimonials
      await Testimonial.insertMany(defaultStories);
      testimonials = await Testimonial.find().sort({ createdAt: -1 });
    }
    
    // Normalize MongoDB document _id to string id
    const normalized = testimonials.map(t => {
      const obj = t.toObject();
      return {
        ...obj,
        id: obj.id || obj._id.toString(),
      };
    });

    return NextResponse.json({
      success: true,
      testimonials: normalized,
    });
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}

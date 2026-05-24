import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Pricing from "@/backend/models/Pricing";
import { DEFAULT_PRICING } from "@/frontend/lib/pricingEngine";

export const dynamic = "force-dynamic";

// Helper to set CORS headers
function corsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

export async function GET() {
  try {
    await connectDB();
    
    // Find active pricing configuration
    let pricingDoc = await Pricing.findOne({ isActive: true });
    
    // If not found, return compile-in defaults
    if (!pricingDoc) {
      return corsResponse({
        success: true,
        pricing: DEFAULT_PRICING,
        isDefault: true,
      });
    }

    // Normalize output to match PricingConfig format
    const pricingData = {
      serviceBaseFees: pricingDoc.serviceBaseFees,
      ratePerKm: pricingDoc.ratePerKm,
      vehicleMultipliers: pricingDoc.vehicleMultipliers,
      nightSurcharge: pricingDoc.nightSurcharge,
      peakHourSurcharge: pricingDoc.peakHourSurcharge,
      emergencySurcharge: pricingDoc.emergencySurcharge,
    };

    return corsResponse({
      success: true,
      pricing: pricingData,
    });
  } catch (error: any) {
    console.error("Error in GET /api/pricing:", error);
    return corsResponse(
      { success: false, error: error.message || error },
      500
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    if (!body || !body.pricing) {
      return corsResponse({ success: false, error: "Invalid request payload. Must provide 'pricing' object." }, 400);
    }

    const { serviceBaseFees, ratePerKm, vehicleMultipliers, nightSurcharge, peakHourSurcharge, emergencySurcharge } = body.pricing;

    // Upsert pricing configuration where isActive = true
    const updatedPricing = await Pricing.findOneAndUpdate(
      { isActive: true },
      {
        $set: {
          serviceBaseFees,
          ratePerKm,
          vehicleMultipliers,
          nightSurcharge,
          peakHourSurcharge,
          emergencySurcharge,
        },
      },
      { new: true, upsert: true }
    );

    return corsResponse({
      success: true,
      pricing: {
        serviceBaseFees: updatedPricing.serviceBaseFees,
        ratePerKm: updatedPricing.ratePerKm,
        vehicleMultipliers: updatedPricing.vehicleMultipliers,
        nightSurcharge: updatedPricing.nightSurcharge,
        peakHourSurcharge: updatedPricing.peakHourSurcharge,
        emergencySurcharge: updatedPricing.emergencySurcharge,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/pricing:", error);
    return corsResponse(
      { success: false, error: error.message || error },
      500
    );
  }
}

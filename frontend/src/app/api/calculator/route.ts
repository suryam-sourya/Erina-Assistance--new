import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startCity, endCity, make, model, year, batteryAge, lastService, phone } = body;

    // Simulate Distance and Terrain (Normally via Google Maps API)
    // For this demonstration, we'll generate mock data based on input length or a standard 350km assumption
    const distanceKm = 350; 
    const isMountainous = (endCity || "").toLowerCase().includes("ooty") || (endCity || "").toLowerCase().includes("shimla");
    
    // Simulate Weather (Normally via OpenWeatherMap API)
    const tempC = 38; // Hot summer day simulation

    // --- Complex Risk Algorithm ---
    let riskScore = 0;
    
    // 1. Vehicle Age Factor
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - parseInt(year || currentYear.toString());
    if (carAge > 10) riskScore += 3;
    else if (carAge > 5) riskScore += 1;

    // 2. Battery Factor (Extremely sensitive to heat/cold)
    if (batteryAge === '3+') riskScore += 3;
    else if (batteryAge === '1-3') riskScore += 1;

    // 3. Service Factor
    if (lastService === '6+') riskScore += 2;
    else if (lastService === '3-6') riskScore += 1;

    // 4. Terrain & Weather Modifiers
    if (isMountainous) riskScore += 2;
    if (tempC > 35 && batteryAge === '3+') riskScore += 2; // Heat kills old batteries

    let finalRisk: "low" | "medium" | "high" = "low";
    if (riskScore >= 6) finalRisk = "high";
    else if (riskScore >= 3) finalRisk = "medium";

    // --- Generate Custom Insights & Tire Pressure ---
    const insights: string[] = [];
    
    // Tire Pressure logic based on Make/Heat
    let recommendedPsi = 33; // Default
    if (make.toLowerCase() === "toyota" || make.toLowerCase() === "mahindra") recommendedPsi = 35;
    if (tempC > 35) {
      recommendedPsi -= 2; // Reduce tire pressure slightly in extreme heat to prevent blowout
      insights.push(`Since the route temperature is ${tempC}°C, keep tire pressure slightly lower at exactly ${recommendedPsi} PSI to prevent highway blowouts from heat expansion.`);
    } else {
      insights.push(`Keep your tire pressure at ${recommendedPsi} PSI for optimal highway mileage and safety.`);
    }

    if (batteryAge === '3+') {
      insights.push(`Your ${year} ${make} ${model}'s battery is in the high-risk failure zone. Alternator stress on a ${distanceKm}km trip could leave you stranded.`);
    }

    if (isMountainous) {
      insights.push(`Mountain terrain detected! Check your coolant levels. Uphill driving puts 30% more load on your radiator.`);
    }

    if (lastService === '6+') {
      insights.push(`Since your last service was over 6 months ago, check your engine oil dipstick and top up windshield wiper fluid before departure.`);
    }

    const payload = {
      startCity, endCity, make, model, year, batteryAge, lastService, phone,
      finalRisk, distanceKm, tempC, recommendedPsi, insights,
      timestamp: new Date().toISOString()
    };

    // Save Lead to Firebase Firestore Realtime Database
    try {
      if (db && typeof db.app !== 'undefined') {
        const leadId = `LEAD-${Date.now()}`;
        const firestorePromise = setDoc(doc(db, "road_trip_leads", leadId), payload);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
        await Promise.race([firestorePromise, timeoutPromise]);
      }
    } catch (fsErr) {
      console.warn("Firebase Sync Failed or Timed Out:", fsErr);
    }

    return NextResponse.json({
      success: true,
      data: payload
    });

  } catch (error: any) {
    console.error("Calculator Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

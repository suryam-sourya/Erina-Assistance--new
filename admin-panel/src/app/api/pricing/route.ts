/**
 * GET /api/pricing
 *
 * Returns the current dynamic pricing configuration so the customer
 * frontend can fetch live admin rates.
 *
 * The settings are stored in localStorage on the admin panel side, so
 * this endpoint returns the compiled-in defaults. The admin panel UI
 * updates these values and they're persisted locally — for a future
 * MongoDB-backed approach, swap DEFAULT_PRICING here with a DB fetch.
 */

import { NextResponse } from 'next/server';
import { DEFAULT_PRICING } from '@/frontend/lib/pricingEngine';

export async function GET() {
  return NextResponse.json(
    { success: true, pricing: DEFAULT_PRICING },
    {
      headers: {
        // Allow cross-origin requests from the customer frontend
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}

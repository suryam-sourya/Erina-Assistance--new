import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import SOSAlert from '@/models/SOSAlert';

export async function POST(req: Request) {
  try {
    const { latitude, longitude } = await req.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const newAlert = await SOSAlert.create({
      latitude,
      longitude,
      status: 'PENDING',
    });

    return NextResponse.json(
      { success: true, alert: newAlert },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating SOS alert:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

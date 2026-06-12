import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/mongodb';
import SOSAlert from '@/backend/models/SOSAlert';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const alerts = await SOSAlert.find({}).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(alerts, { status: 200 });
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    await connectDB();
    const updated = await SOSAlert.findByIdAndUpdate(id, { status }, { new: true });
    
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating SOS alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

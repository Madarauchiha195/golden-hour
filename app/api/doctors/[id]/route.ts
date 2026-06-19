import { NextRequest, NextResponse } from 'next/server';
// Removed authMiddleware import
import getDoctorModel from '@/models/Doctor';

async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const Model = await getDoctorModel();
    const { id } = params;
    if (req.method === 'GET') {
      const doc = await Model.findById(id);
      if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: doc });
    }
    if (req.method === 'PUT') {
      const body = await req.json();
      const doc = await Model.findByIdAndUpdate(id, body, { new: true });
      if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: doc });
    }
    if (req.method === 'DELETE') {
      await Model.findByIdAndDelete(id);
      return NextResponse.json({ success: true, data: { deleted: true } });
    }
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}


export const GET = handler;
export const PUT = handler;
export const DELETE = handler;

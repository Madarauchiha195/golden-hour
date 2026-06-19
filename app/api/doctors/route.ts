import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getCurrentUserId } from 'lyzr-architect';
const getCurrentUserIdMock = () => 'demo-user-123';
import getDoctorModel from '@/models/Doctor';

async function handler(req: NextRequest) {
  try {
    const Model = await getDoctorModel();
    if (req.method === 'GET') {
      const data = await Model.find({});
      return NextResponse.json({ success: true, data });
    }
    if (req.method === 'POST') {
      const body = await req.json();
      const doc = await Model.create({ ...body, owner_user_id: getCurrentUserIdMock() });
      return NextResponse.json({ success: true, data: doc });
    }
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}


export const GET = handler;
export const POST = handler;

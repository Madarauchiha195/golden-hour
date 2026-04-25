import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from 'lyzr-architect';
import getWorkflowRunModel from '@/models/WorkflowRun';

async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const Model = await getWorkflowRunModel();
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
    return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

const protectedHandler = authMiddleware(handler);
export const GET = protectedHandler;
export const PUT = protectedHandler;

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { verifySession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await verifySession();
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    await dbConnect();
    const query: Record<string, any> = {};
    if (statusFilter && ['PENDING', 'APPROVED', 'DENIED', 'SUSPENDED'].includes(statusFilter)) {
      query.status = statusFilter;
    }

    const users = await User.find(query).select('-pinHash').sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

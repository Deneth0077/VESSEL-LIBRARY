import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import AuditLog from '@/models/AuditLog';
import LoginHistory from '@/models/LoginHistory';
import { verifySession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';

export async function GET(req: NextRequest) {
  try {
    const user = await verifySession();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'audit';

    await dbConnect();

    if (type === 'login') {
      const logins = await LoginHistory.find().sort({ loginAt: -1 }).limit(100).lean();
      return NextResponse.json({ logins });
    }

    const auditLogs = await AuditLog.find().sort({ timestamp: -1 }).limit(100).lean();
    return NextResponse.json({ auditLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, verifySession } from '@/lib/auth/session';
import { logAudit } from '@/lib/audit/logger';

export async function POST(req: NextRequest) {
  try {
    const user = await verifySession();
    if (user) {
      await logAudit({
        userId: user._id.toString(),
        userName: user.fullName,
        userRole: user.role,
        action: 'USER_LOGOUT',
        target: user.employeeId,
      });
    }

    clearSessionCookie();

    return NextResponse.json({ message: 'Logged out successfully.' });
  } catch (error) {
    clearSessionCookie();
    return NextResponse.json({ message: 'Logged out.' });
  }
}

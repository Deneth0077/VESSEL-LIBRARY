import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { verifySession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import { logAudit } from '@/lib/audit/logger';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await verifySession();
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    await dbConnect();
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    user.status = 'APPROVED';
    user.approvedAt = new Date();
    user.approvedBy = currentUser.employeeId;
    await user.save();

    await logAudit({
      userId: currentUser._id.toString(),
      userName: currentUser.fullName,
      userRole: 'ADMIN',
      action: 'USER_REACTIVATED',
      target: user.employeeId,
      metadata: { targetUserId: user._id.toString(), targetName: user.fullName },
    });

    return NextResponse.json({ message: `User ${user.fullName} reactivated successfully.`, user });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

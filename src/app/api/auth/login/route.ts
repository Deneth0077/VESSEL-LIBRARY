import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import LoginHistory from '@/models/LoginHistory';
import { loginSchema } from '@/lib/validation/schemas';
import { verifyPin, hashPin, createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { logAudit } from '@/lib/audit/logger';

export async function POST(req: NextRequest) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Unknown';

  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { employeeId, pin } = parseResult.data;
    const formattedEmpId = employeeId.toUpperCase();

    await dbConnect();

    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@vessellibrary.com').toLowerCase();
    const envAdminEmpId = (process.env.ADMIN_EMPLOYEE_ID || 'EMP000').toUpperCase();
    const envAdminPass = process.env.ADMIN_PASSWORD || 'admin1234password!';
    const envAdminPin = process.env.ADMIN_PIN || '1234';

    const isEnvAdminIdentifier =
      employeeId.toLowerCase() === envAdminEmail ||
      formattedEmpId === envAdminEmpId;

    // Find user by Employee ID or Email
    let user = await User.findOne({
      $or: [{ employeeId: formattedEmpId }, { email: employeeId.toLowerCase() }],
    });

    if (!user && isEnvAdminIdentifier) {
      const pinHash = await hashPin(envAdminPin);
      user = await User.create({
        fullName: process.env.ADMIN_FULL_NAME || 'System Administrator',
        employeeId: envAdminEmpId,
        email: envAdminEmail,
        pinHash,
        role: 'ADMIN',
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: 'SYSTEM_AUTO',
      });
    }

    if (!user) {
      await LoginHistory.create({
        employeeId: formattedEmpId,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'User not found',
      });
      return NextResponse.json({ message: 'Invalid Employee ID or PIN.' }, { status: 401 });
    }

    // Verify PIN or Admin Password match
    let isPinValid = await verifyPin(pin, user.pinHash);
    if (!isPinValid && isEnvAdminIdentifier && (pin === envAdminPass || pin === envAdminPin)) {
      isPinValid = true;
      user.pinHash = await hashPin(pin.length === 4 ? pin : envAdminPin);
      await user.save();
    }

    if (!isPinValid) {
      await LoginHistory.create({
        userId: user._id.toString(),
        employeeId: user.employeeId,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Invalid PIN',
      });
      return NextResponse.json({ message: 'Invalid Employee ID or PIN.' }, { status: 401 });
    }

    // Verify Status: MUST BE APPROVED
    if (user.status === 'PENDING') {
      await LoginHistory.create({
        userId: user._id.toString(),
        employeeId: user.employeeId,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Account PENDING approval',
      });
      return NextResponse.json(
        { message: 'Your account is pending administrator approval. Please wait for an admin to approve your request.' },
        { status: 403 }
      );
    }

    if (user.status === 'SUSPENDED' || user.status === 'DENIED') {
      await LoginHistory.create({
        userId: user._id.toString(),
        employeeId: user.employeeId,
        ipAddress,
        userAgent,
        success: false,
        failureReason: `Account ${user.status}`,
      });
      return NextResponse.json(
        { message: `Your account access has been ${user.status.toLowerCase()}. Please contact system administration.` },
        { status: 403 }
      );
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Log successful login
    await LoginHistory.create({
      userId: user._id.toString(),
      employeeId: user.employeeId,
      ipAddress,
      userAgent,
      success: true,
    });

    // Generate JWT token
    const token = await createSessionToken({
      userId: user._id.toString(),
      employeeId: user.employeeId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    });

    setSessionCookie(token);

    await logAudit({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: user.role,
      action: 'USER_LOGIN',
      target: user.employeeId,
      metadata: { ipAddress, userAgent },
    });

    return NextResponse.json({
      message: 'Login successful.',
      user: {
        id: user._id,
        fullName: user.fullName,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

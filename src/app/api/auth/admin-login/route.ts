import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import LoginHistory from '@/models/LoginHistory';
import { adminLoginSchema } from '@/lib/validation/schemas';
import { verifyPin, hashPin, createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { logAudit } from '@/lib/audit/logger';

export async function POST(req: NextRequest) {
  const ipAddress = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Unknown';

  try {
    const body = await req.json();
    const parseResult = adminLoginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { identifier, password } = parseResult.data;

    await dbConnect();

    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@vessellibrary.com').toLowerCase();
    const envAdminEmpId = (process.env.ADMIN_EMPLOYEE_ID || 'EMP000').toUpperCase();
    const envAdminPass = process.env.ADMIN_PASSWORD || 'admin1234password!';
    const envAdminPin = process.env.ADMIN_PIN || '1234';

    const isEnvAdminIdentifier =
      identifier.toLowerCase() === envAdminEmail ||
      identifier.toUpperCase() === envAdminEmpId;

    // 1. Find user by Email or Employee ID
    let user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { employeeId: identifier.toUpperCase() },
      ],
    });

    // 2. Auto-create Admin user if database is fresh and matching env admin credentials
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
        employeeId: identifier.toUpperCase(),
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Admin login failed: User not found',
      });
      return NextResponse.json({ message: 'Invalid administrator credentials.' }, { status: 401 });
    }

    // 3. Verify PIN or Admin Password
    let isValid = await verifyPin(password, user.pinHash);
    if (!isValid && (password === envAdminPass || password === envAdminPin)) {
      isValid = true;
      user.pinHash = await hashPin(password.length === 4 ? password : envAdminPin);
      await user.save();
    }

    if (!isValid) {
      await LoginHistory.create({
        userId: user._id.toString(),
        employeeId: user.employeeId,
        ipAddress,
        userAgent,
        success: false,
        failureReason: 'Admin login failed: Invalid password or PIN',
      });
      return NextResponse.json({ message: 'Invalid administrator credentials.' }, { status: 401 });
    }

    // 4. Ensure account has ADMIN role & APPROVED status
    if (user.role !== 'ADMIN') {
      if (isEnvAdminIdentifier) {
        user.role = 'ADMIN';
        user.status = 'APPROVED';
        await user.save();
      } else {
        return NextResponse.json(
          { message: 'This account does not have Administrator privileges.' },
          { status: 403 }
        );
      }
    }

    if (user.status !== 'APPROVED') {
      return NextResponse.json({ message: 'Administrator account is inactive.' }, { status: 403 });
    }

    user.lastLoginAt = new Date();
    await user.save();

    await LoginHistory.create({
      userId: user._id.toString(),
      employeeId: user.employeeId,
      ipAddress,
      userAgent,
      success: true,
    });

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
      userRole: 'ADMIN',
      action: 'ADMIN_LOGIN',
      target: user.employeeId,
      metadata: { ipAddress, userAgent },
    });

    return NextResponse.json({
      message: 'Admin authentication successful.',
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
    console.error('Admin login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { registerSchema } from '@/lib/validation/schemas';
import { hashPin } from '@/lib/auth/session';
import { logAudit } from '@/lib/audit/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fullName, employeeId, email, pin } = parseResult.data;

    await dbConnect();

    // Check if Employee ID or Email already exists
    const existingEmployee = await User.findOne({ employeeId: employeeId.toUpperCase() });
    if (existingEmployee) {
      return NextResponse.json({ message: 'Employee ID is already registered.' }, { status: 409 });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ message: 'Email address is already registered.' }, { status: 409 });
    }

    // Hash the 4-digit PIN using bcrypt
    const pinHash = await hashPin(pin);

    // Initial status MUST be PENDING
    const newUser = await User.create({
      fullName,
      employeeId: employeeId.toUpperCase(),
      email: email.toLowerCase(),
      pinHash,
      role: 'USER',
      status: 'PENDING',
    });

    await logAudit({
      userId: newUser._id.toString(),
      userName: newUser.fullName,
      userRole: 'USER',
      action: 'USER_REGISTERED',
      target: newUser.employeeId,
      metadata: { email: newUser.email },
    });

    return NextResponse.json(
      {
        message: 'Registration successful! Your account is pending administrator approval.',
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          employeeId: newUser.employeeId,
          email: newUser.email,
          status: newUser.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

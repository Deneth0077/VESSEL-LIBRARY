import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Vessel from '@/models/Vessel';
import VesselEntry from '@/models/VesselEntry';
import { verifySession } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/rbac';
import { vesselSchema } from '@/lib/validation/schemas';
import { logAudit } from '@/lib/audit/logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await dbConnect();
    const vessel = await Vessel.findById(params.id).lean();

    if (!vessel) {
      return NextResponse.json({ message: 'Vessel profile not found.' }, { status: 404 });
    }

    return NextResponse.json({ vessel });
  } catch (error) {
    console.error('Error getting vessel:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = vesselSchema.partial().safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await dbConnect();
    const vessel = await Vessel.findById(params.id);

    if (!vessel) {
      return NextResponse.json({ message: 'Vessel not found.' }, { status: 404 });
    }

    Object.assign(vessel, parseResult.data, {
      updatedBy: user._id.toString(),
    });

    await vessel.save();

    await logAudit({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: user.role,
      action: 'VESSEL_UPDATED',
      target: vessel.vesselName,
      metadata: { vesselId: vessel._id.toString() },
    });

    return NextResponse.json({ message: 'Vessel profile updated successfully.', vessel });
  } catch (error) {
    console.error('Error updating vessel:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifySession();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    await dbConnect();
    const vessel = await Vessel.findById(params.id);

    if (!vessel) {
      return NextResponse.json({ message: 'Vessel not found.' }, { status: 404 });
    }

    // Delete associated entries as well
    await VesselEntry.deleteMany({ vesselId: params.id });
    await Vessel.findByIdAndDelete(params.id);

    await logAudit({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: 'ADMIN',
      action: 'VESSEL_DELETED',
      target: vessel.vesselName,
      metadata: { vesselId: params.id, imoNumber: vessel.imoNumber },
    });

    return NextResponse.json({ message: 'Vessel profile and associated entries deleted successfully.' });
  } catch (error) {
    console.error('Error deleting vessel:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

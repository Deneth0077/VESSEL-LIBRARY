import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Vessel from '@/models/Vessel';
import { verifySession } from '@/lib/auth/session';
import { vesselSchema } from '@/lib/validation/schemas';
import { logAudit } from '@/lib/audit/logger';

export async function GET(req: NextRequest) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryStr = searchParams.get('q') || searchParams.get('search') || '';

    await dbConnect();

    let query: Record<string, any> = {};
    if (queryStr.trim()) {
      const regex = new RegExp(queryStr.trim(), 'i');
      query = {
        $or: [
          { vesselName: regex },
          { imoNumber: regex },
          { vesselType: regex },
          { flag: regex },
          { ownerOperator: regex },
          { callSign: regex },
        ],
      };
    }

    const vessels = await Vessel.find(query).sort({ vesselName: 1 }).lean();

    return NextResponse.json({ vessels, count: vessels.length });
  } catch (error) {
    console.error('Error fetching vessels:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = vesselSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check IMO uniqueness if provided
    const rawImo = parseResult.data.imoNumber?.trim() || '';
    if (rawImo) {
      const existingImo = await Vessel.findOne({ imoNumber: rawImo });
      if (existingImo) {
        return NextResponse.json({ message: 'A vessel with this IMO Number already exists.' }, { status: 409 });
      }
    }

    const vesselData = {
      ...parseResult.data,
      vesselName: parseResult.data.vesselName.trim(),
      imoNumber: rawImo,
      flag: parseResult.data.flag?.trim() || '',
      ownerOperator: parseResult.data.ownerOperator?.trim() || '',
      callSign: parseResult.data.callSign?.trim() || '',
      yearBuilt: parseResult.data.yearBuilt || new Date().getFullYear(),
      createdBy: user._id.toString(),
      updatedBy: user._id.toString(),
    };

    const newVessel = await Vessel.create(vesselData);

    await logAudit({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: user.role,
      action: 'VESSEL_CREATED',
      target: newVessel.vesselName,
      metadata: { vesselId: newVessel._id.toString(), imoNumber: newVessel.imoNumber },
    });

    return NextResponse.json({ message: 'Vessel profile created successfully.', vessel: newVessel }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vessel:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

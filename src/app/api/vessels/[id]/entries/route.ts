import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import VesselEntry from '@/models/VesselEntry';
import Vessel from '@/models/Vessel';
import { verifySession } from '@/lib/auth/session';
import { vesselEntrySchema } from '@/lib/validation/schemas';
import { logAudit } from '@/lib/audit/logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    await dbConnect();

    const query: Record<string, any> = { vesselId: params.id };
    if (section) {
      query.section = section;
    }

    const entries = await VesselEntry.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching vessel entries:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = vesselEntrySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await dbConnect();

    const vessel = await Vessel.findById(params.id);
    if (!vessel) {
      return NextResponse.json({ message: 'Vessel profile not found.' }, { status: 404 });
    }

    const newEntry = await VesselEntry.create({
      vesselId: params.id,
      section: parseResult.data.section,
      text: parseResult.data.text.trim(),
      solution: parseResult.data.solution?.trim() || '',
      photographs: parseResult.data.photographs || [],
      createdBy: user._id.toString(),
      createdByName: user.fullName,
      updatedBy: user._id.toString(),
      updatedByName: user.fullName,
    });

    await logAudit({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: user.role,
      action: 'ENTRY_CREATED',
      target: `${vessel.vesselName} - ${parseResult.data.section}`,
      metadata: { vesselId: params.id, entryId: newEntry._id.toString(), section: parseResult.data.section },
    });

    return NextResponse.json({ message: 'Entry added successfully.', entry: newEntry }, { status: 201 });
  } catch (error) {
    console.error('Error creating vessel entry:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

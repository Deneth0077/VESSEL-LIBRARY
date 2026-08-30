import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import VesselEntry from '@/models/VesselEntry';
import { verifySession } from '@/lib/auth/session';
import { canEditOrDeleteEntry } from '@/lib/auth/rbac';
import { vesselEntrySchema } from '@/lib/validation/schemas';
import { logAudit } from '@/lib/audit/logger';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await dbConnect();
    const entry = await VesselEntry.findById(params.id);
    if (!entry) {
      return NextResponse.json({ message: 'Entry not found.' }, { status: 404 });
    }

    const body = await req.json();
    const parseResult = vesselEntrySchema.partial().safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Validation error', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const isTextEdit = parseResult.data.text !== undefined || parseResult.data.solution !== undefined;
    const isPhotoEdit = parseResult.data.photographs !== undefined;

    // Only creator or admin can edit text or solution
    if (isTextEdit && !canEditOrDeleteEntry(user, entry.createdBy)) {
      return NextResponse.json({ message: 'Forbidden. Only the creator or admin can edit description text.' }, { status: 403 });
    }

    // Any approved user can update photographs
    if (isPhotoEdit && user.status !== 'APPROVED') {
      return NextResponse.json({ message: 'Forbidden. Approved account required to manage photos.' }, { status: 403 });
    }

    if (parseResult.data.text !== undefined && canEditOrDeleteEntry(user, entry.createdBy)) {
      entry.text = parseResult.data.text.trim();
    }
    if (parseResult.data.solution !== undefined && canEditOrDeleteEntry(user, entry.createdBy)) {
      entry.solution = parseResult.data.solution.trim();
    }
    if (parseResult.data.safetyStatus !== undefined && canEditOrDeleteEntry(user, entry.createdBy)) {
      entry.safetyStatus = parseResult.data.safetyStatus;
    }
    if (parseResult.data.category !== undefined && canEditOrDeleteEntry(user, entry.createdBy)) {
      entry.category = parseResult.data.category.trim();
    }
    if (parseResult.data.photographs !== undefined) {
      entry.photographs = parseResult.data.photographs as any;
    }

    entry.updatedBy = user._id.toString();
    entry.updatedByName = user.fullName;
    await entry.save();

    await logAudit({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: user.role,
      action: 'ENTRY_UPDATED',
      target: entry.section,
      metadata: { entryId: entry._id.toString(), vesselId: entry.vesselId.toString() },
    });

    return NextResponse.json({ message: 'Entry updated successfully.', entry });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await dbConnect();
    const entry = await VesselEntry.findById(params.id);
    if (!entry) {
      return NextResponse.json({ message: 'Entry not found.' }, { status: 404 });
    }

    if (!canEditOrDeleteEntry(user, entry.createdBy)) {
      return NextResponse.json({ message: 'Forbidden. You can only delete your own entries.' }, { status: 403 });
    }

    await VesselEntry.findByIdAndDelete(params.id);

    await logAudit({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: user.role,
      action: 'ENTRY_DELETED',
      target: entry.section,
      metadata: { entryId: params.id, vesselId: entry.vesselId.toString() },
    });

    return NextResponse.json({ message: 'Entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

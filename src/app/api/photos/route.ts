import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { saveUploadedFile } from '@/lib/storage/upload';
import { logAudit } from '@/lib/audit/logger';

export async function POST(req: NextRequest) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized. You must be an approved active user to upload photos.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const caption = (formData.get('caption') as string) || '';

    if (!file) {
      return NextResponse.json({ message: 'No image file provided.' }, { status: 400 });
    }

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'Image size must be under 10MB.' }, { status: 400 });
    }

    const photoMetadata = await saveUploadedFile(file, user.employeeId, user.fullName, caption);

    await logAudit({
      userId: user._id ? String(user._id) : 'UNKNOWN',
      userName: user.fullName,
      userRole: user.role,
      action: 'PHOTO_UPLOADED',
      target: photoMetadata.filename,
      metadata: { url: photoMetadata.url },
    });

    return NextResponse.json({ message: 'Photo uploaded successfully.', photo: photoMetadata }, { status: 201 });
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ message: error?.message || 'Failed to upload photo. Please try again.' }, { status: 500 });
  }
}

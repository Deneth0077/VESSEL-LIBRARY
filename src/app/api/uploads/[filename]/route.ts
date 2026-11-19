import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/db/connect';
import StoredPhoto from '@/models/StoredPhoto';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;

  if (!filename) {
    return new NextResponse('Filename missing', { status: 400 });
  }

  // 1. Fast local disk check (if running in local dev with files on disk)
  try {
    const localPath = path.join(process.cwd(), 'public', 'uploads', filename);
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      const ext = filename.split('.').pop()?.toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': buffer.length.toString(),
        },
      });
    }
  } catch (fsErr) {
    // Ignore and proceed to MongoDB storage fallback (for Vercel serverless)
  }

  // 2. Persistent Database Storage Check (for Vercel & Production)
  try {
    await dbConnect();
    const photo = await StoredPhoto.findOne({ filename }).lean();

    if (photo && photo.data) {
      const buffer = Buffer.isBuffer(photo.data) ? photo.data : Buffer.from(photo.data);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': photo.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': buffer.length.toString(),
        },
      });
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (err: any) {
    console.error('Error serving photo from database:', err);
    return new NextResponse('Error loading photo', { status: 500 });
  }
}

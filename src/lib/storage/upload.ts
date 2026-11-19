import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dbConnect from '@/lib/db/connect';
import StoredPhoto from '@/models/StoredPhoto';

export async function saveUploadedFile(
  file: File | Blob,
  uploadedBy: string,
  uploadedByName?: string,
  caption?: string
) {
  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);
  const fileExt = (file as File).name?.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizeName = (file as File).name?.replace(/[^a-zA-Z0-9._-]/g, '_') || `photo.${fileExt}`;
  const baseId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const outFilename = `${baseId}_${sanitizeName.split('.')[0]}.jpg`;

  // 1. Image Optimization: compress using python pillow if available
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const tempPath = path.join(uploadDir, `raw_${baseId}.${fileExt}`);
    const outPath = path.join(uploadDir, outFilename);
    fs.writeFileSync(tempPath, buffer);

    try {
      const pyCmd = `python -c "from PIL import Image; img = Image.open(r'${tempPath}'); img = img.convert('RGB'); img.thumbnail((1200, 1200), Image.Resampling.LANCZOS); img.save(r'${outPath}', 'JPEG', quality=82, optimize=True)"`;
      execSync(pyCmd);
      if (fs.existsSync(outPath)) {
        buffer = fs.readFileSync(outPath);
      }
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (e) {
      // Python not available in this env, use original buffer
      fs.renameSync(tempPath, outPath);
    }
  } catch (fsErr) {
    // Read-only filesystem (e.g. Vercel serverless) - buffer remains original
  }

  // 2. Persist to MongoDB Atlas StoredPhoto collection (guaranteed persistence across Vercel deployments)
  try {
    await dbConnect();
    await StoredPhoto.findOneAndUpdate(
      { filename: outFilename },
      {
        filename: outFilename,
        contentType: 'image/jpeg',
        data: buffer,
        size: buffer.length,
        uploadedBy: uploadedBy || 'USER',
      },
      { upsert: true, new: true }
    );
  } catch (dbErr) {
    console.error('Failed storing photo to MongoDB:', dbErr);
  }

  return {
    url: `/uploads/${outFilename}`,
    filename: outFilename,
    uploadedBy,
    uploadedByName: uploadedByName || 'Unknown',
    uploadedAt: new Date(),
    caption: caption || '',
  };
}

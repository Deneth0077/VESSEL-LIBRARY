import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/db/connect';
import StoredPhoto from '@/models/StoredPhoto';

// Initialize Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret && cloudName !== 'vessel-app') {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

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

  // 1. Cloudinary Primary Upload (Fast global CDN delivery)
  const currentCloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const currentApiKey = process.env.CLOUDINARY_API_KEY;
  const currentApiSecret = process.env.CLOUDINARY_API_SECRET;

  if (currentCloudName && currentApiKey && currentApiSecret && currentCloudName !== 'vessel-app') {
    try {
      cloudinary.config({
        cloud_name: currentCloudName,
        api_key: currentApiKey,
        api_secret: currentApiSecret,
        secure: true,
      });

      const cloudinaryResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'vessel_library_photos',
            resource_type: 'image',
            transformation: [{ width: 1400, height: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Cloudinary upload returned empty'));
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      if (cloudinaryResult && cloudinaryResult.secure_url) {
        return {
          url: cloudinaryResult.secure_url,
          filename: cloudinaryResult.public_id || outFilename,
          uploadedBy,
          uploadedByName: uploadedByName || 'Unknown',
          uploadedAt: new Date(),
          caption: caption || '',
        };
      }
    } catch (cloudErr: any) {
      console.warn('Cloudinary upload error, falling back to database/local storage:', cloudErr?.message || cloudErr);
    }
  }

  // 2. Image Optimization Fallback: compress using python pillow if available
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
      // Python not available in this env, keep buffer
      fs.renameSync(tempPath, outPath);
    }
  } catch (fsErr) {
    // Read-only filesystem (e.g. Vercel serverless) - buffer remains original
  }

  // 3. Persist to MongoDB Atlas StoredPhoto collection (guaranteed persistence across Vercel deployments)
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

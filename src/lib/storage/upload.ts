import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vessel-app',
  api_key: process.env.CLOUDINARY_API_KEY || '325647985138631',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'sjdqEUCWxpW_3Rm8gTHA30g6hLg',
  secure: true,
});

export async function saveUploadedFile(
  file: File | Blob,
  uploadedBy: string,
  uploadedByName?: string,
  caption?: string
) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileExt = (file as File).name?.split('.').pop() || 'jpg';
  const sanitizeName = (file as File).name?.replace(/[^a-zA-Z0-9._-]/g, '_') || `photo.${fileExt}`;
  const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${sanitizeName}`;

  try {
    // Attempt Cloudinary Upload via buffer stream
    const cloudinaryResponse = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'vessel_library_photos',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned empty result'));
          }
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return {
      url: cloudinaryResponse.secure_url,
      filename: cloudinaryResponse.public_id || filename,
      uploadedBy,
      uploadedByName: uploadedByName || 'Unknown',
      uploadedAt: new Date(),
      caption: caption || '',
    };
  } catch (cloudErr) {
    console.warn('Cloudinary upload failed or unconfigured, saving to local disk storage:', cloudErr);

    // Fallback: Local Disk Storage
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${filename}`,
      filename,
      uploadedBy,
      uploadedByName: uploadedByName || 'Unknown',
      uploadedAt: new Date(),
      caption: caption || '',
    };
  }
}

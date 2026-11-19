import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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
  const fileExt = (file as File).name?.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizeName = (file as File).name?.replace(/[^a-zA-Z0-9._-]/g, '_') || `photo.${fileExt}`;
  const baseId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const outFilename = `${baseId}_${sanitizeName.split('.')[0]}.jpg`;

  // 1. Primary Method: Save to local disk with image optimization (Fastest & Lightest)
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const tempPath = path.join(uploadDir, `raw_${baseId}.${fileExt}`);
    const outPath = path.join(uploadDir, outFilename);
    fs.writeFileSync(tempPath, buffer);

    try {
      // Compress & optimize image via Pillow: max 1200x1200, 82% quality (shrinks 5MB photos down to ~80KB)
      const pyCmd = `python -c "from PIL import Image; img = Image.open(r'${tempPath}'); img = img.convert('RGB'); img.thumbnail((1200, 1200), Image.Resampling.LANCZOS); img.save(r'${outPath}', 'JPEG', quality=82, optimize=True)"`;
      execSync(pyCmd);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch (optErr) {
      // Fallback: if python not available, keep original buffer
      fs.renameSync(tempPath, outPath);
    }

    return {
      url: `/uploads/${outFilename}`,
      filename: outFilename,
      uploadedBy,
      uploadedByName: uploadedByName || 'Unknown',
      uploadedAt: new Date(),
      caption: caption || '',
    };
  } catch (fsErr: any) {
    console.warn('Local disk save failed, attempting Cloudinary / compressed fallback:', fsErr?.message);

    // 2. Secondary Method: Cloudinary
    try {
      const cloudinaryResponse = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'vessel_library_photos',
            resource_type: 'auto',
            transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
          },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Cloudinary error'));
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return {
        url: cloudinaryResponse.secure_url,
        filename: cloudinaryResponse.public_id || outFilename,
        uploadedBy,
        uploadedByName: uploadedByName || 'Unknown',
        uploadedAt: new Date(),
        caption: caption || '',
      };
    } catch (cloudErr: any) {
      console.warn('Cloudinary failed, fallback to base64:', cloudErr?.message);

      // 3. Fail-Proof Fallback: Base64 Data URL
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;

      return {
        url: dataUrl,
        filename: outFilename,
        uploadedBy,
        uploadedByName: uploadedByName || 'Unknown',
        uploadedAt: new Date(),
        caption: caption || '',
      };
    }
  }
}

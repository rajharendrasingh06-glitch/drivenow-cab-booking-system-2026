import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if credentials provided
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder = 'drivenow'
): Promise<string> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Upload to Cloudinary failed'));
          }
          resolve(result.secure_url);
        }
      );
      stream.end(fileBuffer);
    });
  }

  // Fallback if Cloudinary is not yet configured: convert to safe Data URL
  const base64 = fileBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

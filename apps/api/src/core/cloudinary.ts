import { env } from '../config/env';

/**
 * Upload a buffer to Cloudinary and return the secure URL and public id.
 * This uses a dynamic import so tests and environments that don't have
 * the Cloudinary package installed won't fail at module load time.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  filename?: string,
  folder?: string
): Promise<{ url: string; publicId: string }> {
  const cloudinaryModule = await import('cloudinary');
  // cloudinary.v2 is the usual entrypoint
  const cloudinary: any = (cloudinaryModule as any).v2 || cloudinaryModule;

  // Configure from env if present
  cloudinary.config({
    cloud_name: env['CLOUDINARY_CLOUD_NAME'] || process.env['CLOUDINARY_CLOUD_NAME'],
    api_key: env['CLOUDINARY_API_KEY'] || process.env['CLOUDINARY_API_KEY'],
    api_secret: env['CLOUDINARY_API_SECRET'] || process.env['CLOUDINARY_API_SECRET'],
    secure: true,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error: any, result: any) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });

    stream.end(buffer);
  });
}

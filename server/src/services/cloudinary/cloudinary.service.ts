import cloudinary from '@/config/cloudinary.config';
import fs from 'fs';

export class CloudinaryService {
  async uploadFile(filePath: string, folder: string = 'uploads'): Promise<{ url: string; publicId: string }> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto',
      });

      // Delete local file after upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }

  async getOptimizedUrl(publicId: string, width?: number, height?: number): Promise<string> {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }
}

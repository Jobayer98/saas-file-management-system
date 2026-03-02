import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
const thumbnailDir = path.join(process.cwd(), 'uploads', 'thumbnails');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(thumbnailDir)) {
  fs.mkdirSync(thumbnailDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = process.env.ALLOWED_MIME_TYPES?.split(',') || [];
  
  // If no restrictions or wildcard, allow all
  if (allowedMimeTypes.length === 0 || allowedMimeTypes.includes('*')) {
    cb(null, true);
    return;
  }

  // Check if file type is allowed
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB default
  },
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', parseInt(process.env.MAX_FILES_PER_UPLOAD || '10'));
export const uploadChunk = upload.single('chunk');

export default upload;

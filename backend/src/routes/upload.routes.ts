import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UploadController } from '../controllers/upload.controller';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// TODO: During npm install I am facing error due to this below line so, I make it commented for now.
// const multerOdm = require('multer-odm');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File validation failed',
        errors: {
          file: [`File size exceeds the maximum allowed size of 5MB. ${err.message}`],
        },
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'File validation failed',
        errors: {
          files: [`Maximum 10 files allowed. ${err.message}`],
        },
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      errors: {
        file: [err.message],
      },
    });
  }
  if (err) {
    return res.status(400).json({
      message: 'File validation failed',
      errors: {
        file: [err.message || 'Unsupported file type. Allowed types: images (JPEG, PNG, GIF, WebP) and PDF.'],
      },
    });
  }
  next();
};

const router = Router();
const controller = new UploadController();

router.post(
  '/',
  authenticate,
  authorize('admin', 'manager', 'user'),
  upload.single('file'),
  handleMulterError,
  controller.upload,
);

router.post(
  '/multiple',
  authenticate,
  authorize('admin', 'manager', 'user'),
  uploadMultiple.array('files', 10),
  handleMulterError,
  controller.uploadMultiple,
);

export default router;


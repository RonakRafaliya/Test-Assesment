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
 
const router = Router();
const controller = new UploadController();

router.post('/', authenticate, authorize('admin', 'manager', 'user'), upload.single('file'), controller.upload);

export default router;


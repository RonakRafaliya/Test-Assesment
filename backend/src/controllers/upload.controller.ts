import { Request, Response } from 'express';
import path from 'path';
import * as fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

export class UploadController {
  ensureUploadDir() {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  upload = (req: Request, res: Response) => {
    this.ensureUploadDir();

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    return res.status(201).json({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });
  };
}


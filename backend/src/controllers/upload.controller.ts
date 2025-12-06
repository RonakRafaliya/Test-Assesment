import { Request, Response } from 'express';
import path from 'path';
import * as fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_COUNT = 10;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

export class UploadController {
  ensureUploadDir() {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  validateFile(file: Express.Multer.File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if file exists
    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
      );
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      errors.push(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}.`,
      );
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push(
        `File extension "${ext}" is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}.`,
      );
    }

    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty. Please upload a valid file.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  upload = (req: Request, res: Response) => {
    this.ensureUploadDir();

    if (!req.file) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          file: ['No file provided. Please select a file to upload.'],
        },
      });
    }

    const validation = this.validateFile(req.file);
    if (!validation.valid) {
      // Clean up invalid file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: 'File validation failed',
        errors: {
          file: validation.errors,
        },
      });
    }

    return res.status(201).json({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      originalName: req.file.originalname,
    });
  };

  uploadMultiple = (req: Request, res: Response) => {
    this.ensureUploadDir();

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          files: ['No files provided. Please select at least one file to upload.'],
        },
      });
    }

    // Check file count
    if (files.length > MAX_FILES_COUNT) {
      // Clean up all files
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          files: [`Maximum ${MAX_FILES_COUNT} files allowed. You uploaded ${files.length} files.`],
        },
      });
    }

    const errors: Record<string, string[]> = {};
    const validFiles: Express.Multer.File[] = [];
    let hasErrors = false;

    files.forEach((file, index) => {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        hasErrors = true;
        errors[`file_${index}`] = validation.errors;
        // Clean up invalid file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } else {
        validFiles.push(file);
      }
    });

    if (hasErrors) {
      // Clean up all valid files if there are any errors
      validFiles.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(400).json({
        message: 'File validation failed',
        errors,
      });
    }

    return res.status(201).json({
      files: validFiles.map((file) => ({
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        originalName: file.originalname,
      })),
      count: validFiles.length,
    });
  };
}


import { Router, Response } from 'express';
import { upload, uploadToCloudinary } from '../services/cloudinary';
import { authenticate, AuthRequest } from '../auth';

export const uploadRouter = Router();

uploadRouter.post(
  '/',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded. Please provide an image file.' });
        return;
      }

      const folder = (req.body.folder as string) || 'drivenow';
      const url = await uploadToCloudinary(req.file.buffer, req.file.originalname, folder);

      res.json({
        message: 'File uploaded successfully.',
        url,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (err) {
      console.error('File upload error:', err);
      res.status(500).json({ error: 'Failed to upload image.', details: String(err) });
    }
  }
);

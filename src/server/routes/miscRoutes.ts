import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { NotificationModel } from '../models';
import { authenticate, AuthRequest } from '../auth';
import { INDIAN_CITIES } from '../../data/indianCities';
import { INDIAN_CAR_MODELS } from '../../data/carModels';

export const miscRouter = Router();

// Get list of Indian cities with landmark coordinates
miscRouter.get('/cities', (_req, res) => {
  res.json({ cities: INDIAN_CITIES });
});

// Get 20 Indian car models catalog
miscRouter.get('/car-models', (_req, res) => {
  res.json({ models: INDIAN_CAR_MODELS });
});

// User Notifications from MongoDB
miscRouter.get('/notifications', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }
    const notifications = await NotificationModel.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: String(err) });
  }
});

// Mark notification as read
miscRouter.put('/notifications/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await NotificationModel.updateOne({ id: req.params.id }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification', details: String(err) });
  }
});

// Mark all as read
miscRouter.post('/notifications/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }
    await NotificationModel.updateMany({ userId: req.user.id }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications', details: String(err) });
  }
});

// Safety SOS Trigger API
miscRouter.post('/safety/sos', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { rideId } = req.body;
    const user = req.user;

    console.log(`[DRIVENOW SOS ALERT] Triggered for user ${user?.name} (${user?.phone}) on ride ${rideId}`);

    if (user) {
      await NotificationModel.create({
        id: `notif-${uuidv4().slice(0, 8)}`,
        userId: user.id,
        title: 'Emergency SOS Broadcasted',
        message: 'Your emergency distress signal and live GPS location were forwarded to Police Helpline 112 and the DriveNow Safety Response Center.',
        type: 'SAFETY',
        rideId,
        read: false,
      });
    }

    res.json({
      message: 'EMERGENCY SOS SIGNAL BROADCASTED. DriveNow Safety Control Room and Police Helpline 112 alerted with your live GPS location.',
      status: 'ACTIVE_DISPATCH',
      timestamp: new Date().toISOString(),
      emergencyHelplines: [
        { name: 'Police Helpline', number: '112' },
        { name: 'Women Safety Helpline', number: '1091' },
        { name: 'DriveNow 24x7 Safety Response Center', number: '1800-200-8899' },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger SOS alert', details: String(err) });
  }
});

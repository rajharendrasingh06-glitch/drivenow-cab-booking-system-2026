import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { UserModel, DriverModel } from '../models';
import { generateToken, hashPassword, comparePassword, authenticate, AuthRequest } from '../auth';
import { sendPasswordResetEmail } from '../services/mailer';
import { User, UserRole } from '../../types';

export const authRouter = Router();

// Customer / Driver / Admin Register
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'CUSTOMER', licenseNumber } = req.body;

    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: 'Please provide name, email, phone, and password.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const userId = `usr-${uuidv4().slice(0, 8)}`;
    const hashedPassword = hashPassword(password);

    const userDoc = await UserModel.create({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: (role as UserRole) || 'CUSTOMER',
      avatar: '',
    });

    // If driver is registering, create driver record in MongoDB
    if (role === 'DRIVER') {
      await DriverModel.create({
        id: `DRV-${uuidv4().slice(0, 8)}`,
        userId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        licenseNumber: (licenseNumber || 'MH012023009988').toUpperCase(),
        rating: 5.0,
        totalRatingsCount: 0,
        completedRides: 0,
        isVerified: false, // Driver verification workflow
        status: 'OFFLINE',
        currentCoordinates: {
          lat: 19.076,
          lng: 72.8777,
          address: 'Mumbai Central, Maharashtra',
        },
        earningsToday: 0,
        earningsTotal: 0,
        city: 'Mumbai',
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }

    const userObj = userDoc.toJSON();
    const token = generateToken(userObj as unknown as User);

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: userObj,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed.', details: String(err) });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const userDoc = await UserModel.findOne({ email: cleanEmail });
    if (!userDoc) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (role && userDoc.role !== role) {
      res.status(403).json({
        error: `Account is not authorized for ${role} portal. Your registered role is ${userDoc.role}.`,
      });
      return;
    }

    const isMatch = comparePassword(password, userDoc.password || '');
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const userObj = userDoc.toJSON();
    const token = generateToken(userObj as unknown as User);

    res.json({
      message: 'Logged in successfully.',
      token,
      user: userObj,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.', details: String(err) });
  }
});

// Current User Profile
authRouter.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Update Profile
authRouter.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { name, phone, avatar, emergencyContact, savedPlaces } = req.body;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (avatar) updates.avatar = avatar;
    if (emergencyContact) updates.emergencyContact = emergencyContact;
    if (savedPlaces) updates.savedPlaces = savedPlaces;

    const updated = await UserModel.findOneAndUpdate(
      { id: req.user.id },
      { $set: updates },
      { new: true }
    ).lean();

    res.json({
      message: 'Profile updated successfully.',
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.', details: String(err) });
  }
});

// Forgot Password
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) {
      // Security practice: Don't leak user existence
      res.json({ message: 'If an account exists with this email, password reset instructions have been sent.' });
      return;
    }

    const token = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/login?resetToken=${token}&email=${encodeURIComponent(cleanEmail)}`;

    await sendPasswordResetEmail(cleanEmail, resetUrl);

    res.json({
      message: 'Password reset instructions sent to your email address.',
      resetUrlPreview: resetUrl, // Helpful for local testing
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate password reset.', details: String(err) });
  }
});

// Reset Password
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: 'Reset token and new password are required.' });
      return;
    }

    const query: any = {
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    };
    if (email) {
      query.email = email.trim().toLowerCase();
    }

    const user = await UserModel.findOne(query);
    if (!user) {
      res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
      return;
    }

    user.password = hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.', details: String(err) });
  }
});

import { Router, Response } from 'express';
import { DriverModel, RideModel, VehicleModel } from '../models';
import { authenticate, requireRole, AuthRequest } from '../auth';

export const driverRouter = Router();

// Ensure all endpoints are driver/admin authenticated
driverRouter.use(authenticate);
driverRouter.use(requireRole(['DRIVER', 'ADMIN']));

// Helper to find driver record for logged-in user
async function getDriverForUser(userId: string, email: string) {
  let driver = await DriverModel.findOne({ userId }).lean();
  if (!driver) {
    driver = await DriverModel.findOne({ email: email.toLowerCase() }).lean();
  }
  if (!driver) {
    driver = await DriverModel.findOne().lean();
  }
  return driver;
}

// 1. Get current driver profile & dashboard data
driverRouter.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const driver = await getDriverForUser(user.id, user.email);
    if (!driver) {
      res.status(404).json({ error: 'Driver profile not found.' });
      return;
    }

    const assignedVehicle = driver.assignedVehicleId
      ? await VehicleModel.findOne({ id: driver.assignedVehicleId }).lean()
      : null;

    const activeRide = await RideModel.findOne({
      driverId: driver.id,
      status: {
        $in: [
          'DRIVER_ASSIGNED',
          'DRIVER_ARRIVING',
          'DRIVER_ARRIVED',
          'TRIP_STARTED',
        ],
      },
    }).lean();

    const recentRides = await RideModel.find({ driverId: driver.id })
      .sort({ requestedAt: -1 })
      .limit(10)
      .lean();

    res.json({
      driver,
      vehicle: assignedVehicle,
      activeRide,
      recentRides,
      stats: {
        todayEarnings: driver.earningsToday || 0,
        totalEarnings: driver.earningsTotal || 0,
        rating: driver.rating,
        totalRides: driver.completedRides || 0,
        status: driver.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch driver dashboard', details: String(err) });
  }
});

// 2. Toggle Driver Online / Offline Status
driverRouter.post('/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // 'ONLINE' | 'OFFLINE'
    if (!['ONLINE', 'OFFLINE'].includes(status)) {
      res.status(400).json({ error: "Status must be 'ONLINE' or 'OFFLINE'." });
      return;
    }

    const user = req.user!;
    const driver = await getDriverForUser(user.id, user.email);
    if (!driver) {
      res.status(404).json({ error: 'Driver not found.' });
      return;
    }

    const updated = await DriverModel.findOneAndUpdate(
      { id: driver.id },
      { $set: { status } },
      { new: true }
    ).lean();

    // Also update assigned vehicle availability
    if (driver.assignedVehicleId) {
      await VehicleModel.updateOne(
        { id: driver.assignedVehicleId },
        { $set: { availabilityStatus: status === 'ONLINE' ? 'AVAILABLE' : 'OFFLINE' } }
      );
    }

    res.json({ message: `Driver status changed to ${status}.`, driver: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status', details: String(err) });
  }
});

// 3. Update Driver GPS Location
driverRouter.post('/location', async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng, address } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ error: 'Valid numeric latitude and longitude are required.' });
      return;
    }

    const user = req.user!;
    const driver = await getDriverForUser(user.id, user.email);
    if (!driver) {
      res.status(404).json({ error: 'Driver not found.' });
      return;
    }

    const updated = await DriverModel.findOneAndUpdate(
      { id: driver.id },
      {
        $set: {
          'currentCoordinates.lat': lat,
          'currentCoordinates.lng': lng,
          'currentCoordinates.address': address || driver.currentCoordinates?.address || '',
        },
      },
      { new: true }
    ).lean();

    // Also update assigned vehicle location
    if (driver.assignedVehicleId) {
      await VehicleModel.updateOne(
        { id: driver.assignedVehicleId },
        {
          $set: {
            'currentCoordinates.lat': lat,
            'currentCoordinates.lng': lng,
            'currentCoordinates.address': address || '',
          },
        }
      );
    }

    res.json({ message: 'GPS location synchronized.', coordinates: updated?.currentCoordinates });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update location', details: String(err) });
  }
});

// 4. Accept Ride
driverRouter.post('/accept-ride', async (req: AuthRequest, res: Response) => {
  try {
    const { rideId } = req.body;
    const ride = await RideModel.findOne({ id: rideId });
    if (!ride) {
      res.status(404).json({ error: 'Ride not found.' });
      return;
    }

    ride.status = 'DRIVER_ARRIVING';
    await ride.save();

    res.json({ message: 'Ride accepted. Proceed to customer pickup location.', ride: ride.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept ride', details: String(err) });
  }
});

// 5. Driver Ride History
driverRouter.get('/rides', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const driver = await getDriverForUser(user.id, user.email);
    if (!driver) {
      res.status(404).json({ error: 'Driver not found.' });
      return;
    }

    const rides = await RideModel.find({ driverId: driver.id })
      .sort({ requestedAt: -1 })
      .lean();

    res.json({ rides });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch driver rides', details: String(err) });
  }
});

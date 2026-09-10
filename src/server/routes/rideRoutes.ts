import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  DriverModel,
  NotificationModel,
  PaymentModel,
  ReviewModel,
  RideModel,
  VehicleModel,
} from '../models';
import { authenticate, AuthRequest } from '../auth';
import { sendRideConfirmationEmail } from '../services/mailer';
import { CabCategory, FareBreakdown, PaymentMethod, Ride, RideStatus } from '../../types';

export const rideRouter = Router();

// Helper to compute haversine distance in km between two GPS coordinates
function computeHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = R * c;
  // Road distance factor ~1.35x direct straight-line distance in Indian cities
  return Number(Math.max(1.2, directDistance * 1.35).toFixed(1));
}

// Configurable fare parameters (Indian market norms)
const CATEGORY_PRICING: Record<
  CabCategory,
  { baseFare: number; minDistanceKm: number; perKmRate: number; perMinuteRate: number; minFare: number }
> = {
  Mini: { baseFare: 45, minDistanceKm: 2, perKmRate: 11.5, perMinuteRate: 1.5, minFare: 60 },
  Sedan: { baseFare: 60, minDistanceKm: 2, perKmRate: 14.5, perMinuteRate: 1.8, minFare: 80 },
  Prime: { baseFare: 70, minDistanceKm: 2, perKmRate: 16.5, perMinuteRate: 2.0, minFare: 95 },
  SUV: { baseFare: 95, minDistanceKm: 3, perKmRate: 21.0, perMinuteRate: 2.5, minFare: 130 },
};

export function calculateFare(
  category: CabCategory,
  distanceKm: number,
  timeMinutes: number
): FareBreakdown {
  const config = CATEGORY_PRICING[category] || CATEGORY_PRICING.Prime;
  const baseFare = config.baseFare;

  // Charge extra km beyond minimum included distance
  const chargeableDistance = Math.max(0, distanceKm - config.minDistanceKm);
  const distanceFare = Number((chargeableDistance * config.perKmRate).toFixed(2));
  const timeFare = Number((timeMinutes * config.perMinuteRate).toFixed(2));

  const platformFee = 15.0; // Safety and platform fee
  const subtotal = Number((baseFare + distanceFare + timeFare + platformFee).toFixed(2));

  // 5% GST for passenger transport cab services in India
  const taxes = Number((subtotal * 0.05).toFixed(2));
  const rawTotal = subtotal + taxes;
  const totalFare = Math.max(config.minFare, Math.round(rawTotal));

  return {
    baseFare,
    distanceKm,
    distanceFare,
    timeMinutes,
    timeFare,
    subtotal,
    taxes,
    platformFee,
    totalFare,
    currency: 'INR',
  };
}

// Dynamic Fare Estimate API
rideRouter.post('/estimate', async (req, res) => {
  try {
    const { pickup, drop, category } = req.body;

    if (!pickup?.lat || !pickup?.lng || !drop?.lat || !drop?.lng) {
      res.status(400).json({ error: 'Pickup and Drop GPS coordinates are required.' });
      return;
    }

    const distanceKm = computeHaversineDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
    // Average urban speed in Indian traffic ~22 km/h
    const estimatedMinutes = Math.max(6, Math.round((distanceKm / 22) * 60));

    const categories: CabCategory[] = ['Mini', 'Sedan', 'Prime', 'SUV'];
    const pickupCity = pickup.city || 'Mumbai';

    const estimates = await Promise.all(
      categories.map(async (cat) => {
        const fare = calculateFare(cat, distanceKm, estimatedMinutes);
        const count = await VehicleModel.countDocuments({
          category: cat,
          availabilityStatus: 'AVAILABLE',
          city: new RegExp(`^${pickupCity}$`, 'i'),
        });

        return {
          category: cat,
          fare,
          availableVehiclesCount: Math.max(2, count),
          estimatedEtaMinutes: Math.floor(Math.random() * 4) + 2, // 2-5 mins
        };
      })
    );

    res.json({
      distanceKm,
      estimatedMinutes,
      estimates: category ? estimates.filter((e) => e.category === category) : estimates,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate fare estimate', details: String(err) });
  }
});

// Book a Ride (Nearest Available Driver Assignment)
rideRouter.post('/book', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { pickup, drop, vehicleCategory = 'Prime', paymentMethod = 'UPI' } = req.body;

    if (!pickup?.lat || !pickup?.lng || !drop?.lat || !drop?.lng) {
      res.status(400).json({ error: 'Valid pickup and drop locations are required.' });
      return;
    }

    // Check if customer already has an active ride in MongoDB
    const existingActiveRide = await RideModel.findOne({
      customerId: user.id,
      status: {
        $in: [
          'REQUESTED',
          'DRIVER_ASSIGNED',
          'DRIVER_ARRIVING',
          'DRIVER_ARRIVED',
          'TRIP_STARTED',
        ],
      },
    }).lean();

    if (existingActiveRide) {
      res.status(400).json({
        error: 'You already have an active ride in progress.',
        activeRideId: existingActiveRide.id,
      });
      return;
    }

    const distanceKm = computeHaversineDistance(pickup.lat, pickup.lng, drop.lat, drop.lng);
    const estimatedMinutes = Math.max(6, Math.round((distanceKm / 22) * 60));
    const fare = calculateFare(vehicleCategory as CabCategory, distanceKm, estimatedMinutes);

    // 1. Query online & available vehicles matching category in MongoDB
    const pickupCity = pickup.city || 'Mumbai';
    let availableVehicles = await VehicleModel.find({
      category: vehicleCategory,
      availabilityStatus: 'AVAILABLE',
      city: new RegExp(`^${pickupCity}$`, 'i'),
    }).lean();

    if (availableVehicles.length === 0) {
      // Fallback across all cities
      availableVehicles = await VehicleModel.find({
        category: vehicleCategory,
        availabilityStatus: 'AVAILABLE',
      }).lean();
    }

    if (availableVehicles.length === 0) {
      // General fallback
      availableVehicles = await VehicleModel.find({ availabilityStatus: 'AVAILABLE' }).limit(5).lean();
    }

    // 2. Select the nearest driver based on GPS coordinates
    let matchedVehicle = availableVehicles[0];
    let matchedDriver: any = null;
    let shortestDistance = Infinity;

    for (const v of availableVehicles) {
      if (v.assignedDriverId) {
        const driver = await DriverModel.findOne({
          id: v.assignedDriverId,
          status: { $in: ['ONLINE'] },
        }).lean();

        if (driver) {
          const dist = computeHaversineDistance(
            pickup.lat,
            pickup.lng,
            driver.currentCoordinates?.lat || v.currentCoordinates?.lat,
            driver.currentCoordinates?.lng || v.currentCoordinates?.lng
          );
          if (dist < shortestDistance) {
            shortestDistance = dist;
            matchedVehicle = v;
            matchedDriver = driver;
          }
        }
      }
    }

    // If no driver found through loop, grab the vehicle's assigned driver or first online driver
    if (!matchedDriver && matchedVehicle?.assignedDriverId) {
      matchedDriver = await DriverModel.findOne({ id: matchedVehicle.assignedDriverId }).lean();
    }
    if (!matchedDriver) {
      matchedDriver = await DriverModel.findOne({ status: 'ONLINE' }).lean();
    }
    if (!matchedDriver) {
      matchedDriver = await DriverModel.findOne().lean();
    }

    // 3. Mark vehicle & driver as ON_TRIP in MongoDB to prevent double-booking
    if (matchedVehicle) {
      await VehicleModel.updateOne({ id: matchedVehicle.id }, { $set: { availabilityStatus: 'ON_TRIP' } });
    }
    if (matchedDriver) {
      await DriverModel.updateOne({ id: matchedDriver.id }, { $set: { status: 'ON_TRIP' } });
    }

    // 4. Generate 4-digit start OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const rideId = `RIDE-IN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRideData: Partial<Ride> = {
      id: rideId,
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      driverId: matchedDriver?.id,
      driverName: matchedDriver?.name || 'Assigned Driver',
      driverPhone: matchedDriver?.phone || '+91 98765 43210',
      driverPhoto: matchedDriver?.photo,
      driverRating: matchedDriver?.rating || 4.8,
      vehicleId: matchedVehicle?.id,
      vehicleModel: matchedVehicle ? `${matchedVehicle.brand} ${matchedVehicle.model}` : 'Maruti Suzuki Dzire',
      vehicleRegNo: matchedVehicle?.registrationNumber || 'MH 02 EE 9912',
      vehicleColor: matchedVehicle?.color || 'Arctic White',
      vehicleCategory: (vehicleCategory as CabCategory) || 'Prime',
      vehicleImage: matchedVehicle?.image,
      otp,
      pickup,
      drop,
      routeDistanceKm: distanceKm,
      estimatedDurationMins: estimatedMinutes,
      fare,
      status: 'DRIVER_ASSIGNED',
      paymentStatus: 'PENDING',
      paymentMethod: (paymentMethod as PaymentMethod) || 'UPI',
      requestedAt: new Date().toISOString(),
      assignedAt: new Date().toISOString(),
      driverLiveLocation: matchedDriver
        ? {
            lat: matchedDriver.currentCoordinates.lat,
            lng: matchedDriver.currentCoordinates.lng,
            updatedAt: new Date().toISOString(),
          }
        : {
            lat: pickup.lat + 0.005,
            lng: pickup.lng + 0.004,
            updatedAt: new Date().toISOString(),
          },
    };

    const createdRide = await RideModel.create(newRideData);

    // 5. Create Notification in MongoDB
    await NotificationModel.create({
      id: `notif-${uuidv4().slice(0, 8)}`,
      userId: user.id,
      title: 'Cab Booked Successfully',
      message: `${newRideData.vehicleModel} (${newRideData.vehicleRegNo}) is assigned with driver ${newRideData.driverName}. Share OTP ${otp} upon boarding.`,
      type: 'RIDE',
      rideId,
      read: false,
    });

    // 6. Send confirmation email (Nodemailer)
    sendRideConfirmationEmail(user.email, createdRide).catch(() => {});

    res.status(201).json({
      message: 'Cab booked and driver assigned successfully.',
      ride: createdRide.toJSON(),
    });
  } catch (err) {
    console.error('Ride booking error:', err);
    res.status(500).json({ error: 'Failed to book ride', details: String(err) });
  }
});

// Get Active Ride for current Customer
rideRouter.get('/active', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const activeRide = await RideModel.findOne({
      customerId: req.user.id,
      status: {
        $in: [
          'REQUESTED',
          'DRIVER_ASSIGNED',
          'DRIVER_ARRIVING',
          'DRIVER_ARRIVED',
          'TRIP_STARTED',
        ],
      },
    }).lean();

    res.json({ ride: activeRide || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active ride', details: String(err) });
  }
});

// Get Customer Ride History
rideRouter.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const rides = await RideModel.find({ customerId: req.user.id })
      .sort({ requestedAt: -1 })
      .lean();

    res.json({ rides });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ride history', details: String(err) });
  }
});

// Get Single Ride Details
rideRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const ride = await RideModel.findOne({ id: req.params.id }).lean();
    if (!ride) {
      res.status(404).json({ error: 'Ride not found.' });
      return;
    }
    res.json({ ride });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ride', details: String(err) });
  }
});

// Update Ride Status (Driver / System lifecycle progression)
rideRouter.post('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, otp } = req.body;
    const ride = await RideModel.findOne({ id: req.params.id });

    if (!ride) {
      res.status(404).json({ error: 'Ride not found.' });
      return;
    }

    const now = new Date().toISOString();
    const updates: Partial<Ride> = { status };

    if (status === 'DRIVER_ARRIVING') {
      updates.arrivedAt = undefined;
    } else if (status === 'DRIVER_ARRIVED') {
      updates.arrivedAt = now;
      await NotificationModel.create({
        id: `notif-${uuidv4().slice(0, 8)}`,
        userId: ride.customerId,
        title: 'Driver Has Arrived',
        message: `Your driver ${ride.driverName} has arrived at pickup in ${ride.vehicleModel} (${ride.vehicleRegNo}).`,
        type: 'RIDE',
        rideId: ride.id,
      });
    } else if (status === 'TRIP_STARTED') {
      // Validate OTP
      if (otp && otp !== ride.otp) {
        res.status(400).json({ error: 'Invalid start OTP. Please verify with customer.' });
        return;
      }
      updates.startedAt = now;
      await NotificationModel.create({
        id: `notif-${uuidv4().slice(0, 8)}`,
        userId: ride.customerId,
        title: 'Trip Started',
        message: `Your trip to ${ride.drop.address} has commenced. Track live on map.`,
        type: 'RIDE',
        rideId: ride.id,
      });
    } else if (status === 'TRIP_COMPLETED') {
      updates.completedAt = now;

      // Free vehicle & driver in MongoDB
      if (ride.vehicleId) {
        await VehicleModel.updateOne({ id: ride.vehicleId }, { $set: { availabilityStatus: 'AVAILABLE' } });
      }
      if (ride.driverId) {
        const driver = await DriverModel.findOne({ id: ride.driverId });
        if (driver) {
          const fareAmount = ride.fare?.totalFare || 250;
          await DriverModel.updateOne(
            { id: ride.driverId },
            {
              $set: { status: 'ONLINE' },
              $inc: {
                completedRides: 1,
                earningsToday: Math.round(fareAmount * 0.8), // 80% driver payout
                earningsTotal: Math.round(fareAmount * 0.8),
              },
            }
          );
        }
      }

      await NotificationModel.create({
        id: `notif-${uuidv4().slice(0, 8)}`,
        userId: ride.customerId,
        title: 'Trip Completed',
        message: `You have reached your destination. Please complete fare payment of ₹${ride.fare?.totalFare}.`,
        type: 'RIDE',
        rideId: ride.id,
      });
    } else if (status === 'CANCELLED') {
      updates.cancelledAt = now;
      updates.cancelReason = req.body.cancelReason || 'Cancelled by user';
      updates.cancelledBy = req.user?.role === 'DRIVER' ? 'DRIVER' : 'CUSTOMER';

      if (ride.vehicleId) {
        await VehicleModel.updateOne({ id: ride.vehicleId }, { $set: { availabilityStatus: 'AVAILABLE' } });
      }
      if (ride.driverId) {
        await DriverModel.updateOne({ id: ride.driverId }, { $set: { status: 'ONLINE' } });
      }
    }

    const updated = await RideModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { new: true }
    ).lean();

    res.json({ message: `Ride status updated to ${status}.`, ride: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ride status', details: String(err) });
  }
});

// Update Driver Live GPS Location during Active Trip
rideRouter.post('/:id/location', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { lat, lng } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ error: 'Valid numeric latitude and longitude are required.' });
      return;
    }

    const now = new Date().toISOString();
    const updated = await RideModel.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          driverLiveLocation: { lat, lng, updatedAt: now },
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: 'Ride not found.' });
      return;
    }

    // Also update driver's current coordinates
    if (updated.driverId) {
      await DriverModel.updateOne(
        { id: updated.driverId },
        { $set: { 'currentCoordinates.lat': lat, 'currentCoordinates.lng': lng } }
      );
    }

    res.json({ message: 'Driver location updated.', location: updated.driverLiveLocation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update location', details: String(err) });
  }
});

// Cancel Ride
rideRouter.post('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reason = 'Plans changed' } = req.body;
    const ride = await RideModel.findOne({ id: req.params.id });

    if (!ride) {
      res.status(404).json({ error: 'Ride not found.' });
      return;
    }

    if (ride.status === 'TRIP_COMPLETED') {
      res.status(400).json({ error: 'Completed trips cannot be cancelled.' });
      return;
    }

    const now = new Date().toISOString();
    const updated = await RideModel.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          status: 'CANCELLED',
          cancelledAt: now,
          cancelReason: reason,
          cancelledBy: req.user?.role === 'DRIVER' ? 'DRIVER' : 'CUSTOMER',
        },
      },
      { new: true }
    ).lean();

    // Free vehicle & driver
    if (ride.vehicleId) {
      await VehicleModel.updateOne({ id: ride.vehicleId }, { $set: { availabilityStatus: 'AVAILABLE' } });
    }
    if (ride.driverId) {
      await DriverModel.updateOne({ id: ride.driverId }, { $set: { status: 'ONLINE' } });
    }

    res.json({ message: 'Ride has been cancelled.', ride: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel ride', details: String(err) });
  }
});

// Rate & Review Completed Ride
rideRouter.post('/:id/review', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, feedback } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      res.status(400).json({ error: 'Rating must be a number between 1 and 5.' });
      return;
    }

    const ride = await RideModel.findOne({ id: req.params.id });
    if (!ride) {
      res.status(404).json({ error: 'Ride not found.' });
      return;
    }

    const now = new Date().toISOString();
    const updated = await RideModel.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          rating: {
            stars: numRating,
            feedback: feedback || '',
            submittedAt: now,
          },
        },
      },
      { new: true }
    ).lean();

    // Create Review document in MongoDB
    await ReviewModel.create({
      id: `rev-${uuidv4().slice(0, 8)}`,
      rideId: ride.id,
      customerId: ride.customerId,
      customerName: ride.customerName,
      driverId: ride.driverId,
      rating: numRating,
      comment: feedback || '',
    });

    // Recalculate and update driver's real rating in MongoDB
    if (ride.driverId) {
      const allDriverReviews = await ReviewModel.find({ driverId: ride.driverId }).lean();
      const avgRating =
        allDriverReviews.reduce((acc, r) => acc + r.rating, 0) / allDriverReviews.length;
      await DriverModel.updateOne(
        { id: ride.driverId },
        {
          $set: {
            rating: Number(avgRating.toFixed(2)),
            totalRatingsCount: allDriverReviews.length,
          },
        }
      );
    }

    res.json({ message: 'Thank you! Rating recorded successfully.', ride: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review', details: String(err) });
  }
});

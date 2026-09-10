import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  UserModel,
  DriverModel,
  VehicleModel,
  RideModel,
  PaymentModel,
  ReviewModel,
  db,
  seedDatabaseIfEmpty,
} from '../db';
import { authenticate, requireRole, AuthRequest } from '../auth';

export const adminRouter = Router();

// Protect all admin endpoints
adminRouter.use(authenticate);
adminRouter.use(requireRole(['ADMIN']));

// 1. Live Calculated Dashboard Statistics (MongoDB Aggregation)
adminRouter.get('/stats', async (_req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute admin statistics', details: String(err) });
  }
});

// 2. Driver Management
adminRouter.get('/drivers', async (req, res) => {
  try {
    const { status, city, search, page = '1', limit = '20' } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (city) query.city = new RegExp(`^${String(city).trim()}$`, 'i');
    if (search) {
      const s = String(search).trim();
      const regex = new RegExp(s, 'i');
      query.$or = [
        { name: regex },
        { phone: regex },
        { licenseNumber: regex },
        { vehicleRegNo: regex },
      ];
    }

    const p = parseInt(String(page), 10) || 1;
    const l = parseInt(String(limit), 10) || 20;
    const skip = (p - 1) * l;

    const [drivers, total] = await Promise.all([
      DriverModel.find(query).skip(skip).limit(l).lean(),
      DriverModel.countDocuments(query),
    ]);

    res.json({ drivers, total, page: p, totalPages: Math.ceil(total / l) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drivers', details: String(err) });
  }
});

// Add new Driver
adminRouter.post('/drivers', async (req, res) => {
  try {
    const { name, phone, email, licenseNumber, city, vehicleModel, vehicleRegNo } = req.body;
    if (!name || !phone || !licenseNumber || !city) {
      res.status(400).json({ error: 'Name, phone, license number and city are required.' });
      return;
    }

    const newDriver = await DriverModel.create({
      id: `DRV-${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@drivenow.in`,
      photo: '',
      licenseNumber: licenseNumber.trim().toUpperCase(),
      rating: 4.8,
      totalRatingsCount: 1,
      completedRides: 0,
      isVerified: true,
      status: 'ONLINE',
      currentCoordinates: {
        lat: 19.076,
        lng: 72.8777,
        address: `${city} Center`,
      },
      vehicleModel,
      vehicleRegNo,
      earningsToday: 0,
      earningsTotal: 0,
      city,
      joinedDate: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({ message: 'Driver registered successfully.', driver: newDriver.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create driver', details: String(err) });
  }
});

// Update Driver
adminRouter.put('/drivers/:id', async (req, res) => {
  try {
    const updated = await DriverModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: 'Driver not found.' });
      return;
    }

    res.json({ message: 'Driver updated.', driver: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update driver', details: String(err) });
  }
});

// Toggle Driver Verification
adminRouter.patch('/drivers/:id/verify', async (req, res) => {
  try {
    const driver = await DriverModel.findOne({ id: req.params.id });
    if (!driver) {
      res.status(404).json({ error: 'Driver not found.' });
      return;
    }

    driver.isVerified = !driver.isVerified;
    await driver.save();

    res.json({ message: `Driver verification set to ${driver.isVerified}.`, driver: driver.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update verification', details: String(err) });
  }
});

// Toggle Driver Status (Suspend / Online)
adminRouter.patch('/drivers/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await DriverModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: 'Driver not found.' });
      return;
    }

    res.json({ message: `Driver status set to ${status}.`, driver: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: String(err) });
  }
});

// 3. Vehicle Management
adminRouter.get('/vehicles', async (req, res) => {
  try {
    const { category, city, status, search, page = '1', limit = '20' } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (city) query.city = new RegExp(`^${String(city).trim()}$`, 'i');
    if (status) query.availabilityStatus = status;
    if (search) {
      const s = String(search).trim();
      const regex = new RegExp(s, 'i');
      query.$or = [
        { model: regex },
        { brand: regex },
        { registrationNumber: regex },
        { city: regex },
      ];
    }

    const p = parseInt(String(page), 10) || 1;
    const l = parseInt(String(limit), 10) || 20;
    const skip = (p - 1) * l;

    const [vehicles, total] = await Promise.all([
      VehicleModel.find(query).skip(skip).limit(l).lean(),
      VehicleModel.countDocuments(query),
    ]);

    res.json({ vehicles, total, page: p, totalPages: Math.ceil(total / l) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles', details: String(err) });
  }
});

// Add new Vehicle
adminRouter.post('/vehicles', async (req, res) => {
  try {
    const {
      brand,
      model,
      variant,
      category,
      registrationNumber,
      year,
      color,
      city,
      fuelType = 'CNG',
      transmission = 'Manual',
      assignedDriverId,
      image,
    } = req.body;

    if (!brand || !model || !registrationNumber || !city) {
      res.status(400).json({ error: 'Brand, model, registration number and city are required.' });
      return;
    }

    const newVehicle = await VehicleModel.create({
      id: `VEH-${uuidv4().slice(0, 8)}`,
      brand,
      model,
      variant: variant || 'Base',
      category: category || 'Sedan',
      registrationNumber: registrationNumber.toUpperCase(),
      year: parseInt(year, 10) || 2023,
      color: color || 'White',
      fuelType,
      transmission,
      seats: category === 'SUV' ? 6 : 4,
      city,
      currentCoordinates: { lat: 19.076, lng: 72.8777, address: `${city} Depot` },
      dailyBaseFare: 60,
      perKmFare: 14.5,
      rating: 4.8,
      totalRides: 0,
      availabilityStatus: 'AVAILABLE',
      assignedDriverId,
      image: image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      features: ['Air Conditioning', 'Clean Interior'],
    });

    res.status(201).json({ message: 'Vehicle added successfully.', vehicle: newVehicle.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add vehicle', details: String(err) });
  }
});

// Update Vehicle Status
adminRouter.patch('/vehicles/:id/status', async (req, res) => {
  try {
    const { availabilityStatus } = req.body;
    const updated = await VehicleModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { availabilityStatus } },
      { new: true }
    ).lean();

    if (!updated) {
      res.status(404).json({ error: 'Vehicle not found.' });
      return;
    }

    res.json({ message: 'Vehicle availability updated.', vehicle: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vehicle', details: String(err) });
  }
});

// Delete Vehicle
adminRouter.delete('/vehicles/:id', async (req, res) => {
  try {
    const deleted = await VehicleModel.deleteOne({ id: req.params.id });
    if (deleted.deletedCount === 0) {
      res.status(404).json({ error: 'Vehicle not found.' });
      return;
    }
    res.json({ message: 'Vehicle deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vehicle', details: String(err) });
  }
});

// 4. All Rides List with Filters
adminRouter.get('/rides', async (req, res) => {
  try {
    const { status, city, search, page = '1', limit = '20' } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (city) query['pickup.city'] = new RegExp(`^${String(city).trim()}$`, 'i');
    if (search) {
      const s = String(search).trim();
      const regex = new RegExp(s, 'i');
      query.$or = [
        { id: regex },
        { customerName: regex },
        { driverName: regex },
        { vehicleRegNo: regex },
      ];
    }

    const p = parseInt(String(page), 10) || 1;
    const l = parseInt(String(limit), 10) || 20;
    const skip = (p - 1) * l;

    const [rides, total] = await Promise.all([
      RideModel.find(query).sort({ requestedAt: -1 }).skip(skip).limit(l).lean(),
      RideModel.countDocuments(query),
    ]);

    res.json({ rides, total, page: p, totalPages: Math.ceil(total / l) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rides', details: String(err) });
  }
});

// 5. Customers List
adminRouter.get('/customers', async (req, res) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const query: any = { role: 'CUSTOMER' };

    if (search) {
      const s = String(search).trim();
      const regex = new RegExp(s, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const p = parseInt(String(page), 10) || 1;
    const l = parseInt(String(limit), 10) || 20;
    const skip = (p - 1) * l;

    const [customers, total] = await Promise.all([
      UserModel.find(query).skip(skip).limit(l).lean(),
      UserModel.countDocuments(query),
    ]);

    res.json({ customers, total, page: p, totalPages: Math.ceil(total / l) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers', details: String(err) });
  }
});

// 6. Payments List
adminRouter.get('/payments', async (req, res) => {
  try {
    const { status, method, page = '1', limit = '20' } = req.query;
    const query: any = {};

    if (status) query.status = status;
    if (method) query.method = method;

    const p = parseInt(String(page), 10) || 1;
    const l = parseInt(String(limit), 10) || 20;
    const skip = (p - 1) * l;

    const [payments, total] = await Promise.all([
      PaymentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      PaymentModel.countDocuments(query),
    ]);

    res.json({ payments, total, page: p, totalPages: Math.ceil(total / l) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments', details: String(err) });
  }
});

// 7. Reviews List
adminRouter.get('/reviews', async (_req, res) => {
  try {
    const reviews = await ReviewModel.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews', details: String(err) });
  }
});

// 8. Re-seed MongoDB database (400 vehicles, 20 models)
adminRouter.post('/seed', async (_req, res) => {
  try {
    await seedDatabaseIfEmpty(true);
    res.json({ message: 'MongoDB seeded with 400 vehicles across 20 models.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to re-seed database', details: String(err) });
  }
});

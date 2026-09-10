import { Router } from 'express';
import { VehicleModel } from '../models';

export const vehicleRouter = Router();

// Get list of vehicles with filters and pagination from MongoDB
vehicleRouter.get('/', async (req, res) => {
  try {
    const {
      city,
      category,
      model,
      status,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const query: any = {};

    if (city) {
      query.city = new RegExp(`^${String(city).trim()}$`, 'i');
    }

    if (category) {
      query.category = String(category);
    }

    if (model) {
      query.model = new RegExp(String(model).trim(), 'i');
    }

    if (status) {
      query.availabilityStatus = String(status);
    }

    if (search) {
      const s = String(search).trim();
      const regex = new RegExp(s, 'i');
      query.$or = [
        { model: regex },
        { brand: regex },
        { registrationNumber: regex },
        { city: regex },
        { assignedDriverName: regex },
      ];
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [vehicles, totalCount, statsCounts] = await Promise.all([
      VehicleModel.find(query).skip(skip).limit(limitNum).lean(),
      VehicleModel.countDocuments(query),
      Promise.all([
        VehicleModel.countDocuments({}),
        VehicleModel.countDocuments({ availabilityStatus: 'AVAILABLE' }),
        VehicleModel.countDocuments({ availabilityStatus: 'ON_TRIP' }),
        VehicleModel.countDocuments({ category: 'Mini' }),
        VehicleModel.countDocuments({ category: 'Sedan' }),
        VehicleModel.countDocuments({ category: 'Prime' }),
        VehicleModel.countDocuments({ category: 'SUV' }),
      ]),
    ]);

    const stats = {
      total: statsCounts[0],
      available: statsCounts[1],
      onTrip: statsCounts[2],
      mini: statsCounts[3],
      sedan: statsCounts[4],
      prime: statsCounts[5],
      suv: statsCounts[6],
    };

    res.json({
      vehicles,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      stats,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles', details: String(err) });
  }
});

// Get single vehicle details
vehicleRouter.get('/:id', async (req, res) => {
  try {
    const vehicle = await VehicleModel.findOne({ id: req.params.id }).lean();
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found.' });
      return;
    }
    res.json({ vehicle });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle', details: String(err) });
  }
});

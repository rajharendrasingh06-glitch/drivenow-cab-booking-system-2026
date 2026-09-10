import { INDIAN_CAR_MODELS } from '../data/carModels';
import { INDIAN_CITIES } from '../data/indianCities';
import { Driver, User, Vehicle, Ride, PaymentRecord, NotificationItem } from '../types';

// Realistic Indian Driver Names
const FIRST_NAMES = [
  'Rajesh', 'Suresh', 'Ramesh', 'Amit', 'Sunil', 'Vijay', 'Manoj', 'Anil',
  'Deepak', 'Sanjay', 'Vikram', 'Pankaj', 'Rakesh', 'Santosh', 'Mukesh',
  'Dinesh', 'Sachin', 'Praveen', 'Mahesh', 'Ganesh', 'Arun', 'Vinod',
  'Ashok', 'Ajay', 'Pradeep', 'Navin', 'Kishore', 'Babu', 'Satish', 'Mohan'
];

const LAST_NAMES = [
  'Verma', 'Sharma', 'Yadav', 'Singh', 'Patil', 'Gupta', 'Kumar', 'Chauhan',
  'Mishra', 'Pandey', 'Kadam', 'Shinde', 'Rao', 'Reddy', 'Nair', 'Gowda',
  'Joshi', 'Deshmukh', 'Pawar', 'Patel', 'Solanki', 'Mehta', 'Thakur', 'Gaikwad'
];

const DRIVER_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
];

const COLORS = [
  'Arctic White', 'Silky Silver', 'Magma Grey', 'Pearl White',
  'Oxford Blue', 'Daytona Grey', 'Calgary White', 'Titan Grey',
  'Granite Grey', 'Phoenix Red'
];

export function generateSeedData(): {
  users: User[];
  drivers: Driver[];
  vehicles: Vehicle[];
  rides: Ride[];
  payments: PaymentRecord[];
  notifications: NotificationItem[];
} {
  const users: User[] = [
    {
      id: 'usr-customer-1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98201 12345',
      role: 'CUSTOMER',
      avatar: '',
      emergencyContact: {
        name: 'Priya Sharma',
        phone: '+91 98201 54321',
        relation: 'Sister',
      },
      savedPlaces: [
        {
          id: 'sp-1',
          label: 'Home',
          address: 'Oberoi Woods, Mohan Gokhale Rd, Goregaon East, Mumbai 400063',
          lat: 19.1678,
          lng: 72.8682,
        },
        {
          id: 'sp-2',
          label: 'Work',
          address: 'ONE BKC, G Block, Bandra Kurla Complex, Mumbai 400051',
          lat: 19.0657,
          lng: 72.8680,
        },
      ],
      createdAt: '2025-01-15T09:30:00.000Z',
    },
    {
      id: 'usr-driver-1',
      name: 'Rajesh Verma',
      email: 'rajesh.driver@drivenow.in',
      phone: '+91 98765 43210',
      role: 'DRIVER',
      avatar: '',
      createdAt: '2024-11-10T10:00:00.000Z',
    },
    {
      id: 'usr-admin-1',
      name: 'DriveNow Ops Center',
      email: 'admin@drivenow.in',
      phone: '+91 98111 00000',
      role: 'ADMIN',
      avatar: '',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  const vehicles: Vehicle[] = [];
  const drivers: Driver[] = [];
  const usedRegNumbers = new Set<string>();

  let vehicleIndex = 1;

  // Exactly 20 models × 20 vehicles per model = EXACTLY 400 vehicles
  INDIAN_CAR_MODELS.forEach((carModel, modelIdx) => {
    for (let unit = 1; unit <= 20; unit++) {
      const cityData = INDIAN_CITIES[(modelIdx * 20 + unit) % INDIAN_CITIES.length];
      const rtoCode = cityData.stateRtoCodes[unit % cityData.stateRtoCodes.length];

      // Unique realistic Indian registration number
      const letterSeries = String.fromCharCode(65 + ((modelIdx + unit) % 26)) + String.fromCharCode(65 + ((unit * 3) % 26));
      let regDigits = 1000 + (modelIdx * 45) + (unit * 19);
      let regNo = `${rtoCode} ${letterSeries} ${regDigits}`;
      while (usedRegNumbers.has(regNo)) {
        regDigits++;
        regNo = `${rtoCode} ${letterSeries} ${regDigits}`;
      }
      usedRegNumbers.add(regNo);

      const vehicleId = `VEH-${1000 + vehicleIndex}`;
      const driverId = `DRV-${1000 + vehicleIndex}`;

      const fName = FIRST_NAMES[(modelIdx * 7 + unit) % FIRST_NAMES.length];
      const lName = LAST_NAMES[(modelIdx * 3 + unit) % LAST_NAMES.length];
      const driverName = `${fName} ${lName}`;
      const driverPhone = `+91 ${9800000000 + (modelIdx * 1000) + (unit * 37)}`;

      // Slight jitter around city center coordinates for realistic nearby positioning
      const latOffset = ((unit % 7) - 3) * 0.022 + ((modelIdx % 5) - 2) * 0.009;
      const lngOffset = ((unit % 5) - 2) * 0.024 + ((modelIdx % 7) - 3) * 0.008;
      const currentLat = Number((cityData.center.lat + latOffset).toFixed(5));
      const currentLng = Number((cityData.center.lng + lngOffset).toFixed(5));

      const rating = Number((4.7 + ((unit * 13) % 30) / 100).toFixed(2));
      const totalRides = 140 + (modelIdx * 35) + (unit * 24);
      const isOnline = unit % 5 !== 0; // ~80% online for active fleet availability

      // Create Driver Record
      const driverRecord: Driver = {
        id: driverId,
        userId: vehicleIndex === 1 ? 'usr-driver-1' : undefined,
        name: driverName,
        phone: driverPhone,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}${unit}@drivenow.in`,
        photo: DRIVER_PHOTOS[(modelIdx + unit) % DRIVER_PHOTOS.length],
        licenseNumber: `${rtoCode.replace(' ', '')}${2018 + (unit % 6)}00${1000 + vehicleIndex}`,
        rating,
        totalRatingsCount: Math.floor(totalRides * 0.85),
        completedRides: totalRides,
        isVerified: true,
        status: isOnline ? 'ONLINE' : 'OFFLINE',
        currentCoordinates: {
          lat: currentLat,
          lng: currentLng,
          heading: (unit * 45) % 360,
          address: `${cityData.popularLandmarks[unit % cityData.popularLandmarks.length]?.name || 'City Center'}, ${cityData.name}`,
        },
        assignedVehicleId: vehicleId,
        vehicleModel: `${carModel.brand} ${carModel.model}`,
        vehicleRegNo: regNo,
        earningsToday: isOnline ? Math.floor(850 + (unit * 110) % 1800) : 0,
        earningsTotal: Math.floor(totalRides * 240),
        city: cityData.name,
        joinedDate: '2024-03-12',
      };
      drivers.push(driverRecord);

      // Create Vehicle Record
      const selectedColor = COLORS[(modelIdx + unit) % COLORS.length];
      const vehicleImage = carModel.colorImages?.[selectedColor] || carModel.imageUrl;

      const vehicleRecord: Vehicle = {
        id: vehicleId,
        brand: carModel.brand,
        model: carModel.model,
        variant: carModel.variants[unit % carModel.variants.length],
        category: carModel.category,
        registrationNumber: regNo,
        year: 2021 + (unit % 5),
        color: selectedColor,
        fuelType: carModel.fuelTypes[unit % carModel.fuelTypes.length],
        transmission: unit % 3 === 0 ? 'Automatic' : 'Manual',
        seats: carModel.defaultSeats,
        city: cityData.name,
        currentCoordinates: {
          lat: currentLat,
          lng: currentLng,
          address: `${cityData.popularLandmarks[unit % cityData.popularLandmarks.length]?.name || 'City Area'}, ${cityData.name}`,
        },
        dailyBaseFare: carModel.baseFare,
        perKmFare: carModel.perKmRate,
        rating,
        totalRides,
        availabilityStatus: isOnline ? 'AVAILABLE' : 'OFFLINE',
        assignedDriverId: driverId,
        assignedDriverName: driverName,
        assignedDriverPhone: driverPhone,
        image: vehicleImage,
        features: carModel.features,
        createdAt: '2024-02-15T08:00:00.000Z',
      };
      vehicles.push(vehicleRecord);

      vehicleIndex++;
    }
  });

  // Seed initial sample completed ride and active ride
  const sampleRide1: Ride = {
    id: 'RIDE-IN-982101',
    customerId: 'usr-customer-1',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98201 12345',
    driverId: drivers[0].id,
    driverName: drivers[0].name,
    driverPhone: drivers[0].phone,
    driverPhoto: drivers[0].photo,
    driverRating: drivers[0].rating,
    vehicleId: vehicles[0].id,
    vehicleModel: `${vehicles[0].brand} ${vehicles[0].model}`,
    vehicleRegNo: vehicles[0].registrationNumber,
    vehicleColor: vehicles[0].color,
    vehicleCategory: vehicles[0].category,
    vehicleImage: vehicles[0].image,
    otp: '4892',
    pickup: {
      lat: 19.0664,
      lng: 72.8690,
      address: 'Bandra Kurla Complex (BKC), G Block, Mumbai',
      city: 'Mumbai',
    },
    drop: {
      lat: 19.0896,
      lng: 72.8656,
      address: 'Chhatrapati Shivaji Maharaj Int’l Airport (T2), Andheri East, Mumbai',
      city: 'Mumbai',
    },
    routeDistanceKm: 8.4,
    estimatedDurationMins: 24,
    fare: {
      baseFare: 65,
      distanceKm: 8.4,
      distanceFare: 130.2,
      timeMinutes: 24,
      timeFare: 36.0,
      subtotal: 231.2,
      taxes: 11.56,
      platformFee: 15.0,
      totalFare: 258,
      currency: 'INR',
    },
    status: 'TRIP_COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    paymentId: 'PAY-DN-100234',
    requestedAt: '2026-03-08T14:15:00.000Z',
    assignedAt: '2026-03-08T14:16:30.000Z',
    arrivedAt: '2026-03-08T14:21:00.000Z',
    startedAt: '2026-03-08T14:23:00.000Z',
    completedAt: '2026-03-08T14:48:00.000Z',
    rating: {
      stars: 5,
      feedback: 'Very polite driver, car was clean and AC was freezing cold. Reached airport right on time!',
      submittedAt: '2026-03-08T14:50:00.000Z',
    },
  };

  const rides: Ride[] = [sampleRide1];

  const payments: PaymentRecord[] = [
    {
      id: 'PAY-DN-100234',
      rideId: 'RIDE-IN-982101',
      customerId: 'usr-customer-1',
      customerName: 'Rahul Sharma',
      driverId: drivers[0].id,
      driverName: drivers[0].name,
      amount: 258,
      currency: 'INR',
      status: 'PAID',
      method: 'UPI',
      razorpayPaymentId: 'pay_NmB198Xz28PLa',
      invoiceNumber: 'INV-DN-2026-00412',
      createdAt: '2026-03-08T14:49:00.000Z',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      userId: 'usr-customer-1',
      title: 'Welcome to DriveNow!',
      message: 'Book verified Indian cabs anytime across 14 major cities with zero hidden surge fares.',
      type: 'SYSTEM',
      read: true,
      createdAt: '2026-03-08T10:00:00.000Z',
    },
    {
      id: 'notif-2',
      userId: 'usr-customer-1',
      title: 'Trip Completed Successfully',
      message: 'Your ride to Chhatrapati Shivaji Maharaj Int’l Airport (T2) is complete. Paid ₹258 via UPI.',
      type: 'PAYMENT',
      rideId: 'RIDE-IN-982101',
      read: false,
      createdAt: '2026-03-08T14:49:00.000Z',
    },
  ];

  return {
    users,
    drivers,
    vehicles,
    rides,
    payments,
    notifications,
  };
}

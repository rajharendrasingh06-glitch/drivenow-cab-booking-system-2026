export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export type CabCategory = 'Mini' | 'Sedan' | 'Prime' | 'SUV';

export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'MAINTENANCE';

export type RideStatus =
  | 'REQUESTED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'TRIP_STARTED'
  | 'TRIP_COMPLETED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'CASH' | 'WALLET';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  savedPlaces?: {
    id?: string;
    label?: string;
    address?: string;
    lat?: number;
    lng?: number;
    home?: string;
    work?: string;
  }[] | { home?: string; work?: string } | any;
  createdAt: string;
}

export interface Driver {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  licenseNumber: string;
  rating: number;
  totalRatingsCount: number;
  completedRides: number;
  isVerified: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'ON_TRIP';
  currentCoordinates: {
    lat: number;
    lng: number;
    heading?: number;
    address?: string;
  };
  assignedVehicleId?: string;
  vehicleModel?: string;
  vehicleRegNo?: string;
  earningsToday: number;
  earningsTotal: number;
  city: string;
  joinedDate: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant: string;
  category: CabCategory;
  registrationNumber: string;
  year: number;
  color: string;
  fuelType: 'CNG' | 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  seats: number;
  city: string;
  currentCoordinates: {
    lat: number;
    lng: number;
    address?: string;
  };
  dailyBaseFare: number;
  perKmFare: number;
  rating: number;
  totalRides: number;
  availabilityStatus: VehicleStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  image: string;
  features: string[];
  createdAt?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  address: string;
  city?: string;
}

export interface FareBreakdown {
  baseFare: number;
  distanceKm: number;
  distanceFare: number;
  timeMinutes: number;
  timeFare: number;
  subtotal: number;
  taxes: number; // 5% GST on cab services in India
  platformFee: number;
  totalFare: number;
  currency: 'INR';
}

export interface Ride {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  driverRating?: number;
  vehicleId?: string;
  vehicleModel?: string;
  vehicleRegNo?: string;
  vehicleColor?: string;
  vehicleCategory: CabCategory;
  vehicleImage?: string;
  otp: string; // 4-digit start OTP like Ola/Uber
  pickup: Coordinates;
  drop: Coordinates;
  routeDistanceKm: number;
  estimatedDurationMins: number;
  fare: FareBreakdown;
  status: RideStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  requestedAt: string;
  assignedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: 'CUSTOMER' | 'DRIVER' | 'SYSTEM';
  driverLiveLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  rating?: {
    stars: number;
    feedback: string;
    submittedAt: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'RIDE' | 'PAYMENT' | 'SAFETY' | 'SYSTEM';
  rideId?: string;
  read: boolean;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  rideId: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  amount: number;
  currency: 'INR';
  status: PaymentStatus;
  method: PaymentMethod;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  invoiceNumber: string;
  createdAt: string;
}

export interface AdminStats {
  totalCustomers: number;
  totalDrivers: number;
  totalVehicles: number;
  onlineDrivers: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  totalRevenue: number;
  todayRevenue: number;
  fleetUtilizationPercent: number;
}

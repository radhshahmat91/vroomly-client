export type Role = "renter" | "owner" | "admin";
export type HostStatus = "none" | "pending" | "approved" | "rejected";
export type CarStatus = "pending" | "approved" | "rejected" | "removed" | "suspended";
export type BookingStatus = "pending" | "accepted" | "confirmed" | "completed" | "rejected" | "cancelled";
export type PaymentStatus = "succeeded" | "refunded" | "failed";
export type ComplaintStatus = "open" | "in_review" | "resolved" | "dismissed";
export type Category = "sedan" | "suv" | "hatchback" | "sports" | "luxury" | "convertible" | "offroad" | "van" | "pickup";
export type FuelType = "petrol" | "diesel" | "hybrid" | "electric" | "cng";
export type Transmission = "automatic" | "manual";

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  [key: string]: unknown;
}
export interface Paginated<T, M = Record<string, unknown>> {
  data: T[];
  meta: Meta & M;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  status: "active" | "suspended";
  suspendedReason?: string;
  hostStatus: HostStatus;
  phone?: string;
  city?: string;
  bio?: string;
  hostProfile?: { phone?: string; city?: string; about?: string; appliedAt?: string; reviewedAt?: string; reviewNote?: string };
  createdAt?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  image?: string | null;
  city?: string;
  bio?: string;
  createdAt?: string;
}

export interface CarImage {
  url: string;
  publicId?: string;
}
export interface BlockedRange {
  id: string;
  start: string;
  end: string;
  reason?: string;
}
export interface OwnerStats {
  carsCount: number;
  tripsCount: number;
  ratingAvg: number;
  ratingCount: number;
}

export interface Car {
  id: string;
  owner: PublicUser & { email?: string };
  title: string;
  brand: string;
  model: string;
  year: number;
  category: Category;
  description: string;
  images: CarImage[];
  pricePerDay: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  seats: number;
  doors?: number;
  fuelType: FuelType;
  transmission: Transmission;
  features: string[];
  city: string;
  address?: string;
  country?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  blockedDates?: BlockedRange[];
  status: CarStatus;
  adminNote?: string;
  ratingAvg: number;
  ratingCount: number;
  tripsCount: number;
  distanceKm?: number;
  ownerStats?: OwnerStats;
  createdAt: string;
  updatedAt?: string;
}

export interface CarsMeta {
  totalCars: number;
  brands: string[];
  cities: string[];
  categories: Record<string, number>;
  fuelTypes: Record<string, number>;
  priceRange: { min: number; max: number };
}

export interface CarFilters {
  search?: string;
  brand?: string;
  category?: string;
  city?: string;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface Availability {
  blocked: { start: string; end: string }[];
  booked: { start: string; end: string }[];
}

export interface Pricing {
  days: number;
  dailyRate: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  platformFee: number;
  ownerEarning: number;
}

export interface BookingCar {
  id: string;
  title: string;
  brand?: string;
  model?: string;
  year?: number;
  images: CarImage[];
  city: string;
  pricePerDay: number;
  status: CarStatus;
}

export interface Booking {
  id: string;
  car: BookingCar;
  renter: PublicUser;
  owner: PublicUser;
  startDate: string;
  endDate: string;
  days: number;
  pricing: Pricing;
  message?: string;
  status: BookingStatus;
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentIntentId?: string;
  paidAt?: string;
  respondedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: "renter" | "owner" | "system" | "admin";
  cancelReason?: string;
  reviewed: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  booking: string;
  car: { id: string; title: string; images?: CarImage[]; city?: string };
  renter: PublicUser;
  owner: string;
  rating: number;
  comment: string;
  reply?: { text?: string; repliedAt?: string };
  createdAt: string;
}
export interface ReviewMeta {
  average: number;
  distribution?: Record<string, number>;
}

export interface Payment {
  id: string;
  booking: string | { id: string; startDate: string; endDate: string; days: number };
  car: { id: string; title: string; images?: CarImage[] };
  renter: PublicUser;
  owner: PublicUser;
  amount: number;
  platformFee: number;
  ownerEarning: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId: string;
  receiptUrl?: string;
  paidAt: string;
  refundedAt?: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  user: AppUser | string;
  booking?: { id: string; startDate: string; endDate: string; status: string; car?: { title: string } };
  car?: { id: string; title: string };
  category: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface OwnerStatsData {
  listings: { total: number; approved: number; pending: number; rejected: number };
  pendingRequests: number;
  upcomingTrips: number;
  earnings: { allTime: number; thisMonth: number; trips: number };
  rating: { average: number; count: number };
}
export interface EarningsMonth {
  month: string;
  gross: number;
  commission: number;
  net: number;
  trips: number;
}
export interface EarningsData {
  monthly: EarningsMonth[];
  totals: { gross: number; commission: number; net: number; trips: number };
}

export interface AdminAnalytics {
  kpis: {
    users: number;
    hosts: number;
    cars: number;
    bookings: number;
    completedTrips: number;
    grossRevenue: number;
    commission: number;
    payments: number;
  };
  queues: { pendingHosts: number; pendingCars: number; openComplaints: number };
  revenueByMonth: { month: string; gross: number; commission: number; bookings: number }[];
  bookingsByStatus: { status: BookingStatus; count: number }[];
}

export interface PublicStats {
  cars: number;
  hosts: number;
  trips: number;
  cities: number;
}

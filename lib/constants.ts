import type { BookingStatus, Category, ComplaintStatus, FuelType, Transmission } from "@/types";
import { images } from "./images";

export const SITE = {
  name: "Vroomly",
  tagline: "Rent cars from people near you",
  description:
    "Vroomly is a peer-to-peer car rental marketplace. Browse cars from local hosts, pick your dates, pay securely and drive.",
};

export const CATEGORY_TILES: { key: string; label: string; href: string; image: string; blurb: string }[] = [
  { key: "suv", label: "SUVs", href: "/cars?category=suv", image: images.categories.suv, blurb: "Room for people and gear" },
  { key: "sedan", label: "Sedans", href: "/cars?category=sedan", image: images.categories.sedan, blurb: "Easy, efficient daily drivers" },
  { key: "hatchback", label: "Compact", href: "/cars?category=hatchback", image: images.categories.hatchback, blurb: "Made for tight city streets" },
  { key: "electric", label: "Electric", href: "/cars?fuelType=electric", image: images.categories.electric, blurb: "Silent, quick, zero tailpipe" },
  { key: "convertible", label: "Convertibles", href: "/cars?category=convertible", image: images.categories.convertible, blurb: "Roof down, windows open" },
  { key: "sports", label: "Sports", href: "/cars?category=sports", image: images.categories.sports, blurb: "For the drive itself" },
  { key: "luxury", label: "Luxury", href: "/cars?category=luxury", image: images.categories.luxury, blurb: "Make the occasion count" },
  { key: "offroad", label: "Off-road", href: "/cars?category=offroad", image: images.categories.offroad, blurb: "Trails, snow and gravel" },
];

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback / compact" },
  { value: "sports", label: "Sports" },
  { value: "luxury", label: "Luxury" },
  { value: "convertible", label: "Convertible" },
  { value: "offroad", label: "Off-road" },
  { value: "van", label: "Van / minivan" },
  { value: "pickup", label: "Pickup truck" },
];

export const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
  { value: "cng", label: "CNG" },
];

export const TRANSMISSION_OPTIONS: { value: Transmission; label: string }[] = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest listings" },
];

export const FEATURE_SUGGESTIONS = [
  "Bluetooth", "Apple CarPlay", "Android Auto", "Backup camera", "Heated seats", "Sunroof", "USB charging",
  "GPS navigation", "Cruise control", "Keyless entry", "Pet friendly", "Roof rack", "4WD", "AWD", "Child seat available",
  "Leather seats", "Convertible top", "Lane assist",
];

export const BOOKING_STATUS: Record<BookingStatus, { label: string; badge: string; hint: string }> = {
  pending: { label: "Awaiting host", badge: "badge-warning", hint: "The host has not answered yet." },
  accepted: { label: "Ready to pay", badge: "badge-info", hint: "Accepted — pay to confirm the trip." },
  confirmed: { label: "Confirmed", badge: "badge-success", hint: "Paid and locked in." },
  completed: { label: "Completed", badge: "badge-neutral", hint: "Trip finished." },
  rejected: { label: "Declined", badge: "badge-error", hint: "The host declined the request." },
  cancelled: { label: "Cancelled", badge: "badge-ghost", hint: "This booking was cancelled." },
};

export const COMPLAINT_STATUS: Record<ComplaintStatus, { label: string; badge: string }> = {
  open: { label: "Open", badge: "badge-warning" },
  in_review: { label: "In review", badge: "badge-info" },
  resolved: { label: "Resolved", badge: "badge-success" },
  dismissed: { label: "Dismissed", badge: "badge-ghost" },
};

export const COMPLAINT_CATEGORIES = [
  { value: "booking", label: "A booking" },
  { value: "payment", label: "Payment or refund" },
  { value: "vehicle", label: "The vehicle" },
  { value: "host", label: "A host" },
  { value: "renter", label: "A renter" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Something else" },
];

export const NAV_LINKS = [
  { href: "/cars", label: "Browse cars" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/become-host", label: "Become a host" },
];

export const DEMO_ACCOUNTS = [
  { label: "Renter", email: "renter@vroomly.app" },
  { label: "Host", email: "host@vroomly.app" },
  { label: "Admin", email: "admin@vroomly.app" },
];
export const DEMO_PASSWORD = "Vroomly@123";

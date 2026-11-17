import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/i.test(v), "Enter a full link that starts with http:// or https://");

/** The three password rules from the brief: an uppercase letter, a lowercase letter, and 6+ characters. */
export const passwordRules = [
  { id: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { id: "length", label: "At least 6 characters", test: (v: string) => v.length >= 6 },
];

const password = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Z]/, "Password needs at least one uppercase letter")
  .regex(/[a-z]/, "Password needs at least one lowercase letter");

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.email("Enter a valid email address"),
  photoURL: optionalUrl,
  password,
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotSchema = z.object({ email: z.email("Enter a valid email address") });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });
export type ResetValues = z.infer<typeof resetSchema>;

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, "Enter your current password"), newPassword: password, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { message: "Passwords do not match", path: ["confirm"] })
  .refine((v) => v.newPassword !== v.currentPassword, { message: "Choose a password you haven't used here before", path: ["newPassword"] });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  phone: z.string().trim().max(30),
  city: z.string().trim().max(60),
  bio: z.string().trim().max(400, "Keep your bio under 400 characters"),
  image: optionalUrl,
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const hostApplySchema = z.object({
  phone: z.string().trim().min(6, "Enter a phone number we can reach you on").max(30),
  city: z.string().trim().min(2, "City is required").max(60),
  about: z.string().trim().min(20, "Tell us a little about yourself and your car (20+ characters)").max(800),
});
export type HostApplyValues = z.infer<typeof hostApplySchema>;

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a star rating").max(5),
  comment: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)").max(1200),
});
export type ReviewValues = z.infer<typeof reviewSchema>;

export const complaintSchema = z.object({
  category: z.string().min(1),
  bookingId: z.string(),
  subject: z.string().trim().min(4, "Subject must be at least 4 characters").max(120),
  description: z.string().trim().min(15, "Please describe the problem in at least 15 characters").max(2000),
});
export type ComplaintValues = z.infer<typeof complaintSchema>;

export const blockSchema = z.object({ reason: z.string().trim().max(140) });

const optionalNumber = z.number().optional();

export const carFormSchema = z.object({
  brand: z.string().trim().min(2, "Brand must be at least 2 characters").max(40),
  model: z.string().trim().min(1, "Model is required").max(60),
  year: z.number({ error: "Enter the model year" }).int().min(1950, "Year must be 1950 or later").max(new Date().getFullYear() + 1, "That year is too far ahead"),
  category: z.string().min(1, "Pick a body type"),
  description: z.string().trim().min(20, "Describe the car in at least 20 characters").max(2000),
  pricePerDay: z.number({ error: "Enter a daily price" }).min(5, "Daily price must be at least $5").max(5000),
  weeklyDiscount: z.number({ error: "Enter 0 for no discount" }).min(0).max(60, "Weekly discount can be up to 60%"),
  monthlyDiscount: z.number({ error: "Enter 0 for no discount" }).min(0).max(80, "Monthly discount can be up to 80%"),
  seats: z.number({ error: "How many seats?" }).int().min(1).max(15),
  doors: optionalNumber,
  fuelType: z.string().min(1, "Pick a fuel type"),
  transmission: z.string().min(1, "Pick a transmission"),
  features: z.array(z.string()),
  images: z.array(z.object({ url: z.string(), publicId: z.string().optional() })).min(1, "Add at least one photo").max(10, "You can add up to 10 photos"),
  city: z.string().trim().min(2, "City is required").max(60),
  address: z.string().trim().max(160),
  country: z.string().trim().max(60),
  lat: optionalNumber,
  lng: optionalNumber,
});
export type CarFormValues = z.infer<typeof carFormSchema>;

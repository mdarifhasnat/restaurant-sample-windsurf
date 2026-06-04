import { z } from 'zod';

// Customer Info Schema
export const customerInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Vorname muss mindestens 2 Zeichen lang sein')
    .max(50, 'Vorname darf maximal 50 Zeichen lang sein'),
  lastName: z
    .string()
    .min(2, 'Nachname muss mindestens 2 Zeichen lang sein')
    .max(50, 'Nachname darf maximal 50 Zeichen lang sein'),
  email: z
    .string()
    .email('Ungültige E-Mail-Adresse'),
  phone: z
    .string()
    .min(10, 'Telefonnummer muss mindestens 10 Zeichen lang sein')
    .max(20, 'Telefonnummer darf maximal 20 Zeichen lang sein')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Ungültiges Telefonformat'),
});

// Delivery Address Schema
export const deliveryAddressSchema = z.object({
  street: z
    .string()
    .min(3, 'Straße muss mindestens 3 Zeichen lang sein')
    .max(100, 'Straße darf maximal 100 Zeichen lang sein'),
  houseNumber: z
    .string()
    .min(1, 'Hausnummer ist erforderlich')
    .max(10, 'Hausnummer darf maximal 10 Zeichen lang sein'),
  postalCode: z
    .string()
    .min(5, 'Postleitzahl muss mindestens 5 Zeichen lang sein')
    .max(10, 'Postleitzahl darf maximal 10 Zeichen lang sein')
    .regex(/^[0-9]+$/, 'Postleitzahl darf nur Zahlen enthalten'),
  city: z
    .string()
    .min(2, 'Stadt muss mindestens 2 Zeichen lang sein')
    .max(50, 'Stadt darf maximal 50 Zeichen lang sein'),
  deliveryInstructions: z
    .string()
    .max(200, 'Lieferhinweise dürfen maximal 200 Zeichen lang sein')
    .optional(),
});

// Complete Checkout Schema
export const checkoutSchema = z.object({
  customerInfo: customerInfoSchema,
  deliveryAddress: deliveryAddressSchema,
  orderNotes: z
    .string()
    .max(500, 'Bestellnotizen dürfen maximal 500 Zeichen lang sein')
    .optional(),
});

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Ungültige E-Mail-Adresse'),
  password: z
    .string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
});

// Register Schema
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Vorname muss mindestens 2 Zeichen lang sein')
    .max(50, 'Vorname darf maximal 50 Zeichen lang sein'),
  lastName: z
    .string()
    .min(2, 'Nachname muss mindestens 2 Zeichen lang sein')
    .max(50, 'Nachname darf maximal 50 Zeichen lang sein'),
  email: z
    .string()
    .email('Ungültige E-Mail-Adresse'),
  phone: z
    .string()
    .min(10, 'Telefonnummer muss mindestens 10 Zeichen lang sein')
    .max(20, 'Telefonnummer darf maximal 20 Zeichen lang sein')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Ungültiges Telefonformat'),
  password: z
    .string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten'),
  confirmPassword: z
    .string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

// Types
export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;
export type DeliveryAddressFormData = z.infer<typeof deliveryAddressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

import { z } from 'zod';

// ============================================================================
// PRODUCT VALIDATION
// ============================================================================

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Produktname ist erforderlich'),
  nameDe: z.string().min(1, 'Deutscher Name ist erforderlich'),
  nameEn: z.string().min(1, 'Englischer Name ist erforderlich'),
  description: z.string().optional(),
  descriptionDe: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.string().min(1, 'Preis ist erforderlich').regex(/^\d+(\.\d{1,2})?$/, 'Ungültiges Preisformat'),
  categoryId: z.string().min(1, 'Kategorie ist erforderlich'),
  imageUrl: z.string().url('Ungültige Bild-URL').optional(),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  allergens: z.array(z.string()).optional(),
  calories: z.number().int().min(0).optional(),
  preparationTime: z.number().int().min(0).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().min(1, 'Produkt-ID ist erforderlich'),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// ============================================================================
// CATEGORY VALIDATION
// ============================================================================

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Kategoriename ist erforderlich'),
  nameDe: z.string().min(1, 'Deutscher Name ist erforderlich'),
  nameEn: z.string().min(1, 'Englischer Name ist erforderlich'),
  description: z.string().optional(),
  descriptionDe: z.string().optional(),
  descriptionEn: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  imageUrl: z.string().url('Ungültige Bild-URL').optional(),
  isActive: z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: z.string().min(1, 'Kategorie-ID ist erforderlich'),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

// ============================================================================
// ORDER STATUS UPDATE VALIDATION
// ============================================================================

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'Bestell-ID ist erforderlich'),
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']),
});

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// ============================================================================
// RESTAURANT SETTINGS VALIDATION
// ============================================================================

export const UpdateRestaurantSettingsSchema = z.object({
  name: z.string().min(1, 'Restaurantname ist erforderlich'),
  phone: z.string().min(1, 'Telefonnummer ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  address: z.string().min(1, 'Adresse ist erforderlich'),
  deliveryFee: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Ungültiges Liefergebühr-Format'),
  minimumOrderValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Ungültiges Mindestbestellwert-Format'),
  openingHours: z.string().optional(),
  deliveryRadius: z.number().int().min(0).optional(),
});

export type UpdateRestaurantSettingsInput = z.infer<typeof UpdateRestaurantSettingsSchema>;

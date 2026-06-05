import { z } from 'zod';

// ============================================================================
// ORDER CREATION VALIDATION SCHEMA
// ============================================================================

export const DeliveryAddressSchema = z.object({
  street: z.string().min(1, 'Straße ist erforderlich'),
  houseNumber: z.string().min(1, 'Hausnummer ist erforderlich'),
  postalCode: z.string().min(1, 'Postleitzahl ist erforderlich'),
  city: z.string().min(1, 'Stadt ist erforderlich'),
  deliveryInstructions: z.string().optional(),
});

export const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Produkt-ID ist erforderlich'),
  quantity: z.number().int().min(1, 'Menge muss mindestens 1 sein'),
  selectedOptions: z.record(z.string(), z.array(z.string())).optional(),
  specialInstructions: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  customerType: z.enum(['GUEST', 'REGISTERED'], {
    message: 'Kundentyp ist erforderlich',
  }),
  customerId: z.string().nullable().optional(),
  customerFirstName: z.string().min(1, 'Vorname ist erforderlich'),
  customerLastName: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().min(1, 'Telefonnummer ist erforderlich'),
  orderType: z.enum(['DELIVERY', 'PICKUP'], {
    message: 'Bestellart ist erforderlich',
  }),
  deliveryAddress: DeliveryAddressSchema.optional(),
  orderNotes: z.string().optional(),
  items: z.array(OrderItemSchema).min(1, 'Warenkorb darf nicht leer sein'),
}).refine(
  (data) => {
    // DELIVERY orders require delivery address
    if (data.orderType === 'DELIVERY') {
      return data.deliveryAddress !== undefined;
    }
    return true;
  },
  {
    message: 'Lieferadresse ist für Lieferbestellungen erforderlich',
    path: ['deliveryAddress'],
  }
).refine(
  (data) => {
    // GUEST orders must have customerId = null
    if (data.customerType === 'GUEST') {
      return data.customerId === null;
    }
    return true;
  },
  {
    message: 'Gastbestellungen dürfen keine Kunden-ID haben',
    path: ['customerId'],
  }
).refine(
  (data) => {
    // REGISTERED orders should have customerId
    if (data.customerType === 'REGISTERED') {
      return data.customerId !== null && data.customerId !== undefined;
    }
    return true;
  },
  {
    message: 'Registrierte Bestellungen benötigen eine Kunden-ID',
    path: ['customerId'],
  }
);

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type DeliveryAddressInput = z.infer<typeof DeliveryAddressSchema>;
export type OrderItemInput = z.infer<typeof OrderItemSchema>;

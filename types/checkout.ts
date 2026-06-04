// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export type CustomerType = 'guest' | 'registered';

// ============================================================================
// CUSTOMER INFORMATION
// ============================================================================

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// ============================================================================
// DELIVERY ADDRESS
// ============================================================================

export interface DeliveryAddress {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  deliveryInstructions?: string;
}

// ============================================================================
// CHECKOUT SESSION
// Represents the complete state of a checkout session
// This is used during the checkout flow before order creation
// ============================================================================

export interface CheckoutSession {
  customerType: CustomerType;
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  orderNotes?: string;
}

// ============================================================================
// ORDER STATUS
// For future Prisma integration
// ============================================================================

export type OrderStatus = 
  | 'pending'       // Order created, awaiting confirmation
  | 'confirmed'     // Order confirmed by restaurant
  | 'preparing'     // Order is being prepared
  | 'ready'         // Order is ready for pickup/delivery
  | 'delivering'    // Order is out for delivery
  | 'delivered'     // Order has been delivered
  | 'cancelled';    // Order was cancelled

// ============================================================================
// PAYMENT STATUS
// For future Prisma integration
// ============================================================================

export type PaymentStatus = 
  | 'pending'       // Payment not yet processed
  | 'processing'    // Payment is being processed
  | 'completed'     // Payment completed successfully
  | 'failed'        // Payment failed
  | 'refunded';     // Payment was refunded

// ============================================================================
// PAYMENT METHOD
// For future Prisma integration
// ============================================================================

export type PaymentMethod = 
  | 'cash'          // Cash on delivery
  | 'card'          // Credit/Debit card
  | 'paypal'        // PayPal
  | 'sofort'        // Sofort (German payment method)
  | 'giropay'       // Giropay (German payment method)
  | 'invoice';      // Invoice payment

// ============================================================================
// ORDER ITEM
// Individual items in an order
// For future Prisma integration
// ============================================================================

export interface OrderItem {
  id: string;
  orderId: string;
  dishId: string;
  dishName: string;
  dishDescription?: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

// ============================================================================
// ORDER
// Complete order structure for database storage
// For future Prisma integration
// ============================================================================

export interface Order {
  id: string;
  
  // Customer information
  customerType: CustomerType;
  customerId: string | null; // null for guests, user.id for registered customers
  email: string;
  phone: string;
  
  // Delivery information
  deliveryAddress: DeliveryAddress;
  orderNotes?: string;
  
  // Order details
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  
  // Status tracking
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  deliveredAt?: Date;
}

// ============================================================================
// CART ITEM
// Items in the shopping cart before checkout
// ============================================================================

export interface CartItem {
  id: string;
  dishId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
}

// ============================================================================
// ORDER SUMMARY
// Simplified order summary for display purposes
// ============================================================================

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// ============================================================================
// CHECKOUT STEP
// Steps in the checkout flow
// ============================================================================

export type CheckoutStep = 
  | 'options'           // Choose guest/login/register
  | 'customer-info'     // Enter customer information
  | 'delivery-address'  // Enter delivery address
  | 'payment'           // Select payment method
  | 'confirmation';     // Order confirmation

// ============================================================================
// CHECKOUT OPTION
// Initial checkout options
// ============================================================================

export type CheckoutOption = 'guest' | 'login' | 'register';

// ============================================================================
// USER (for future authentication)
// For future Prisma integration
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SAVED ADDRESS (for future implementation)
// For registered users to save multiple addresses
// For future Prisma integration
// ============================================================================

export interface SavedAddress {
  id: string;
  userId: string;
  label: string; // e.g., "Home", "Work"
  address: DeliveryAddress;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// HELPER TYPES
// Utility types for common patterns
// ============================================================================

// Guest order type (customerType is always 'guest', customerId is always null)
export type GuestOrder = Omit<Order, 'customerType' | 'customerId'> & {
  customerType: 'guest';
  customerId: null;
};

// Registered order type (customerType is always 'registered', customerId is required)
export type RegisteredOrder = Omit<Order, 'customerType' | 'customerId'> & {
  customerType: 'registered';
  customerId: string;
};

// Guest checkout session type
export type GuestCheckoutSession = Omit<CheckoutSession, 'customerType'> & {
  customerType: 'guest';
};

// Registered checkout session type
export type RegisteredCheckoutSession = Omit<CheckoutSession, 'customerType'> & {
  customerType: 'registered';
};

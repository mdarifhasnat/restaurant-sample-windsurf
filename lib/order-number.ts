/**
 * Generate a unique order number in the format: SR-YYYYMMDD-XXXX
 * Example: SR-20260604-0001
 */

export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // XXXX
  return `SR-${dateStr}-${random}`;
}

/**
 * Validate order number format
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  const regex = /^SR-\d{8}-\d{4}$/;
  return regex.test(orderNumber);
}

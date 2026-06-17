/**
 * Client-side pricing that mirrors the backend `calculatePrice` service
 * (backend/src/services/pricing.ts) exactly, so the cart total shown to a
 * parent matches what the server will charge at checkout.
 */

export type DemandLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PriceBreakdown {
  basePrice: number;
  surgeMultiplier: number;
  surgeAmount: number;
  bulkDiscountPercent: number;
  bulkDiscountAmount: number;
  taxPercent: number;
  taxAmount: number;
  finalPrice: number;
  totalSavings: number;
}

/** Surge multiplier by demand level — must stay in sync with the backend. */
export const surgeMultiplierFor = (demandLevel: DemandLevel): number => {
  if (demandLevel === 'high') return 1.3;
  if (demandLevel === 'critical') return 1.6;
  return 1.0;
};

/** Bulk discount percentage by quantity — must stay in sync with the backend. */
export const bulkDiscountPercentFor = (quantity: number): number => {
  if (quantity >= 10) return 15;
  if (quantity >= 5) return 10;
  if (quantity >= 3) return 5;
  return 0;
};

export const calculatePrice = (
  basePrice: number,
  demandLevel: DemandLevel,
  taxPercent: number,
  quantity = 1,
): PriceBreakdown => {
  const surgeMultiplier = surgeMultiplierFor(demandLevel);
  const surgeAmount = Math.round(basePrice * (surgeMultiplier - 1));

  const bulkDiscountPercent = bulkDiscountPercentFor(quantity);

  const subtotal = (basePrice + surgeAmount) * quantity;
  const bulkDiscountAmount = Math.round(subtotal * (bulkDiscountPercent / 100));
  const afterDiscount = subtotal - bulkDiscountAmount;
  const taxAmount = Math.round(afterDiscount * (taxPercent / 100));

  return {
    basePrice,
    surgeMultiplier,
    surgeAmount,
    bulkDiscountPercent,
    bulkDiscountAmount,
    taxPercent,
    taxAmount,
    finalPrice: afterDiscount + taxAmount,
    totalSavings: bulkDiscountAmount,
  };
};

import { prisma } from '../config/database';

export interface PriceBreakdown {
  basePrice: number; surgeMultiplier: number; surgeAmount: number;
  bulkDiscountPercent: number; bulkDiscountAmount: number;
  taxPercent: number; taxAmount: number; finalPrice: number; totalSavings: number;
}

export const calculatePrice = async (formCatalogItemId: string, quantity = 1): Promise<PriceBreakdown> => {
  const form = await prisma.formCatalogItem.findUnique({
    where: { id: formCatalogItemId },
    include: { school: true },
  });
  if (!form) throw new Error('Form not found');

  const basePrice = form.basePrice;
  let surgeMultiplier = 1.0;
  if (form.school.demandLevel === 'high') surgeMultiplier = 1.3;
  if (form.school.demandLevel === 'critical') surgeMultiplier = 1.6;
  const surgeAmount = Math.round(basePrice * (surgeMultiplier - 1));

  let bulkDiscountPercent = 0;
  if (quantity >= 10) bulkDiscountPercent = 15;
  else if (quantity >= 5) bulkDiscountPercent = 10;
  else if (quantity >= 3) bulkDiscountPercent = 5;

  const subtotal = (basePrice + surgeAmount) * quantity;
  const bulkDiscountAmount = Math.round(subtotal * (bulkDiscountPercent / 100));
  const taxPercent = form.taxPercentage;
  const afterDiscount = subtotal - bulkDiscountAmount;
  const taxAmount = Math.round(afterDiscount * (taxPercent / 100));

  return {
    basePrice, surgeMultiplier, surgeAmount,
    bulkDiscountPercent, bulkDiscountAmount,
    taxPercent, taxAmount,
    finalPrice: afterDiscount + taxAmount,
    totalSavings: bulkDiscountAmount,
  };
};

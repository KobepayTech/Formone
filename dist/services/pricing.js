"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePrice = void 0;
const database_1 = require("../config/database");
const calculatePrice = async (formCatalogItemId, quantity = 1) => {
    const form = await database_1.prisma.formCatalogItem.findUnique({
        where: { id: formCatalogItemId },
        include: { school: true },
    });
    if (!form)
        throw new Error('Form not found');
    const basePrice = form.basePrice;
    let surgeMultiplier = 1.0;
    if (form.school.demandLevel === 'high')
        surgeMultiplier = 1.3;
    if (form.school.demandLevel === 'critical')
        surgeMultiplier = 1.6;
    const surgeAmount = Math.round(basePrice * (surgeMultiplier - 1));
    let bulkDiscountPercent = 0;
    if (quantity >= 10)
        bulkDiscountPercent = 15;
    else if (quantity >= 5)
        bulkDiscountPercent = 10;
    else if (quantity >= 3)
        bulkDiscountPercent = 5;
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
exports.calculatePrice = calculatePrice;
//# sourceMappingURL=pricing.js.map
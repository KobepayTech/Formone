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
export declare const calculatePrice: (formCatalogItemId: string, quantity?: number) => Promise<PriceBreakdown>;

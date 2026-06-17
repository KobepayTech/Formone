/**
 * Currency helpers. The platform settles in Tanzanian Shilling (TZS),
 * matching the backend data model, so all monetary values are formatted
 * consistently here rather than hardcoding "Rs." across the UI.
 */

export const CURRENCY_CODE = 'TZS';

const formatter = new Intl.NumberFormat('en-TZ', {
  style: 'currency',
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

/** Format an integer amount of TZS, e.g. 1500 -> "TSh 1,500". */
export const formatCurrency = (amount: number): string => formatter.format(amount);

/** Format just the grouped number without the currency symbol, e.g. 1500 -> "1,500". */
export const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 }).format(amount);

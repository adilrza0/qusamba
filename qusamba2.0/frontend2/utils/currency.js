/**
 * Currency utility functions for Indian Rupees
 */

/**
 * Format amount as Indian Rupees
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale to use (default: 'en-IN')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, locale = 'en-IN') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format amount as Indian Rupees with custom symbol
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the rupee symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatRupees = (amount, showSymbol = true) => {
  const formatted = amount.toFixed(2);
  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Convert paise to rupees
 * @param {number} paise - Amount in paise
 * @returns {number} Amount in rupees
 */
export const paiseToRupees = (paise) => {
  return paise / 100;
};

/**
 * Convert rupees to paise
 * @param {number} rupees - Amount in rupees
 * @returns {number} Amount in paise
 */
export const rupeesToPaise = (rupees) => {
  return Math.round(rupees * 100);
};

/**
 * Format amount with Indian number system (lakhs, crores)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with Indian numbering
 */
export const formatIndianNumber = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount);
};

// Default export
export default {
  formatCurrency,
  formatRupees,
  paiseToRupees,
  rupeesToPaise,
  formatIndianNumber
};

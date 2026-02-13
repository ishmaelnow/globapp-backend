/**
 * Normalize phone number to E.164 format
 * Handles various input formats and converts to +1234567890
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +, keep it
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If it starts with 1 and has 11 digits, add +
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return '+' + cleaned;
  }
  
  // If it has 10 digits, assume US number and add +1
  if (cleaned.length === 10) {
    return '+1' + cleaned;
  }
  
  // Otherwise, try to add +1 if it looks like a US number
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return '+' + cleaned;
  }
  
  // Return as-is if we can't normalize
  return cleaned;
};

/**
 * Format phone number for display
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length === 12 && normalized.startsWith('+1')) {
    const digits = normalized.slice(2);
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return normalized;
};

/**
 * Check if phone number format is valid
 */
export const isValidPhoneFormat = (phone: string): boolean => {
  const normalized = normalizePhone(phone);
  // E.164 format: + followed by 1-15 digits
  return /^\+[1-9]\d{1,14}$/.test(normalized);
};



































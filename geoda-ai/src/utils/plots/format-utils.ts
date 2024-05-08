/**
 * Formats a number to a more human-readable format, using compact notation
 * @param value The number to format
 * @returns The formatted number
 */
export const numericFormatter = (value: number): string => {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
};

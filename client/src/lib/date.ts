/**
 * Convert a timestamp to a Date object.
 * @param timestamp - The timestamp to convert.
 * @returns The Date object.
 */
export const timestampToDate = (timestamp: number) => {
  return new Date(timestamp * 1000);
};

/**
 * Format a date to a locale string.
 * @param date - The date to format.
 * @returns The formatted date.
 */
export const formatToLocaleString = (date: Date | string | number) => {
  const d =
    typeof date === "string"
      ? new Date(date)
      : typeof date === "number"
        ? timestampToDate(date)
        : date;
  return d.toLocaleString();
};

/**
 * Format a date to a locale string.
 * @param date - The date to format.
 * @returns The formatted date.
 */
export const formatToLocaleDateString = (date: Date | string | number) => {
  const d =
    typeof date === "string"
      ? new Date(date)
      : typeof date === "number"
        ? timestampToDate(date)
        : date;
  return d.toLocaleDateString();
};

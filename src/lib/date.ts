/** Formats a date as YYYY-MM-DD using the user's local timezone. */
export const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Returns today's date as YYYY-MM-DD in the user's local timezone. */
export const getTodayLocal = (): string => toLocalDateString(new Date());

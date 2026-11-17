/** Mirrors the API's pricing rules so the booking card can show a live estimate. The server is the source of truth. */
export function discountPercentFor(days: number, weekly = 0, monthly = 0) {
  if (days >= 30) return Math.max(monthly, weekly);
  if (days >= 7) return weekly;
  return 0;
}

export function estimatePrice(pricePerDay: number, days: number, weekly = 0, monthly = 0) {
  const dailyCents = Math.round(pricePerDay * 100);
  const subtotal = dailyCents * days;
  const discountPercent = discountPercentFor(days, weekly, monthly);
  const discount = Math.round((subtotal * discountPercent) / 100);
  return {
    days,
    subtotal: subtotal / 100,
    discountPercent,
    discountAmount: discount / 100,
    total: (subtotal - discount) / 100,
  };
}

/** Inclusive day count between two dates (pick-up and return day both count). */
export function inclusiveDays(start: Date, end: Date) {
  const ms = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  return Math.round(ms / 86_400_000) + 1;
}

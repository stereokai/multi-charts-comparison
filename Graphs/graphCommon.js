export function getBaseDate(baseDate = new Date()) {
  baseDate.setDate(baseDate.getDate() - 1);
  return baseDate.setHours(22);
}

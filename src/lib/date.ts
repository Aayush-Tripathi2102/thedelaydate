export const cuisines = ["Indian", "Chinese", "Italian", "You pick. Impress me."] as const;
export const excitementLevels = ["Yes", "Yessssss", "Not so much, it’s been 1 year"] as const;

export type BookingAnswers = { expectations: string; cuisine: string; excitement: string; dietary: string };
export type DatePlan = { day: string; time: string; timezone: string; pickup: string };

export function getPlan(): DatePlan {
  return {
    day: process.env.DATE_DAY || "2026-11-01",
    time: process.env.DATE_TIME || "17:00",
    timezone: process.env.DATE_TIMEZONE || "Asia/Kolkata",
    pickup: process.env.PICKUP_LOCATION || "Your hostel gate",
  };
}

export function formatDay(day: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
}

export function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, "0")}` : ""} ${hour >= 12 ? "PM" : "AM"}`;
}

export function validateAnswers(value: unknown): BookingAnswers | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.expectations !== "string" || !v.expectations.trim() || v.expectations.length > 1500) return null;
  if (typeof v.cuisine !== "string" || !cuisines.some(c => c === v.cuisine)) return null;
  if (typeof v.excitement !== "string" || !excitementLevels.some(e => e === v.excitement)) return null;
  if (typeof v.dietary !== "string" || v.dietary.length > 300) return null;
  return { expectations: v.expectations.trim(), cuisine: v.cuisine, excitement: v.excitement, dietary: v.dietary.trim() };
}

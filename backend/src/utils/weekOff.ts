import CompanySetting from "../models/CompanySetting";

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function normalizeWeeklyOffs(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map((day) => Number(day))
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    ),
  ].sort((left, right) => left - right);
}

export async function resolveWeeklyOffs(weeklyOffs?: number[]) {
  const own = normalizeWeeklyOffs(weeklyOffs);

  if (own.length) return own;

  const settings = await CompanySetting.findOne({ key: "default" });
  const company = normalizeWeeklyOffs(settings?.weeklyOffs);

  return company.length ? company : [0];
}

export function weeklyOffLabel(days: number[]) {
  return days.map((day) => DAY_NAMES[day]).join(", ") || "None";
}

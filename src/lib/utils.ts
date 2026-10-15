import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value + "T00:00:00") : value;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, differenceInHours, differenceInMinutes } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export function formatTimeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy HH:mm");
}

export function getPublishCountdown(publishAt: Date | string): string {
  const pub = new Date(publishAt);
  const now = new Date();
  if (pub <= now) return "Publishing now";
  const mins = differenceInMinutes(pub, now);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function isNewListing(publishedAt: Date | string | null): boolean {
  if (!publishedAt) return false;
  return differenceInHours(new Date(), new Date(publishedAt)) < 24;
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    REAL_ESTATE: "Real Estate",
    LUXURY_CARS: "Luxury Cars",
    YACHTS: "Yachts",
    OTHER: "Other",
  };
  return map[cat] ?? cat;
}

export function categoryIcon(cat: string): string {
  const map: Record<string, string> = {
    REAL_ESTATE: "Building2",
    LUXURY_CARS: "Car",
    YACHTS: "Anchor",
    OTHER: "Tag",
  };
  return map[cat] ?? "Tag";
}

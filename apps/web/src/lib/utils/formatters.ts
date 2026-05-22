import {
  format,
  formatDistanceToNow,
  differenceInDays,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";

export const formatDate = (date: string | Date, fmt = "MMM d, yyyy") =>
  format(new Date(date), fmt);

export const formatDateShort = (date: string | Date) =>
  format(new Date(date), "MMM d");

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), "MMM d, yyyy h:mm a");

export const formatTime = (date: string | Date) =>
  format(new Date(date), "h:mm a");

export const formatDateSmart = (date: string | Date): string => {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy");
};

export const formatRelative = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatCurrency = (
  amount: number,
  currency = "USD",
  locale = "en-US",
) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatNights = (n: number) =>
  `${n} ${n === 1 ? "night" : "nights"}`;

export const formatGuests = (
  adults: number,
  children = 0,
  infants = 0,
): string => {
  const parts: string[] = [];
  parts.push(`${adults} ${adults === 1 ? "adult" : "adults"}`);
  if (children > 0)
    parts.push(`${children} ${children === 1 ? "child" : "children"}`);
  if (infants > 0)
    parts.push(`${infants} ${infants === 1 ? "infant" : "infants"}`);
  return parts.join(", ");
};

export const formatRoom = (number: string | null | undefined) =>
  number ? `Room ${number}` : "Unassigned";

export const formatName = (first: string, last: string) => `${first} ${last}`;

export const formatInitials = (first: string, last: string) =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

export const nightsBetween = (
  checkIn: string | Date,
  checkOut: string | Date,
) => Math.max(0, differenceInDays(new Date(checkOut), new Date(checkIn)));

export const formatPercent = (value: number, decimals = 1) =>
  `${value.toFixed(decimals)}%`;

export const truncate = (str: string, length = 30) =>
  str.length > length ? `${str.slice(0, length)}...` : str;

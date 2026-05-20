import { format, formatDistanceToNow, differenceInDays } from "date-fns";

export const formatDate = (date: string | Date, fmt = "MMM d, yyyy") =>
  format(new Date(date), fmt);

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), "MMM d, yyyy h:mm a");

export const formatTime = (date: string | Date) =>
  format(new Date(date), "h:mm a");

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
  }).format(amount);

export const formatNights = (nights: number) =>
  `${nights} ${nights === 1 ? "night" : "nights"}`;

export const formatGuestCount = (adults: number, children = 0) => {
  const parts = [`${adults} ${adults === 1 ? "adult" : "adults"}`];
  if (children > 0)
    parts.push(`${children} ${children === 1 ? "child" : "children"}`);
  return parts.join(", ");
};

export const formatRoomNumber = (number: string | null) =>
  number ? `Room ${number}` : "Unassigned";

export const nightsBetween = (
  checkIn: string | Date,
  checkOut: string | Date,
) => differenceInDays(new Date(checkOut), new Date(checkIn));

export const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

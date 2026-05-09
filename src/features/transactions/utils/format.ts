const DASH = "—";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return DASH;
  return dateFormatter.format(date);
}

export function formatAmount(
  amount: number | null,
  currency: string | null,
): string {
  if (amount === null) return DASH;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
  return currency ? `${formatted} ${currency.toUpperCase()}` : formatted;
}

export function formatAddress(address: string | null): string {
  if (!address) return DASH;
  if (address.length <= 12) return address.toLowerCase();
  const lower = address.toLowerCase();
  return `${lower.slice(0, 6)}…${lower.slice(-4)}`;
}

export function formatNetwork(network: string | null): string {
  if (!network) return DASH;
  return network
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatMethod(method: string): string {
  return method.charAt(0).toUpperCase() + method.slice(1);
}

export const formatNaira = (value: string | number | null | undefined) => {
  const n = Number(value);
  return value === null || value === undefined || !Number.isFinite(n)
    ? "—"
    : `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const humanize = (value: string | null | undefined) =>
  value ? value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "—";

/** Converts 0806… or +234806… into the digits wa.me expects. */
export const whatsappLink = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
};

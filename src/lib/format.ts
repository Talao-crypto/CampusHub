export const number = (value: number, decimals = 2) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: decimals }).format(value);
export const dateLabel = (date: Date | string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(date));
export const dateInput = (date: Date) => date.toISOString().slice(0, 10);
export function today() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return new Date(`${part("year")}-${part("month")}-${part("day")}T00:00:00.000Z`);
}

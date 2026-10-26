/** Parse decimals without binary floating-point rounding. Commas are accepted for pt-BR. */
export function toFixedUnits(value: string, decimals: number): number {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error("Informe um número positivo válido.");
  const [whole = "0", fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) throw new Error(`Use no máximo ${decimals} casas decimais.`);
  const units = Number(whole) * 10 ** decimals + Number(fraction.padEnd(decimals, "0"));
  if (!Number.isSafeInteger(units)) throw new Error("Número fora do intervalo permitido.");
  return units;
}

export function roundedRatio(numerator: bigint, denominator: bigint, decimals: number, mode: "HALF_UP" | "TRUNCATE"): number {
  if (numerator < 0n || denominator <= 0n) throw new Error("Invalid non-negative ratio.");
  const scaled = numerator * 10n ** BigInt(decimals);
  const value = mode === "HALF_UP" ? (scaled * 2n + denominator) / (denominator * 2n) : scaled / denominator;
  return Number(value) / 10 ** decimals;
}

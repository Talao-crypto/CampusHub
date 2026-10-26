import "server-only";
import { UserError } from "@/lib/errors";

const buckets = new Map<string, { count: number; until: number }>();

/** Process-local backpressure for the loopback demo. Distributed storage is required before public hosting. */
export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  if (buckets.size > 1000) {
    for (const [entry, bucket] of buckets) if (bucket.until <= now) buckets.delete(entry);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.until <= now) {
    buckets.set(key, { count: 1, until: now + windowMs });
    return;
  }
  if (++bucket.count > limit) throw new UserError("Muitas solicitações. Aguarde um minuto e tente novamente.");
}

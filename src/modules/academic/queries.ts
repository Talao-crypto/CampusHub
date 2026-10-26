import "server-only";
import { getDb } from "@/lib/server/db";
import type { Prisma } from "@/generated/prisma/client";

export const offeringInclude = {
  subject: true,
  term: true,
  absences: { orderBy: [{ date: "desc" as const }, { id: "desc" as const }] },
  assessments: { orderBy: [{ createdAt: "asc" as const }, { id: "asc" as const }] },
} satisfies Prisma.ClassOfferingInclude;

export const PAGE_SIZE = 12;
export function pageNumber(value: string | string[] | undefined) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 && page <= 100_000 ? page : 1;
}

export async function listOfferings(ownerId: string, page = 1) {
  return getDb().classOffering.findMany({
    where: { ownerId }, include: offeringInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE,
  });
}

export async function findOffering(ownerId: string, id: string) {
  return getDb().classOffering.findFirst({ where: { id, ownerId }, include: offeringInclude });
}

export type Offering = NonNullable<Awaited<ReturnType<typeof findOffering>>>;
export const attendancePolicy = (offering: Offering) => ({ unit: offering.attendanceUnit, totalUnits: offering.totalUnits, minimumBps: offering.minAttendanceBps });
export const gradeRule = (offering: Offering) => ({ version: 1, kind: "WEIGHTED", maxUnits: offering.gradeMaxUnits, thresholdUnits: offering.gradeThresholdUnits, decimals: offering.gradeDecimals, rounding: offering.gradeRounding }) as const;
export const gradeItems = (offering: Offering) => offering.assessments.map(({ name, weightBps, scoreUnits }) => ({ name, weightBps, scoreUnits }));

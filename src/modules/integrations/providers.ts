/** Contracts only. No provider implementation or network access exists in Phase 1. */
export type AuthorizedConnection = {
  connectionId: string;
  ownerId: string;
  institutionId: string;
  consentedScopes: readonly string[];
};
export type ExternalAssignment = { externalId: string; title: string; dueAt: string | null; courseExternalId: string };
export type ExternalCalendarEvent = { externalId: string; title: string; startsAt: string; endsAt: string };
export type AcademicSnapshot = { sourceRecordId: string; subjectCode: string; termLabel: string; retrievedAt: string };

export interface CanvasProvider {
  readonly kind: "CANVAS";
  listAssignments(connection: AuthorizedConnection, cursor?: string): Promise<{ items: ExternalAssignment[]; nextCursor: string | null }>;
}
export interface OutlookProvider {
  readonly kind: "MICROSOFT_GRAPH";
  listCalendarEvents(connection: AuthorizedConnection, range: { startsAt: string; endsAt: string }, cursor?: string): Promise<{ items: ExternalCalendarEvent[]; nextCursor: string | null }>;
}
/** Implement only after API availability and institutional authorization are verified. */
export interface StudentPortalProvider {
  readonly kind: "STUDENT_PORTAL";
  getAcademicSnapshot(connection: AuthorizedConnection): Promise<AcademicSnapshot[]>;
}

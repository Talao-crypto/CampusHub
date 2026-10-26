-- Fixed-point values: attendance units /100, grades /10000, percentages /100.
CREATE TYPE "AttendanceUnit" AS ENUM ('SESSION', 'HOUR');
CREATE TYPE "GradeRounding" AS ENUM ('HALF_UP', 'TRUNCATE');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'DONE');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY, "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Institution" (
  "id" TEXT PRIMARY KEY, "slug" TEXT NOT NULL, "name" TEXT NOT NULL
);
CREATE UNIQUE INDEX "Institution_slug_key" ON "Institution"("slug");
CREATE TABLE "SubjectDefinition" (
  "id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL, "institutionId" TEXT NOT NULL,
  "code" TEXT NOT NULL, "name" TEXT NOT NULL,
  CONSTRAINT "SubjectDefinition_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SubjectDefinition_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SubjectDefinition_id_ownerId_key" ON "SubjectDefinition"("id", "ownerId");
CREATE UNIQUE INDEX "SubjectDefinition_ownerId_institutionId_code_key" ON "SubjectDefinition"("ownerId", "institutionId", "code");
CREATE TABLE "AcademicTerm" (
  "id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL, "institutionId" TEXT NOT NULL, "label" TEXT NOT NULL,
  CONSTRAINT "AcademicTerm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AcademicTerm_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AcademicTerm_id_ownerId_key" ON "AcademicTerm"("id", "ownerId");
CREATE UNIQUE INDEX "AcademicTerm_ownerId_institutionId_label_key" ON "AcademicTerm"("ownerId", "institutionId", "label");
CREATE TABLE "ClassOffering" (
  "id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL, "subjectId" TEXT NOT NULL, "termId" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT 'indigo', "attendanceUnit" "AttendanceUnit" NOT NULL DEFAULT 'SESSION',
  "totalUnits" INTEGER NOT NULL, "minAttendanceBps" INTEGER NOT NULL DEFAULT 7500,
  "gradeMaxUnits" INTEGER NOT NULL DEFAULT 100000, "gradeThresholdUnits" INTEGER NOT NULL DEFAULT 60000,
  "gradeDecimals" INTEGER NOT NULL DEFAULT 2, "gradeRounding" "GradeRounding" NOT NULL DEFAULT 'HALF_UP',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClassOffering_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClassOffering_subjectId_ownerId_fkey" FOREIGN KEY ("subjectId", "ownerId") REFERENCES "SubjectDefinition"("id", "ownerId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClassOffering_termId_ownerId_fkey" FOREIGN KEY ("termId", "ownerId") REFERENCES "AcademicTerm"("id", "ownerId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClassOffering_attendance_check" CHECK ("totalUnits" > 0 AND "totalUnits" <= 1000000 AND "minAttendanceBps" BETWEEN 0 AND 10000 AND ("attendanceUnit" = 'HOUR' OR "totalUnits" % 100 = 0)),
  CONSTRAINT "ClassOffering_grades_check" CHECK ("gradeMaxUnits" BETWEEN 1 AND 1000000 AND "gradeThresholdUnits" BETWEEN 0 AND "gradeMaxUnits" AND "gradeDecimals" BETWEEN 0 AND 4),
  CONSTRAINT "ClassOffering_color_check" CHECK ("color" IN ('indigo','teal','amber','rose'))
);
CREATE UNIQUE INDEX "ClassOffering_id_ownerId_key" ON "ClassOffering"("id", "ownerId");
CREATE UNIQUE INDEX "ClassOffering_ownerId_subjectId_termId_key" ON "ClassOffering"("ownerId", "subjectId", "termId");
CREATE INDEX "ClassOffering_ownerId_createdAt_idx" ON "ClassOffering"("ownerId", "createdAt");
CREATE TABLE "Absence" (
  "id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL, "offeringId" TEXT NOT NULL,
  "date" DATE NOT NULL, "units" INTEGER NOT NULL CHECK ("units" > 0 AND "units" <= 1000000), "note" TEXT,
  CONSTRAINT "Absence_offeringId_ownerId_fkey" FOREIGN KEY ("offeringId", "ownerId") REFERENCES "ClassOffering"("id", "ownerId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Absence_offeringId_ownerId_date_idx" ON "Absence"("offeringId", "ownerId", "date");
CREATE TABLE "Assessment" (
  "id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL, "offeringId" TEXT NOT NULL,
  "name" TEXT NOT NULL, "weightBps" INTEGER NOT NULL CHECK ("weightBps" BETWEEN 1 AND 10000),
  "scoreUnits" INTEGER CHECK ("scoreUnits" BETWEEN 0 AND 1000000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Assessment_offeringId_ownerId_fkey" FOREIGN KEY ("offeringId", "ownerId") REFERENCES "ClassOffering"("id", "ownerId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Assessment_offeringId_ownerId_createdAt_idx" ON "Assessment"("offeringId", "ownerId", "createdAt");
CREATE TABLE "Task" (
  "id" TEXT PRIMARY KEY, "ownerId" TEXT NOT NULL, "offeringId" TEXT,
  "title" TEXT NOT NULL, "dueDate" DATE NOT NULL, "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Task_offeringId_ownerId_fkey" FOREIGN KEY ("offeringId", "ownerId") REFERENCES "ClassOffering"("id", "ownerId") ON DELETE NO ACTION ON UPDATE CASCADE
);
CREATE INDEX "Task_ownerId_status_dueDate_idx" ON "Task"("ownerId", "status", "dueDate");

-- AlterTable
ALTER TABLE "ctf_events" ADD COLUMN "joinDeadlineMinutes" INTEGER DEFAULT 10;
ALTER TABLE "ctf_events" ADD COLUMN "maxParticipants" INTEGER DEFAULT 10000;

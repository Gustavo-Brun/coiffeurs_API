-- CreateEnum
CREATE TYPE "QueueEntryStatus" AS ENUM ('WAITING', 'COMPLETED', 'REMOVED');

-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "QueueEntryStatus" NOT NULL DEFAULT 'WAITING',
    "clientId" INTEGER NOT NULL,
    "note" TEXT,
    "queueId" TEXT NOT NULL,

    CONSTRAINT "QueueEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

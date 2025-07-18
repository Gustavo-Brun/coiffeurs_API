-- This is an empty migration.

-- Add a unique index combination queueId and order, ONLY where the status is 'WAITING'
CREATE UNIQUE INDEX "QueueEntry_queueId_order_waiting_unique" ON "QueueEntry"("queueId", "order") WHERE status = 'WAITING';

-- Add a unique index combination queueId and clientId, ONLY where the status is 'WAITING'
CREATE UNIQUE INDEX "QueueEntry_queueId_clientId_waiting_unique" ON "QueueEntry"("queueId", "clientId") WHERE status = 'WAITING';
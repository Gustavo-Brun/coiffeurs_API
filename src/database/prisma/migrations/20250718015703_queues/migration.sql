-- CreateTable
CREATE TABLE "Queues" (
    "id" TEXT NOT NULL,
    "providerId" INTEGER NOT NULL,

    CONSTRAINT "Queues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Queues_providerId_key" ON "Queues"("providerId");

-- AddForeignKey
ALTER TABLE "Queues" ADD CONSTRAINT "Queues_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

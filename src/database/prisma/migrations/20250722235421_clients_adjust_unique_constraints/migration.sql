/*
  Warnings:

  - A unique constraint covering the columns `[providerId,name]` on the table `Clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[providerId,whatsappNumber]` on the table `Clients` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Clients_name_key";

-- DropIndex
DROP INDEX "Clients_whatsappNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "Clients_providerId_name_key" ON "Clients"("providerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Clients_providerId_whatsappNumber_key" ON "Clients"("providerId", "whatsappNumber");

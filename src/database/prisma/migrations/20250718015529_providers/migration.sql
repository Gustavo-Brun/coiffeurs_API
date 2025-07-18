-- CreateTable
CREATE TABLE "Providers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Providers_email_key" ON "Providers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Providers_whatsappNumber_key" ON "Providers"("whatsappNumber");

-- CreateTable
CREATE TABLE "Player" (
    "user_id" SERIAL NOT NULL,
    "telegram_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 5000,
    "referred_by_id" INTEGER,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Character" (
    "character_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("character_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_telegram_id_key" ON "Player"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "Character_user_id_key" ON "Character"("user_id");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "Player"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Player"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

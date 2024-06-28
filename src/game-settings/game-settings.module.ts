import { Module } from '@nestjs/common';
import { GameSettingsService } from './game-settings.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [GameSettingsService, PrismaService],
  controllers: [],
  exports: [GameSettingsService],
})
export class GameSettingsModule {}

import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { GameSettingsService } from 'src/game-settings/game-settings.service';

@Module({
  providers: [GameSettingsService, PlayerService, PrismaService],
  exports: [PlayerService],
  controllers: [PlayerController],
})
export class PlayerModule {}

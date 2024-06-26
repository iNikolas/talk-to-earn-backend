import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';

@Module({
  providers: [PlayerService, PrismaService],
  exports: [PlayerService],
  controllers: [PlayerController],
})
export class PlayerModule {}

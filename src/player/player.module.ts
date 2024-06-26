import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PlayerService } from './player.service';

@Module({
  providers: [PlayerService, PrismaService],
  exports: [PlayerService],
})
export class PlayerModule {}

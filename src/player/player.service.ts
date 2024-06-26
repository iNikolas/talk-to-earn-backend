import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlayerService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOrCreatePlayer(telegramId: bigint, name: string) {
    let player = await this.prismaService.player.findUnique({
      where: { telegram_id: telegramId },
    });

    const isNew = !player;

    if (!player) {
      player = await this.prismaService.player.create({
        data: {
          telegram_id: telegramId,
          name,
        },
      });
    }
    return { player, isNew };
  }
}

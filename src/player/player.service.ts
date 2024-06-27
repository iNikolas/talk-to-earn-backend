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

      await this.createCharacter(telegramId);
    }
    return { player, isNew };
  }

  async createCharacter(telegramId: bigint) {
    const player = await this.prismaService.player.findUnique({
      where: { telegram_id: telegramId },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    const characterExists = await this.prismaService.character.findUnique({
      where: { telegram_id: telegramId },
    });

    if (!characterExists) {
      return await this.prismaService.character.create({
        data: {
          telegram_id: telegramId,
        },
      });
    }
  }

  async getPlayerInfo(telegramId: bigint) {
    const player = await this.prismaService.player.findUniqueOrThrow({
      where: { telegram_id: telegramId },
      include: { character: true },
    });

    let character = player.character;

    if (!character) {
      character = await this.createCharacter(telegramId);
    }

    return {
      ...player,
      telegram_id: player.telegram_id.toString(),
      character: {
        ...character,
        telegram_id: character.telegram_id.toString(),
      },
    };
  }
}

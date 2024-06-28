import { Injectable } from '@nestjs/common';
import { Character, Player } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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
      ...this.serializePlayerBigInt(player),
      character: this.serializeCharacterBigInt(character),
    };
  }

  serializePlayerBigInt(player: Player) {
    return {
      ...player,
      telegram_id: player.telegram_id.toString(),
    };
  }

  serializeCharacterBigInt(character: Character) {
    return {
      ...character,
      telegram_id: character.telegram_id.toString(),
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const take = limit;

    const players = await this.prismaService.player.findMany({
      skip,
      take,
    });

    const total = await this.prismaService.player.count();

    return {
      data: players.map(this.serializePlayerBigInt),
      total,
      page,
      limit,
    };
  }
}

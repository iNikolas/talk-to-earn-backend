import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Character, Player } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GameSettingsService } from 'src/game-settings/game-settings.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly gameSettingsService: GameSettingsService,
  ) {}

  async rewardPlayerWithCoins(
    telegramId: bigint,
    reward?: number,
  ): Promise<Player> {
    try {
      const player = await this.prismaService.player.findUnique({
        where: { telegram_id: telegramId },
      });

      if (!player) {
        throw new Error(`Player with telegramId ${telegramId} not found`);
      }

      let playerReward = reward;

      if (!playerReward) {
        const { reward_coins: baseReward } =
          await this.gameSettingsService.getGlobalSetting();

        playerReward = baseReward;
      }

      const updatedPlayer = await this.prismaService.player.update({
        data: { coins: player.coins + playerReward },
        where: { telegram_id: telegramId },
      });

      return updatedPlayer;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to reward player with coins: ${error.message}`,
      );
    }
  }

  async findOrCreatePlayer(telegramId: bigint, name: string) {
    let player = await this.prismaService.player.findUnique({
      where: { telegram_id: telegramId },
    });

    const isNew = !player;

    if (!player) {
      try {
        await this.prismaService.$transaction(async (prisma) => {
          player = await prisma.player.create({
            data: {
              telegram_id: telegramId,
              name,
            },
          });

          await prisma.character.create({
            data: {
              telegram_id: telegramId,
            },
          });
        });
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to find or create player: ' + error.message,
        );
      }

      return { player, isNew };
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

    const { character } = player;

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
      include: { character: true },
    });

    const total = await this.prismaService.player.count();

    return {
      data: players.map((player) => ({
        ...this.serializePlayerBigInt(player),
        character: this.serializeCharacterBigInt(player.character),
      })),
      total,
      page,
      limit,
    };
  }
}

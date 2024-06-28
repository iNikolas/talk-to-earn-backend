import { Injectable } from '@nestjs/common';
import { GameSetting, GameSettingType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class GameSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalSetting(): Promise<GameSetting> {
    const setting = await this.prisma.gameSetting.findUnique({
      where: { type: GameSettingType.global },
    });

    if (!setting) {
      return await this.createGlobalSetting();
    }

    return setting;
  }

  async createGlobalSetting(data?: Partial<GameSetting>): Promise<GameSetting> {
    const setting = await this.prisma.gameSetting.findUnique({
      where: { type: GameSettingType.global },
    });

    if (setting) {
      throw new Error('Global settings already exists');
    }

    const createdSetting = await this.prisma.gameSetting.create({
      data: data ?? {},
    });

    return createdSetting;
  }
}

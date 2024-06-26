import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private palyerService: PlayerService) {}

  @Get(':telegram_id')
  getPlayerInfo(@Param('telegram_id', ParseIntPipe) telegramId: number) {
    return this.palyerService.getPlayerInfo(BigInt(telegramId));
  }
}

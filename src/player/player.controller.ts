import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Get(':telegram_id')
  getPlayerInfo(@Param('telegram_id', ParseIntPipe) telegramId: number) {
    return this.playerService.getPlayerInfo(BigInt(telegramId));
  }
}

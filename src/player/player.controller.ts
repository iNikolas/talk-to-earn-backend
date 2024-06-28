import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PlayerService } from './player.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':telegram_id')
  getPlayerInfo(@Param('telegram_id', ParseIntPipe) telegramId: number) {
    return this.playerService.getPlayerInfo(BigInt(telegramId));
  }

  @Get()
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    paginationDto: PaginationDto,
  ) {
    return this.playerService.findAll(paginationDto);
  }
}

import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';

import { TelegramService } from './telegram.service';
import { optionsFactory } from './telegram-config.factory';
import { ChatgptModule } from 'src/chatgpt/chatgpt.module';
import { PlayerModule } from 'src/player/player.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync(optionsFactory()),
    ChatgptModule,
    PlayerModule,
  ],
  providers: [TelegramService],
})
export class TelegramModule {}

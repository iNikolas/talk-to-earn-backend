import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';

import { TelegramService } from './telegram.service';
import { optionsFactory } from './telegram-config.factory';
import { ChatgptService } from 'src/chatgpt/chatgpt.service';
import { ChatgptModule } from 'src/chatgpt/chatgpt.module';

@Module({
  imports: [TelegrafModule.forRootAsync(optionsFactory()), ChatgptModule],
  providers: [TelegramService],
})
export class TelegramModule {}

import { ConfigService } from '@nestjs/config';
import { TelegrafModuleAsyncOptions } from 'nestjs-telegraf';

export function optionsFactory(): TelegrafModuleAsyncOptions {
  return {
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      token: config.get('TELEGRAM_API'),
    }),
  };
}

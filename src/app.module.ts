import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ChatgptModule } from './chatgpt/chatgpt.module';
import { TelegramModule } from './telegram/telegram.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ChatgptModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}

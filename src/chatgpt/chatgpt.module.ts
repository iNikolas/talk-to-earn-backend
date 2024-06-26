import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ChatgptService } from './chatgpt.service';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [HttpModule, CacheModule.register({ ttl: 600000 })],
  providers: [ChatgptService, ConfigService],
  exports: [ChatgptService],
})
export class ChatgptModule {}

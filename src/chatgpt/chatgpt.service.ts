import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { firstValueFrom } from 'rxjs';

import { gptConfig } from '../config/gpt.config';
import {
  OpenAIChatCompletionResponse,
  Message,
  Role,
} from '../types/chatgpt.types';

@Injectable()
export class ChatgptService {
  private readonly logger = new Logger(ChatgptService.name);
  private readonly gptUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
  ) {
    this.gptUrl = 'https://api.openai.com/v1/chat/completions';
    this.apiKey = this.configService.get<string>('GPT_API');
  }

  private getCacheKey(userId: string): string {
    return `chatgpt:${userId}`;
  }

  async generateResponse(userId: string, content: string): Promise<string> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    const previousMessages =
      (await this.cacheManager.get<Message[]>(this.getCacheKey(userId))) || [];

    const data = {
      ...gptConfig,
      messages: [
        ...previousMessages,
        {
          role: Role.User,
          content,
        },
      ],
    };

    try {
      const response: AxiosResponse<OpenAIChatCompletionResponse> =
        await firstValueFrom(
          this.httpService.post(this.gptUrl, data, { headers }),
        );
      const choice = response.data.choices[0];

      const assistantMessage: Message = {
        role: Role.Assistant,
        content: choice ? choice.message.content : 'No response',
      };

      const updatedMessages = [
        ...previousMessages,
        { role: Role.User, content },
        assistantMessage,
      ];

      await this.cacheManager.set(this.getCacheKey(userId), updatedMessages);

      return assistantMessage.content;
    } catch (err) {
      this.logger.error(
        'Error occurred while fetching response from OpenAI',
        err,
      );
      return 'An error occurred while processing your request.';
    }
  }
}

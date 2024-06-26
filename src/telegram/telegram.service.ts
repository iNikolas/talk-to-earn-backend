import { Scenes, Telegraf } from 'telegraf';
import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { ChatgptService } from 'src/chatgpt/chatgpt.service';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

import { GreetingTemplateData } from 'src/types/template.types';
import { PlayerService } from 'src/player/player.service';

interface Context extends Scenes.SceneContext {}

@Update()
export class TelegramService extends Telegraf<Context> {
  private readonly logger = new Logger(TelegramService.name);

  private readonly greetingsTemplate: HandlebarsTemplateDelegate<GreetingTemplateData>;
  private readonly styles: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly chatGptService: ChatgptService,
    private readonly playerService: PlayerService,
  ) {
    super(configService.get('TELEGRAM_API'));
    const templateFilePath = path.join(
      process.cwd(),
      'client',
      'templates',
      'greetings.html',
    );

    const templateFile = fs.readFileSync(templateFilePath, 'utf8');
    this.greetingsTemplate = handlebars.compile(templateFile);
  }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    try {
      const telegramId = BigInt(ctx.from.id);
      const firstName = ctx.from.first_name.trim();
      const lastName = ctx.from.last_name.trim();

      const { player, isNew } = await this.playerService.findOrCreatePlayer(
        telegramId,
        `${firstName} ${lastName}`,
      );

      const htmlContent = this.renderTemplate({
        firstTime: isNew,
        firstName,
        lastName,
        coins: player.coins,
      });
      ctx.replyWithHTML(htmlContent);
    } catch (error) {
      this.handleCustomError(ctx, 'Error during initialization', error);
    }
  }

  @On('text')
  async onMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    try {
      const response = await this.chatGptService.generateResponse(
        String(ctx.from.id),
        message,
      );
      ctx.reply(response);
    } catch (error) {
      this.handleCustomError(ctx, 'Error during message processing', error);
    }
  }

  private renderTemplate(data: GreetingTemplateData): string {
    return this.greetingsTemplate(data);
  }

  private handleCustomError(ctx: Context, message: string, error: unknown) {
    ctx.reply(`An error occurred: ${message}. Please try again.`);
    this.logger.error(message, error);
  }
}

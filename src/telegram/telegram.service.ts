import { Scenes, Telegraf } from 'telegraf';
import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { ChatgptService } from 'src/chatgpt/chatgpt.service';
import { Logger } from '@nestjs/common';
import { PlayerService } from 'src/player/player.service';
import { TemplateService } from 'src/template/template.service';

interface Context extends Scenes.SceneContext {}

@Update()
export class TelegramService extends Telegraf<Context> {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly chatGptService: ChatgptService,
    private readonly playerService: PlayerService,
    private readonly templateService: TemplateService,
  ) {
    super(configService.get('TELEGRAM_API'));
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

      const htmlContent = this.templateService.renderTemplate('greetings', {
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

      await this.playerService.rewardPlayerWithCoins(BigInt(ctx.from.id));
      ctx.reply(response);
    } catch (error) {
      this.handleCustomError(ctx, 'Error during message processing', error);
    }
  }

  private handleCustomError(ctx: Context, message: string, error: unknown) {
    ctx.reply(`An error occurred: ${message}. Please try again.`);
    this.logger.error(message, error);
  }
}

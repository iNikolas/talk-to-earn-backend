import { Scenes, Telegraf } from 'telegraf';
import { Ctx, Message, On, Start, Update } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { ChatgptService } from 'src/chatgpt/chatgpt.service';

interface Context extends Scenes.SceneContext {}

@Update()
export class TelegramService extends Telegraf<Context> {
  constructor(
    private readonly configService: ConfigService,
    private readonly chatGptService: ChatgptService,
  ) {
    super(configService.get('TELEGRAM_API'));
  }
  @Start()
  onStart(@Ctx() ctx: Context) {
    ctx.replyWithHTML(`<b>Hello ${ctx.from.first_name} ${ctx.from.last_name}</b>
This is "Talk To Earn" chatbot.
Enter any phrase and recieve an answer`);
  }

  @On('text')
  async onMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    const response = await this.chatGptService.generateResponse(
      String(ctx.from.id),
      message,
    );
    ctx.reply(response);
  }
}

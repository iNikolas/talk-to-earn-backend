import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ResponseLogin, Tokens } from './types/tokens.type';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() userDTO: CreateUserDTO) {
    const user = await this.userService.create(userDTO);
    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDTO: LoginDTO): Promise<ResponseLogin> {
    return this.authService.login(loginDTO);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  public async getUsersFromJira(@Req() req): Promise<User> {
    return await this.authService.validateUser({ email: req.user.email });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDTO: RefreshTokenDTO): Promise<Tokens> {
    return this.authService.refreshTokens(refreshTokenDTO.refreshToken);
  }
}

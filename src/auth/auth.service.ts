import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDTO } from './dto/login.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import { ResponseLogin, Tokens } from './types/tokens.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDTO: LoginDTO): Promise<ResponseLogin> {
    const user = await this.userService.findOne({ email: loginDTO.email });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatched = await this.comparePasswords(
      loginDTO.password,
      user.password,
    );

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user);

    delete user.password;

    return {
      ...tokens,
      data: user,
    };
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async getTokens(user: User): Promise<Tokens> {
    const payload = {
      sub: user.user_id,
      email: user.email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_TOKEN_EXPIRES_IN',
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRES_IN',
        ),
      }),
    ]);

    return {
      expires_in: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    const user = await this.validateUserByRefreshToken(refreshToken);
    const tokens = await this.getTokens(user);

    return tokens;
  }

  async validateUserByRefreshToken(refreshToken: string): Promise<User> {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });

    if (!payload) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    return await this.validateUser({ email: payload.email });
  }

  async validateUser(payload: Partial<User>): Promise<User> {
    const user: User = await this.userService.findOne(payload);
    delete user.password;

    return user;
  }
}

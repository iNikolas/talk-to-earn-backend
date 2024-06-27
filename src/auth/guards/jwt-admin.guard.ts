import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PayloadType } from '../types/payload.type';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Role } from '@prisma/client';

@Injectable()
export class JwtAdminGuard extends JwtAuthGuard {
  handleRequest<TUser extends PayloadType>(
    err: Error | null,
    user: TUser,
    info: any,
    context: ExecutionContext,
  ): TUser {
    user = super.handleRequest(err, user, info, context);

    if (user.role === Role.admin) {
      return user;
    }

    throw err ?? new UnauthorizedException('User is not an admin');
  }
}

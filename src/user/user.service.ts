import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userDTO: CreateUserDTO) {
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(userDTO.password, salt);

    const user = await this.prismaService.user.create({
      data: {
        first_name: userDTO.firstName,
        last_name: userDTO.lastName,
        email: userDTO.email,
        password,
      },
    });

    delete user.password;

    return user;
  }

  async findOne(data: Partial<User>) {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedException('Could not find user');
    }

    return user;
  }
}

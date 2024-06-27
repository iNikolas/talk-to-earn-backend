import { User } from '@prisma/client';

export interface PayloadType extends Omit<User, 'password'> {}

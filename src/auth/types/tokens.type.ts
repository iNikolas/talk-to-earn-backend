import { PayloadType } from './payload.type';

export type Tokens = {
  access_token: string;
  refresh_token: string;
  expires_in: string;
};

export type ResponseLogin = Tokens & { data: PayloadType };

import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const configService = new ConfigService();

function getRequiredEnvVar(key: string): string {
  const value = configService.get<string>(key);
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined.`);
  }
  return value;
}

export const gptConfig = {
  model: getRequiredEnvVar('GPT_MODEL'),
  temperature: parseFloat(getRequiredEnvVar('GPT_TEMPERATURE')),
  max_tokens: parseInt(getRequiredEnvVar('GPT_MAX_TOKENS')),
  top_p: parseFloat(getRequiredEnvVar('GPT_TOP_P')),
  frequency_penalty: parseFloat(getRequiredEnvVar('GPT_FREQUENCY_PENALTY')),
  presence_penalty: parseFloat(getRequiredEnvVar('GPT_PRESENCE_PENALTY')),
};

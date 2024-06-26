export interface OpenAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}

export interface Choice {
  index: number;
  message: Message;
  finish_reason: string;
}

export interface Message {
  role: Role;
  content: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export enum Role {
  System = 'system',
  User = 'user',
  Assistant = 'assistant',
}

export interface AIStreamChunk {
  type: 'text' | 'tool_call' | 'error' | 'done';
  content?: string;
  toolName?: string;
  toolResult?: unknown;
  error?: string;
}

export interface AIFeedback {
  id: string;
  resumeId: string;
  userId: string;
  action: string;
  liked: boolean;
  originalOutput: string;
  modifiedOutput?: string;
  comment?: string;
  createdAt: Date;
}

export type AIModelProvider = 'deepseek' | 'openai' | 'gemini';

export interface AIModelConfig {
  provider: AIModelProvider;
  model: string;
  temperature: number;
  maxTokens: number;
}

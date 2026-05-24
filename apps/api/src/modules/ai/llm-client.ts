export interface AIModelConfig {
  provider: 'deepseek' | 'openai' | 'gemini';
  apiKey: string;
  baseURL?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export function getAIConfig(): AIModelConfig {
  const provider = (process.env.AI_MODEL_PROVIDER || 'deepseek') as AIModelConfig['provider'];

  const configs: Record<string, AIModelConfig> = {
    deepseek: {
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 4096,
    },
    openai: {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
    },
    gemini: {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxTokens: 4096,
    },
  };

  return configs[provider];
}

export async function callLLM(config: AIModelConfig, prompt: string): Promise<string> {
  const { provider, apiKey, baseURL, model, temperature, maxTokens } = config;
  const isGemini = provider === 'gemini';

  let url: string;
  let headers: Record<string, string>;
  let body: Record<string, unknown>;

  if (isGemini) {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    headers = { 'Content-Type': 'application/json' };
    body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    };
  } else {
    const base = provider === 'openai'
      ? 'https://api.openai.com/v1'
      : baseURL || 'https://api.deepseek.com/v1';
    url = `${base}/chat/completions`;
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
    body = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI API error (${response.status}): ${text}`);
  }

  const data = await response.json();

  if (isGemini) {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  return data.choices?.[0]?.message?.content || '';
}

export function parseJSON(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text);
  } catch {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      } catch { /* fall through */ }
    }
    return { raw: text };
  }
}

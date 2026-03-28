import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

/** Returns true only if the string looks like a real ASCII API key. */
function isValidApiKey(key: string | undefined | null): boolean {
  if (!key || key.trim().length < 8) return false;
  return [...key].every(c => c.charCodeAt(0) <= 127);
}

/** Resolve provider + apiKey, falling back to environment variables. */
export function resolveConfig(
  provider: string | undefined,
  apiKey: string | undefined,
): AIConfig {
  const resolvedProvider = (provider || process.env.DEFAULT_AI_PROVIDER || 'anthropic') as AIProvider;
  const resolvedKey = isValidApiKey(apiKey)
    ? apiKey!
    : (process.env.DEFAULT_AI_API_KEY || (resolvedProvider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : '') || '');
  return { provider: resolvedProvider, apiKey: resolvedKey };
}

export type AIProvider = 'anthropic' | 'openai' | 'deepseek' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

export const PROVIDERS: Record<AIProvider, { name: string; defaultModel: string; baseURL?: string }> = {
  anthropic: { name: 'Anthropic (Claude)', defaultModel: 'claude-opus-4-5' },
  openai:    { name: 'OpenAI (GPT-4o)',    defaultModel: 'gpt-4o' },
  deepseek:  { name: 'DeepSeek',           defaultModel: 'deepseek-chat', baseURL: 'https://api.deepseek.com' },
  gemini:    { name: 'Google Gemini',      defaultModel: 'gemini-2.0-flash', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai' },
};

function makeOpenAIClient(provider: Exclude<AIProvider, 'anthropic'>, apiKey: string) {
  const { baseURL } = PROVIDERS[provider];
  return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

/** Non-streaming completion — returns the full text response. */
export async function chatComplete(
  config: AIConfig,
  system: string,
  userMessage: string,
  maxTokens = 2000,
  useThinking = false,
): Promise<string> {
  if (config.provider === 'anthropic') {
    const client = new Anthropic({ apiKey: config.apiKey });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      model: PROVIDERS.anthropic.defaultModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }],
    };
    if (useThinking) params.thinking = { type: 'enabled', budget_tokens: 3000 };
    const response = await client.messages.create(params);
    for (const block of response.content) {
      if (block.type === 'text') return block.text;
    }
    return '';
  }

  const client = makeOpenAIClient(config.provider as Exclude<AIProvider, 'anthropic'>, config.apiKey);
  const response = await client.chat.completions.create({
    model: PROVIDERS[config.provider].defaultModel,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage },
    ],
  });
  return response.choices[0]?.message?.content ?? '';
}

/** Streaming completion — yields text chunks as they arrive. */
export async function* chatStream(
  config: AIConfig,
  system: string,
  userMessage: string,
  maxTokens = 2500,
): AsyncGenerator<string> {
  if (config.provider === 'anthropic') {
    const client = new Anthropic({ apiKey: config.apiKey });
    const stream = client.messages.stream({
      model: PROVIDERS.anthropic.defaultModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }],
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
    return;
  }

  const client = makeOpenAIClient(config.provider as Exclude<AIProvider, 'anthropic'>, config.apiKey);
  const stream = await client.chat.completions.create({
    model: PROVIDERS[config.provider].defaultModel,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage },
    ],
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? '';
    if (text) yield text;
  }
}


export interface ChatApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatApiRequest {
  messages: ChatApiMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatApiResponse {
  message: string;
  error?: string;
}

export class ChatApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = '/api/chat', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async sendMessage(messages: ChatApiMessage[]): Promise<ChatApiResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          messages,
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        message: data.message || data.choices?.[0]?.message?.content || 'No response received',
      };
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async streamMessage(
    messages: ChatApiMessage[], 
    onChunk: (chunk: string) => void
  ): Promise<ChatApiResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          messages,
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullMessage += content;
                  onChunk(content);
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      return { message: fullMessage };
    } catch (error) {
      console.error('Chat API streaming error:', error);
      return {
        message: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
}

export const chatApiService = new ChatApiService();

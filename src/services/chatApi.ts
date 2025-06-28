import { ChatMessage, FormSchema } from "@/types/chat";

export interface ChatApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatApiRequest {
  message: ChatApiMessage;
}

export interface ChatApiResponse {
  message: ChatMessage;
  error?: string;
}

const BASE_URL = 'https://pre-houyi.admin.alibaba-inc.com';

export class ChatApiService {

  async stream(
    agent: string,
    conversation: string,
    message: ChatApiMessage, 
    onChunk: (chunk: string) => void
  ): Promise<ChatApiResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/${agent}/${conversation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();

      let fullMessage: ChatMessage = {
        id: '',
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: false,
      };

      let hasFormSchema: boolean = false;
      let formSchemaContent: string = '';

      while (true) {

          const { done, value } = await reader.read();

          if (done && !value) {
            break;
          }

          const chunk = decoder.decode(value);

          const chunkMessage = JSON.parse(chunk) as ChatMessage;

          fullMessage.id = chunkMessage.id || fullMessage.id;
          fullMessage.role = chunkMessage.role || fullMessage.role;
          fullMessage.timestamp = chunkMessage.timestamp || fullMessage.timestamp;

          const lines: string[] = chunkMessage.content.split('\n');

          for (const line of lines) {

            if (hasFormSchema) {
              formSchemaContent += line.trim() !== '</dynamic_form_schema>' ? line : '';
              continue;
            }

            if (line.trim() === '<dynamic_form_schema>') {
              hasFormSchema = true;
              continue;
            }

            fullMessage.content += line + '\n';

          }

          chunkMessage.content = fullMessage.content.trim();
          chunkMessage.isStreaming = true;

          onChunk(JSON.stringify(chunkMessage));

        }

        fullMessage.isStreaming = false;
        fullMessage.timestamp = new Date(fullMessage.timestamp || Date.now());
        fullMessage.content = fullMessage.content.trim();
        fullMessage.formSchema = hasFormSchema ? JSON.parse(formSchemaContent) as FormSchema[] : [];

      return { message: fullMessage };
    } catch (error) {
      return {
        message: {} as ChatMessage,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const chatApiService = new ChatApiService();

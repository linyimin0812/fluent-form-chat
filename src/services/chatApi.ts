import { ChatMessage, FormSchema } from "@/types/chat";

export interface ChatApiMessage {
  role: 'user' | 'assistant';
  content: string;
  formSubmitted: boolean;

}

export interface ChatApiRequest {
  message: ChatApiMessage;
}

export interface ChatApiResponse {
  message: ChatMessage;
  error?: string;
}

// const BASE_URL = 'https://pre-houyi.admin.alibaba-inc.com';

const BASE_URL = 'http://localhost:8090';


export class ChatApiService {

  async stream(
    agent: string,
    conversation: string,
    message: ChatApiMessage, 
    onChunk: (chunk: ChatMessage) => void
  ): Promise<ChatApiResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/chat/forward/${agent}/${conversation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
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
        chatContent: '',
        role: 'assistant',
        timestamp: Date.now(),
        isStreaming: false,
      };

      let fullChatContent: string = '';

      while (true) {

        const { done, value } = await reader.read();

        if (done && !value) {
          break;
        }

        let buffer: string = '';

        const chunks: string[] = decoder.decode(value).split('__CHUNK_SEPARATOR__');

        for (let chunk of chunks) {

          if (!chunk.trim()) {
            continue; 
          }

          if (buffer) {
            chunk = buffer + chunk;
          }

          let chunkMessage;

          // 保证每个 chunk 都是完整的 JSON 对象
          try {
            chunkMessage = JSON.parse(chunk);
            buffer = '';
          } catch (e) {
            buffer += chunk;
            continue;
          }

          chunkMessage.isStreaming = true;

          if (chunkMessage.formSchema) {
            chunkMessage.formSchema = JSON.parse(chunkMessage.formSchema) as FormSchema[] || [];
          }

          onChunk(chunkMessage);

          if (!fullMessage.id) {
            fullMessage.id = chunkMessage.id;
            fullMessage.role = chunkMessage.role;
            fullMessage.timestamp = chunkMessage.timestamp || Date.now();
          }

          if (chunkMessage.formSchema) {
            fullMessage.formSchema = chunkMessage.formSchema;
          }

          fullChatContent = chunkMessage.chatContent || '';
        }
      }

        fullMessage.isStreaming = false;
        fullMessage.chatContent = fullChatContent.trim();

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

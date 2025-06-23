
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
}

export interface FormSchema {
  name: string;
  label: string;
  type: 'input' | 'select';
  values: string[];
}

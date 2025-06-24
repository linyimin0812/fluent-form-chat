
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  formSchema?: FormSchema[]
}

export interface FormSchema {
  name: string;
  label: string;
  type: 'input' | 'select';
  values: string[];
}

export interface DynamicForm {
  
}
